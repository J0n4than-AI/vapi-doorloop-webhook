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

async function checkLeaseUnit() {
  console.log('🔍 Checking what unit the "Smoke - Sarah Johnson" lease is on...\n');

  try {
    // Get the lease
    const leaseId = '68fa80664aa6bb84cc1d1e84';
    const leaseResponse = await doorloopClient.get(`/leases/${leaseId}`);
    const lease = leaseResponse.data;

    console.log('Lease Details:');
    console.log('=' .repeat(60));
    console.log('Lease ID:', lease.id);
    console.log('Lease Name:', lease.name);
    console.log('Status:', lease.status);
    console.log('Units:', lease.units);
    console.log('Property:', lease.property);

    // Get unit details for each unit in the lease
    if (lease.units && lease.units.length > 0) {
      console.log('\n✅ Lease is linked to these units:');
      for (const unitId of lease.units) {
        const unitResponse = await doorloopClient.get(`/units/${unitId}`);
        console.log(`\n  Unit ID: ${unitId}`);
        console.log(`  Unit Name: ${unitResponse.data.name}`);
        console.log(`  Property: ${unitResponse.data.property}`);
      }

      // Check if any of these units is "Smoke Test"
      let hasSmokeTest = false;
      for (const unitId of lease.units) {
        const unitResponse = await doorloopClient.get(`/units/${unitId}`);
        if (unitResponse.data.name === 'Smoke Test') {
          console.log('\n✅ Found "Smoke Test" unit in lease!');
          hasSmokeTest = true;
        }
      }

      if (!hasSmokeTest) {
        console.log('\n❌ PROBLEM: Lease "Smoke - Sarah Johnson" is NOT linked to "Smoke Test" unit!');
        console.log('The lease is on a different unit.');
        console.log('\nThis explains why the authentication found the lease but on the wrong unit.');
      }
    }

    // Now find which lease is actually on "Smoke Test" unit
    console.log('\n' + '='.repeat(60));
    console.log('Finding leases on "Smoke Test" unit...\n');

    const smokeTestUnitId = '69026f40df153a1cdd4cf3c6';
    const leasesResponse = await doorloopClient.get('/leases', {
      params: {
        units: smokeTestUnitId,
        status: 'ACTIVE',
        limit: 20
      }
    });

    console.log(`Found ${leasesResponse.data.data.length} active lease(s) on "Smoke Test" unit:\n`);

    leasesResponse.data.data.forEach((lease, index) => {
      console.log(`${index + 1}. "${lease.name}" (ID: ${lease.id})`);
    });

    // Check if Sarah Johnson has a lease on Smoke Test
    const sarahLease = leasesResponse.data.data.find(l =>
      l.name?.toLowerCase().includes('sarah johnson')
    );

    if (sarahLease) {
      console.log('\n✅ Found Sarah Johnson lease on "Smoke Test":');
      console.log('   Lease ID:', sarahLease.id);
      console.log('   Lease Name:', sarahLease.name);
    } else {
      console.log('\n❌ No Sarah Johnson lease found on "Smoke Test" unit!');
      console.log('This means the test data is inconsistent.');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }

  console.log('\n' + '='.repeat(60));
}

checkLeaseUnit();
