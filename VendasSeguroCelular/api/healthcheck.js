import crypto from 'crypto';

// IMPORTANT: Private key must be set in Vercel environment variables
// Add PRIVATE_KEY in Vercel Settings > Environment Variables
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Validate that private key is configured
if (!PRIVATE_KEY) {
  console.error('⚠️  PRIVATE_KEY environment variable is not set!');
}

function decryptRequest(encryptedFlowData, encryptedAesKey, initialVector) {
  try {
    // Decrypt the AES key using RSA private key
    const decryptedAesKey = crypto.privateDecrypt(
      {
        key: PRIVATE_KEY,
        oaepHash: 'sha256',
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      Buffer.from(encryptedAesKey, 'base64')
    );

    // Decrypt the flow data using AES-GCM
    const encryptedFlowDataBuffer = Buffer.from(encryptedFlowData, 'base64');
    const ivBuffer = Buffer.from(initialVector, 'base64');
    
    // The last 16 bytes are the auth tag
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
    // Flip the initialization vector
    const ivBuffer = Buffer.from(initialVector, 'base64');
    const flippedIv = Buffer.alloc(ivBuffer.length);
    for (let i = 0; i < ivBuffer.length; i++) {
      flippedIv[i] = ~ivBuffer[i];
    }

    // Encrypt the response using AES-GCM
    const cipher = crypto.createCipheriv('aes-128-gcm', aesKey, flippedIv);
    let encrypted = cipher.update(JSON.stringify(response), 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Append the auth tag
    const authTag = cipher.getAuthTag();
    const encryptedWithTag = Buffer.concat([encrypted, authTag]);

    return encryptedWithTag.toString('base64');
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

export default function handler(req, res) {
  // WhatsApp Flow Health Check Endpoint
  // Responds to ping requests to verify endpoint is active
  
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }

  try {
    const body = req.body;

    // Check if request is encrypted (from WhatsApp)
    if (body.encrypted_flow_data && body.encrypted_aes_key && body.initial_vector) {
      // Decrypt the request
      const decryptedRequest = decryptRequest(
        body.encrypted_flow_data,
        body.encrypted_aes_key,
        body.initial_vector
      );

      const { version, action } = decryptedRequest;

      // Validate health check request
      if (version === '3.0' && action === 'ping') {
        const response = {
          data: {
            status: 'active'
          }
        };

        // Encrypt the response
        const decryptedAesKey = crypto.privateDecrypt(
          {
            key: PRIVATE_KEY,
            oaepHash: 'sha256',
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          },
          Buffer.from(body.encrypted_aes_key, 'base64')
        );

        const encryptedResponse = encryptResponse(response, decryptedAesKey, body.initial_vector);

        // Return as plain text base64 string
        return res.status(200).send(encryptedResponse);
      }

      return res.status(400).json({
        error: 'Invalid request',
        message: 'Expected version 3.0 and action ping'
      });
    }

    // Handle plain request (for testing)
    const { version, action } = body;

    if (version === '3.0' && action === 'ping') {
      return res.status(200).json({
        data: {
          status: 'active'
        }
      });
    }

    return res.status(400).json({
      error: 'Invalid request',
      message: 'Expected version 3.0 and action ping or encrypted request format'
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
