const axios = require('axios');

const WEBHOOK_URL = 'https://vapi-doorloop-webhook.onrender.com/vapi/webhook';
const DOORLOOP_API_KEY = 'E8ptJZjnKe17RH2.WJPwP7JDWDTEF53BxZKhkj2Jvs6LZcTcdwVrStqLPeFQNRWh';

async function testEndToEnd() {
  console.log('🧪 COMPREHENSIVE END-TO-END TEST\n');
  console.log('Testing: Authentication + Work Order Creation');
  console.log('=' .repeat(60));

  // Step 1: Verify webhook is accessible
  console.log('\n📡 Step 1: Testing webhook accessibility...');
  try {
    const healthCheck = await axios.get('https://vapi-doorloop-webhook.onrender.com/health', {
      timeout: 10000
    });
    console.log('✅ Webhook is online:', healthCheck.data);
  } catch (error) {
    console.error('❌ Webhook is not accessible!');
    console.error('Error:', error.message);
    return;
  }

  // Step 2: Test with real tenant data
  console.log('\n🔐 Step 2: Testing authenticated work order creation...');
  console.log('Using real tenant: "Smoke - Sarah Johnson" in unit "Smoke Test"');

  const mockVapiRequest = {
    message: {
      type: 'function-call',
      functionCall: {
        name: 'createWorkOrder',
        parameters: {
          unitNumber: 'Smoke Test',
          tenantName: 'Sarah Johnson',  // Partial name should match "Smoke - Sarah Johnson"
          tenantPhone: '555-0102',
          issueDescription: 'END-TO-END TEST: Kitchen faucet leaking water',
          urgency: 'standard',
          category: 'plumbing',
          whenStarted: 'This morning around 8am'
        }
      }
    }
  };

  console.log('\n📤 Sending request to webhook...');
  console.log('Request data:', JSON.stringify(mockVapiRequest.message.functionCall.parameters, null, 2));

  try {
    const response = await axios.post(WEBHOOK_URL, mockVapiRequest, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });

    console.log('\n✅ WEBHOOK RESPONSE RECEIVED');
    console.log('=' .repeat(60));
    console.log(JSON.stringify(response.data, null, 2));

    // Step 3: Verify the response
    if (response.data.results && response.data.results[0]) {
      const result = response.data.results[0];

      if (result.success) {
        console.log('\n🎉 SUCCESS! Work order created!');
        console.log('Work Order ID:', result.workOrderId);
        console.log('DoorLoop Task ID:', result.doorloopTaskId);

        // Step 4: Verify task exists in DoorLoop
        console.log('\n🔍 Step 3: Verifying task in DoorLoop...');
        try {
          const taskResponse = await axios.get(
            `https://api.doorloop.com/api/tasks/${result.doorloopTaskId}`,
            {
              headers: {
                'Authorization': `Bearer ${DOORLOOP_API_KEY}`,
                'Content-Type': 'application/json'
              }
            }
          );

          console.log('✅ Task confirmed in DoorLoop!');
          console.log('Task Subject:', taskResponse.data.subject);
          console.log('Task Type:', taskResponse.data.type);
          console.log('Task Status:', taskResponse.data.status);
          console.log('Linked Unit ID:', taskResponse.data.unit);
          console.log('Linked Property ID:', taskResponse.data.property);

          console.log('\n' + '='.repeat(60));
          console.log('🎉 END-TO-END TEST PASSED!');
          console.log('='.repeat(60));
          console.log('\n✅ Authentication: WORKING');
          console.log('✅ Work Order Creation: WORKING');
          console.log('✅ DoorLoop Integration: WORKING');

        } catch (verifyError) {
          console.error('\n⚠️  Task created but verification failed:');
          console.error(verifyError.response?.data || verifyError.message);
        }

      } else {
        console.error('\n❌ WORK ORDER CREATION FAILED');
        console.error('Error:', result.error);
        console.error('Message:', result.message);
        console.error('Details:', result.details);

        console.log('\n' + '='.repeat(60));
        console.log('❌ END-TO-END TEST FAILED');
        console.log('='.repeat(60));
      }
    }

  } catch (error) {
    console.error('\n❌ REQUEST FAILED');
    console.error('=' .repeat(60));

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('❌ END-TO-END TEST FAILED');
    console.log('='.repeat(60));
  }

  // Step 5: Test authentication failure scenario
  console.log('\n\n🔒 Step 4: Testing authentication rejection...');
  console.log('Using INVALID tenant name for same unit');

  const invalidRequest = {
    message: {
      type: 'function-call',
      functionCall: {
        name: 'createWorkOrder',
        parameters: {
          unitNumber: 'Smoke Test',
          tenantName: 'Bob Johnson',  // Wrong name
          tenantPhone: '555-9999',
          issueDescription: 'Test with invalid tenant',
          urgency: 'standard',
          category: 'plumbing',
          whenStarted: 'Today'
        }
      }
    }
  };

  try {
    const invalidResponse = await axios.post(WEBHOOK_URL, invalidRequest, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });

    if (invalidResponse.data.results && invalidResponse.data.results[0]) {
      const result = invalidResponse.data.results[0];

      if (!result.success && result.error === 'Authentication failed') {
        console.log('✅ Authentication rejection working correctly!');
        console.log('Message:', result.message);
      } else {
        console.warn('⚠️  Expected authentication to fail, but it succeeded!');
      }
    }

  } catch (error) {
    console.error('Error testing auth rejection:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('TEST COMPLETE');
  console.log('='.repeat(60) + '\n');
}

testEndToEnd();
