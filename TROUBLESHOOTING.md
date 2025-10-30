# 🔧 Troubleshooting Guide

## Issues Reported

1. ❌ Voice agent says "technical issue" when creating work order
2. ❌ Call not being recorded in VAPI

---

## Issue 1: Work Order Creation Failing

### Debug Steps

I've added logging to see what's happening. To view the logs:

**Option A: View Render Logs (Recommended)**
1. Go to: https://dashboard.render.com
2. Click on your `vapi-doorloop-webhook` service
3. Click "Logs" tab
4. Make a test call
5. Watch the logs in real-time to see what's failing

**Look for these log messages:**
```
🔐 AUTH ATTEMPT: Unit="...", Tenant="..."
   Units found: X
   ✓ Unit matched: ...
   Active leases: X
   Lease name: "..."
   Lease tenants: [...]
   Caller name (lowercase): "..."
   Comparing "..." vs "...": ✓ MATCH or ✗ no match
   ✅ AUTHENTICATED or ❌ Name authentication FAILED
```

### Common Problems & Solutions

**Problem: Authentication fails**
- **Solution**: Make sure you're providing your name EXACTLY as it appears in DoorLoop
- **Example**: If DoorLoop has "Smoke - John Smith", say "Smoke John Smith" or just "John Smith"

**Problem: Unit not found**
- **Solution**: Provide the unit name/number exactly as shown in DoorLoop
- **Example**: "101A" not "101 A" or "unit 101A"

**Problem: No active lease**
- **Solution**: Your lease might be expired or not set to ACTIVE status in DoorLoop
- **Fix**: Contact property manager to verify lease status

---

## Issue 2: Calls Not Being Recorded

### Check VAPI Settings

1. Go to: https://dashboard.vapi.ai/assistants/65b8c896-3c88-40ef-ac6a-c25ce1592cfa
2. Click "Edit" on your assistant
3. Scroll to **"Call Settings"** or **"Recording"** section
4. Make sure **"Record Calls"** is ENABLED

### Enable Call Recording

If recording is disabled:
1. In VAPI assistant settings
2. Find "Recording" or "Call Settings"
3. Toggle "Record Calls" to ON
4. Click "Save"

### Where to Find Recorded Calls

After enabling:
1. Go to VAPI Dashboard: https://dashboard.vapi.ai
2. Click "Calls" in left sidebar
3. You should see all calls listed with:
   - Timestamp
   - Duration
   - Recording link
   - Transcript

---

## Quick Test Script

To test if authentication is working properly, tell me:

1. **What unit number did you use?** (e.g., "101A", "Smoke Test")
2. **What name did you provide?** (e.g., "John Smith", "Smoke - John Smith")

I can then test that exact combination to see what's failing.

---

## Temporary Workaround: Disable Authentication

If you need the system working immediately while we debug:

**Edit webhook-server.js** (lines 140-150):
```javascript
// Comment out authentication check temporarily
// const authResult = await authenticateTenant(unitNumber, tenantName);
// if (!authResult.authenticated) {
//   return {
//     success: false,
//     error: 'Authentication failed',
//     reason: authResult.reason,
//     message: authResult.message
//   };
// }

// Temporary: skip authentication
console.log('⚠️  AUTHENTICATION DISABLED FOR TESTING');
```

**Then commit and push:**
```bash
cd "C:\Users\jvill_4n9gpf4\VAPI\MAINTENANCE AGENT"
git add webhook-server.js
git commit -m "Temporarily disable authentication for testing"
git push
```

⚠️ **WARNING**: This allows ANYONE to create work orders. Only use for testing!

---

## Next Steps

1. **Check Render logs** after making a call
2. **Tell me what unit and name you used**
3. **Check VAPI recording settings**
4. I'll fix the specific issue causing the failure

The system is working - we just need to see what's happening in the logs to fix it!
