const axios = require('axios');

const WEBHOOK_URL = 'https://vapi-doorloop-webhook.onrender.com/vapi/webhook';

async function testValidTenant() {
  console.log('🔐 TEST 1: Valid Tenant Authentication\n');

  // Using "Smoke - John Smith" who is on an active lease
  const mockVapiRequest = {
    message: {
      type: 'function-call',
      functionCall: {
        name: 'createWorkOrder',
        parameters: {
          unitNumber: '101A',  // Unit from DoorLoop (Smoke - John Smith's unit)
          tenantName: 'Smoke - John Smith',  // Full name as it appears in DoorLoop lease
          tenantPhone: '555-0101',
          issueDescription: 'Air conditioning not cooling properly',
          urgency: 'urgent',
          category: 'hvac',
          whenStarted: 'Yesterday afternoon'
        }
      }
    }
  };

  try {
    console.log('Testing with VALID tenant...');
    console.log('Tenant:', mockVapiRequest.message.functionCall.parameters.tenantName);
    console.log('Unit:', mockVapiRequest.message.functionCall.parameters.unitNumber);
    console.log('');

    const response = await axios.post(WEBHOOK_URL, mockVapiRequest, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });

    console.log('✅ SUCCESS - Valid tenant authenticated!\n');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('\n---\n');

  } catch (error) {
    console.error('❌ FAILED - Valid tenant should have been authenticated!\n');
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    console.log('\n---\n');
  }
}

async function testInvalidTenant() {
  console.log('🔐 TEST 2: Invalid Tenant Authentication (Should Fail)\n');

  // Using fake tenant name that doesn't exist
  const mockVapiRequest = {
    message: {
      type: 'function-call',
      functionCall: {
        name: 'createWorkOrder',
        parameters: {
          unitNumber: '101A',
          tenantName: 'Fake Person',  // This name doesn't match the lease
          tenantPhone: '555-9999',
          issueDescription: 'Trying to create fake work order',
          urgency: 'urgent',
          category: 'plumbing'
        }
      }
    }
  };

  try {
    console.log('Testing with INVALID tenant (should be rejected)...');
    console.log('Tenant:', mockVapiRequest.message.functionCall.parameters.tenantName);
    console.log('Unit:', mockVapiRequest.message.functionCall.parameters.unitNumber);
    console.log('');

    const response = await axios.post(WEBHOOK_URL, mockVapiRequest, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });

    console.log('❌ SECURITY BREACH - Invalid tenant was NOT rejected!\n');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('\n---\n');

  } catch (error) {
    if (error.response && error.response.data && error.response.data.result?.error === 'Authentication failed') {
      console.log('✅ SUCCESS - Invalid tenant correctly rejected!\n');
      console.log('Security Message:', error.response.data.result.message);
    } else {
      console.error('❌ UNEXPECTED ERROR\n');
      console.error('Response:', JSON.stringify(error.response?.data, null, 2));
    }
    console.log('\n---\n');
  }
}

async function testInvalidUnit() {
  console.log('🔐 TEST 3: Non-existent Unit (Should Fail)\n');

  const mockVapiRequest = {
    message: {
      type: 'function-call',
      functionCall: {
        name: 'createWorkOrder',
        parameters: {
          unitNumber: '9999',  // Unit doesn't exist
          tenantName: 'John Smith',
          tenantPhone: '555-0101',
          issueDescription: 'Testing fake unit',
          urgency: 'urgent',
          category: 'plumbing'
        }
      }
    }
  };

  try {
    console.log('Testing with NON-EXISTENT unit (should be rejected)...');
    console.log('Tenant:', mockVapiRequest.message.functionCall.parameters.tenantName);
    console.log('Unit:', mockVapiRequest.message.functionCall.parameters.unitNumber);
    console.log('');

    const response = await axios.post(WEBHOOK_URL, mockVapiRequest, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });

    console.log('❌ SECURITY BREACH - Non-existent unit was NOT rejected!\n');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('\n---\n');

  } catch (error) {
    if (error.response && error.response.data && error.response.data.result?.error === 'Authentication failed') {
      console.log('✅ SUCCESS - Non-existent unit correctly rejected!\n');
      console.log('Security Message:', error.response.data.result.message);
    } else {
      console.error('❌ UNEXPECTED ERROR\n');
      console.error('Response:', JSON.stringify(error.response?.data, null, 2));
    }
    console.log('\n---\n');
  }
}

async function runAuthenticationTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Tenant Authentication Tests');
  console.log('═══════════════════════════════════════════════════════════\n');

  await testValidTenant();
  await testInvalidTenant();
  await testInvalidUnit();

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Authentication Tests Complete!');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('🔒 Security Summary:');
  console.log('   - Only authenticated tenants can create work orders');
  console.log('   - Caller name must match tenant on active lease');
  console.log('   - Unit must exist and have active lease');
  console.log('   - Invalid requests are rejected with clear messages\n');
}

runAuthenticationTests();
