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

// Helper function: Authenticate tenant against DoorLoop
async function authenticateTenant(unitNumber, tenantName) {
  try {
    console.log(`\n🔐 AUTH ATTEMPT: Unit="${unitNumber}", Tenant="${tenantName}"`);

    // Get units to find the unit ID by unit number/name
    const unitsResponse = await doorloopClient.get('/units', {
      params: { search: unitNumber, limit: 10 }
    });

    console.log(`   Units found: ${unitsResponse.data.data?.length || 0}`);

    if (!unitsResponse.data.data || unitsResponse.data.data.length === 0) {
      console.log('   ❌ No units found');
      return {
        authenticated: false,
        reason: 'Unit not found in system',
        message: `I'm sorry, I couldn't find unit ${unitNumber} in our system. Please verify the unit number and try again.`
      };
    }

    // Try exact match first (case-insensitive)
    const unitLower = unitNumber.toLowerCase();
    let unit = unitsResponse.data.data.find(u =>
      u.name?.toLowerCase() === unitLower ||
      u.reference?.toLowerCase() === unitLower
    );

    // If no exact match, try partial match (contains)
    if (!unit) {
      unit = unitsResponse.data.data.find(u =>
        u.name?.toLowerCase().includes(unitLower) ||
        u.reference?.toLowerCase().includes(unitLower)
      );
    }

    if (!unit) {
      console.log('   ❌ Unit not matched in results');
      console.log('   Units in search:', unitsResponse.data.data.map(u => u.name).join(', '));
      return {
        authenticated: false,
        reason: 'Unit not found',
        message: `I'm sorry, I couldn't find unit ${unitNumber} in our records. Can you please verify the unit number?`
      };
    }

    console.log(`   ✓ Unit matched: ${unit.name} (${unit.id})`);

    // Get active leases for this unit
    const leasesResponse = await doorloopClient.get('/leases', {
      params: { units: unit.id, status: 'ACTIVE', limit: 10 }
    });

    console.log(`   Active leases: ${leasesResponse.data.data?.length || 0}`);

    if (!leasesResponse.data.data || leasesResponse.data.data.length === 0) {
      console.log('   ❌ No active lease');
      return {
        authenticated: false,
        reason: 'No active lease for this unit',
        message: `I'm sorry, I don't show an active lease for unit ${unitNumber}. Please contact the property manager directly.`
      };
    }

    // Check ALL active leases to find a match (unit may have multiple leases)
    const callerName = tenantName.toLowerCase();
    console.log(`   Caller name (lowercase): "${callerName}"`);

    let matchedLease = null;

    // Iterate through all active leases to find a match
    for (const lease of leasesResponse.data.data) {
      console.log(`\n   Checking lease: "${lease.name}"`);

      // Check if lease has tenant information in the name field
      const leaseName = lease.name?.toLowerCase() || '';

      // Split lease name by common separators (& or ,) to get individual tenant names
      const leaseNames = leaseName.split(/[&,]/).map(n => n.trim());
      console.log(`   Lease tenants: ${JSON.stringify(leaseNames)}`);

      // Check if caller's name matches any tenant on this lease
      const nameMatch = leaseNames.some(leaseTenantName => {
        const matches = leaseTenantName.includes(callerName) || callerName.includes(leaseTenantName);
        console.log(`     Comparing "${leaseTenantName}" vs "${callerName}": ${matches ? '✓ MATCH' : '✗ no match'}`);
        return matches;
      });

      if (nameMatch) {
        matchedLease = lease;
        console.log(`   ✅ MATCH FOUND in lease: "${lease.name}"`);
        break;  // Stop checking once we find a match
      }
    }

    if (!matchedLease) {
      console.log('\n   ❌ Name authentication FAILED - no matching lease found');
      return {
        authenticated: false,
        reason: 'Name does not match tenant on any lease',
        message: `I'm sorry, I don't show ${tenantName} as a tenant for unit ${unitNumber}. For security reasons, I can only process requests from authorized tenants. Please contact the property manager if you believe this is an error.`
      };
    }

    // Authentication successful - now get tenant ID for creating tenant requests
    console.log('   ✅ AUTHENTICATED');
    console.log('   🔍 Fetching tenant ID...');

    try {
      // Search for tenant by name to get tenant ID
      const tenantsResponse = await doorloopClient.get('/tenants', {
        params: { search: tenantName, limit: 20 }
      });

      // Find exact tenant match by name
      const tenant = tenantsResponse.data.data.find(t =>
        t.name?.toLowerCase().includes(callerName) ||
        callerName.includes(t.name?.toLowerCase())
      );

      if (tenant) {
        console.log(`   ✓ Tenant ID found: ${tenant.id}`);
        return {
          authenticated: true,
          unitId: unit.id,
          unitName: unit.name,
          propertyId: unit.property,
          leaseId: matchedLease.id,
          tenantId: tenant.id,  // Add tenant ID for TENANT_REQUEST creation
          tenantName: tenant.name,
          message: 'Tenant authenticated successfully'
        };
      } else {
        console.log('   ⚠️  Tenant ID not found, will use lease-based creation');
        return {
          authenticated: true,
          unitId: unit.id,
          unitName: unit.name,
          propertyId: unit.property,
          leaseId: matchedLease.id,
          tenantId: null,  // No tenant ID found
          message: 'Tenant authenticated successfully'
        };
      }
    } catch (tenantError) {
      console.log('   ⚠️  Could not fetch tenant ID:', tenantError.message);
      return {
        authenticated: true,
        unitId: unit.id,
        unitName: unit.name,
        propertyId: unit.property,
        leaseId: matchedLease.id,
        tenantId: null,
        message: 'Tenant authenticated successfully'
      };
    }

  } catch (error) {
    console.error('Error authenticating tenant:', error.response?.data || error.message);
    return {
      authenticated: false,
      reason: 'Authentication system error',
      message: 'I\'m experiencing technical difficulties verifying your information. Please contact the property manager directly for assistance.'
    };
  }
}

// Tool Handler: createWorkOrder
async function handleCreateWorkOrder(params) {
  const { unitNumber, tenantName, tenantPhone, issueDescription, urgency, category, whenStarted } = params;

  // Authenticate tenant first
  const authResult = await authenticateTenant(unitNumber, tenantName);

  if (!authResult.authenticated) {
    return {
      success: false,
      error: 'Authentication failed',
      reason: authResult.reason,
      message: authResult.message
    };
  }

  // Build task data - Create as TENANT_REQUEST so it appears under tenant name
  const taskData = {
    subject: `${category} - ${unitNumber}: ${issueDescription.substring(0, 50)}${issueDescription.length > 50 ? '...' : ''}`,
    description: `Tenant: ${tenantName}\nPhone: ${tenantPhone}\nUnit: ${unitNumber}\nCategory: ${category}\n\nIssue Description:\n${issueDescription}\n\nReported: ${whenStarted || 'Just now'}`,
    type: 'TENANT_REQUEST',  // Changed from WORK_ORDER to TENANT_REQUEST
    status: 'NOT_STARTED',
    unit: authResult.unitId,
    property: authResult.propertyId,
    tenantRequestType: 'MAINTENANCE',
    entryPermission: 'NOT_APPLICABLE'
  };

  // Add tenant ID if available (required for TENANT_REQUEST)
  if (authResult.tenantId) {
    taskData.requestedByTenant = authResult.tenantId;
    taskData.linkedResource = {
      resourceId: authResult.leaseId,
      resourceType: 'LEASE'
    };
    console.log('Creating TENANT_REQUEST with tenant ID:', authResult.tenantId);
  } else {
    // Fallback: If tenant ID not found, create as WORK_ORDER instead
    console.log('⚠️  No tenant ID available, creating as WORK_ORDER instead');
    taskData.type = 'WORK_ORDER';
    delete taskData.tenantRequestType;
    delete taskData.entryPermission;
  }

  try {
    console.log('Creating DoorLoop task:', JSON.stringify(taskData, null, 2));
    const response = await doorloopClient.post('/tasks', taskData);
    console.log(`✅ Task created as ${taskData.type}:`, response.data.id);

    return {
      success: true,
      workOrderId: response.data.id,
      estimatedResponseTime: urgency === 'urgent' ? '2 hours' : urgency === 'standard' ? '24 hours' : '3-5 days',
      doorloopTaskId: response.data.id,
      message: `Maintenance request created successfully in DoorLoop under ${authResult.tenantId ? 'your tenant account' : 'the property'}`
    };
  } catch (error) {
    console.error('❌ Error creating maintenance request:', error.response?.data || error.message);
    return {
      success: false,
      error: 'Failed to create maintenance request',
      details: error.response?.data || error.message,
      message: 'I apologize, but I encountered a technical issue while creating your maintenance request. Please contact the property manager directly, or try again in a few minutes.'
    };
  }
}

// Tool Handler: escalateToEmergency
async function handleEscalateToEmergency(params) {
  const { unitNumber, tenantName, tenantPhone, issueDescription, category, safetyNotes } = params;

  // Authenticate tenant first
  const authResult = await authenticateTenant(unitNumber, tenantName);

  if (!authResult.authenticated) {
    return {
      success: false,
      error: 'Authentication failed',
      reason: authResult.reason,
      message: authResult.message
    };
  }

  // Build emergency task data - Create as TENANT_REQUEST so it appears under tenant name
  const taskData = {
    subject: `🚨 EMERGENCY - ${category} - ${unitNumber}`,
    description: `⚠️ EMERGENCY MAINTENANCE REQUEST ⚠️\n\nTenant: ${tenantName}\nPhone: ${tenantPhone}\nUnit: ${unitNumber}\nCategory: ${category}\n\nIssue Description:\n${issueDescription}\n\nSafety Notes:\n${safetyNotes || 'None provided'}\n\nEXPECTED RESPONSE: Vendor should arrive within 1-2 hours\nEXPECTED CALLBACK: Vendor should call tenant within 15 minutes`,
    type: 'TENANT_REQUEST',
    status: 'NOT_STARTED',
    unit: authResult.unitId,
    property: authResult.propertyId,
    tenantRequestType: 'MAINTENANCE',
    entryPermission: 'NOT_APPLICABLE'
  };

  // Add tenant ID if available (required for TENANT_REQUEST)
  if (authResult.tenantId) {
    taskData.requestedByTenant = authResult.tenantId;
    taskData.linkedResource = {
      resourceId: authResult.leaseId,
      resourceType: 'LEASE'
    };
    console.log('Creating emergency TENANT_REQUEST with tenant ID:', authResult.tenantId);
  } else {
    // Fallback: If tenant ID not found, create as WORK_ORDER instead
    console.log('⚠️  No tenant ID available, creating emergency as WORK_ORDER instead');
    taskData.type = 'WORK_ORDER';
    delete taskData.tenantRequestType;
    delete taskData.entryPermission;
  }

  try {
    const response = await doorloopClient.post('/tasks', taskData);
    console.log(`✅ Emergency task created as ${taskData.type}:`, response.data.id);

    return {
      success: true,
      emergencyWorkOrderId: response.data.id,
      dispatchStatus: `Emergency ${taskData.type === 'TENANT_REQUEST' ? 'tenant request' : 'work order'} created - Property manager must assign vendor`,
      doorloopTaskId: response.data.id
    };
  } catch (error) {
    console.error('Error escalating to emergency:', error.response?.data || error.message);
    return {
      success: false,
      error: 'Failed to create emergency request',
      details: error.response?.data || error.message,
      message: 'I apologize, but I encountered a technical issue while escalating your emergency request. Please call the property manager directly at their emergency number immediately.'
    };
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
      status: 'COMPLETED',
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
      status: 'NOT_STARTED',
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
    type: 'WORK_ORDER',
    status: 'NOT_STARTED'
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
  const timestamp = new Date().toISOString();
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📞 WEBHOOK RECEIVED at ${timestamp}`);
  console.log(`${'='.repeat(80)}`);
  console.log('Full request body:', JSON.stringify(req.body, null, 2));

  try {
    const { message } = req.body;

    if (!message || message.type !== 'tool-calls') {
      console.error('❌ Invalid request: Missing or wrong message type');
      console.error('Expected: "tool-calls", Got:', message?.type);
      return res.status(400).json({
        error: 'Invalid request: Expected tool-calls message type'
      });
    }

    const { toolCallList } = message;

    if (!toolCallList || toolCallList.length === 0) {
      console.error('❌ No tool calls in request');
      return res.status(400).json({
        error: 'Invalid request: No tool calls provided'
      });
    }

    // Process all tool calls and collect results
    const results = [];

    for (const toolCall of toolCallList) {
      const { id: toolCallId, name, arguments: params } = toolCall;

      console.log(`\n🔧 Tool called: ${name}`);
      console.log('Tool Call ID:', toolCallId);
      console.log('Arguments:', JSON.stringify(params, null, 2));

      let result;

      // Route to appropriate handler
      switch (name) {
        case 'createWorkOrder':
          console.log('→ Routing to handleCreateWorkOrder');
          result = await handleCreateWorkOrder(params);
          console.log('← handleCreateWorkOrder result:', JSON.stringify(result, null, 2));
          break;

        case 'escalateToEmergency':
          result = await handleEscalateToEmergency(params);
          break;

        case 'dispatchEmergencyVendor':
          result = await handleDispatchEmergencyVendor(params);
          break;

        case 'provideStatus':
          result = await handleProvideStatus(params);
          break;

        case 'confirmCompletion':
          result = await handleConfirmCompletion(params);
          break;

        case 'reopenWorkOrder':
          result = await handleReopenWorkOrder(params);
          break;

        case 'scheduleInspection':
          result = await handleScheduleInspection(params);
          break;

        default:
          result = {
            success: false,
            error: `Unknown function: ${name}`
          };
      }

      // Add to results array with toolCallId
      results.push({
        toolCallId: toolCallId,
        result: result
      });
    }

    // Return success response in VAPI format
    console.log(`\n✅ SUCCESS - Returning results to VAPI`);
    console.log('Results:', JSON.stringify(results, null, 2));
    console.log(`${'='.repeat(80)}\n`);

    res.json({
      results: results
    });

  } catch (error) {
    console.error(`\n${'='.repeat(80)}`);
    console.error('❌ ERROR PROCESSING WEBHOOK');
    console.error(`${'='.repeat(80)}`);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.response) {
      console.error('API Error Response:', JSON.stringify(error.response.data, null, 2));
    }
    console.error(`${'='.repeat(80)}\n`);

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
