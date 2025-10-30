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

async function debugTaskLocation() {
  console.log('🔍 Debugging where the task is created...\n');
  console.log('=' .repeat(60));

  try {
    const taskId = '6903a9148bb680aaae5ed8e3';

    // Get task details
    console.log('📋 Step 1: Fetching task details...');
    const taskResponse = await doorloopClient.get(`/tasks/${taskId}`);
    const task = taskResponse.data;

    console.log('\nTask Info:');
    console.log('  Type:', task.type);
    console.log('  Subject:', task.subject);
    console.log('  Unit ID:', task.unit);
    console.log('  Property ID:', task.property);
    console.log('  Requested By Tenant:', task.requestedByTenant);

    // Get unit details
    if (task.unit) {
      console.log('\n📋 Step 2: Fetching unit details...');
      const unitResponse = await doorloopClient.get(`/units/${task.unit}`);
      console.log('\nUnit Info:');
      console.log('  Unit Name:', unitResponse.data.name);
      console.log('  Unit ID:', unitResponse.data.id);
      console.log('  Property ID:', unitResponse.data.property);

      console.log('\n❌ PROBLEM FOUND!');
      console.log('Task is linked to unit:', unitResponse.data.name);
      console.log('Expected unit: Smoke Test');

      if (unitResponse.data.name !== 'Smoke Test') {
        console.log('\n⚠️  Task created on WRONG UNIT!');
        console.log('The authentication found the unit but linked to different unit ID');
      }
    }

    // Get tenant details
    if (task.requestedByTenant) {
      console.log('\n📋 Step 3: Fetching tenant details...');
      const tenantResponse = await doorloopClient.get(`/tenants/${task.requestedByTenant}`);
      console.log('\nTenant Info:');
      console.log('  Tenant Name:', tenantResponse.data.name);
      console.log('  Tenant ID:', tenantResponse.data.id);
    }

    // Now check what unit "Smoke Test" actually is
    console.log('\n📋 Step 4: Finding correct "Smoke Test" unit...');
    const unitsResponse = await doorloopClient.get('/units', {
      params: { search: 'Smoke Test', limit: 50 }
    });

    const smokeTestUnit = unitsResponse.data.data.find(u =>
      u.name?.toLowerCase() === 'smoke test'
    );

    if (smokeTestUnit) {
      console.log('\nCorrect "Smoke Test" unit:');
      console.log('  Unit Name:', smokeTestUnit.name);
      console.log('  Unit ID:', smokeTestUnit.id);
      console.log('  Property ID:', smokeTestUnit.property);

      if (task.unit !== smokeTestUnit.id) {
        console.log('\n🚨 MISMATCH CONFIRMED!');
        console.log('Task unit ID:', task.unit);
        console.log('Correct Smoke Test unit ID:', smokeTestUnit.id);
        console.log('\nThe authentication is finding the WRONG unit!');
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }

  console.log('\n' + '='.repeat(60));
}

debugTaskLocation();
