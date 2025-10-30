# MaintenanceBot DoorLoop Integration - COMPLETE

## 🎉 What's Been Created

Your unified maintenance assistant is now fully integrated with DoorLoop API!

---

## 📁 Files Created

### Core Files
1. **webhook-server.js** - Complete webhook server (Node.js/Express)
2. **package.json** - Dependencies configuration
3. **doorloop-tools-config.json** - All 7 tool configurations for DoorLoop

### Documentation
4. **DOORLOOP-INTEGRATION-GUIDE.md** - Complete integration guide
5. **DEPLOYMENT-GUIDE.md** - Step-by-step deployment instructions
6. **SUMMARY.md** - This file

### Previous Files (Still useful)
- maintenance-assistant-config.json
- tools-config.json (original generic version)
- README.md, setup-guide.md, example-calls.md
- create-assistant.js

---

## ✅ Your VAPI Assistant

**Assistant ID:** `65b8c896-3c88-40ef-ac6a-c25ce1592cfa`
**Name:** MaintenanceBot - Unified Assistant
**Status:** ✅ Created and ready

**View it here:** [VAPI Dashboard](https://vapi.ai)

---

## 🔧 What Works Right Now

### The Assistant Can:
- ✅ Have conversations in 3 modes (Intake, Emergency, Followup)
- ✅ Detect context and switch modes automatically
- ✅ Use professional voice (Cartesia)
- ✅ Handle interruptions
- ✅ Record calls

### What's Missing:
- ❌ Tools not connected yet (need webhook server deployed)
- ❌ Can't create work orders in DoorLoop (need webhook)
- ❌ Can't update tasks (need webhook)

---

## 🚀 Next Steps (In Order)

### Step 1: Deploy Webhook Server

**Option A: Render.com (Recommended - Free)**
1. Create GitHub repo
2. Push these files:
   - webhook-server.js
   - package.json
3. Go to [render.com](https://render.com)
4. Create Web Service from GitHub
5. Set environment variable: `DOORLOOP_API_TOKEN`
6. Deploy
7. Get URL (e.g., `https://vapi-doorloop-webhook.onrender.com`)

**Option B: Test Locally First**
```bash
cd "MAINTENANCE AGENT"
npm install express body-parser
npm start
```
Then test: http://localhost:3000/health

See `DEPLOYMENT-GUIDE.md` for detailed instructions.

---

### Step 2: Connect Webhook to VAPI

1. Go to [vapi.ai](https://vapi.ai)
2. Edit "MaintenanceBot - Unified Assistant"
3. Set **Server URL** to: `https://your-webhook-url.com/vapi/webhook`
4. Save

---

### Step 3: Add 7 Functions to VAPI

For each function below, add it in VAPI dashboard:

**Function 1: createWorkOrder**
```json
{
  "type": "function",
  "function": {
    "name": "createWorkOrder",
    "description": "Creates a new maintenance work order in DoorLoop",
    "parameters": {
      "type": "object",
      "properties": {
        "unitNumber": {"type": "string", "description": "Unit number"},
        "tenantName": {"type": "string", "description": "Tenant full name"},
        "tenantPhone": {"type": "string", "description": "Tenant phone"},
        "issueDescription": {"type": "string", "description": "Detailed issue description"},
        "urgency": {"type": "string", "enum": ["urgent", "standard", "low"]},
        "category": {"type": "string", "enum": ["plumbing", "electrical", "hvac", "appliance", "security", "general"]},
        "whenStarted": {"type": "string", "description": "When issue started (optional)"}
      },
      "required": ["unitNumber", "tenantName", "tenantPhone", "issueDescription", "urgency", "category"]
    }
  }
}
```

**Function 2: escalateToEmergency**
```json
{
  "type": "function",
  "function": {
    "name": "escalateToEmergency",
    "description": "Creates emergency high-priority task in DoorLoop",
    "parameters": {
      "type": "object",
      "properties": {
        "unitNumber": {"type": "string"},
        "tenantName": {"type": "string"},
        "tenantPhone": {"type": "string"},
        "issueDescription": {"type": "string"},
        "category": {"type": "string", "enum": ["hvac", "plumbing", "electrical", "gas", "security"]},
        "safetyNotes": {"type": "string", "description": "Safety concerns"}
      },
      "required": ["unitNumber", "tenantName", "tenantPhone", "issueDescription", "category"]
    }
  }
}
```

**Function 3: dispatchEmergencyVendor**
```json
{
  "type": "function",
  "function": {
    "name": "dispatchEmergencyVendor",
    "description": "Adds dispatch update to emergency task",
    "parameters": {
      "type": "object",
      "properties": {
        "workOrderId": {"type": "string", "description": "DoorLoop task ID"},
        "category": {"type": "string", "enum": ["hvac", "plumbing", "electrical", "security", "gas"]},
        "arrivalTimeEstimate": {"type": "string", "enum": ["30min", "1hour", "2hours"]},
        "safetyNotes": {"type": "string"},
        "tenantPhone": {"type": "string"}
      },
      "required": ["category", "arrivalTimeEstimate", "tenantPhone"]
    }
  }
}
```

**Function 4: provideStatus**
```json
{
  "type": "function",
  "function": {
    "name": "provideStatus",
    "description": "Gets current status of a task from DoorLoop",
    "parameters": {
      "type": "object",
      "properties": {
        "taskId": {"type": "string", "description": "DoorLoop task ID"}
      },
      "required": ["taskId"]
    }
  }
}
```

**Function 5: confirmCompletion**
```json
{
  "type": "function",
  "function": {
    "name": "confirmCompletion",
    "description": "Marks task as completed with tenant feedback",
    "parameters": {
      "type": "object",
      "properties": {
        "taskId": {"type": "string"},
        "tenantConfirmed": {"type": "boolean"},
        "issueResolved": {"type": "boolean"},
        "qualityRating": {"type": "integer", "enum": [1, 2, 3, 4, 5]},
        "feedbackNotes": {"type": "string"},
        "inspectionRequired": {"type": "boolean"}
      },
      "required": ["taskId", "tenantConfirmed", "issueResolved", "qualityRating", "feedbackNotes", "inspectionRequired"]
    }
  }
}
```

**Function 6: reopenWorkOrder**
```json
{
  "type": "function",
  "function": {
    "name": "reopenWorkOrder",
    "description": "Reopens a task that wasn't properly resolved",
    "parameters": {
      "type": "object",
      "properties": {
        "taskId": {"type": "string"},
        "reason": {"type": "string"},
        "urgency": {"type": "string", "enum": ["emergency", "urgent", "standard"]},
        "tenantAvailability": {"type": "string"}
      },
      "required": ["taskId", "reason", "urgency"]
    }
  }
}
```

**Function 7: scheduleInspection**
```json
{
  "type": "function",
  "function": {
    "name": "scheduleInspection",
    "description": "Creates manager inspection task",
    "parameters": {
      "type": "object",
      "properties": {
        "relatedTaskId": {"type": "string"},
        "inspectionType": {"type": "string", "enum": ["quality_check", "tenant_concern", "final_approval", "damage_assessment"]},
        "reason": {"type": "string"},
        "tenantAvailability": {"type": "string"},
        "unitNumber": {"type": "string"}
      },
      "required": ["relatedTaskId", "inspectionType", "reason", "tenantAvailability", "unitNumber"]
    }
  }
}
```

---

### Step 4: Test Everything

1. **Test in VAPI dashboard** - Click "Test" button
2. **Try intake scenario:**
   - "Hi, my sink is leaking in unit 204"
   - Provide details when asked
   - Check DoorLoop for new task

3. **Try emergency scenario:**
   - "My heat isn't working and it's freezing"
   - Check DoorLoop for high-priority task

4. **Try followup scenario:**
   - "I'm calling about the repair from yesterday"
   - Confirm it's fixed
   - Check DoorLoop - task should be completed

---

## 📊 How Data Flows

```
Tenant Call
    ↓
VAPI Assistant (Voice)
    ↓
Detects mode & collects info
    ↓
Calls function (e.g., createWorkOrder)
    ↓
VAPI sends to your webhook server
    ↓
Webhook server transforms data
    ↓
Calls DoorLoop API
    ↓
Task created in DoorLoop
    ↓
Response sent back to VAPI
    ↓
Assistant confirms to tenant
```

---

## 🔑 Your Credentials

**VAPI API Key:**
```
44d98331-b00a-435f-8788-30aad5f58510
```

**DoorLoop API Token:**
```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoiQVBJIiwiaWQiOiI2OGVlNmZiYjIxYjI0MjkxYjdmZTM4ODgiLCJleHAiOjIwNzU4MTY2MzV9.6D_BgXStGG-yVE5dogTmp_KQ7So0GRhtOBXbMUyLS1I
```

**VAPI Assistant ID:**
```
65b8c896-3c88-40ef-ac6a-c25ce1592cfa
```

**DoorLoop Base URL:**
```
https://app.doorloop.com/api
```

---

## 🛠️ How Each Tool Works

### createWorkOrder
- **Creates:** New task in DoorLoop
- **Priority:** High (urgent), Medium (standard), Low (low)
- **Status:** "Not Started"
- **Subject:** `[category] - [unit]: [description]`

### escalateToEmergency
- **Creates:** High-priority task with 🚨 emoji
- **Priority:** Always "High"
- **Includes:** Safety notes, expected response times
- **Action Required:** Property manager assigns vendor

### dispatchEmergencyVendor
- **Updates:** Existing task with dispatch confirmation
- **Adds:** Note that emergency coordinator dispatched
- **Documents:** Expected callback time (15 min)

### provideStatus
- **Retrieves:** Current task status from DoorLoop
- **Returns:** Status, priority, description, timestamps

### confirmCompletion
- **Updates:** Task status to "Completed"
- **Adds:** Tenant feedback, quality rating (1-5)
- **Documents:** Resolution confirmation

### reopenWorkOrder
- **Updates:** Task status back to "Not Started"
- **Increases:** Priority if needed
- **Documents:** Why reopening, vendor must return

### scheduleInspection
- **Creates:** New inspection task
- **Links:** To original work order
- **Priority:** Medium
- **For:** Major repairs or quality concerns

---

## 💰 Costs

### VAPI
- Free tier: 10 min/month
- Paid: ~$0.10-0.20 per minute (varies by usage)
- Voice provider costs included

### Webhook Hosting
- **Render.com**: Free tier (sleeps after inactivity, 750 hours/month)
- **Railway**: $5/month
- **Heroku**: Free tier deprecated, $7/month
- **Own server**: Your hosting costs

### DoorLoop
- Your existing subscription
- API access included

---

## 🐛 Troubleshooting

### Assistant created but can't call functions
→ Need to deploy webhook server and add serverUrl

### Webhook server can't reach DoorLoop
→ Check API token is set correctly
→ Verify token hasn't expired
→ Test with curl

### Tasks not appearing in DoorLoop
→ Check webhook server logs
→ Verify function names match exactly
→ Test each function individually

### "Function not found" error
→ Function name in VAPI must match webhook server
→ Case-sensitive!

---

## 📚 Documentation Reference

| File | Purpose |
|------|---------|
| `DOORLOOP-INTEGRATION-GUIDE.md` | Complete integration overview |
| `DEPLOYMENT-GUIDE.md` | Deploy webhook server |
| `README.md` | Original assistant documentation |
| `setup-guide.md` | Initial VAPI setup |
| `example-calls.md` | 10 conversation examples |

---

## ✨ What's Next?

After you deploy and test:

1. **Monitor first week closely**
   - Check DoorLoop tasks are created correctly
   - Review call recordings
   - Adjust priorities if needed

2. **Train your team**
   - How the system works
   - When to intervene manually
   - How to assign vendors

3. **Optional Enhancements**
   - Auto-assign vendors based on category
   - Add custom fields to tasks
   - Integrate with vendor calendars
   - Add SMS notifications

4. **Scale Up**
   - Purchase phone number
   - Add to your website
   - Promote to tenants
   - Monitor analytics

---

## 🎯 Success Metrics to Track

- **Task Creation Rate**: How many tasks created per day
- **Emergency Response Time**: How fast emergencies are handled
- **Tenant Satisfaction**: Quality ratings from followups
- **Completion Rate**: % of tasks completed on first try
- **Reopen Rate**: % of tasks that need to be reopened

---

## 📞 Support

If you need help:

1. Check `DEPLOYMENT-GUIDE.md` for deployment issues
2. Check `DOORLOOP-INTEGRATION-GUIDE.md` for integration issues
3. Review webhook server logs for API errors
4. Test each component individually

---

## 🚀 You're Ready!

Everything is configured and ready to deploy. Just follow the Next Steps above and you'll have a fully working maintenance assistant integrated with DoorLoop!

**Files Location:**
`C:\Users\jvill_4n9gpf4\VAPI\MAINTENANCE AGENT\`

Good luck! 🎉
