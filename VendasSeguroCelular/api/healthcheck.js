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
    const { version, action } = req.body;

    // Validate health check request
    if (version === '3.0' && action === 'ping') {
      return res.status(200).json({
        data: {
          status: 'active'
        }
      });
    }

    // Invalid request format
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Expected version 3.0 and action ping'
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
