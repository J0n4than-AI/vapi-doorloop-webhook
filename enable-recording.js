const axios = require('axios');

const VAPI_API_KEY = '44d98331-b00a-435f-8788-30aad5f58510';
const ASSISTANT_ID = '65b8c896-3c88-40ef-ac6a-c25ce1592cfa';

async function enableRecording() {
  try {
    console.log('Enabling call recording for VAPI assistant...\n');

    const response = await axios.patch(
      `https://api.vapi.ai/assistant/${ASSISTANT_ID}`,
      {
        recordingEnabled: true
      },
      {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Call recording enabled!');
    console.log('\nAll calls will now be recorded and visible in:');
    console.log('https://dashboard.vapi.ai/calls\n');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

enableRecording();
