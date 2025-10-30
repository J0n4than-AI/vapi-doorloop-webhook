# MaintenanceBot - Setup Guide

This guide will walk you through setting up the MaintenanceBot Unified Assistant from scratch.

---

## Prerequisites

Before you begin, ensure you have:

- [ ] VAPI account (sign up at [vapi.ai](https://vapi.ai))
- [ ] VAPI API key
- [ ] Backend API to handle tool calls
- [ ] Node.js installed (for API creation script)
- [ ] Phone number (optional, for inbound calls)

---

## Step 1: Set Up Your VAPI Account

### 1.1 Create Account
1. Go to [vapi.ai](https://vapi.ai)
2. Click "Sign Up"
3. Complete registration
4. Verify your email

### 1.2 Get API Key
1. Log in to VAPI dashboard
2. Click on your profile (top right)
3. Select "API Keys"
4. Click "Create New API Key"
5. Copy and save your API key securely
6. **Never share or commit your API key**

---

## Step 2: Set Up Backend API

Your backend needs to implement **7 endpoints** to handle tool calls from the assistant.

### Required Endpoints

#### 1. POST /maintenance/work-orders
**Purpose**: Create new work order (non-emergency)

**Request Body**:
```json
{
  "unitNumber": "101",
  "tenantName": "John Smith",
  "tenantPhone": "555-123-4567",
  "issueDescription": "Kitchen sink leaking under cabinet",
  "urgency": "urgent",
  "category": "plumbing",
  "whenStarted": "this morning"
}
```

**Response**:
```json
{
  "workOrderId": "WO-5432",
  "estimatedResponseTime": "2 hours"
}
```

#### 2. POST /maintenance/emergency/escalate
**Purpose**: Escalate to emergency workflow

**Request Body**:
```json
{
  "unitNumber": "105",
  "tenantName": "Michael Davis",
  "tenantPhone": "555-321-9876",
  "issueDescription": "No heat, outside temp 25F, has 2-year-old child",
  "category": "hvac",
  "safetyNotes": "Tenant has small child, extreme cold outside"
}
```

**Response**:
```json
{
  "emergencyWorkOrderId": "WO-5433-EMERG",
  "dispatchStatus": "Emergency workflow started"
}
```

#### 3. POST /maintenance/emergency/dispatch
**Purpose**: Dispatch on-call emergency vendor

**Request Body**:
```json
{
  "workOrderId": "WO-5433-EMERG",
  "category": "hvac",
  "arrivalTimeEstimate": "1hour",
  "safetyNotes": "Tenant has small child, extreme cold outside (25F)"
}
```

**Response**:
```json
{
  "dispatchId": "DISP-789",
  "vendorName": "ABC Emergency Services",
  "vendorPhone": "555-999-8888",
  "estimatedArrival": "Within 1-2 hours",
  "status": "Dispatched - vendor will call tenant within 15 minutes"
}
```

#### 4. GET /maintenance/emergency/status
**Purpose**: Check emergency dispatch status

**Query Parameters**: `dispatchId`

**Response**:
```json
{
  "status": "Vendor en route",
  "estimatedArrival": "45 minutes",
  "vendorPhone": "555-999-8888",
  "lastUpdate": "2025-10-30T10:30:00Z"
}
```

#### 5. POST /maintenance/work-orders/complete
**Purpose**: Close work order with feedback

**Request Body**:
```json
{
  "workOrderId": "WO-5432",
  "tenantConfirmed": true,
  "issueResolved": true,
  "qualityRating": 5,
  "feedbackNotes": "Tenant says sink working great, technician was professional and on time",
  "inspectionRequired": false
}
```

**Response**:
```json
{
  "status": "Work order closed",
  "closedDate": "2025-10-30T14:30:00Z",
  "tenantSatisfactionRecorded": true
}
```

#### 6. POST /maintenance/work-orders/reopen
**Purpose**: Reopen incomplete work order

**Request Body**:
```json
{
  "workOrderId": "WO-5432",
  "reason": "HVAC blowing air but not warm, unit not heating adequately",
  "urgency": "urgent",
  "tenantAvailability": "Most evenings after 5pm"
}
```

**Response**:
```json
{
  "status": "Work order reopened",
  "newWorkOrderId": "WO-5432-R1",
  "vendorNotified": true,
  "estimatedCallback": "Within 2 hours"
}
```

#### 7. POST /maintenance/inspections/schedule
**Purpose**: Schedule manager inspection

**Request Body**:
```json
{
  "workOrderId": "WO-5432",
  "inspectionType": "quality_check",
  "reason": "Major repair (>$500), manager inspection required",
  "tenantAvailability": "Tuesday or Wednesday afternoons"
}
```

**Response**:
```json
{
  "inspectionId": "INS-789",
  "inspectionDate": "2025-11-01T14:00:00Z",
  "inspector": "Property Manager Jane Smith",
  "calendarLink": "https://calendar.aictive.com/ins-789"
}
```

### Backend Implementation Examples

**Node.js/Express Example**:
```javascript
const express = require('express');
const app = express();

app.use(express.json());

// Create work order
app.post('/maintenance/work-orders', async (req, res) => {
  const { unitNumber, tenantName, tenantPhone, issueDescription, urgency, category } = req.body;

  // Your logic here: save to database, send notifications, etc.
  const workOrderId = generateWorkOrderId();

  res.json({
    workOrderId,
    estimatedResponseTime: urgency === 'urgent' ? '2 hours' : '24 hours'
  });
});

// ... implement other endpoints
```

**Python/Flask Example**:
```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/maintenance/work-orders', methods=['POST'])
def create_work_order():
    data = request.json

    # Your logic here
    work_order_id = generate_work_order_id()

    return jsonify({
        'workOrderId': work_order_id,
        'estimatedResponseTime': '2 hours' if data['urgency'] == 'urgent' else '24 hours'
    })

# ... implement other endpoints
```

---

## Step 3: Create the Assistant

You have two options for creating the assistant:

### Option A: Using VAPI Dashboard (Recommended for beginners)

1. **Log in to VAPI dashboard**

2. **Create new assistant**
   - Click "Assistants" in sidebar
   - Click "Create Assistant"

3. **Configure basic settings**
   - Name: "MaintenanceBot - Unified Assistant"
   - Model: OpenAI GPT-4 Turbo
   - Temperature: 0.7
   - Max Tokens: 500

4. **Add system prompt**
   - Copy the entire system prompt from `maintenance-assistant-config.json`
   - Paste into the "System Prompt" field

5. **Configure voice**
   - Provider: ElevenLabs
   - Voice: Rachel
   - Stability: 0.5
   - Similarity Boost: 0.75

6. **Add first message**
   ```
   Hi! This is MaintenanceBot from Aictive Management. I'm here to help you today. Are you calling about a new maintenance issue, or following up on an existing work order?
   ```

7. **Configure call settings**
   - Max Duration: 600 seconds
   - Silence Timeout: 30 seconds
   - Enable Interruptions: Yes
   - Enable Recording: Yes

8. **Add tools**
   - Click "Add Tool"
   - For each tool in `tools-config.json`:
     - Select "Function"
     - Copy tool configuration
     - Update `server.url` to your backend API URL
     - Save

9. **Save assistant**

### Option B: Using API (Recommended for developers)

1. **Set environment variables**
   ```bash
   export VAPI_API_KEY="your-vapi-api-key-here"
   export BACKEND_API_URL="https://api.yourdomain.com"
   ```

2. **Install dependencies**
   ```bash
   npm install axios
   ```

3. **Run creation script**
   ```bash
   node create-assistant.js
   ```

4. **Save the Assistant ID**
   The script will output an Assistant ID. Save this for later use.

---

## Step 4: Test the Assistant

### 4.1 Test in Dashboard

1. Go to VAPI dashboard
2. Navigate to your assistant
3. Click "Test" button
4. Have a conversation to test different modes:
   - **Intake Mode**: "Hi, my sink is leaking"
   - **Emergency Mode**: "My heat isn't working and it's freezing outside"
   - **Followup Mode**: "I'm calling about the repair that was completed"

### 4.2 Verify Tool Calls

1. During testing, watch the "Tool Calls" section
2. Verify each tool is being called correctly
3. Check that your backend is receiving requests
4. Verify responses are correct

### 4.3 Common Test Scenarios

**Test 1: Standard Intake**
```
You: "Hi, my dishwasher isn't working"
Bot: Collects info → Creates work order → Sets expectations
```

**Test 2: Emergency Escalation**
```
You: "My heat is out and it's 20 degrees outside"
Bot: Gathers info → Escalates to emergency → Dispatches vendor
```

**Test 3: Followup Completion**
```
You: "I'm calling about the sink repair from yesterday"
Bot: Verifies completion → Collects feedback → Closes work order
```

**Test 4: Followup Reopening**
```
You: "The repair didn't work, the problem is still there"
Bot: Gathers details → Reopens work order → Sets callback expectations
```

---

## Step 5: Set Up Phone Number (Optional)

### 5.1 Purchase Phone Number

1. In VAPI dashboard, go to "Phone Numbers"
2. Click "Purchase Number"
3. Select country and area code
4. Complete purchase

### 5.2 Assign Number to Assistant

1. Click on your phone number
2. Under "Assistant", select "MaintenanceBot - Unified Assistant"
3. Save changes

### 5.3 Test Phone Calls

1. Call your VAPI phone number
2. Have a real conversation
3. Verify all modes work correctly
4. Check call recordings in dashboard

---

## Step 6: Monitor and Optimize

### 6.1 Monitor Call Logs

1. Go to "Call Logs" in dashboard
2. Review recent calls
3. Listen to recordings
4. Check for issues:
   - Is the assistant detecting modes correctly?
   - Are tools being called appropriately?
   - Is the tone and pacing good?

### 6.2 Track Metrics

Monitor these key metrics:

- **Call Distribution**: % of calls in each mode (Intake/Emergency/Followup)
- **Emergency Accuracy**: Are true emergencies being escalated?
- **Completion Rate**: % of followup calls that close work orders
- **Average Call Duration**: Aim for 2-3 minutes for intake, 3-5 for emergency
- **Tenant Satisfaction**: Quality ratings from followup calls

### 6.3 Optimize Performance

**If calls are too slow**:
- Switch from `gpt-4-turbo` to `gpt-3.5-turbo`
- Reduce `responseDelaySeconds` to 0.3

**If assistant interrupts too much**:
- Increase `numWordsToInterruptAssistant` to 3-4

**If calls end too quickly**:
- Increase `silenceTimeoutSeconds` to 45

**If assistant is too chatty**:
- Reduce `maxTokens` to 300
- Lower `temperature` to 0.5

---

## Step 7: Production Deployment

### 7.1 Security Checklist

- [ ] API keys stored securely (environment variables, not hardcoded)
- [ ] Backend API uses HTTPS
- [ ] Authentication implemented on backend endpoints
- [ ] Rate limiting configured
- [ ] Error handling implemented
- [ ] Logging and monitoring set up

### 7.2 Compliance Checklist

- [ ] Call recording consent (if required in your jurisdiction)
- [ ] Data retention policy defined
- [ ] Privacy policy updated
- [ ] HIPAA compliance (if handling health information)

### 7.3 Launch Checklist

- [ ] All tools tested and working
- [ ] Phone number assigned
- [ ] Backend API in production
- [ ] Monitoring dashboards set up
- [ ] On-call schedule configured
- [ ] Vendor notifications working
- [ ] Team trained on system

---

## Troubleshooting

### Issue: Tools not being called

**Possible causes**:
- Backend API URL is incorrect
- Backend API is not responding
- Authentication failure

**Solutions**:
1. Check tool configurations in VAPI dashboard
2. Verify `server.url` points to correct endpoint
3. Test endpoints directly with curl/Postman
4. Check backend logs for errors

### Issue: Assistant gives repair advice

**Problem**: Assistant should NEVER give specific repair advice (liability)

**Solutions**:
1. Review system prompt
2. Add explicit instruction: "NEVER give repair advice"
3. Review recent calls where this happened
4. Update prompt if needed

### Issue: Emergency mode not triggering

**Problem**: True emergencies not being escalated

**Solutions**:
1. Review emergency classification logic in prompt
2. Ensure assistant is asking about temperature for HVAC issues
3. Check if `escalateToEmergency` tool is configured correctly
4. Test with explicit emergency scenarios

### Issue: Calls ending prematurely

**Possible causes**:
- Silence timeout too short
- End call phrases too broad

**Solutions**:
1. Increase `silenceTimeoutSeconds` to 45
2. Review and narrow `endCallPhrases`
3. Check for accidental trigger words in conversation

### Issue: High API costs

**Solutions**:
1. Switch from `gpt-4-turbo` to `gpt-3.5-turbo`
2. Reduce `maxTokens` to 300
3. Enable caching (if available)
4. Review call logs for unnecessarily long conversations

---

## Support

### Documentation
- VAPI Documentation: https://docs.vapi.ai
- OpenAI API: https://platform.openai.com/docs
- ElevenLabs: https://elevenlabs.io/docs

### Community
- VAPI Discord: https://discord.gg/vapi
- VAPI GitHub: https://github.com/VapiAI

### Contact
- Aictive Management Support: support@aictive.com
- VAPI Support: support@vapi.ai

---

## Next Steps

After successful setup:

1. **Train your team** on how the system works
2. **Monitor performance** daily for the first week
3. **Gather feedback** from tenants and adjust as needed
4. **Expand capabilities** with additional tools and features
5. **Integrate with existing systems** (CRM, property management software)

---

## Congratulations!

You've successfully set up the MaintenanceBot Unified Assistant. Your tenants now have 24/7 intelligent maintenance support across the entire lifecycle.

For questions or issues, refer to the troubleshooting section above or contact support.
