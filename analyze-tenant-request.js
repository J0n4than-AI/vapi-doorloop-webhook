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

async function analyzeTenantRequest() {
  console.log('🔍 Analyzing existing TENANT_REQUEST tasks...\n');
  console.log('=' .repeat(60));

  try {
    // Get all tasks
    const tasksResponse = await doorloopClient.get('/tasks', {
      params: { limit: 100 }
    });

    // Find TENANT_REQUEST tasks
    const tenantRequests = tasksResponse.data.data.filter(task => task.type === 'TENANT_REQUEST');

    console.log(`\nFound ${tenantRequests.length} TENANT_REQUEST task(s):\n`);

    if (tenantRequests.length === 0) {
      console.log('No TENANT_REQUEST tasks found. Creating one manually in DoorLoop UI might help us see the structure.');
      return;
    }

    // Analyze the first few tenant requests
    const samplesToShow = Math.min(3, tenantRequests.length);

    for (let i = 0; i < samplesToShow; i++) {
      const task = tenantRequests[i];

      console.log(`\n--- TENANT_REQUEST #${i + 1} ---`);
      console.log('Full task object:', JSON.stringify(task, null, 2));
      console.log('\nKey fields:');
      console.log('  ID:', task.id);
      console.log('  Subject:', task.subject);
      console.log('  Type:', task.type);
      console.log('  Status:', task.status);
      console.log('  Unit:', task.unit);
      console.log('  Property:', task.property);
      console.log('  Lease:', task.lease);
      console.log('  Tenant:', task.tenant);
      console.log('  Priority:', task.priority);
      console.log('  Category:', task.category);
      console.log('  Created:', task.created);
      console.log('  Modified:', task.modified);
      console.log('\nAll fields in this task:');
      Object.keys(task).forEach(key => {
        console.log(`  - ${key}: ${typeof task[key]}`);
      });
      console.log('');
    }

    // Now let's try to create one with the same structure
    console.log('\n' + '='.repeat(60));
    console.log('Attempting to create TENANT_REQUEST with discovered structure...\n');

    const sampleTenantRequest = tenantRequests[0];

    const newTenantRequest = {
      subject: 'TEST: Creating Tenant Request',
      description: 'Testing tenant request creation with correct structure',
      type: 'TENANT_REQUEST',
      status: 'NOT_STARTED',
      unit: '69026f40df153a1cdd4cf3c6',  // Smoke Test unit
      property: '69026f40df153a1cdd4cf379',
      tenant: sampleTenantRequest.tenant || undefined,  // Copy tenant field if exists
      lease: sampleTenantRequest.lease || undefined,
      category: sampleTenantRequest.category || undefined,
      priority: sampleTenantRequest.priority || undefined
    };

    // Remove undefined fields
    Object.keys(newTenantRequest).forEach(key => {
      if (newTenantRequest[key] === undefined) {
        delete newTenantRequest[key];
      }
    });

    console.log('Payload:', JSON.stringify(newTenantRequest, null, 2));

    const createResponse = await doorloopClient.post('/tasks', newTenantRequest);
    console.log('\n✅ SUCCESS! Created TENANT_REQUEST!');
    console.log('Task ID:', createResponse.data.id);
    console.log('Response:', JSON.stringify(createResponse.data, null, 2));

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('ANALYSIS COMPLETE\n');
}

analyzeTenantRequest();
