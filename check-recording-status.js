const axios = require('axios');

const VAPI_API_KEY = '44d98331-b00a-435f-8788-30aad5f58510';
const ASSISTANT_ID = '65b8c896-3c88-40ef-ac6a-c25ce1592cfa';

async function checkRecordingStatus() {
  try {
    console.log('🔍 Checking call recording status...\n');

    const response = await axios.get(
      `https://api.vapi.ai/assistant/${ASSISTANT_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Assistant Details:');
    console.log('=' .repeat(60));
    console.log('Name:', response.data.name);
    console.log('ID:', response.data.id);
    console.log('Recording Enabled:', response.data.recordingEnabled);
    console.log('=' .repeat(60));

    if (response.data.recordingEnabled) {
      console.log('\n✅ Call recording is ENABLED');
      console.log('All calls will be recorded and available at:');
      console.log('https://dashboard.vapi.ai/calls\n');
    } else {
      console.log('\n❌ Call recording is DISABLED');
      console.log('Run enable-recording.js to enable it.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkRecordingStatus();
