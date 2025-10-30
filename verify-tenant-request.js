const axios = require('axios');

const DOORLOOP_API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoiQVBJIiwiaWQiOiI2OGVlNmZiYjIxYjI0MjkxYjdmZTM4ODgiLCJleHAiOjIwNzU4MTY2MzV9.6D_BgXStGG-yVE5dogTmp_KQ7So0GRhtOBXbMUyLS1I';
const TASK_ID = '6903a9148bb680aaae5ed8e3';

async function verifyTenantRequest() {
  console.log('🔍 Verifying task in DoorLoop...\n');

  try {
    const response = await axios.get(
      `https://app.doorloop.com/api/tasks/${TASK_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${DOORLOOP_API_TOKEN}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ TASK EXISTS IN DOORLOOP!\n');
    console.log('Task Details:');
    console.log('=' .repeat(60));
    console.log('Task ID:', response.data.id);
    console.log('Task Type:', response.data.type);
    console.log('Subject:', response.data.subject);
    console.log('Status:', response.data.status);
    console.log('Unit ID:', response.data.unit);
    console.log('Property ID:', response.data.property);
    console.log('Requested By Tenant:', response.data.requestedByTenant);
    console.log('Linked Resource:', response.data.linkedResource);
    console.log('Tenant Request Type:', response.data.tenantRequestType);
    console.log('Entry Permission:', response.data.entryPermission);
    console.log('\nDescription:');
    console.log(response.data.description);
    console.log('=' .repeat(60));

    if (response.data.type === 'TENANT_REQUEST') {
      console.log('\n✅ SUCCESS! Task created as TENANT_REQUEST!');
      console.log('✅ This will appear under the tenant name, not just property!');

      // Get tenant name
      if (response.data.requestedByTenant) {
        console.log('\nFetching tenant details...');
        const tenantResponse = await axios.get(
          `https://app.doorloop.com/api/tenants/${response.data.requestedByTenant}`,
          {
            headers: {
              'Authorization': `Bearer ${DOORLOOP_API_TOKEN}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('\n🎉 VERIFICATION COMPLETE!');
        console.log('=' .repeat(60));
        console.log('✅ Task Type: TENANT_REQUEST');
        console.log('✅ Requested By: ' + tenantResponse.data.name);
        console.log('✅ Linked to Lease: ' + (response.data.linkedResource ? 'Yes' : 'No'));
        console.log('✅ Will appear under tenant account in DoorLoop');
        console.log('=' .repeat(60));
      }
    } else {
      console.log('\n⚠️  Task type is:', response.data.type);
      console.log('Expected: TENANT_REQUEST');
    }

  } catch (error) {
    console.error('❌ Failed to verify task in DoorLoop');
    console.error('Error:', error.response?.data || error.message);
  }
}

verifyTenantRequest();
