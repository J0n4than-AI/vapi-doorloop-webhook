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

async function debugDoorLoopData() {
  console.log('🔍 DEBUGGING DOORLOOP DATA\n');
  console.log('=' .repeat(60));

  try {
    // 1. Get all units
    console.log('\n📋 Step 1: Fetching all units...');
    const unitsResponse = await doorloopClient.get('/units', {
      params: { limit: 50 }
    });

    console.log(`Found ${unitsResponse.data.data.length} units:`);
    unitsResponse.data.data.forEach((unit, index) => {
      console.log(`${index + 1}. "${unit.name}" (ID: ${unit.id}, Ref: ${unit.reference || 'N/A'}, Property: ${unit.property})`);
    });

    // 2. Search specifically for "Smoke Test"
    console.log('\n🔍 Step 2: Searching for "Smoke Test" unit...');
    const smokeUnitSearch = await doorloopClient.get('/units', {
      params: { search: 'Smoke Test', limit: 10 }
    });

    if (smokeUnitSearch.data.data.length > 0) {
      console.log('Found matching units:');
      smokeUnitSearch.data.data.forEach(unit => {
        console.log(`  - "${unit.name}" (ID: ${unit.id})`);
      });

      const smokeUnit = smokeUnitSearch.data.data[0];
      console.log('\nUsing first match:', smokeUnit.name);
      console.log('Unit ID:', smokeUnit.id);
      console.log('Property ID:', smokeUnit.property);

      // 3. Get leases for this unit
      console.log('\n📝 Step 3: Fetching leases for this unit...');
      const leasesResponse = await doorloopClient.get('/leases', {
        params: {
          units: smokeUnit.id,
          limit: 20
        }
      });

      console.log(`\nFound ${leasesResponse.data.data.length} leases for this unit:`);
      leasesResponse.data.data.forEach((lease, index) => {
        console.log(`\nLease ${index + 1}:`);
        console.log(`  Name: "${lease.name}"`);
        console.log(`  Status: ${lease.status}`);
        console.log(`  Start: ${lease.startDate || 'N/A'}`);
        console.log(`  End: ${lease.endDate || 'N/A'}`);
        console.log(`  Tenants: ${lease.tenants?.length || 0}`);
        if (lease.tenants && lease.tenants.length > 0) {
          lease.tenants.forEach(tenant => {
            console.log(`    - Tenant ID: ${tenant}`);
          });
        }
      });

      // 4. Get ACTIVE leases only
      console.log('\n✅ Step 4: Fetching ACTIVE leases only...');
      const activeLeasesResponse = await doorloopClient.get('/leases', {
        params: {
          units: smokeUnit.id,
          status: 'ACTIVE',
          limit: 10
        }
      });

      if (activeLeasesResponse.data.data.length === 0) {
        console.log('❌ NO ACTIVE LEASES FOUND!');
        console.log('\nThis explains why authentication is failing!');
        console.log('The unit exists, but there is no ACTIVE lease on it.');
      } else {
        console.log(`\nFound ${activeLeasesResponse.data.data.length} ACTIVE lease(s):`);
        activeLeasesResponse.data.data.forEach((lease, index) => {
          console.log(`\nActive Lease ${index + 1}:`);
          console.log(`  Name: "${lease.name}"`);
          console.log(`  Status: ${lease.status}`);
          console.log(`  Lease ID: ${lease.id}`);

          // Test name matching logic
          console.log('\n  Testing name matching:');
          const testNames = [
            'Sarah Johnson',
            'Smoke - Sarah Johnson',
            'Johnson',
            'Sarah',
            'smoke sarah johnson'
          ];

          const leaseName = lease.name?.toLowerCase() || '';
          const leaseNames = leaseName.split(/[&,]/).map(n => n.trim());
          console.log(`  Lease name parts:`, leaseNames);

          testNames.forEach(testName => {
            const callerName = testName.toLowerCase();
            const nameMatch = leaseNames.some(leaseTenantName => {
              return leaseTenantName.includes(callerName) || callerName.includes(leaseTenantName);
            });
            console.log(`    "${testName}" → ${nameMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
          });
        });
      }

    } else {
      console.log('❌ NO UNITS FOUND matching "Smoke Test"');
      console.log('\nTrying alternative search terms...');

      const altSearchTerms = ['smoke', 'test', 'Smoke', 'Test'];
      for (const term of altSearchTerms) {
        const altSearch = await doorloopClient.get('/units', {
          params: { search: term, limit: 5 }
        });
        if (altSearch.data.data.length > 0) {
          console.log(`\nFound units matching "${term}":`);
          altSearch.data.data.forEach(unit => {
            console.log(`  - "${unit.name}"`);
          });
        }
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('DEBUG COMPLETE');
  console.log('='.repeat(60) + '\n');
}

debugDoorLoopData();
