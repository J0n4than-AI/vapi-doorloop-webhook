const axios = require('axios');

const WEBHOOK_URL = 'https://vapi-doorloop-webhook.onrender.com/vapi/webhook';

async function testWithCorrectLease() {
  console.log('🧪 Testing with different Sarah Johnson lease...\n');

  // Use tenant name that matches lease #17: "Smoke - Sarah Johnson & SMOKE - Smoke SMOKE - Test"
  // This lease should be on the correct unit

  const mockVapiRequest = {
    message: {
      type: 'function-call',
      functionCall: {
        name: 'createWorkOrder',
        parameters: {
          unitNumber: 'Smoke Test',
          tenantName: 'Smoke Sarah Johnson',  // Try different name format
          tenantPhone: '555-0102',
          issueDescription: 'TEST: Bathroom sink is clogged',
          urgency: 'standard',
          category: 'plumbing',
          whenStarted: 'Yesterday evening'
        }
      }
    }
  };

  try {
    console.log('Sending request with tenant name: "Smoke Sarah Johnson"');
    console.log('Unit: Smoke Test\n');

    const response = await axios.post(WEBHOOK_URL, mockVapiRequest, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });

    console.log('✅ SUCCESS!\n');
    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.data.result && response.data.result.success) {
      const taskId = response.data.result.doorloopTaskId;
      console.log('\nTask ID:', taskId);

      // Verify the task
      console.log('\n🔍 Verifying task in DoorLoop...');

      const DOORLOOP_API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoiQVBJIiwiaWQiOiI2OGVlNmZiYjIxYjI0MjkxYjdmZTM4ODgiLCJleHAiOjIwNzU4MTY2MzV9.6D_BgXStGG-yVE5dogTmp_KQ7So0GRhtOBXbMUyLS1I';

      const taskResponse = await axios.get(
        `https://app.doorloop.com/api/tasks/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${DOORLOOP_API_TOKEN}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      const unitResponse = await axios.get(
        `https://app.doorloop.com/api/units/${taskResponse.data.unit}`,
        {
          headers: {
            'Authorization': `Bearer ${DOORLOOP_API_TOKEN}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('\n' + '='.repeat(60));
      console.log('VERIFICATION:');
      console.log('='.repeat(60));
      console.log('Task Type:', taskResponse.data.type);
      console.log('Unit Name:', unitResponse.data.name);
      console.log('Requested By Tenant:', taskResponse.data.requestedByTenant);

      if (unitResponse.data.name === 'Smoke Test') {
        console.log('\n✅ SUCCESS! Task created on correct unit!');
      } else {
        console.log('\n❌ Still wrong unit');
      }
    }

  } catch (error) {
    console.error('❌ FAILED\n');
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testWithCorrectLease();
