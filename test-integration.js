const axios = require('axios');

// Test the webhook server with a mock VAPI function call
const WEBHOOK_URL = 'https://vapi-doorloop-webhook.onrender.com/vapi/webhook';

async function testCreateWorkOrder() {
  console.log('🧪 Testing createWorkOrder function...\n');

  // This simulates what VAPI sends to your webhook when the assistant calls createWorkOrder
  const mockVapiRequest = {
    message: {
      type: 'function-call',
      functionCall: {
        name: 'createWorkOrder',
        parameters: {
          unitNumber: '204',
          tenantName: 'Test Tenant',
          tenantPhone: '555-1234',
          issueDescription: 'Kitchen sink is leaking under the cabinet. Water dripping onto floor.',
          urgency: 'urgent',
          category: 'plumbing',
          whenStarted: 'This morning around 8am'
        }
      }
    }
  };

  try {
    console.log('Sending test request to webhook...');
    console.log('Function:', mockVapiRequest.message.functionCall.name);
    console.log('Parameters:', JSON.stringify(mockVapiRequest.message.functionCall.parameters, null, 2));
    console.log('\nCalling webhook at:', WEBHOOK_URL);
    console.log('---\n');

    const response = await axios.post(WEBHOOK_URL, mockVapiRequest, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ SUCCESS! Webhook responded:\n');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n---');
    console.log('\n🎉 Your integration is working!');
    console.log('\n📋 Next steps:');
    console.log('1. Log into DoorLoop: https://app.doorloop.com');
    console.log('2. Go to Tasks section');
    console.log('3. Look for new task: "plumbing - 204: Kitchen sink is leaking..."');
    console.log('\nIf you see the task in DoorLoop, your VAPI assistant is fully operational! 🚀');

  } catch (error) {
    console.error('❌ Test failed!');
    console.error('\nError details:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received from webhook server');
      console.error('Is the server running?');
    } else {
      console.error(error.message);
    }
  }
}

async function testEmergency() {
  console.log('\n\n🧪 Testing escalateToEmergency function...\n');

  const mockVapiRequest = {
    message: {
      type: 'function-call',
      functionCall: {
        name: 'escalateToEmergency',
        parameters: {
          unitNumber: '305',
          tenantName: 'Emergency Test',
          tenantPhone: '555-9999',
          issueDescription: 'No heat and outside temperature is 25 degrees. Furnace not working at all.',
          category: 'hvac',
          safetyNotes: 'Tenant staying warm with blankets. Temperature inside unit dropping.'
        }
      }
    }
  };

  try {
    console.log('Sending emergency test to webhook...');
    console.log('Function:', mockVapiRequest.message.functionCall.name);
    console.log('Parameters:', JSON.stringify(mockVapiRequest.message.functionCall.parameters, null, 2));
    console.log('\nCalling webhook at:', WEBHOOK_URL);
    console.log('---\n');

    const response = await axios.post(WEBHOOK_URL, mockVapiRequest, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ SUCCESS! Emergency escalation responded:\n');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n---');
    console.log('\n🚨 Emergency task should be HIGH priority in DoorLoop with 🚨 emoji!');

  } catch (error) {
    console.error('❌ Emergency test failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  VAPI to DoorLoop Integration Test');
  console.log('═══════════════════════════════════════════════════════════\n');

  await testCreateWorkOrder();
  await testEmergency();

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Tests Complete!');
  console.log('═══════════════════════════════════════════════════════════\n');
}

runAllTests();
