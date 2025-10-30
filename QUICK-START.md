# MaintenanceBot - Quick Start Guide

Get your unified maintenance assistant up and running in minutes.

---

## What You'll Build

A single intelligent VAPI assistant that handles:
- **Intake**: New maintenance requests
- **Emergency**: Crisis management with safety guidance
- **Followup**: Post-repair quality verification

---

## Quick Setup (5 Steps)

### 1. Get Your API Key
- Sign up at [vapi.ai](https://vapi.ai)
- Get your API key from dashboard

### 2. Set Up Backend Endpoints

Your backend needs 7 endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/maintenance/work-orders` | POST | Create work order |
| `/maintenance/emergency/escalate` | POST | Escalate to emergency |
| `/maintenance/emergency/dispatch` | POST | Dispatch vendor |
| `/maintenance/emergency/status` | GET | Check dispatch status |
| `/maintenance/work-orders/complete` | POST | Close work order |
| `/maintenance/work-orders/reopen` | POST | Reopen work order |
| `/maintenance/inspections/schedule` | POST | Schedule inspection |

See `setup-guide.md` for endpoint specifications.

### 3. Create the Assistant

**Option A: Dashboard (Easiest)**
1. Log in to VAPI dashboard
2. Create new assistant
3. Copy config from `maintenance-assistant-config.json`
4. Add tools from `tools-config.json`
5. Update tool URLs to your backend
6. Save

**Option B: API (Fastest)**
```bash
export VAPI_API_KEY="your-api-key"
export BACKEND_API_URL="https://api.yourdomain.com"
npm install axios
node create-assistant.js
```

### 4. Test It

Test these scenarios:
- "My sink is leaking" (Intake)
- "No heat and it's 20 degrees outside" (Emergency)
- "Calling about the repair from yesterday" (Followup)

### 5. Deploy

1. Purchase phone number in VAPI dashboard
2. Assign to your assistant
3. Call and test with real phone
4. Monitor call logs

---

## Files Included

```
MAINTENANCE AGENT/
├── maintenance-assistant-config.json   # Main config
├── tools-config.json                   # 7 tool definitions
├── create-assistant.js                 # Auto-creation script
├── setup-guide.md                      # Detailed setup
├── example-calls.md                    # 10 example scenarios
├── README.md                           # Full documentation
└── QUICK-START.md                      # This file
```

---

## How It Works

### Mode Detection (Automatic)

The assistant intelligently detects which mode to use:

**INTAKE MODE**
- Trigger: "I have a problem", "Something is broken"
- Actions: Gather info → Classify urgency → Create work order
- Response time: 2 hours (urgent) or 24 hours (standard)

**EMERGENCY MODE**
- Trigger: Safety risk or severe property damage
- Actions: Safety guidance → Dispatch vendor immediately
- Response time: Vendor arrives within 1-2 hours

**FOLLOWUP MODE**
- Trigger: "Calling about the repair that was completed"
- Actions: Verify completion → Collect feedback → Close or reopen
- Response time: Immediate (on this call)

---

## Emergency Classification

### Emergency (Immediate Dispatch)
- HVAC failure when outside temp >90°F or <32°F
- Major water leaks/flooding
- Complete power outage or sparking
- Gas leaks
- Broken door locks

### Urgent (2 Hours)
- Minor water leaks
- Partial power outages
- Appliance failures
- HVAC issues in mild weather

### Standard (24 Hours)
- General repairs
- Non-essential appliances
- Minor plumbing
- Door/window issues

### Low (3-5 Days)
- Cosmetic issues
- Minor inconveniences

---

## 7 Tools Explained

### 1. createWorkOrder
**When**: After collecting tenant info (non-emergency)
**Input**: Unit, name, phone, description, urgency, category
**Output**: Work order ID, estimated response time

### 2. escalateToEmergency
**When**: Emergency detected during intake
**Input**: Tenant details, issue, safety notes
**Output**: Emergency work order ID, dispatch status

### 3. dispatchEmergencyVendor
**When**: In emergency mode after safety guidance
**Input**: Work order ID, category, arrival estimate, safety notes
**Output**: Dispatch ID, vendor name/phone, ETA

### 4. provideStatus
**When**: Tenant asks "Where is the technician?"
**Input**: Dispatch ID
**Output**: Current status, ETA, vendor phone

### 5. confirmCompletion
**When**: Followup call - tenant confirms issue resolved
**Input**: Work order ID, tenant feedback, quality rating
**Output**: Confirmation of closure

### 6. reopenWorkOrder
**When**: Followup call - issue NOT resolved
**Input**: Work order ID, reason, urgency
**Output**: New work order ID, callback estimate

### 7. scheduleInspection
**When**: Major repair or tenant concerns
**Input**: Work order ID, inspection type, availability
**Output**: Inspection ID, date/time, inspector

---

## Configuration Cheat Sheet

### Model Settings
```json
{
  "provider": "openai",
  "model": "gpt-4-turbo",
  "temperature": 0.7,
  "maxTokens": 500
}
```

**Optimize for speed**: Use `gpt-3.5-turbo`
**Optimize for accuracy**: Keep `gpt-4-turbo`

### Voice Settings
```json
{
  "provider": "11labs",
  "voiceId": "rachel",
  "stability": 0.5,
  "similarityBoost": 0.75
}
```

**Other voices**: `adam`, `antoni`, `bella`

### Call Settings
```json
{
  "maxDurationSeconds": 600,
  "silenceTimeoutSeconds": 30,
  "responseDelaySeconds": 0.5,
  "interruptionsEnabled": true,
  "recordingEnabled": true
}
```

**Calls too short?** Increase `silenceTimeoutSeconds` to 45
**Too slow?** Reduce `responseDelaySeconds` to 0.3

---

## Common Issues & Fixes

### Tools Not Being Called
- ✓ Check tool URLs point to your backend
- ✓ Verify backend is responding
- ✓ Check VAPI dashboard for errors

### Emergency Mode Not Triggering
- ✓ Ensure temperature is mentioned
- ✓ Ask "What's the temperature outside?"
- ✓ Check emergency classification logic

### Assistant Giving Repair Advice
- ✓ Review system prompt
- ✓ Add "NEVER give repair advice"
- ✓ This is a liability issue - fix immediately

### High API Costs
- ✓ Switch to `gpt-3.5-turbo`
- ✓ Reduce `maxTokens` to 300
- ✓ Review call logs for long conversations

---

## Testing Checklist

- [ ] Standard intake (sink leak)
- [ ] Emergency escalation (no heat)
- [ ] Emergency with safety guidance (burst pipe)
- [ ] Followup - issue resolved
- [ ] Followup - issue NOT resolved
- [ ] Followup - negative vendor feedback
- [ ] Pricing questions handled correctly
- [ ] All 7 tools called successfully
- [ ] Phone number working
- [ ] Call recording working

---

## Key Metrics to Track

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Call distribution | 60% Intake, 15% Emergency, 25% Followup | Balanced workload |
| Emergency accuracy | >95% | True emergencies escalated |
| Completion rate | >80% | Issues resolved first time |
| Avg call duration | 2-3 min | Efficient conversations |
| Quality rating | >4.0/5 | Tenant satisfaction |

---

## Next Steps After Setup

1. **Week 1**: Monitor daily, review all call recordings
2. **Week 2**: Analyze metrics, optimize prompts
3. **Month 1**: Train team on system usage
4. **Month 2**: Expand to additional properties
5. **Quarter 1**: Integrate with existing systems

---

## Support Resources

- **Full Docs**: See `README.md`
- **Setup Guide**: See `setup-guide.md`
- **Examples**: See `example-calls.md`
- **VAPI Docs**: https://docs.vapi.ai
- **Support**: support@aictive.com

---

## Pro Tips

💡 **Test with real scenarios**: Don't just test happy paths, test edge cases

💡 **Monitor the first 100 calls closely**: This is where you'll find issues

💡 **Update prompts based on real calls**: The system learns from your refinements

💡 **Train your team**: They should understand how the system works

💡 **Gather tenant feedback**: Ask how they like the automated system

💡 **Set up alerts**: Get notified of failed tool calls or errors

💡 **Review vendor performance**: Use quality ratings to identify top vendors

💡 **Optimize over time**: Don't expect perfection on day 1

---

## Quick Reference: Emergency Safety Guidance

| Emergency Type | Immediate Safety Guidance |
|---------------|---------------------------|
| **Gas Leak** | Evacuate immediately. No electronics/switches. Call 911 if strong smell. |
| **Major Water Leak** | Shut off main water valve (under sink or bathroom cabinet). |
| **HVAC - Extreme Heat** | Stay hydrated. Avoid activity. Go to cooler location if dizzy. |
| **HVAC - Extreme Cold** | Use blankets, close unused rooms, dress in layers. Arrange housing if below 50°F. |
| **Electrical** | Stay away from sparking outlet. Turn off power to room if safe. |
| **Broken Lock** | Don't leave unit unattended. Can arrange security if needed. |

---

## Success Checklist

- [x] Three maintenance persona files combined into one
- [x] One intelligent assistant handles entire lifecycle
- [x] Context-aware mode detection
- [x] 7 specialized tools configured
- [x] Professional boundaries maintained
- [x] Safety guidance for emergencies
- [x] Quality feedback collection
- [x] Complete documentation provided

---

## You're Ready!

You now have everything you need to deploy an intelligent maintenance assistant that handles intake, emergencies, and followup - all in one unified system.

**Questions?** Check the full documentation in `README.md` and `setup-guide.md`.

**Need help?** Contact support@aictive.com

**Ready to launch?** Follow the 5 steps above and you'll be live in under an hour.

---

**Good luck! 🚀**
