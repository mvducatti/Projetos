import crypto from 'crypto';
import brandsHandler from './brands.js';
import modelsHandler from './models.js';
import memoryHandler from './memory.js';
import deviceHandler from './device.js';

const PRIVATE_KEY = process.env.PRIVATE_KEY;

function decryptRequest(encryptedFlowData, encryptedAesKey, initialVector) {
  try {
    const decryptedAesKey = crypto.privateDecrypt(
      {
        key: PRIVATE_KEY,
        oaepHash: 'sha256',
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      Buffer.from(encryptedAesKey, 'base64')
    );

    const encryptedFlowDataBuffer = Buffer.from(encryptedFlowData, 'base64');
    const ivBuffer = Buffer.from(initialVector, 'base64');
    
    const authTag = encryptedFlowDataBuffer.slice(-16);
    const encryptedData = encryptedFlowDataBuffer.slice(0, -16);

    const decipher = crypto.createDecipheriv('aes-128-gcm', decryptedAesKey, ivBuffer);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, null, 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

function encryptResponse(response, aesKey, initialVector) {
  try {
    const ivBuffer = Buffer.from(initialVector, 'base64');
    const flippedIv = Buffer.alloc(ivBuffer.length);
    for (let i = 0; i < ivBuffer.length; i++) {
      flippedIv[i] = ~ivBuffer[i];
    }

    const cipher = crypto.createCipheriv('aes-128-gcm', aesKey, flippedIv);
    let encrypted = cipher.update(JSON.stringify(response), 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    const authTag = cipher.getAuthTag();
    const encryptedWithTag = Buffer.concat([encrypted, authTag]);

    return encryptedWithTag.toString('base64');
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

// Mock request/response objects for internal calls
function createMockRes() {
  let statusCode = 200;
  let responseData = null;

  return {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => {
          responseData = { statusCode, ...data };
        }
      };
    },
    json: (data) => {
      responseData = { statusCode, ...data };
    },
    getData: () => responseData
  };
}

// Get brands from internal handler
async function getBrands() {
  const mockReq = { query: {} };
  const mockRes = createMockRes();
  
  await brandsHandler(mockReq, mockRes);
  const data = mockRes.getData();
  
  if (data.hasError) {
    return [];
  }
  
  return data.data.map(item => ({
    id: item.id,
    title: item.name
  }));
}

// Get models from internal handler
async function getModels(brand) {
  const mockReq = { query: { brand } };
  const mockRes = createMockRes();
  
  await modelsHandler(mockReq, mockRes);
  const data = mockRes.getData();
  
  if (data.hasError) {
    return [];
  }
  
  return data.data.map(item => ({
    id: item.DeModel,
    title: item.DeModel
  }));
}

// Get memory options from internal handler
async function getMemory(model) {
  const mockReq = { query: { model } };
  const mockRes = createMockRes();
  
  await memoryHandler(mockReq, mockRes);
  const data = mockRes.getData();
  
  if (data.hasError) {
    return [];
  }
  
  return data.data.map(item => ({
    id: item.IdObjectSmartphone.toString(),
    title: item.DeMemory,
    metadata: {
      device_id: item.IdObjectSmartphone
    }
  }));
}

// Get device details from internal handler
async function getDeviceDetails(deviceId) {
  const mockReq = { query: { id: deviceId } };
  const mockRes = createMockRes();
  
  await deviceHandler(mockReq, mockRes);
  const data = mockRes.getData();
  
  if (data.hasError) {
    return null;
  }
  
  return data.data;
}

export default async function handler(req, res) {
  const timestamp = new Date().toISOString();
  console.log('\n\n========================================');
  console.log('🔵 FLOW ENDPOINT CALLED at', timestamp);
  console.log('========================================');
  console.log('📍 URL:', req.url);
  console.log('🔧 Method:', req.method);
  console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('🌐 Query:', JSON.stringify(req.query || {}, null, 2));
  
  if (req.method !== 'POST') {
    console.log('❌ REJECTED: Invalid method:', req.method);
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }

  try {
    const body = req.body || {};
    console.log('📦 Body type:', typeof body);
    console.log('📦 Body keys:', Object.keys(body));
    console.log('📦 Full body (first 500 chars):', JSON.stringify(body).substring(0, 500));

    // Check if encrypted request
    const hasEncryptedData = !!body.encrypted_flow_data;
    const hasEncryptedKey = !!body.encrypted_aes_key;
    const hasIV = !!body.initial_vector;
    
    console.log('🔒 Encryption check:');
    console.log('   - encrypted_flow_data:', hasEncryptedData);
    console.log('   - encrypted_aes_key:', hasEncryptedKey);
    console.log('   - initial_vector:', hasIV);
    
    if (!hasEncryptedData || !hasEncryptedKey || !hasIV) {
      console.log('❌ REJECTED: Missing encrypted fields');
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Missing encrypted request fields',
        details: {
          hasEncryptedData,
          hasEncryptedKey,
          hasIV
        }
      });
    }

    console.log('🔐 Attempting decryption...');
    console.log('   - PRIVATE_KEY exists:', !!PRIVATE_KEY);
    console.log('   - PRIVATE_KEY length:', PRIVATE_KEY ? PRIVATE_KEY.length : 0);
    
    // Decrypt request
    const decryptedRequest = decryptRequest(
      body.encrypted_flow_data,
      body.encrypted_aes_key,
      body.initial_vector
    );

    console.log('✅ Decryption successful!');
    console.log('📋 Decrypted request:', JSON.stringify(decryptedRequest, null, 2));
    const { version, action, screen, data: requestData } = decryptedRequest;

    // Decrypt AES key for response encryption
    const decryptedAesKey = crypto.privateDecrypt(
      {
        key: PRIVATE_KEY,
        oaepHash: 'sha256',
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      Buffer.from(body.encrypted_aes_key, 'base64')
    );

    // Handle health check (ping) request
    if (action === 'ping') {
      console.log('🏥 Health check request detected');
      const healthResponse = {
        data: {
          status: 'active'
        }
      };
      
      const encryptedHealthResponse = encryptResponse(healthResponse, decryptedAesKey, body.initial_vector);
      console.log('✅ Health check response sent');
      return res.status(200).send(encryptedHealthResponse);
    }

    let responseData = {};

    console.log('📱 Processing screen:', screen);
    console.log('📊 Request data:', JSON.stringify(requestData));

    // Handle different screens
    if (screen === 'DEVICE_SELECTION') {
      // Initial load - send brands
      if (!requestData.selected_brand) {
        const brands = await getBrands();
        responseData = {
          brands: brands,
          models: [],
          memories: [],
          selected_brand: '',
          selected_model: '',
          selected_memory: '',
          device_id: ''
        };
      }
      // Brand selected - send models
      else if (requestData.selected_brand && !requestData.selected_model) {
        const models = await getModels(requestData.selected_brand);
        responseData = {
          brands: await getBrands(),
          models: models,
          memories: [],
          selected_brand: requestData.selected_brand,
          selected_model: '',
          selected_memory: '',
          device_id: ''
        };
      }
      // Model selected - send memories
      else if (requestData.selected_model && !requestData.selected_memory) {
        const memories = await getMemory(requestData.selected_model);
        responseData = {
          brands: await getBrands(),
          models: await getModels(requestData.selected_brand),
          memories: memories,
          selected_brand: requestData.selected_brand,
          selected_model: requestData.selected_model,
          selected_memory: '',
          device_id: ''
        };
      }
      // Memory selected - set device ID
      else if (requestData.selected_memory) {
        const memories = await getMemory(requestData.selected_model);
        const selectedMemory = memories.find(m => m.id === requestData.selected_memory);
        
        responseData = {
          brands: await getBrands(),
          models: await getModels(requestData.selected_brand),
          memories: memories,
          selected_brand: requestData.selected_brand,
          selected_model: requestData.selected_model,
          selected_memory: requestData.selected_memory,
          device_id: selectedMemory ? selectedMemory.metadata.device_id.toString() : ''
        };
      }
    }
    else if (screen === 'PLAN_SELECTION') {
      // Get device details for display
      const deviceId = requestData.device_id || decryptedRequest.flow_token;
      if (deviceId) {
        const device = await getDeviceDetails(deviceId);
        if (device) {
          responseData = {
            device_info: {
              model: device.DeModel,
              memory: device.DeMemory,
              price: device.FormattedPrice
            }
          };
        }
      }
    }
    else if (screen === 'ORDER_SUMMARY') {
      // Build summary
      const deviceId = requestData.device_id;
      const plan = requestData.plan;
      
      if (deviceId) {
        const device = await getDeviceDetails(deviceId);
        
        const planPrices = {
          'super_economico': { value: 19.90, pix: 18.90 },
          'economico': { value: 34.90, pix: 33.15 },
          'completo': { value: 49.90, pix: 47.40 }
        };
        
        const selectedPlan = planPrices[plan] || planPrices.completo;
        
        responseData = {
          summary: {
            device: `${device.DeModel} - ${device.DeMemory}`,
            plan: `${plan.toUpperCase()} - R$ ${selectedPlan.value.toFixed(2)}`,
            total: `R$ ${selectedPlan.value.toFixed(2)}`,
            total_pix: `R$ ${selectedPlan.pix.toFixed(2)}`
          }
        };
      }
    }

    const response = {
      screen: screen,
      data: responseData
    };

    console.log('📤 Sending response:', JSON.stringify(response));
    
    const encryptedResponse = encryptResponse(response, decryptedAesKey, body.initial_vector);

    console.log('✅ Response encrypted successfully');
    return res.status(200).send(encryptedResponse);

  } catch (error) {
    console.error('\n❌❌❌ CRITICAL ERROR ❌❌❌');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('========================================\n');
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
