const axios = require('axios');

const VAPI_API_KEY = '44d98331-b00a-435f-8788-30aad5f58510';
const ASSISTANT_ID = '65b8c896-3c88-40ef-ac6a-c25ce1592cfa';

const functions = [
  {
    type: "function",
    function: {
      name: "createWorkOrder",
      description: "Creates a new maintenance work order in DoorLoop. Use this when a tenant reports a new maintenance issue during the intake conversation.",
      parameters: {
        type: "object",
        properties: {
          unitNumber: {
            type: "string",
            description: "Unit number or apartment number"
          },
          tenantName: {
            type: "string",
            description: "Tenant's full name"
          },
          tenantPhone: {
            type: "string",
            description: "Tenant's phone number for callbacks"
          },
          issueDescription: {
            type: "string",
            description: "Detailed description of the maintenance issue"
          },
          urgency: {
            type: "string",
            enum: ["urgent", "standard", "low"],
            description: "Urgency level: urgent (same day), standard (2-3 days), low (when possible)"
          },
          category: {
            type: "string",
            enum: ["plumbing", "electrical", "hvac", "appliance", "security", "general"],
            description: "Category of maintenance issue"
          },
          whenStarted: {
            type: "string",
            description: "When the issue started (optional)"
          }
        },
        required: ["unitNumber", "tenantName", "tenantPhone", "issueDescription", "urgency", "category"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "escalateToEmergency",
      description: "Creates an emergency high-priority task in DoorLoop for life-safety issues like gas leaks, no heat in winter, electrical hazards, flooding, or security breaches.",
      parameters: {
        type: "object",
        properties: {
          unitNumber: {
            type: "string",
            description: "Unit number"
          },
          tenantName: {
            type: "string",
            description: "Tenant's full name"
          },
          tenantPhone: {
            type: "string",
            description: "Tenant's phone number"
          },
          issueDescription: {
            type: "string",
            description: "Detailed description of the emergency"
          },
          category: {
            type: "string",
            enum: ["hvac", "plumbing", "electrical", "gas", "security"],
            description: "Emergency category"
          },
          safetyNotes: {
            type: "string",
            description: "Safety concerns and immediate actions taken"
          }
        },
        required: ["unitNumber", "tenantName", "tenantPhone", "issueDescription", "category"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "dispatchEmergencyVendor",
      description: "Adds a note to an emergency task indicating that emergency vendor has been dispatched. Used after escalateToEmergency.",
      parameters: {
        type: "object",
        properties: {
          workOrderId: {
            type: "string",
            description: "DoorLoop task ID from the emergency escalation"
          },
          category: {
            type: "string",
            enum: ["hvac", "plumbing", "electrical", "security", "gas"],
            description: "Emergency category"
          },
          arrivalTimeEstimate: {
            type: "string",
            enum: ["30min", "1hour", "2hours"],
            description: "Estimated arrival time"
          },
          safetyNotes: {
            type: "string",
            description: "Additional safety instructions for tenant"
          },
          tenantPhone: {
            type: "string",
            description: "Tenant phone for vendor callback"
          }
        },
        required: ["category", "arrivalTimeEstimate", "tenantPhone"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "provideStatus",
      description: "Gets the current status of a work order from DoorLoop. Use when tenant calls asking about status of their repair.",
      parameters: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description: "DoorLoop task ID"
          }
        },
        required: ["taskId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "confirmCompletion",
      description: "Marks a work order as completed with tenant's feedback and quality rating. Use during followup calls when tenant confirms the issue is resolved.",
      parameters: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description: "DoorLoop task ID"
          },
          tenantConfirmed: {
            type: "boolean",
            description: "Did tenant confirm they're satisfied?"
          },
          issueResolved: {
            type: "boolean",
            description: "Is the issue completely resolved?"
          },
          qualityRating: {
            type: "string",
            enum: ["1", "2", "3", "4", "5"],
            description: "Quality rating: 1=Poor, 5=Excellent"
          },
          feedbackNotes: {
            type: "string",
            description: "Tenant's feedback about the repair"
          },
          inspectionRequired: {
            type: "boolean",
            description: "Does this need manager inspection?"
          }
        },
        required: ["taskId", "tenantConfirmed", "issueResolved", "qualityRating", "feedbackNotes", "inspectionRequired"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "reopenWorkOrder",
      description: "Reopens a work order that wasn't properly resolved. Use when tenant reports the same issue is still happening after repair.",
      parameters: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description: "DoorLoop task ID to reopen"
          },
          reason: {
            type: "string",
            description: "Why is this being reopened? What's still wrong?"
          },
          urgency: {
            type: "string",
            enum: ["emergency", "urgent", "standard"],
            description: "New urgency level"
          },
          tenantAvailability: {
            type: "string",
            description: "When is tenant available for vendor to return"
          }
        },
        required: ["taskId", "reason", "urgency"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "scheduleInspection",
      description: "Creates a property manager inspection task. Use when tenant requests inspection or when repair quality is concerning.",
      parameters: {
        type: "object",
        properties: {
          relatedTaskId: {
            type: "string",
            description: "Original work order task ID"
          },
          inspectionType: {
            type: "string",
            enum: ["quality_check", "tenant_concern", "final_approval", "damage_assessment"],
            description: "Type of inspection needed"
          },
          reason: {
            type: "string",
            description: "Why inspection is needed"
          },
          tenantAvailability: {
            type: "string",
            description: "When tenant is available for inspection"
          },
          unitNumber: {
            type: "string",
            description: "Unit number"
          }
        },
        required: ["relatedTaskId", "inspectionType", "reason", "tenantAvailability", "unitNumber"]
      }
    }
  }
];

async function fixTools() {
  try {
    console.log('Getting current assistant configuration...\n');

    const getResponse = await axios.get(
      `https://api.vapi.ai/assistant/${ASSISTANT_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`
        }
      }
    );

    console.log('Current configuration:');
    console.log('- Tools array length:', getResponse.data.model.tools?.length || 0);
    console.log('- ToolIds array:', getResponse.data.model.toolIds || 'none');

    console.log('\nUpdating assistant - removing toolIds and setting inline tools...\n');

    // Update with only inline tools, remove toolIds
    const updateResponse = await axios.patch(
      `https://api.vapi.ai/assistant/${ASSISTANT_ID}`,
      {
        model: {
          provider: getResponse.data.model.provider,
          model: getResponse.data.model.model,
          temperature: getResponse.data.model.temperature,
          maxTokens: getResponse.data.model.maxTokens,
          messages: getResponse.data.model.messages,
          tools: functions,
          toolIds: []  // Clear the toolIds reference
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Assistant updated successfully!\n');
    console.log('Inline functions configured:');
    functions.forEach((fn, i) => {
      console.log(`${i + 1}. ${fn.function.name}`);
    });
    console.log('\n🎉 Refresh your VAPI dashboard and check the Model section for tools!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

fixTools();
