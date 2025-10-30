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

async function debugSmokeTestUnit() {
  console.log('🔍 DEBUGGING "SMOKE TEST" UNIT SPECIFICALLY\n');
  console.log('=' .repeat(60));

  try {
    // Get units and search for "Smoke Test"
    console.log('\n📋 Step 1: Searching for "Smoke Test" unit...');
    const unitsResponse = await doorloopClient.get('/units', {
      params: { search: 'Smoke Test', limit: 50 }
    });

    console.log(`\nDoorLoop returned ${unitsResponse.data.data.length} units from search`);

    // Use the EXACT same logic as webhook server
    const unitNumber = 'Smoke Test';
    const unit = unitsResponse.data.data.find(u =>
      u.name?.toLowerCase().includes(unitNumber.toLowerCase()) ||
      u.reference?.toLowerCase() === unitNumber.toLowerCase()
    );

    if (!unit) {
      console.log('❌ NO UNIT MATCHED with webhook server logic!');
      console.log('\nUnits in search results:');
      unitsResponse.data.data.forEach(u => {
        const nameMatch = u.name?.toLowerCase().includes(unitNumber.toLowerCase());
        const refMatch = u.reference?.toLowerCase() === unitNumber.toLowerCase();
        console.log(`  - "${u.name}" (matches: ${nameMatch || refMatch})`);
      });
      return;
    }

    console.log(`\n✅ UNIT MATCHED: "${unit.name}"`);
    console.log(`   Unit ID: ${unit.id}`);
    console.log(`   Property ID: ${unit.property}`);

    // Get leases for this specific unit
    console.log('\n📝 Step 2: Fetching leases for "Smoke Test" unit...');
    const leasesResponse = await doorloopClient.get('/leases', {
      params: {
        units: unit.id,
        status: 'ACTIVE',
        limit: 20
      }
    });

    console.log(`\nFound ${leasesResponse.data.data.length} ACTIVE lease(s):`);

    if (leasesResponse.data.data.length === 0) {
      console.log('\n❌ NO ACTIVE LEASES for "Smoke Test" unit!');
      console.log('This is why authentication is failing - the unit has no active lease.');
      return;
    }

    leasesResponse.data.data.forEach((lease, index) => {
      console.log(`\n--- Lease ${index + 1} ---`);
      console.log(`Name: "${lease.name}"`);
      console.log(`Status: ${lease.status}`);
      console.log(`Lease ID: ${lease.id}`);

      // Test name matching with "Sarah Johnson"
      const testNames = ['Sarah Johnson', 'Smoke - Sarah Johnson', 'Johnson', 'Sarah'];

      const leaseName = lease.name?.toLowerCase() || '';
      const leaseNames = leaseName.split(/[&,]/).map(n => n.trim());
      console.log(`Lease name parts:`, leaseNames);

      testNames.forEach(testName => {
        const callerName = testName.toLowerCase();
        const nameMatch = leaseNames.some(leaseTenantName => {
          return leaseTenantName.includes(callerName) || callerName.includes(leaseTenantName);
        });
        console.log(`  "${testName}" → ${nameMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
      });
    });

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('DEBUG COMPLETE');
  console.log('='.repeat(60) + '\n');
}

debugSmokeTestUnit();
