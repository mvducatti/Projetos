// Script to update Flow endpoint
// Run: node update-flow-endpoint.js

const FLOW_ID = '1483727616022490';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const ENDPOINT_URI = 'https://whatsapp-flow-beige.vercel.app/api/flow';

async function updateFlowEndpoint() {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${FLOW_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint_uri: ENDPOINT_URI
        })
      }
    );

    const data = await response.json();
    
    if (data.error) {
      console.error('❌ Error:', JSON.stringify(data.error, null, 2));
    } else {
      console.log('✅ Flow endpoint updated successfully!');
      console.log('📋 Response:', JSON.stringify(data, null, 2));
      console.log('\n🎯 Now republish your Flow in WhatsApp Manager!');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateFlowEndpoint();
