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

async function searchTenantByName() {
  console.log('🔍 Searching for tenant "Sarah Johnson"...\n');

  try {
    // Search tenants API
    const tenantsResponse = await doorloopClient.get('/tenants', {
      params: {
        search: 'Sarah Johnson',
        limit: 10
      }
    });

    console.log(`Found ${tenantsResponse.data.data.length} tenant(s):\n`);

    tenantsResponse.data.data.forEach((tenant, index) => {
      console.log(`\n--- Tenant #${index + 1} ---`);
      console.log('Tenant ID:', tenant.id);
      console.log('Name:', tenant.name);
      console.log('Email:', tenant.email);
      console.log('Phone:', tenant.phone);
      console.log('Lease:', tenant.lease);
    });

    if (tenantsResponse.data.data.length > 0) {
      const tenant = tenantsResponse.data.data[0];

      console.log('\n' + '='.repeat(60));
      console.log('Testing TENANT_REQUEST creation with tenant ID...\n');

      const tenantRequestData = {
        subject: 'TEST: Kitchen faucet leaking - via API',
        description: 'Tenant: Sarah Johnson\nPhone: 555-0102\nUnit: Smoke Test\n\nIssue: Kitchen faucet is leaking water\n\nReported: This morning around 8am',
        type: 'TENANT_REQUEST',
        status: 'NOT_STARTED',
        unit: '69026f40df153a1cdd4cf3c6',  // Smoke Test unit
        property: '69026f40df153a1cdd4cf379',  // Smoke Test property
        requestedByTenant: tenant.id,
        linkedResource: {
          resourceId: tenant.lease || '68fa80664aa6bb84cc1d1e84',
          resourceType: 'LEASE'
        },
        tenantRequestType: 'MAINTENANCE',
        entryPermission: 'NOT_APPLICABLE'
      };

      console.log('Payload:', JSON.stringify(tenantRequestData, null, 2));

      const createResponse = await doorloopClient.post('/tasks', tenantRequestData);
      console.log('\n🎉 SUCCESS! TENANT_REQUEST created!');
      console.log('=' .repeat(60));
      console.log('Task ID:', createResponse.data.id);
      console.log('Task Type:', createResponse.data.type);
      console.log('Subject:', createResponse.data.subject);
      console.log('Requested By Tenant:', createResponse.data.requestedByTenant);
      console.log('Linked Resource:', createResponse.data.linkedResource);
      console.log('\nThis tenant request should now appear under:');
      console.log('- Tenant Name: Sarah Johnson');
      console.log('- NOT just the property address');
      console.log('=' .repeat(60));
    }

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }
}

searchTenantByName();
