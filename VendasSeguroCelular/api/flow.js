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
  
  // WhatsApp Flow só aceita {id, title} - não pode ter campos extras!
  return data.data.map(item => ({
    id: item.IdObjectSmartphone.toString(),
    title: item.DeMemory
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
    const { version, action, screen, data: requestData, flow_token } = decryptedRequest;

    // Decrypt AES key for response encryption
    const decryptedAesKey = crypto.privateDecrypt(
      {
        key: PRIVATE_KEY,
        oaepHash: 'sha256',
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      Buffer.from(body.encrypted_aes_key, 'base64')
    );

    // Helper function to send encrypted response
    const sendEncryptedResponse = (responseData) => {
      console.log('📤 Response to encrypt:', JSON.stringify(responseData));
      const encryptedResponse = encryptResponse(responseData, decryptedAesKey, body.initial_vector);
      console.log('✅ Response encrypted and sent');
      return res.status(200).send(encryptedResponse);
    };

    // Handle health check (ping) request
    if (action === 'ping') {
      console.log('🏥 Health check request detected');
      return sendEncryptedResponse({
        data: {
          status: 'active'
        }
      });
    }

    // Handle error notification from client
    if (requestData?.error) {
      console.warn('⚠️ Client error received:', requestData.error);
      return sendEncryptedResponse({
        data: {
          acknowledged: true
        }
      });
    }

    // Handle INIT action (when user opens the flow)
    if (action === 'INIT') {
      console.log('🚀 INIT action - Loading first screen');
      const brands = await getBrands();
      
      return sendEncryptedResponse({
        screen: 'DEVICE_SELECTION',
        data: {
          brands: brands,
          models: [],
          memories: [],
          selected_brand: '',
          selected_model: '',
          selected_memory: '',
          device_id: ''
        }
      });
    }

    // Handle data_exchange action
    if (action === 'data_exchange') {
      let responseData = {};

      console.log('🔄 DATA EXCHANGE - Screen:', screen);
      console.log('📊 Request data:', JSON.stringify(requestData));

      // Handle different screens
      if (screen === 'DEVICE_SELECTION') {
        console.log('🔍 Received payload:', JSON.stringify(requestData, null, 2));
        
        // Check if user wants to navigate to next screen
        if (requestData.navigate_to === 'PLAN_SELECTION') {
          console.log('🚀 Navigating to PLAN_SELECTION with device_id:', requestData.device_id);
          
          const deviceId = requestData.device_id;
          if (deviceId) {
            const device = await getDeviceDetails(deviceId);
            console.log('📱 Device details for PLAN_SELECTION:', device);
            
            if (device) {
              // Return ONLY screen and data, WITHOUT navigate_to
              return sendEncryptedResponse({
                screen: 'PLAN_SELECTION',
                data: {
                  device_model: device.DeModel,
                  device_memory: device.DeMemory,
                  device_price: device.FormattedPrice,
                  plans: [
                    {
                      id: 'super_economico',
                      title: 'SUPER ECONÔMICO - R$ 19,90/mês',
                      description: 'R$ 215,00/ano\n\nProteção contra defeitos'
                    },
                    {
                      id: 'economico',
                      title: 'ECONÔMICO - R$ 34,90/mês',
                      description: 'R$ 383,00/ano\n\nRoubo, furto e danos acidentais'
                    },
                    {
                      id: 'completo',
                      title: 'COMPLETO - R$ 49,90/mês',
                      description: 'R$ 539,00/ano\n\nCobertura total SEM FRANQUIA + Aparelho reserva'
                    }
                  ]
                }
              });
            } else {
              console.error('❌ Device not found for ID:', deviceId);
            }
          } else {
            console.error('❌ No device_id received');
          }
        } 
        // Normal DEVICE_SELECTION interactions (dropdowns)
        else {
          // Normal DEVICE_SELECTION interactions
          try {
            const brands = await getBrands();
            console.log(`✅ Brands loaded: ${brands.length}`);
            
            let models = [];
            let memories = [];
            let device_id = '';

            // Se tem brand, carrega modelos
            if (requestData.selected_brand) {
              console.log('🏷️ Loading models for brand:', requestData.selected_brand);
              models = await getModels(requestData.selected_brand);
              console.log(`✅ Loaded ${models.length} models`);
            }

            // Se tem model, carrega memórias
            if (requestData.selected_model) {
              console.log('📱 Loading memories for model:', requestData.selected_model);
              memories = await getMemory(requestData.selected_model);
              console.log(`✅ Loaded ${memories.length} memories`);
            }

            // Se tem memory, o device_id é o próprio ID da memória selecionada
            if (requestData.selected_memory) {
              console.log('💾 Memory selected with ID:', requestData.selected_memory);
              device_id = requestData.selected_memory;
              console.log('✅ Device ID set to:', device_id);
            }

            return sendEncryptedResponse({
              screen: 'DEVICE_SELECTION',
              data: {
                brands: brands,
                models: models,
                memories: memories,
                selected_brand: requestData.selected_brand || '',
                selected_model: requestData.selected_model || '',
                selected_memory: requestData.selected_memory || '',
                device_id: device_id
              }
            });
          } catch (innerError) {
            console.error('❌ Error processing DEVICE_SELECTION:', innerError.message);
            throw innerError;
          }
        }
      }
      else if (screen === 'PLAN_SELECTION') {
        console.log('💰 PLAN_SELECTION - Updating plans with dynamic pricing');
        console.log('📊 Request data:', JSON.stringify(requestData));
        
        // Calculate prices based on billing type and franchise
        const billing_type = requestData.billing_type || 'mensal';
        const franchise = requestData.franchise || 'normal';
        
        const basePrices = {
          'super_economico': { mensal: 19.90, anual: 215.00 },
          'economico': { mensal: 34.90, anual: 383.00 },
          'completo': { mensal: 49.90, anual: 539.00 }
        };
        
        const franchiseMultiplier = franchise === 'reduzida' ? 1.15 : 1.0;
        
        const plans = Object.keys(basePrices).map(planId => {
          const monthlyPrice = basePrices[planId].mensal * franchiseMultiplier;
          const annualPrice = basePrices[planId].anual * franchiseMultiplier;
          
          const planNames = {
            'super_economico': 'SUPER ECONÔMICO',
            'economico': 'ECONÔMICO',
            'completo': 'COMPLETO'
          };
          
          const planDescriptions = {
            'super_economico': 'Proteção contra defeitos',
            'economico': 'Roubo, furto e danos acidentais',
            'completo': 'Cobertura total SEM FRANQUIA + Aparelho reserva'
          };
          
          const priceDisplay = billing_type === 'mensal'
            ? `R$ ${monthlyPrice.toFixed(2)}/mês`
            : `R$ ${annualPrice.toFixed(2)}/ano`;
          
          const priceAlt = billing_type === 'mensal'
            ? `R$ ${annualPrice.toFixed(2)}/ano`
            : `R$ ${monthlyPrice.toFixed(2)}/mês`;
          
          return {
            id: planId,
            title: `${planNames[planId]} - ${priceDisplay}`,
            description: `${priceAlt}\n\n${planDescriptions[planId]}`
          };
        });
        
        return sendEncryptedResponse({
          screen: 'PLAN_SELECTION',
          data: {
            device_model: requestData.device_model || '',
            device_memory: requestData.device_memory || '',
            device_price: requestData.device_price || '',
            plans: plans
          }
        });
      }
      else if (screen === 'IMEI_VALIDATION') {
        console.log('📱 IMEI_VALIDATION - Validating IMEI');
        console.log('📊 Request data:', JSON.stringify(requestData));
        
        const imei = requestData.imei;
        
        // Validate IMEI format (15 digits)
        if (!imei || !/^\d{15}$/.test(imei)) {
          return sendEncryptedResponse({
            screen: 'IMEI_VALIDATION',
            data: {
              imei_error: 'IMEI inválido. Deve conter exatamente 15 dígitos numéricos.',
              is_validating: false
            }
          });
        }
        
        // IMEI validation algorithm (Luhn algorithm for IMEI)
        const validateIMEI = (imei) => {
          let sum = 0;
          for (let i = 0; i < 14; i++) {
            let digit = parseInt(imei[i]);
            if (i % 2 === 1) {
              digit *= 2;
              if (digit > 9) digit -= 9;
            }
            sum += digit;
          }
          const checkDigit = (10 - (sum % 10)) % 10;
          return checkDigit === parseInt(imei[14]);
        };
        
        if (!validateIMEI(imei)) {
          return sendEncryptedResponse({
            screen: 'IMEI_VALIDATION',
            data: {
              imei_error: 'IMEI inválido. Verifique os números e tente novamente.',
              is_validating: false
            }
          });
        }
        
        // IMEI válido - navegar para próxima tela
        console.log('✅ IMEI válido:', imei);
        return sendEncryptedResponse({
          screen: 'CLIENT_DATA',
          data: {}
        });
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
          
          return sendEncryptedResponse({
            screen: 'ORDER_SUMMARY',
            data: {
              summary: {
                device: `${device.DeModel} - ${device.DeMemory}`,
                plan: `${plan.toUpperCase()} - R$ ${selectedPlan.value.toFixed(2)}`,
                total: `R$ ${selectedPlan.value.toFixed(2)}`,
                total_pix: `R$ ${selectedPlan.pix.toFixed(2)}`
              }
            }
          });
        }
      }

      throw new Error('Unhandled screen or missing data');
    }

    // Unknown action
    console.error('❌ Unknown action:', action);
    return sendEncryptedResponse({
      data: {
        error_msg: 'Unknown action'
      }
    });

  } catch (error) {
    console.error('\n❌❌❌ CRITICAL ERROR ❌❌❌');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('========================================\n');
    
    // If decryption fails, return 421 to refresh keys
    if (error.message.includes('Decryption failed')) {
      console.error('🔑 Decryption error - returning 421 to refresh keys');
      return res.status(421).send();
    }
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
