# MaintenanceBot - Unified VAPI Assistant

## Overview

This is a **unified intelligent assistant** that combines three maintenance coordination personas into one context-aware AI agent:

1. **Intake Mode** - First point of contact for new maintenance requests
2. **Emergency Mode** - Crisis management for urgent safety and property damage issues
3. **Followup Mode** - Post-repair quality verification and closure

The assistant intelligently detects which mode to use based on the conversation context and dynamically switches between modes as needed.

---

## Features

### Multi-Mode Intelligence
- **Context-Aware**: Automatically detects whether caller is reporting a new issue, experiencing an emergency, or following up on a completed repair
- **Dynamic Switching**: Can switch modes mid-conversation if needed (e.g., followup call reveals new emergency)
- **Unified Experience**: One assistant handles entire maintenance lifecycle

### Comprehensive Capabilities

**Intake Mode:**
- Gather work order information systematically
- Classify urgency using safety and property damage criteria
- Create work orders in system
- Set accurate response time expectations
- Escalate emergencies automatically

**Emergency Mode:**
- Provide immediate safety guidance by emergency type
- Dispatch on-call vendors within 2 minutes
- Coordinate communication between tenant and vendor
- Manage expectations (1-2 hour arrival time)
- Track vendor status and provide updates

**Followup Mode:**
- Verify work completion and quality
- Collect tenant feedback on vendor experience
- Schedule manager inspections for major repairs
- Close work orders properly or reopen if needed
- Identify remaining issues or concerns

### Professional Boundaries
- Does NOT give repair advice (liability)
- Does NOT quote pricing (requires assessment)
- Does NOT diagnose complex issues (needs on-site visit)
- DOES provide safety guidance for emergencies
- DOES set accurate expectations
- DOES show empathy and reassurance

---

## Architecture

### Files Included

```
MAINTENANCE AGENT/
├── maintenance-assistant-config.json   # Main VAPI assistant configuration
├── tools-config.json                   # Tool definitions (7 tools)
├── README.md                           # This file
├── setup-guide.md                      # Step-by-step setup instructions
├── create-assistant.js                 # Node.js script to create assistant via API
└── example-calls.md                    # Example conversation flows
```

### Tool Definitions

The assistant has access to **7 specialized tools**:

1. **createWorkOrder** - Creates new maintenance work orders (non-emergency)
2. **escalateToEmergency** - Escalates to emergency workflow
3. **dispatchEmergencyVendor** - Dispatches on-call emergency vendor immediately
4. **provideStatus** - Checks emergency dispatch status and ETA
5. **confirmCompletion** - Closes work order with tenant feedback
6. **reopenWorkOrder** - Reopens work order if issue not resolved
7. **scheduleInspection** - Schedules manager inspection for quality verification

---

## Setup Instructions

### Prerequisites

1. **VAPI Account** - Sign up at [vapi.ai](https://vapi.ai)
2. **API Key** - Get your VAPI API key from dashboard
3. **Backend API** - You need an API endpoint to receive tool calls (see Backend Setup below)
4. **Phone Number** (Optional) - Purchase a phone number from VAPI for inbound calls

### Quick Start

#### Option 1: Using VAPI Dashboard (Recommended)

1. Log in to your VAPI dashboard
2. Click "Create Assistant"
3. Copy the contents of `maintenance-assistant-config.json`
4. Paste into the configuration editor
5. Add your tool configurations from `tools-config.json`
6. Update the `server.url` in each tool to point to your API
7. Save and deploy

#### Option 2: Using VAPI API

```bash
# Install dependencies
npm install axios

# Set your API key
export VAPI_API_KEY="your-api-key-here"

# Run the creation script
node create-assistant.js
```

See `setup-guide.md` for detailed step-by-step instructions.

---

## Backend API Requirements

Your backend needs to implement endpoints for each tool. Here's what each endpoint should do:

### POST /maintenance/work-orders
**Purpose**: Create a new work order
**Input**: unitNumber, tenantName, tenantPhone, issueDescription, urgency, category
**Output**: `{ workOrderId, estimatedResponseTime }`

### POST /maintenance/emergency/escalate
**Purpose**: Escalate to emergency workflow
**Input**: unitNumber, tenantName, tenantPhone, issueDescription, category, safetyNotes
**Output**: `{ emergencyWorkOrderId, dispatchStatus }`

### POST /maintenance/emergency/dispatch
**Purpose**: Dispatch on-call emergency vendor
**Input**: workOrderId, category, arrivalTimeEstimate, safetyNotes
**Output**: `{ dispatchId, vendorName, vendorPhone, estimatedArrival, status }`

### GET /maintenance/emergency/status
**Purpose**: Check emergency dispatch status
**Input**: dispatchId
**Output**: `{ status, estimatedArrival, vendorPhone, lastUpdate }`

### POST /maintenance/work-orders/complete
**Purpose**: Close work order with feedback
**Input**: workOrderId, tenantConfirmed, issueResolved, qualityRating, feedbackNotes, inspectionRequired
**Output**: `{ status, closedDate, tenantSatisfactionRecorded }`

### POST /maintenance/work-orders/reopen
**Purpose**: Reopen incomplete work order
**Input**: workOrderId, reason, urgency, tenantAvailability
**Output**: `{ status, newWorkOrderId, vendorNotified, estimatedCallback }`

### POST /maintenance/inspections/schedule
**Purpose**: Schedule manager inspection
**Input**: workOrderId, inspectionType, reason, tenantAvailability
**Output**: `{ inspectionId, inspectionDate, inspector, calendarLink }`

---

## Usage Examples

### Example 1: Standard Intake Call

**Tenant**: "Hi, my kitchen sink is leaking."

**Bot (Intake Mode)**: "Hi! This is MaintenanceBot from Aictive Management. I'm here to help with your maintenance request. Can you start by telling me your unit number?"

**Tenant**: "Unit 204"

**Bot**: "Thank you! And what's your name?"

... *[continues with systematic data collection]*

**Bot**: "Perfect! I've created work order #WO-5432. This is classified as urgent, so you can expect a call from our technician within 2 hours. Is there anything else I can help you with?"

---

### Example 2: Emergency Escalation

**Tenant**: "My heat isn't working and it's 25 degrees outside!"

**Bot (Intake Mode → Emergency Mode)**: "I understand, let me help you right away. What's your unit number?"

... *[collects info and detects emergency]*

**Bot**: "This is classified as an emergency situation. I'm transferring you to our emergency coordinator now..."

**Bot (Emergency Mode)**: "Hi [NAME], I have your details. First, are you safe right now?"

... *[provides safety guidance and dispatches vendor]*

**Bot**: "I've just dispatched our emergency technician. They'll call you within 15 minutes and arrive within 1-2 hours. Help is on the way."

---

### Example 3: Followup Call

**Bot (Followup Mode)**: "Hi Sarah, this is MaintenanceBot from Aictive Management. I'm calling about the kitchen sink leak that was recently repaired in unit 204. Do you have a quick minute?"

**Tenant**: "Sure!"

**Bot**: "Great! I see that ABC Plumbing completed the repair on Monday. Did they fix the leak?"

**Tenant**: "Yes, it's working great now."

... *[continues with verification questions]*

**Bot**: "Perfect! I've closed this work order. Thank you for your patience, and if anything changes, just give us a call. Have a great day!"

---

## Configuration Options

### Voice Settings

The assistant uses ElevenLabs "Rachel" voice by default:

```json
"voice": {
  "provider": "11labs",
  "voiceId": "rachel",
  "stability": 0.5,
  "similarityBoost": 0.75,
  "speed": 1.0
}
```

**Available Voices**: You can change `voiceId` to any ElevenLabs voice:
- `rachel` - Professional, friendly female (default)
- `adam` - Professional male
- `antoni` - Warm, friendly male
- `bella` - Calm, professional female

### Call Settings

```json
"maxDurationSeconds": 600,          // 10 minute max call length
"silenceTimeoutSeconds": 30,        // End call after 30 seconds silence
"responseDelaySeconds": 0.5,        // 0.5 second pause before responding
"interruptionsEnabled": true,       // Allow caller to interrupt
"recordingEnabled": true            // Record all calls
```

### Model Settings

```json
"model": {
  "provider": "openai",
  "model": "gpt-4-turbo",           // Fast, intelligent responses
  "temperature": 0.7,                // Balanced creativity
  "maxTokens": 500                   // Keep responses concise
}
```

---

## Monitoring & Analytics

### Call Recording
All calls are recorded by default. Access recordings in your VAPI dashboard under "Call Logs".

### Metrics to Track
- **Mode Distribution**: % of calls in Intake vs Emergency vs Followup
- **Emergency Classification Accuracy**: Are true emergencies being escalated?
- **Followup Success Rate**: % of work orders closed on first followup call
- **Average Call Duration**: Track efficiency by mode
- **Tenant Satisfaction**: Quality ratings from followup calls
- **Vendor Performance**: On-time rates, professionalism scores

### Integration with Helicone
The system is designed to integrate with Helicone for LLM observability:
- All tool calls are traced
- Response times monitored
- Token usage tracked
- Quality metrics logged

---

## Emergency Classification Logic

### Emergency (Immediate Dispatch)
- Complete HVAC failure when outside temp >90°F or <32°F
- Major water leaks (flooding, burst pipes)
- Complete power outage or sparking outlets
- Gas leaks
- Broken door locks preventing security

### Urgent (2-Hour Response)
- Minor to moderate water leaks
- Partial power outages
- Appliance failures (refrigerator, stove, water heater)
- HVAC issues in mild weather (65-85°F)
- Plumbing backups

### Standard (24-Hour Response)
- General repairs (drywall, paint)
- Non-essential appliance issues
- Minor plumbing issues
- Door/window issues (no security impact)

### Low (3-5 Days)
- Cosmetic issues
- Minor inconveniences

---

## Best Practices

### For Property Managers

1. **Monitor Emergency Escalations**: Review emergency calls daily to ensure proper classification
2. **Track Vendor Performance**: Use quality ratings to identify top vendors
3. **Review Reopened Work Orders**: High reopen rate indicates vendor quality issues
4. **Analyze Tenant Feedback**: Identify patterns in negative feedback

### For System Administrators

1. **Update Tool URLs**: Ensure all tool endpoints point to production API
2. **Set API Keys Securely**: Use environment variables, never hardcode
3. **Test All Modes**: Test intake, emergency, and followup flows regularly
4. **Monitor Call Costs**: Track API usage and optimize as needed
5. **Review Transcripts**: Regularly review call transcripts for quality

### For Tenants

The assistant is designed to:
- Make reporting maintenance issues easy and fast
- Provide immediate help in emergencies
- Keep them informed throughout the process
- Ensure their satisfaction with completed work

---

## Troubleshooting

### Common Issues

**Issue**: Assistant not detecting emergency mode
**Solution**: Check that temperature thresholds are mentioned in conversation. Ask "What's the temperature outside right now?"

**Issue**: Tools not being called
**Solution**: Verify tool URLs are correct and API is responding. Check VAPI logs for tool call errors.

**Issue**: Assistant giving repair advice
**Solution**: Review system prompt. It should NEVER give specific repair advice due to liability.

**Issue**: Calls ending too quickly
**Solution**: Adjust `silenceTimeoutSeconds` to give tenants more time to think/respond.

**Issue**: Response too slow
**Solution**: Consider switching from `gpt-4-turbo` to `gpt-3.5-turbo` for faster responses.

---

## Roadmap

### Planned Features

- **Multilingual Support**: Spanish, French, Mandarin
- **SMS Followups**: Automated SMS after work order creation
- **Photo Collection**: Request tenants send photos of issue via SMS
- **Vendor Ratings Dashboard**: Real-time vendor performance tracking
- **Predictive Maintenance**: Identify patterns in maintenance requests
- **Integration with Calendar**: Direct scheduling with vendor calendars

---

## Support

### Documentation
- Full setup guide: `setup-guide.md`
- Example conversations: `example-calls.md`
- API reference: See backend API requirements above

### Contact
- **Company**: Aictive Management
- **Email**: support@aictive.com
- **VAPI Support**: https://docs.vapi.ai

---

## License

Proprietary - Aictive Management
© 2025 All Rights Reserved

---

## Version History

**v1.0** (Current)
- Initial release
- Unified assistant with 3 modes (Intake, Emergency, Followup)
- 7 tool integrations
- Context-aware mode detection
- Professional voice and delivery
