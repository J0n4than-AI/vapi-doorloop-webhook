const axios = require('axios');

const WEBHOOK_URL = 'https://vapi-doorloop-webhook.onrender.com/vapi/webhook';

async function testRealTenant() {
  console.log('🔧 Testing Real Tenant Work Order Creation\n');

  // Using "Smoke - Sarah Johnson" who has unit "Smoke Test"
  const mockVapiRequest = {
    message: {
      type: 'function-call',
      functionCall: {
        name: 'createWorkOrder',
        parameters: {
          unitNumber: 'Smoke Test',  // Real unit from DoorLoop
          tenantName: 'Smoke - Sarah Johnson',  // Real tenant name
          tenantPhone: '555-0102',
          issueDescription: 'Testing work order creation from authenticated tenant',
          urgency: 'standard',
          category: 'plumbing',
          whenStarted: 'This morning'
        }
      }
    }
  };

  try {
    console.log('Sending authenticated request...');
    console.log('Tenant:', mockVapiRequest.message.functionCall.parameters.tenantName);
    console.log('Unit:', mockVapiRequest.message.functionCall.parameters.unitNumber);
    console.log('');

    const response = await axios.post(WEBHOOK_URL, mockVapiRequest, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });

    console.log('✅ SUCCESS!\n');
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ FAILED\n');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRealTenant();
