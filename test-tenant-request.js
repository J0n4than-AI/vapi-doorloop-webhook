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

async function testTenantRequest() {
  console.log('🧪 Testing different task types...\n');
  console.log('=' .repeat(60));

  // Test data
  const unitId = '69026f40df153a1cdd4cf3c6';  // Smoke Test unit
  const propertyId = '69026f40df153a1cdd4cf379';
  const leaseId = '68fa80664aa6bb84cc1d1e84';  // Sarah Johnson's lease

  // Test 1: Try TENANT_REQUEST type
  console.log('\n📝 Test 1: Creating task with type TENANT_REQUEST...');
  try {
    const tenantRequestData = {
      subject: 'TEST: Tenant Request Type',
      description: 'Testing if TENANT_REQUEST type exists',
      type: 'TENANT_REQUEST',
      status: 'NOT_STARTED',
      unit: unitId,
      property: propertyId,
      lease: leaseId
    };

    console.log('Payload:', JSON.stringify(tenantRequestData, null, 2));

    const response1 = await doorloopClient.post('/tasks', tenantRequestData);
    console.log('✅ SUCCESS! TENANT_REQUEST type works!');
    console.log('Task ID:', response1.data.id);
    console.log('Task Type:', response1.data.type);
  } catch (error) {
    console.log('❌ TENANT_REQUEST type failed');
    console.log('Error:', error.response?.data?.message || error.message);
  }

  // Test 2: Try with lease field on WORK_ORDER
  console.log('\n📝 Test 2: Creating WORK_ORDER with lease field...');
  try {
    const workOrderWithLease = {
      subject: 'TEST: Work Order with Lease',
      description: 'Testing WORK_ORDER with lease field',
      type: 'WORK_ORDER',
      status: 'NOT_STARTED',
      unit: unitId,
      property: propertyId,
      lease: leaseId  // Try adding lease field
    };

    console.log('Payload:', JSON.stringify(workOrderWithLease, null, 2));

    const response2 = await doorloopClient.post('/tasks', workOrderWithLease);
    console.log('✅ SUCCESS! WORK_ORDER with lease works!');
    console.log('Task ID:', response2.data.id);
    console.log('Task Type:', response2.data.type);
    console.log('Has Lease:', response2.data.lease ? 'Yes' : 'No');
  } catch (error) {
    console.log('❌ WORK_ORDER with lease failed');
    console.log('Error:', error.response?.data?.message || error.message);
  }

  // Test 3: Try MAINTENANCE_REQUEST type
  console.log('\n📝 Test 3: Creating task with type MAINTENANCE_REQUEST...');
  try {
    const maintenanceRequestData = {
      subject: 'TEST: Maintenance Request Type',
      description: 'Testing if MAINTENANCE_REQUEST type exists',
      type: 'MAINTENANCE_REQUEST',
      status: 'NOT_STARTED',
      unit: unitId,
      property: propertyId,
      lease: leaseId
    };

    console.log('Payload:', JSON.stringify(maintenanceRequestData, null, 2));

    const response3 = await doorloopClient.post('/tasks', maintenanceRequestData);
    console.log('✅ SUCCESS! MAINTENANCE_REQUEST type works!');
    console.log('Task ID:', response3.data.id);
    console.log('Task Type:', response3.data.type);
  } catch (error) {
    console.log('❌ MAINTENANCE_REQUEST type failed');
    console.log('Error:', error.response?.data?.message || error.message);
  }

  // Test 4: Check what types are available by querying tasks
  console.log('\n📝 Test 4: Querying existing tasks to see what types exist...');
  try {
    const tasksResponse = await doorloopClient.get('/tasks', {
      params: { limit: 50 }
    });

    const taskTypes = new Set();
    tasksResponse.data.data.forEach(task => {
      if (task.type) {
        taskTypes.add(task.type);
      }
    });

    console.log('✅ Task types found in your DoorLoop:');
    Array.from(taskTypes).forEach(type => {
      console.log(`   - ${type}`);
    });

  } catch (error) {
    console.log('❌ Failed to query tasks');
    console.log('Error:', error.response?.data?.message || error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('TESTS COMPLETE\n');
}

testTenantRequest();
