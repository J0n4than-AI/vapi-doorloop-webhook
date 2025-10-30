const axios = require('axios');

const DOORLOOP_API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoiQVBJIiwiaWQiOiI2OGVlNmZiYjIxYjI0MjkxYjdmZTM4ODgiLCJleHAiOjIwNzU4MTY2MzV9.6D_BgXStGG-yVE5dogTmp_KQ7So0GRhtOBXbMUyLS1I';

const doorloopClient = axios.create({
  baseURL: 'https://app.doorloop.com/api',
  headers: {
    'Authorization': `Bearer ${DOORLOOP_API_TOKEN}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

async function verifyFinalTask() {
  console.log('🔍 FINAL VERIFICATION\n');
  console.log('=' .repeat(60));

  try {
    const taskId = '6903ab3be6104ddf5c4ac9e5';

    // Get task
    const taskResponse = await doorloopClient.get(`/tasks/${taskId}`);
    const task = taskResponse.data;

    console.log('\n✅ Task Details:');
    console.log('  Task ID:', task.id);
    console.log('  Type:', task.type);
    console.log('  Subject:', task.subject);
    console.log('  Unit ID:', task.unit);
    console.log('  Property ID:', task.property);
    console.log('  Requested By Tenant:', task.requestedByTenant);

    // Get unit
    const unitResponse = await doorloopClient.get(`/units/${task.unit}`);
    console.log('\n✅ Unit Details:');
    console.log('  Unit Name:', unitResponse.data.name);
    console.log('  Unit ID:', unitResponse.data.id);

    // Get tenant
    const tenantResponse = await doorloopClient.get(`/tenants/${task.requestedByTenant}`);
    console.log('\n✅ Tenant Details:');
    console.log('  Tenant Name:', tenantResponse.data.name);
    console.log('  Tenant ID:', tenantResponse.data.id);

    // Verify correctness
    console.log('\n' + '='.repeat(60));
    console.log('VERIFICATION RESULTS:');
    console.log('='.repeat(60));

    if (unitResponse.data.name === 'Smoke Test') {
      console.log('✅ Task created on CORRECT unit: Smoke Test');
    } else {
      console.log('❌ Task created on WRONG unit:', unitResponse.data.name);
    }

    if (task.type === 'TENANT_REQUEST') {
      console.log('✅ Task type: TENANT_REQUEST');
    } else {
      console.log('❌ Task type:', task.type);
    }

    if (tenantResponse.data.name === 'Smoke - Sarah Johnson') {
      console.log('✅ Requested by correct tenant: Smoke - Sarah Johnson');
    } else {
      console.log('⚠️  Requested by:', tenantResponse.data.name);
    }

    if (task.linkedResource) {
      console.log('✅ Linked to lease:', task.linkedResource.resourceId);
    } else {
      console.log('❌ Not linked to lease');
    }

    console.log('\n' + '='.repeat(60));

    if (unitResponse.data.name === 'Smoke Test' && task.type === 'TENANT_REQUEST') {
      console.log('🎉 SUCCESS! Everything is correct!');
      console.log('\nThis tenant request should now be visible in DoorLoop under:');
      console.log('  - Tenant: Smoke - Sarah Johnson');
      console.log('  - Unit: Smoke Test');
      console.log('  - Property ID:', task.property);
      console.log('\n✅ The issue is FIXED!');
    } else {
      console.log('❌ Still have issues to fix');
    }

    console.log('=' .repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }
}

verifyFinalTask();
