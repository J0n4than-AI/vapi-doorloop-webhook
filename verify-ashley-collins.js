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

async function verifyAshleyCollins() {
  console.log('🔍 Verifying Ashley Collins lease on unit C5...\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Find unit C5
    console.log('\n📋 Step 1: Searching for unit "C5"...');
    const unitsResponse = await doorloopClient.get('/units', {
      params: { search: 'C5', limit: 20 }
    });

    console.log(`Found ${unitsResponse.data.data.length} units matching "C5"\n`);

    // Find exact match
    const c5Unit = unitsResponse.data.data.find(u => u.name?.toLowerCase() === 'c5');

    if (!c5Unit) {
      console.log('❌ Unit C5 not found!');
      console.log('Available units:', unitsResponse.data.data.map(u => u.name).join(', '));
      return;
    }

    console.log('✅ Found unit C5:');
    console.log('  Unit ID:', c5Unit.id);
    console.log('  Unit Name:', c5Unit.name);
    console.log('  Property ID:', c5Unit.property);

    // Get property details
    const propertyResponse = await doorloopClient.get(`/properties/${c5Unit.property}`);
    console.log('  Property Name:', propertyResponse.data.name);

    // Step 2: Get leases for unit C5
    console.log('\n📋 Step 2: Fetching leases for unit C5...');
    const leasesResponse = await doorloopClient.get('/leases', {
      params: { units: c5Unit.id, status: 'ACTIVE', limit: 10 }
    });

    console.log(`\nFound ${leasesResponse.data.data.length} active lease(s):\n`);

    leasesResponse.data.data.forEach((lease, index) => {
      console.log(`${index + 1}. "${lease.name}" (ID: ${lease.id})`);
    });

    // Step 3: Find Ashley Collins lease
    const ashleyLease = leasesResponse.data.data.find(l =>
      l.name?.toLowerCase().includes('ashley collins')
    );

    if (!ashleyLease) {
      console.log('\n❌ No Ashley Collins lease found on unit C5!');
      return;
    }

    console.log('\n✅ Found Ashley Collins lease!');
    console.log('  Lease ID:', ashleyLease.id);
    console.log('  Lease Name:', ashleyLease.name);
    console.log('  Status:', ashleyLease.status);

    // Step 4: Get tenant ID for Ashley Collins
    console.log('\n📋 Step 3: Searching for Ashley Collins tenant...');
    const tenantsResponse = await doorloopClient.get('/tenants', {
      params: { search: 'Ashley Collins', limit: 10 }
    });

    const ashleyTenant = tenantsResponse.data.data.find(t =>
      t.name?.toLowerCase().includes('ashley collins')
    );

    if (ashleyTenant) {
      console.log('\n✅ Found Ashley Collins tenant:');
      console.log('  Tenant ID:', ashleyTenant.id);
      console.log('  Tenant Name:', ashleyTenant.name);
    } else {
      console.log('\n⚠️  Ashley Collins tenant not found in tenants API');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('VERIFICATION SUMMARY:');
    console.log('='.repeat(60));
    console.log('✅ Unit: C5 (ID:', c5Unit.id + ')');
    console.log('✅ Property:', propertyResponse.data.name, '(ID:', c5Unit.property + ')');
    console.log('✅ Lease:', ashleyLease.name, '(ID:', ashleyLease.id + ')');
    if (ashleyTenant) {
      console.log('✅ Tenant:', ashleyTenant.name, '(ID:', ashleyTenant.id + ')');
    }
    console.log('\n✅ Ready to test with this data!');
    console.log('=' .repeat(60));

    // Return the data for use in test
    return {
      unit: c5Unit,
      property: propertyResponse.data,
      lease: ashleyLease,
      tenant: ashleyTenant
    };

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }
}

verifyAshleyCollins();
