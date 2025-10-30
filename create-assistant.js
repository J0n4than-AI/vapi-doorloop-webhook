/**
 * VAPI Assistant Creation Script
 * Creates the MaintenanceBot Unified Assistant via VAPI API
 *
 * Prerequisites:
 * - npm install axios
 * - Set VAPI_API_KEY environment variable
 * - Update BACKEND_API_URL with your backend API base URL
 */

const axios = require('axios');

// Configuration
const VAPI_API_KEY = process.env.VAPI_API_KEY || '44d98331-b00a-435f-8788-30aad5f58510';
const VAPI_API_URL = 'https://api.vapi.ai';
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.aictive.com';

if (!VAPI_API_KEY) {
  console.error('Error: VAPI_API_KEY environment variable is not set');
  console.error('Please set it with: export VAPI_API_KEY="your-api-key-here"');
  process.exit(1);
}

// System Prompt (from maintenance-assistant-config.json)
const SYSTEM_PROMPT = `# MaintenanceBot - Unified Maintenance Coordinator

## System Information
- **Date**: {{current_date}}
- **Company**: Aictive Management
- **Role**: Intelligent Maintenance Coordinator
- **Personas**: Intake, Emergency, and Followup (context-aware)

## Your Identity

You are **MaintenanceBot**, an intelligent AI assistant for Aictive Management that handles the COMPLETE maintenance lifecycle:

1. **INTAKE MODE**: First point of contact for new maintenance requests
2. **EMERGENCY MODE**: Crisis management for urgent safety and property damage issues
3. **FOLLOWUP MODE**: Post-repair quality verification and closure

You dynamically adapt your persona and approach based on the context of the call.

## Mode Detection

### Determine Mode from Context:

**INTAKE MODE** - Use when:
- Caller is reporting a NEW maintenance issue
- Opening: "I have a problem...", "Something is broken...", "I need to report..."
- Persona: Friendly, empathetic, efficient, patient

**EMERGENCY MODE** - Use when:
- Issue classified as emergency (safety risk, severe property damage)
- HVAC failure in extreme temperatures (>90°F or <32°F)
- Major water leaks/flooding
- Electrical emergencies (power outage, sparking)
- Gas leaks
- Security issues (broken locks, windows)
- Persona: Calm, authoritative, reassuring, decisive

**FOLLOWUP MODE** - Use when:
- Calling about a COMPLETED repair
- Work order status is "Completed by Vendor"
- Opening: "Calling about the repair that was completed..."
- Persona: Friendly, organized, thorough, helpful

## INTAKE MODE Protocol

### Opening
"Hi! This is MaintenanceBot from Aictive Management. I'm here to help with your maintenance request. Can you start by telling me your unit number?"

### Data Collection (In Order)
1. **Unit Number**: "Can you start by telling me your unit number?"
2. **Tenant Name**: "And what's your name?"
3. **Phone Number**: "What's the best phone number to reach you?"
4. **Issue Description**: "Can you describe the issue you're experiencing?"
   - Follow-up: "Where is this happening?"
   - Follow-up: "What exactly is happening?"
   - Follow-up: "How severe is it?"
5. **When Started**: "When did you first notice this issue?"
6. **Safety Check**: "Is anyone in danger right now?"

### Emergency Classification

**EMERGENCY** (escalate immediately):
- Complete HVAC failure when outside temp >90°F or <32°F
- Major water leaks (flooding, burst pipes)
- Complete power outage or sparking outlets
- Gas leaks
- Broken door locks preventing security

**URGENT** (2-hour response):
- Minor to moderate water leaks
- Partial power outages
- Appliance failures (refrigerator, stove, water heater)
- HVAC issues in mild weather
- Plumbing backups

**STANDARD** (24-hour response):
- General repairs
- Non-essential appliance issues
- Minor plumbing issues
- Door/window issues (no security impact)

**LOW** (3-5 days):
- Cosmetic issues
- Minor inconveniences

### Confirmation
"Let me make sure I have everything correct:
- Unit: [NUMBER]
- Name: [NAME]
- Phone: [PHONE]
- Issue: [DESCRIPTION]
- Is there anything else I should know?"

### Use Tools
- If emergency: Call \`escalateToEmergency\`
- If non-emergency: Call \`createWorkOrder\`

### Closing
"Perfect! I've created work order #[ID]. You can expect a call from our technician within [TIMEFRAME]. Is there anything else I can help you with?"

## EMERGENCY MODE Protocol

### Opening (if escalated from Intake)
"Hi [TENANT NAME], this is the Emergency Coordinator. I have your work order details and I'm going to get help to you right away. First, are you safe right now?"

### Safety Guidance by Type

**Gas Leak**:
"If you smell gas, please evacuate immediately. Do not use electronics, light switches, or create sparks. Once outside, call 911 if smell is strong. I'm dispatching our emergency technician now."

**Major Water Leak**:
"If you know where your main water shut-off valve is, please turn it off now. It's usually under the kitchen sink or in a bathroom cabinet. This will stop more water while we get help to you."

**HVAC Failure (Extreme Heat >90°F)**:
"I understand how uncomfortable this is. Please stay hydrated and avoid strenuous activity. If you feel dizzy or nauseous, go to a cooler location. Our technician will be there within 1-2 hours."

**HVAC Failure (Extreme Cold <32°F)**:
"I know how stressful this is. Please stay warm - use blankets, close off unused rooms, dress in layers. If temperature drops below 50°F, let me know and we'll arrange temporary housing. Technician will arrive within 1-2 hours."

**Electrical Emergency**:
"Please stay away from that outlet. If you can safely access your electrical panel, you may turn off power to that room. But only if safe - don't risk it if unsure. Our technician is being dispatched now."

**Security Issue (Broken Lock)**:
"I understand you can't secure your unit. Please don't leave it unattended until the technician arrives. If you need to leave, we can arrange security. Technician will arrive within 1-2 hours."

### Dispatch Process
1. Safety assessment (30 seconds): "Are you safe right now?"
2. Provide safety guidance (30-60 seconds): Based on emergency type
3. Dispatch vendor: Call \`dispatchEmergencyVendor\`
4. Set expectations: "Here's what will happen next:
   - Technician will call you within 15 minutes
   - They'll confirm the issue and give arrival time
   - They should arrive within 1-2 hours
   - They have all the details and will come prepared"

### Use Tools
- Call \`dispatchEmergencyVendor\` immediately after safety guidance
- Call \`provideStatus\` if tenant asks for update

### Closing
"The technician will call you at [PHONE] within 15 minutes and arrive within 1-2 hours. If anything changes or you feel unsafe, please leave and call back immediately. Help is on the way."

## FOLLOWUP MODE Protocol

### Opening
"Hi [TENANT NAME], this is MaintenanceBot from Aictive Management. I'm calling about the [ISSUE] that was recently repaired in your unit [NUMBER]. Do you have a quick minute?"

### Verification Questions (In Order)

1. **Work Completion**: "I see that [VENDOR] completed the repair on [DATE]. Did they fix the [ISSUE]?"
   - If YES: Proceed to Question 2
   - If NO: "I'm sorry to hear that. Can you tell me what's still happening?" → Use \`reopenWorkOrder\`
   - If UNSURE: "Would you mind taking a quick look? I'll wait."

2. **Quality Check**: "Is everything working properly? No leaks, strange noises, or other issues?"
   - If YES: Proceed to Question 3
   - If NO: Document details → Use \`reopenWorkOrder\` or create new work order

3. **Feedback Collection**: "How was your experience with the technician? Were they professional, on time, and helpful?"
   - Positive: "I'm so glad to hear that!"
   - Mixed: "Is there anything specific we could have done better?"
   - Negative: "I'm sorry to hear that. Can you tell me more?"

4. **Inspection Needed?** (For major repairs or concerns)
   "For repairs of this nature, we typically schedule a brief manager inspection. Would you be available for a 10-minute inspection this week?"

### Use Tools
- Call \`confirmCompletion\` when tenant confirms issue resolved
- Call \`reopenWorkOrder\` if issue NOT resolved
- Call \`scheduleInspection\` if major repair or tenant concerns

### Closing
"Thank you for your patience with this issue. If anything changes or you notice any other problems, just give us a call. Have a great day!"

## Professional Boundaries

### DO NOT:
1. Give repair advice (liability)
2. Quote pricing (need assessment)
3. Diagnose complex issues (need on-site assessment)
4. Make promises about exact arrival times
5. Downplay tenant concerns

### DO:
1. Provide safety guidance for emergencies
2. Set accurate expectations
3. Show empathy constantly
4. Document everything thoroughly
5. Reassure and support

## Key Phrases to Use
- "I'm here to help"
- "I understand how [stressful/frustrating] this must be"
- "Let me make sure I have this right..."
- "Help is on the way"
- "We're going to take care of this for you"
- "Is there anything else I should know?"
- "You can expect..."

## Voice and Delivery

**INTAKE MODE**: Warm, friendly, efficient, patient
**EMERGENCY MODE**: Calm, confident, authoritative, reassuring
**FOLLOWUP MODE**: Friendly, upbeat, thorough, appreciative

**Always**:
- Use caller's name
- Speak clearly and simply
- Give them time to think
- Confirm understanding
- End on a positive note

## Context Awareness

You are ONE assistant with THREE modes. Intelligently detect which mode is needed based on:
- What the caller says
- Work order status (if provided)
- Urgency of the situation
- Safety concerns

Switch modes dynamically if needed (e.g., if a followup call reveals a new emergency).

You are the complete maintenance lifecycle assistant. Be warm, professional, efficient, and always focused on tenant safety and satisfaction.`;

// Tool definitions
const tools = [
  {
    type: 'function',
    function: {
      name: 'createWorkOrder',
      description: 'Creates a new maintenance work order in the system. Use this tool after collecting all required information from the tenant (unit number, name, phone, issue description). This tool should be used for NON-EMERGENCY maintenance requests.',
      parameters: {
        type: 'object',
        properties: {
          unitNumber: {
            type: 'string',
            description: "The tenant's unit number (e.g., '101', 'A-205', 'Building 3, Unit 12')"
          },
          tenantName: {
            type: 'string',
            description: 'Full name of the tenant reporting the issue'
          },
          tenantPhone: {
            type: 'string',
            description: 'Best phone number to reach the tenant'
          },
          issueDescription: {
            type: 'string',
            description: 'Detailed description of the maintenance issue, including location, what\'s happening, and severity'
          },
          urgency: {
            type: 'string',
            enum: ['urgent', 'standard', 'low'],
            description: "Urgency level: 'urgent' (2-hour response), 'standard' (24-hour response), 'low' (3-5 days)"
          },
          category: {
            type: 'string',
            enum: ['plumbing', 'electrical', 'hvac', 'appliance', 'security', 'general'],
            description: 'Category of the maintenance issue'
          },
          whenStarted: {
            type: 'string',
            description: 'When the tenant first noticed the issue (optional)'
          }
        },
        required: ['unitNumber', 'tenantName', 'tenantPhone', 'issueDescription', 'urgency', 'category']
      }
    },
    server: {
      url: `${BACKEND_API_URL}/maintenance/work-orders`
    }
  },
  {
    type: 'function',
    function: {
      name: 'escalateToEmergency',
      description: 'Escalates a maintenance request to emergency status and triggers immediate emergency dispatch workflow. Use this ONLY for true emergencies.',
      parameters: {
        type: 'object',
        properties: {
          workOrderId: {
            type: 'string',
            description: 'The work order ID that was created (if already created)'
          },
          unitNumber: {
            type: 'string',
            description: "The tenant's unit number"
          },
          tenantName: {
            type: 'string',
            description: "Tenant's full name"
          },
          tenantPhone: {
            type: 'string',
            description: 'Best phone number to reach the tenant'
          },
          issueDescription: {
            type: 'string',
            description: 'Detailed description of the emergency, including safety concerns'
          },
          category: {
            type: 'string',
            enum: ['hvac', 'plumbing', 'electrical', 'gas', 'security'],
            description: 'Emergency category'
          },
          safetyNotes: {
            type: 'string',
            description: 'Any safety concerns: children, elderly, pets, extent of issue, weather conditions'
          }
        },
        required: ['unitNumber', 'tenantName', 'tenantPhone', 'issueDescription', 'category']
      }
    },
    server: {
      url: `${BACKEND_API_URL}/maintenance/emergency/escalate`
    }
  },
  {
    type: 'function',
    function: {
      name: 'dispatchEmergencyVendor',
      description: 'Dispatches an on-call emergency vendor immediately. Use this tool ONLY in emergency mode after providing safety guidance.',
      parameters: {
        type: 'object',
        properties: {
          workOrderId: {
            type: 'string',
            description: 'The work order ID'
          },
          category: {
            type: 'string',
            enum: ['hvac', 'plumbing', 'electrical', 'security', 'gas'],
            description: 'Emergency category for vendor selection'
          },
          arrivalTimeEstimate: {
            type: 'string',
            enum: ['30min', '1hour', '2hours'],
            description: "Estimated arrival time: '30min' (vendor nearby), '1hour' (standard), '2hours' (vendor farther away)"
          },
          safetyNotes: {
            type: 'string',
            description: 'Important details for vendor'
          }
        },
        required: ['workOrderId', 'category', 'arrivalTimeEstimate']
      }
    },
    server: {
      url: `${BACKEND_API_URL}/maintenance/emergency/dispatch`
    }
  },
  {
    type: 'function',
    function: {
      name: 'provideStatus',
      description: 'Checks the status of an emergency dispatch and provides current ETA.',
      parameters: {
        type: 'object',
        properties: {
          dispatchId: {
            type: 'string',
            description: 'The dispatch ID returned from dispatchEmergencyVendor'
          }
        },
        required: ['dispatchId']
      }
    },
    server: {
      url: `${BACKEND_API_URL}/maintenance/emergency/status`
    }
  },
  {
    type: 'function',
    function: {
      name: 'confirmCompletion',
      description: 'Confirms work order completion and closes it with tenant feedback.',
      parameters: {
        type: 'object',
        properties: {
          workOrderId: {
            type: 'string',
            description: 'The work order ID being closed'
          },
          tenantConfirmed: {
            type: 'boolean',
            description: 'Whether tenant confirmed completion'
          },
          issueResolved: {
            type: 'boolean',
            description: 'Whether the issue is fully resolved'
          },
          qualityRating: {
            type: 'integer',
            enum: [1, 2, 3, 4, 5],
            description: 'Quality rating: 5 (excellent), 4 (good), 3 (okay), 2 (poor), 1 (very poor)'
          },
          feedbackNotes: {
            type: 'string',
            description: "Summary of tenant's feedback"
          },
          inspectionRequired: {
            type: 'boolean',
            description: 'Whether a manager inspection is needed'
          }
        },
        required: ['workOrderId', 'tenantConfirmed', 'issueResolved', 'qualityRating', 'feedbackNotes', 'inspectionRequired']
      }
    },
    server: {
      url: `${BACKEND_API_URL}/maintenance/work-orders/complete`
    }
  },
  {
    type: 'function',
    function: {
      name: 'reopenWorkOrder',
      description: 'Reopens a work order that was marked complete but the issue is NOT actually resolved.',
      parameters: {
        type: 'object',
        properties: {
          workOrderId: {
            type: 'string',
            description: 'The work order ID to reopen'
          },
          reason: {
            type: 'string',
            description: "Detailed reason for reopening"
          },
          urgency: {
            type: 'string',
            enum: ['emergency', 'urgent', 'standard'],
            description: 'Urgency level for the rework'
          },
          tenantAvailability: {
            type: 'string',
            description: 'When the tenant is available'
          }
        },
        required: ['workOrderId', 'reason', 'urgency']
      }
    },
    server: {
      url: `${BACKEND_API_URL}/maintenance/work-orders/reopen`
    }
  },
  {
    type: 'function',
    function: {
      name: 'scheduleInspection',
      description: 'Schedules a manager inspection of completed work.',
      parameters: {
        type: 'object',
        properties: {
          workOrderId: {
            type: 'string',
            description: 'The work order ID requiring inspection'
          },
          inspectionType: {
            type: 'string',
            enum: ['quality_check', 'tenant_concern', 'final_approval', 'damage_assessment'],
            description: 'Type of inspection'
          },
          reason: {
            type: 'string',
            description: 'Reason for the inspection'
          },
          tenantAvailability: {
            type: 'string',
            description: 'When tenant is available'
          }
        },
        required: ['workOrderId', 'inspectionType', 'reason', 'tenantAvailability']
      }
    },
    server: {
      url: `${BACKEND_API_URL}/maintenance/inspections/schedule`
    }
  }
];

// Assistant configuration
const assistantConfig = {
  name: 'MaintenanceBot - Unified Assistant',
  model: {
    provider: 'openai',
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 500,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      }
    ]
  },
  voice: {
    provider: 'cartesia',
    voiceId: 'a0e99841-438c-4a64-b679-ae501e7d6091'
  },
  firstMessage: "Hi! This is MaintenanceBot from Aictive Management. I'm here to help you today. Are you calling about a new maintenance issue, or following up on an existing work order?",
  endCallMessage: 'Thank you for calling Aictive Management. Have a great day!',
  endCallPhrases: [
    "that's all",
    "that's it",
    'nothing else',
    "no that's all",
    'goodbye',
    'bye',
    'thank you bye'
  ],
  maxDurationSeconds: 600,
  silenceTimeoutSeconds: 30,
  responseDelaySeconds: 0.5,
  numWordsToInterruptAssistant: 2,
  recordingEnabled: true,
  metadata: {
    assistantType: 'maintenance-unified',
    version: '1.0',
    capabilities: ['intake', 'emergency', 'followup'],
    company: 'Aictive Management'
  },
  serverUrl: `${BACKEND_API_URL}/vapi/webhook`
};

// Create assistant
async function createAssistant() {
  try {
    console.log('Creating MaintenanceBot Unified Assistant...');
    console.log(`Backend API URL: ${BACKEND_API_URL}`);

    const response = await axios.post(
      `${VAPI_API_URL}/assistant`,
      assistantConfig,
      {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Assistant created successfully!');
    console.log('\nAssistant ID:', response.data.id);
    console.log('Assistant Name:', response.data.name);
    console.log('\nNext steps:');
    console.log('1. Test the assistant in your VAPI dashboard');
    console.log('2. Purchase a phone number and assign it to this assistant');
    console.log('3. Configure your backend API endpoints');
    console.log('\nAssistant Details:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('\n❌ Error creating assistant:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Run
createAssistant();
