import crypto from 'crypto';

// Store your private key here (for now, using placeholder)
// In production, use environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDnYZ3EiPlo/8aJ
x0JQcySuoa4OMXYtE/8DKwTAX8o2yuVxTkhUUy+G8YafdiHzmOpwKno854DYng8c
vYB6ceB/YEKuIdh+eTHDpYISD7W2G6/w8zM11Q05B04hOYjBi5oXOvQe7OJIZ6f/
FcG5+1kn1CQMhCjyu1sk84Sg3giytFaowWT3dQRzSCPrSs2eQndLpUr0+CV0MK+K
prY5i1jsgGkZ2E72jtNXKWqKki9G+NJNLmDhCX43hkBZSEdgDgLxEjAzGfDqGwAi
S38HhkDgQThjsMh2X9eINP7Qt3xbJMkmMc3qzojqYlnX81Fkz43C1QbyqKPmClaN
OI7+K2jZAgMBAAECggEAFVIqbozMpr9C9Tk2RCGIFMtzNX2bTSYVjp4tLujkwk3J
/Lng8lxD+eRRqmoBUOgbWkCfyPLwLYXLELPpnd7WeAZPvqoBwA285zFeHfnynZhJ
iyNt6Zz7PfENYwRhNKx/g3p8OklLxK5AjcHcex3NJl1nAPxApbVb/biu1QAAvy6w
G6IEBFQtoVc6RDiZHGgTkJqkxUoU/wOts2g68H0Owb+GOyJ9o1lowHPUSEXwdcN5
ylat3G6yuIGHjKMOMR5KwCqecbQhPEBthIAyvE8wpF8G+IR6zv3/Qb0YoDBHrp8b
Mkg/m1rf0v8JcU1bsWTmTV4crvBDVYKCpC4msOSzrQKBgQD5XEpgqadn1NB3W4G9
uUijKfYHAGpFvK6oZdpF7MisMx/LmUJrQqXEO9kVs5B5eCZbYMG3gk5IFEGiNmRD
MFmKep7+AOzo4Mz6LekV4FF8YFMGzVBoqKb8MozjKkokIuh+EnKCerWNouqz/K/q
KY8NA1m5z4I7z3amIGGA3+nL9wKBgQDtisZNlWS85igqO3mmQWxJL+B3NYDuuB18
/MjHQYbkj7zGQS4gKMfcy1bpzEW3hCG2ZBMfgmaiexeC3yqa1kgU/mH1mvwdV8j3
oSPqjT6lkqOSIZy5sfbScZPUYOjguSfpLffvFZ1RrYI6IFOugF3kkVewy/QpW+Sb
fz8hfTIdrwKBgCp4V4qjGooKqv7JLQ29MuvnR6nlnjQGcNDpmAV00LDTfETW84MF
NOp5Lv4NOTwXBKFnl1bD8MVB/fO8w9LVt0ponA+y5Ka9MuwhSaOaMwa1+S4dZeaN
YvNtQKWoHDyPXX2rcqlacPWQm9zP2r5NGbojqfKFry60pQaiWTjz6gP9AoGAGeW8
Uu8LqZCKJniPfbG6RYxjs3tw0BXgmSTSGu8o7rhBA3hNuBHaIFdG5XxwyV4tcr4c
W54S5Hn5CTqdYX4lI6zML0OzYtuUPHMkAElf4BtJm//wH0qoty7MyCW8netxz3lE
g5teqG37Oa0WknrKQcYawlqqBuxO0ykfT95fXV8CgYEAtuc8PjQx83NAYnloAJFz
svWaj/zKO2ZT8eqkAhHESaHzGVHu0CEETYUw88bFoUs9ucOp4jxTOJDhNulWD4uj
3S9uBuowxTo5WihgDY3JuzeXOreQry4eaiE76T63hsbYnkAgCqzKGT3kyzQ+Ix6z
+YD+i8CDpQDUho7qfCHS8Pg=
-----END PRIVATE KEY-----`;

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
