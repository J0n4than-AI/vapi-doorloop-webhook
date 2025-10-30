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

async function getTenantId() {
  console.log('🔍 Finding tenant ID for Sarah Johnson...\n');

  try {
    // Get Sarah Johnson's lease
    const leaseId = '68fa80664aa6bb84cc1d1e84';

    console.log('Fetching lease details...');
    const leaseResponse = await doorloopClient.get(`/leases/${leaseId}`);

    console.log('\nLease details:');
    console.log('=' .repeat(60));
    console.log('Lease ID:', leaseResponse.data.id);
    console.log('Lease Name:', leaseResponse.data.name);
    console.log('Status:', leaseResponse.data.status);
    console.log('\nFull lease object:');
    console.log(JSON.stringify(leaseResponse.data, null, 2));

    // Check for tenant IDs
    if (leaseResponse.data.tenants && leaseResponse.data.tenants.length > 0) {
      console.log('\n✅ Tenant IDs found:');
      leaseResponse.data.tenants.forEach((tenantId, index) => {
        console.log(`  ${index + 1}. ${tenantId}`);
      });

      // Fetch first tenant details
      const firstTenantId = leaseResponse.data.tenants[0];
      console.log(`\nFetching tenant details for: ${firstTenantId}...`);

      const tenantResponse = await doorloopClient.get(`/tenants/${firstTenantId}`);
      console.log('\nTenant details:');
      console.log('  Name:', tenantResponse.data.name);
      console.log('  Email:', tenantResponse.data.email);
      console.log('  Phone:', tenantResponse.data.phone);

    } else {
      console.log('\n❌ No tenant IDs in lease.tenants field');
    }

    // Now try creating a TENANT_REQUEST with this tenant ID
    if (leaseResponse.data.tenants && leaseResponse.data.tenants.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('Testing TENANT_REQUEST creation...\n');

      const tenantRequestData = {
        subject: 'TEST: Kitchen faucet leaking',
        description: 'Testing tenant request with correct tenant ID',
        type: 'TENANT_REQUEST',
        status: 'NOT_STARTED',
        unit: '69026f40df153a1cdd4cf3c6',
        property: '69026f40df153a1cdd4cf379',
        requestedByTenant: leaseResponse.data.tenants[0],
        linkedResource: {
          resourceId: leaseId,
          resourceType: 'LEASE'
        },
        tenantRequestType: 'MAINTENANCE',
        entryPermission: 'NOT_APPLICABLE'
      };

      console.log('Payload:', JSON.stringify(tenantRequestData, null, 2));

      const createResponse = await doorloopClient.post('/tasks', tenantRequestData);
      console.log('\n✅ SUCCESS! TENANT_REQUEST created!');
      console.log('Task ID:', createResponse.data.id);
      console.log('Task Type:', createResponse.data.type);
      console.log('Requested By Tenant:', createResponse.data.requestedByTenant);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }

  console.log('\n' + '='.repeat(60));
}

getTenantId();
