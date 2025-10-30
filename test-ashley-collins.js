const axios = require('axios');

const WEBHOOK_URL = 'https://vapi-doorloop-webhook.onrender.com/vapi/webhook';
const DOORLOOP_API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoiQVBJIiwiaWQiOiI2OGVlNmZiYjIxYjI0MjkxYjdmZTM4ODgiLCJleHAiOjIwNzU4MTY2MzV9.6D_BgXStGG-yVE5dogTmp_KQ7So0GRhtOBXbMUyLS1I';

async function testAshleyCollins() {
  console.log('🧪 ASHLEY COLLINS TENANT REQUEST TEST\n');
  console.log('Testing: Unit C5, Garden View Apartments');
  console.log('=' .repeat(60));

  try {
    // Test data
    const testRequest = {
      message: {
        type: 'tool-calls',
        toolCallList: [
          {
            id: 'test_' + Date.now(),
            name: 'createWorkOrder',
            arguments: {
              unitNumber: 'C5',
              tenantName: 'Ashley Collins',
              tenantPhone: '555-1234',
              issueDescription: 'Air conditioning is not cooling properly. Temperature is staying around 78 degrees even when set to 68.',
              urgency: 'urgent',
              category: 'hvac',
              whenStarted: 'This afternoon around 2pm'
            }
          }
        ]
      }
    };

    console.log('\n📤 Sending request to webhook...');
    const args = testRequest.message.toolCallList[0].arguments;
    console.log('Tenant:', args.tenantName);
    console.log('Unit:', args.unitNumber);
    console.log('Issue:', args.issueDescription.substring(0, 60) + '...');
    console.log('Category:', args.category);

    const response = await axios.post(WEBHOOK_URL, testRequest, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });

    console.log('\n✅ WEBHOOK RESPONSE RECEIVED\n');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.results && response.data.results[0] && response.data.results[0].result.success) {
      const taskId = response.data.results[0].result.doorloopTaskId;

      console.log('\n' + '='.repeat(60));
      console.log('🔍 VERIFYING TASK IN DOORLOOP...');
      console.log('=' .repeat(60));

      // Verify task in DoorLoop
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

      const task = taskResponse.data;

      // Get unit details
      const unitResponse = await axios.get(
        `https://app.doorloop.com/api/units/${task.unit}`,
        {
          headers: {
            'Authorization': `Bearer ${DOORLOOP_API_TOKEN}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      // Get property details
      const propertyResponse = await axios.get(
        `https://app.doorloop.com/api/properties/${task.property}`,
        {
          headers: {
            'Authorization': `Bearer ${DOORLOOP_API_TOKEN}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      // Get tenant details
      let tenantName = 'N/A';
      if (task.requestedByTenant) {
        const tenantResponse = await axios.get(
          `https://app.doorloop.com/api/tenants/${task.requestedByTenant}`,
          {
            headers: {
              'Authorization': `Bearer ${DOORLOOP_API_TOKEN}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );
        tenantName = tenantResponse.data.name;
      }

      console.log('\n✅ Task Details:');
      console.log('  Task ID:', task.id);
      console.log('  Task Type:', task.type);
      console.log('  Subject:', task.subject);
      console.log('  Status:', task.status);

      console.log('\n✅ Location Details:');
      console.log('  Unit:', unitResponse.data.name);
      console.log('  Property:', propertyResponse.data.name);
      console.log('  Requested By:', tenantName);

      console.log('\n✅ Technical Details:');
      console.log('  Unit ID:', task.unit);
      console.log('  Property ID:', task.property);
      console.log('  Tenant ID:', task.requestedByTenant);
      console.log('  Linked to Lease:', task.linkedResource ? 'Yes' : 'No');

      // Verification
      console.log('\n' + '='.repeat(60));
      console.log('VERIFICATION RESULTS:');
      console.log('=' .repeat(60));

      let allPassed = true;

      if (task.type === 'TENANT_REQUEST') {
        console.log('✅ Task Type: TENANT_REQUEST');
      } else {
        console.log('❌ Task Type:', task.type, '(Expected: TENANT_REQUEST)');
        allPassed = false;
      }

      if (unitResponse.data.name === 'C5') {
        console.log('✅ Unit: C5 (CORRECT)');
      } else {
        console.log('❌ Unit:', unitResponse.data.name, '(Expected: C5)');
        allPassed = false;
      }

      if (propertyResponse.data.name === 'Garden View Apartments') {
        console.log('✅ Property: Garden View Apartments (CORRECT)');
      } else {
        console.log('⚠️  Property:', propertyResponse.data.name);
      }

      if (tenantName.includes('Ashley Collins')) {
        console.log('✅ Requested By: Ashley Collins (CORRECT)');
      } else {
        console.log('❌ Requested By:', tenantName, '(Expected: Ashley Collins)');
        allPassed = false;
      }

      if (task.linkedResource) {
        console.log('✅ Linked to Lease: Yes');
      } else {
        console.log('❌ Linked to Lease: No');
        allPassed = false;
      }

      console.log('\n' + '='.repeat(60));

      if (allPassed) {
        console.log('🎉 TEST PASSED! Everything is correct!');
        console.log('\n✅ The tenant request is now visible in DoorLoop under:');
        console.log('   - Tenant: Ashley Collins');
        console.log('   - Unit: C5');
        console.log('   - Property: Garden View Apartments');
        console.log('\n✅ Your maintenance bot is working correctly!');
      } else {
        console.log('❌ TEST FAILED - Some verifications did not pass');
      }

      console.log('=' .repeat(60));

    } else {
      console.log('\n❌ Request failed or returned unsuccessful result');
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED\n');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAshleyCollins();
