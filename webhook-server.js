/**
 * VAPI to DoorLoop Webhook Server
 *
 * This server receives function calls from VAPI and forwards them to DoorLoop API
 *
 * Setup:
 * 1. npm install express axios body-parser
 * 2. Set environment variables or update config below
 * 3. Deploy to your server
 * 4. Update VAPI assistant serverUrl to point here
 */

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Configuration
const DOORLOOP_API_TOKEN = process.env.DOORLOOP_API_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoiQVBJIiwiaWQiOiI2OGVlNmZiYjIxYjI0MjkxYjdmZTM4ODgiLCJleHAiOjIwNzU4MTY2MzV9.6D_BgXStGG-yVE5dogTmp_KQ7So0GRhtOBXbMUyLS1I';
const DOORLOOP_BASE_URL = 'https://app.doorloop.com/api';
const PORT = process.env.PORT || 3000;

// DoorLoop API client
const doorloopClient = axios.create({
  baseURL: DOORLOOP_BASE_URL,
  headers: {
    'Authorization': `Bearer ${DOORLOOP_API_TOKEN}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Helper function: Map urgency to DoorLoop priority
function mapUrgencyToPriority(urgency) {
  const mapping = {
    'urgent': 'High',
    'emergency': 'High',
    'standard': 'Medium',
    'low': 'Low'
  };
  return mapping[urgency] || 'Medium';
}

// Helper function: Format current date
function getCurrentDate() {
  return new Date().toISOString();
}

// Tool Handler: createWorkOrder
async function handleCreateWorkOrder(params) {
  const { unitNumber, tenantName, tenantPhone, issueDescription, urgency, category, whenStarted } = params;

  const taskData = {
    subject: `${category} - ${unitNumber}: ${issueDescription.substring(0, 50)}${issueDescription.length > 50 ? '...' : ''}`,
    description: `Tenant: ${tenantName}\nPhone: ${tenantPhone}\nUnit: ${unitNumber}\nCategory: ${category}\n\nIssue Description:\n${issueDescription}\n\nReported: ${whenStarted || 'Just now'}`,
    priority: mapUrgencyToPriority(urgency),
    status: 'Not Started'
  };

  try {
    const response = await doorloopClient.post('/tasks', taskData);

    return {
      success: true,
      workOrderId: response.data.id,
      estimatedResponseTime: urgency === 'urgent' ? '2 hours' : urgency === 'standard' ? '24 hours' : '3-5 days',
      doorloopTaskId: response.data.id,
      message: 'Work order created successfully in DoorLoop'
    };
  } catch (error) {
    console.error('Error creating work order:', error.response?.data || error.message);
    throw error;
  }
}

// Tool Handler: escalateToEmergency
async function handleEscalateToEmergency(params) {
  const { unitNumber, tenantName, tenantPhone, issueDescription, category, safetyNotes } = params;

  const taskData = {
    subject: `🚨 EMERGENCY - ${category} - ${unitNumber}`,
    description: `⚠️ EMERGENCY MAINTENANCE REQUEST ⚠️\n\nTenant: ${tenantName}\nPhone: ${tenantPhone}\nUnit: ${unitNumber}\nCategory: ${category}\n\nIssue Description:\n${issueDescription}\n\nSafety Notes:\n${safetyNotes || 'None provided'}\n\nEXPECTED RESPONSE: Vendor should arrive within 1-2 hours\nEXPECTED CALLBACK: Vendor should call tenant within 15 minutes`,
    priority: 'High',
    status: 'Not Started'
  };

  try {
    const response = await doorloopClient.post('/tasks', taskData);

    return {
      success: true,
      emergencyWorkOrderId: response.data.id,
      dispatchStatus: 'Emergency work order created - Property manager must assign vendor',
      doorloopTaskId: response.data.id
    };
  } catch (error) {
    console.error('Error escalating to emergency:', error.response?.data || error.message);
    throw error;
  }
}

// Tool Handler: dispatchEmergencyVendor
async function handleDispatchEmergencyVendor(params) {
  const { workOrderId, category, arrivalTimeEstimate, safetyNotes, tenantPhone } = params;

  if (!workOrderId) {
    return {
      success: false,
      error: 'workOrderId is required'
    };
  }

  const updateContent = `✅ EMERGENCY DISPATCHED\n\nCategory: ${category}\nEstimated Arrival: ${arrivalTimeEstimate}\nTenant Contact: ${tenantPhone}\n\nSafety Notes:\n${safetyNotes || 'None provided'}\n\n⚠️ ACTION REQUIRED: Property manager must assign vendor and ensure callback within 15 minutes\n\nStatus: Emergency coordinator has confirmed dispatch to tenant`;

  try {
    const response = await doorloopClient.post(`/tasks/${workOrderId}/updates`, {
      content: updateContent
    });

    return {
      success: true,
      dispatchId: `DISP-${workOrderId}`,
      vendorName: 'To be assigned by property manager',
      vendorPhone: 'Pending assignment',
      estimatedArrival: 'Within 1-2 hours',
      status: 'Dispatched - vendor will call tenant within 15 minutes'
    };
  } catch (error) {
    console.error('Error dispatching emergency vendor:', error.response?.data || error.message);
    throw error;
  }
}

// Tool Handler: provideStatus
async function handleProvideStatus(params) {
  const { taskId } = params;

  if (!taskId) {
    return {
      success: false,
      error: 'taskId is required'
    };
  }

  try {
    const response = await doorloopClient.get(`/tasks/${taskId}`);
    const task = response.data;

    return {
      success: true,
      status: task.status || 'Unknown',
      priority: task.priority || 'Unknown',
      subject: task.subject || 'No subject',
      description: task.description || 'No description',
      createdAt: task.createdAt || 'Unknown',
      updatedAt: task.updatedAt || 'Unknown',
      estimatedArrival: 'Check with property manager for vendor ETA',
      lastUpdate: task.updatedAt || getCurrentDate()
    };
  } catch (error) {
    console.error('Error getting task status:', error.response?.data || error.message);
    throw error;
  }
}

// Tool Handler: confirmCompletion
async function handleConfirmCompletion(params) {
  const { taskId, tenantConfirmed, issueResolved, qualityRating, feedbackNotes, inspectionRequired } = params;

  if (!taskId) {
    return {
      success: false,
      error: 'taskId is required'
    };
  }

  try {
    // First, get the current task to append to description
    const currentTask = await doorloopClient.get(`/tasks/${taskId}`);
    const currentDescription = currentTask.data.description || '';

    const feedbackSection = `\n\n--- TENANT FEEDBACK (${getCurrentDate()}) ---\nIssue Resolved: ${issueResolved}\nQuality Rating: ${qualityRating}/5\nInspection Required: ${inspectionRequired}\n\nFeedback:\n${feedbackNotes}\n\nTenant Confirmed: ${tenantConfirmed}\nCompleted by: MaintenanceBot Followup`;

    const updateData = {
      status: 'Completed',
      description: currentDescription + feedbackSection
    };

    const response = await doorloopClient.put(`/tasks/${taskId}`, updateData);

    return {
      success: true,
      status: 'Work order closed',
      closedDate: getCurrentDate(),
      tenantSatisfactionRecorded: true,
      qualityRating: qualityRating,
      doorloopTaskId: taskId
    };
  } catch (error) {
    console.error('Error confirming completion:', error.response?.data || error.message);
    throw error;
  }
}

// Tool Handler: reopenWorkOrder
async function handleReopenWorkOrder(params) {
  const { taskId, reason, urgency, tenantAvailability } = params;

  if (!taskId) {
    return {
      success: false,
      error: 'taskId is required'
    };
  }

  try {
    // First, get the current task to append to description
    const currentTask = await doorloopClient.get(`/tasks/${taskId}`);
    const currentDescription = currentTask.data.description || '';

    const reopenSection = `\n\n--- WORK ORDER REOPENED (${getCurrentDate()}) ---\n⚠️ ISSUE NOT RESOLVED - VENDOR MUST RETURN\n\nReason for Reopening:\n${reason}\n\nTenant Availability:\n${tenantAvailability || 'Not specified'}\n\nUrgency: ${urgency}\n\nNote: This is a rework. Original issue was not fully resolved. No additional cost to tenant.`;

    const updateData = {
      status: 'Not Started',
      priority: mapUrgencyToPriority(urgency),
      description: currentDescription + reopenSection
    };

    const response = await doorloopClient.put(`/tasks/${taskId}`, updateData);

    return {
      success: true,
      status: 'Work order reopened',
      newWorkOrderId: taskId,
      vendorNotified: true,
      estimatedCallback: urgency === 'emergency' ? 'Within 1 hour' : urgency === 'urgent' ? 'Within 2 hours' : 'Within 24 hours'
    };
  } catch (error) {
    console.error('Error reopening work order:', error.response?.data || error.message);
    throw error;
  }
}

// Tool Handler: scheduleInspection
async function handleScheduleInspection(params) {
  const { relatedTaskId, inspectionType, reason, tenantAvailability, unitNumber } = params;

  const taskData = {
    subject: `Manager Inspection Required - Unit ${unitNumber} - ${inspectionType}`,
    description: `📋 MANAGER INSPECTION REQUESTED\n\nRelated Work Order: ${relatedTaskId}\nInspection Type: ${inspectionType}\nUnit: ${unitNumber}\n\nReason:\n${reason}\n\nTenant Availability:\n${tenantAvailability}\n\nThis inspection was scheduled by MaintenanceBot during followup verification. Please complete inspection within 3-5 business days and update this task with findings.`,
    priority: 'Medium',
    status: 'Not Started'
  };

  try {
    const response = await doorloopClient.post('/tasks', taskData);

    return {
      success: true,
      inspectionId: response.data.id,
      inspectionDate: 'To be scheduled by property manager',
      inspector: 'Property Manager',
      calendarLink: `View in DoorLoop: Task ${response.data.id}`,
      doorloopTaskId: response.data.id
    };
  } catch (error) {
    console.error('Error scheduling inspection:', error.response?.data || error.message);
    throw error;
  }
}

// Main webhook endpoint
app.post('/vapi/webhook', async (req, res) => {
  console.log('Received webhook from VAPI:', JSON.stringify(req.body, null, 2));

  try {
    const { message } = req.body;

    if (!message || message.type !== 'function-call') {
      return res.status(400).json({
        error: 'Invalid request: Expected function-call message type'
      });
    }

    const { functionCall } = message;
    const { name, parameters } = functionCall;

    let result;

    // Route to appropriate handler
    switch (name) {
      case 'createWorkOrder':
        result = await handleCreateWorkOrder(parameters);
        break;

      case 'escalateToEmergency':
        result = await handleEscalateToEmergency(parameters);
        break;

      case 'dispatchEmergencyVendor':
        result = await handleDispatchEmergencyVendor(parameters);
        break;

      case 'provideStatus':
        result = await handleProvideStatus(parameters);
        break;

      case 'confirmCompletion':
        result = await handleConfirmCompletion(parameters);
        break;

      case 'reopenWorkOrder':
        result = await handleReopenWorkOrder(parameters);
        break;

      case 'scheduleInspection':
        result = await handleScheduleInspection(parameters);
        break;

      default:
        return res.status(400).json({
          error: `Unknown function: ${name}`
        });
    }

    // Return success response
    res.json({
      result: result
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      details: error.response?.data || null
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'VAPI to DoorLoop Webhook',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VAPI to DoorLoop Webhook Server running on port ${PORT}`);
  console.log(`📍 Webhook endpoint: http://localhost:${PORT}/vapi/webhook`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
