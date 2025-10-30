# 🔍 How to Check Render Logs to Debug VAPI Calls

I've deployed enhanced logging to help us see exactly what's failing when you make real phone calls.

## Steps to Check Logs

### 1. Make a Test Call

Call your VAPI number and try to create a work order. For example:
- Call the number
- Say: "I'm Ashley Collins from unit C5"
- Try to report an issue: "My air conditioning is not working"
- Wait for it to fail with "technical issue"

### 2. Open Render Logs

1. Go to: **https://dashboard.render.com**
2. Log in to your account
3. Click on your service: **`vapi-doorloop-webhook`**
4. Click the **"Logs"** tab at the top

### 3. Look for the Error

The logs will show detailed information about what happened. Look for:

```
================================================================================
📞 WEBHOOK RECEIVED at [timestamp]
================================================================================
Full request body: { ... }

🔧 Function called: createWorkOrder
Parameters: { ... }

→ Routing to handleCreateWorkOrder
```

Then look for either:

**If it succeeded:**
```
✅ SUCCESS - Returning result to VAPI
```

**If it failed:**
```
================================================================================
❌ ERROR PROCESSING WEBHOOK
================================================================================
Error type: ...
Error message: ...
Error stack: ...
```

### 4. What to Look For

Common issues:

**Authentication Failure:**
```
🔐 AUTH ATTEMPT: Unit="...", Tenant="..."
❌ Name authentication FAILED
```

**Missing Parameters:**
```
Parameters: {
  unitNumber: undefined,  ← Missing!
  tenantName: "Ashley Collins",
  ...
}
```

**DoorLoop API Error:**
```
API Error Response: {
  "message": "Validation Failed",
  "errors": { ... }
}
```

**Tenant ID Not Found:**
```
⚠️  Tenant ID not found, will use lease-based creation
```

### 5. Share the Logs

Copy the entire log section for the failed call (from the "WEBHOOK RECEIVED" line to the "ERROR" or "SUCCESS" line) and share it with me.

## What I'm Looking For

Since our API tests work perfectly, but your real calls don't, the issue is likely:

1. **VAPI is sending parameters in a different format** - Maybe `unit_number` instead of `unitNumber`
2. **Missing required parameters** - VAPI might not be extracting the information correctly
3. **Timeout issues** - The call might be timing out before completion
4. **Authentication failing on real calls** - The tenant name or unit from voice might not match exactly

## Quick Check

While looking at logs, you can also test the webhook directly with curl:

```bash
curl -X POST https://vapi-doorloop-webhook.onrender.com/vapi/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "type": "function-call",
      "functionCall": {
        "name": "createWorkOrder",
        "parameters": {
          "unitNumber": "C5",
          "tenantName": "Ashley Collins",
          "tenantPhone": "555-1234",
          "issueDescription": "Test issue",
          "urgency": "standard",
          "category": "plumbing",
          "whenStarted": "Now"
        }
      }
    }
  }'
```

If this works but phone calls don't, then the issue is with how VAPI is calling the webhook.

---

**Next Steps:**
1. Make a test call
2. Check Render logs immediately after
3. Copy the error logs and send them to me
4. I'll fix the exact issue causing the failure
