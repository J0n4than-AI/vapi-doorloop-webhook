const axios = require('axios');

const VAPI_API_KEY = '44d98331-b00a-435f-8788-30aad5f58510';
const ASSISTANT_ID = '65b8c896-3c88-40ef-ac6a-c25ce1592cfa';

async function checkAssistant() {
  try {
    const response = await axios.get(
      `https://api.vapi.ai/assistant/${ASSISTANT_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`
        }
      }
    );

    console.log('Current Assistant Configuration:\n');
    console.log('Name:', response.data.name);
    console.log('Server URL:', response.data.serverUrl);
    console.log('\nModel Configuration:');
    console.log(JSON.stringify(response.data.model, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkAssistant();
