const axios = require('axios');

const VAPI_API_KEY = '44d98331-b00a-435f-8788-30aad5f58510';
const ASSISTANT_ID = '65b8c896-3c88-40ef-ac6a-c25ce1592cfa';
const WEBHOOK_URL = 'https://vapi-doorloop-webhook.onrender.com/vapi/webhook';

async function updateAssistant() {
  try {
    console.log('Updating VAPI assistant with webhook URL...');

    const response = await axios.patch(
      `https://api.vapi.ai/assistant/${ASSISTANT_ID}`,
      {
        serverUrl: WEBHOOK_URL
      },
      {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Assistant updated successfully!');
    console.log('Server URL set to:', WEBHOOK_URL);

  } catch (error) {
    console.error('❌ Error updating assistant:', error.response?.data || error.message);
  }
}

updateAssistant();
