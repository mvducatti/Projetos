import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    const { name } = req.query;
    
    console.log('📷 Image request:', name);
    console.log('🔍 CWD:', process.cwd());
    
    if (!name) {
      return res.status(400).json({ error: 'Image name is required' });
    }

    // Validar nome do arquivo para evitar path traversal
    if (name.includes('..') || name.includes('/') || name.includes('\\')) {
      return res.status(400).json({ error: 'Invalid image name' });
    }

    // Determinar tipo de conteúdo
    let contentType = 'image/png';
    if (name.endsWith('.svg')) {
      contentType = 'image/svg+xml';
    } else if (name.endsWith('.jpg') || name.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    }

    // Tentar diferentes caminhos possíveis no Vercel
    const possiblePaths = [
      path.join(process.cwd(), 'public', name),
      path.join(process.cwd(), '..', 'public', name),
      path.join('/var/task', 'public', name),
      path.join(__dirname, '..', 'public', name)
    ];

    let imageBuffer = null;
    let foundPath = null;

    for (const imagePath of possiblePaths) {
      try {
        if (fs.existsSync(imagePath)) {
          console.log('✅ Found image at:', imagePath);
          imageBuffer = fs.readFileSync(imagePath);
          foundPath = imagePath;
          break;
        }
      } catch (err) {
        console.log('❌ Failed to read from:', imagePath);
      }
    }

    if (!imageBuffer) {
      console.error('❌ Image not found in any path');
      console.log('Tried paths:', possiblePaths);
      return res.status(404).json({ 
        error: 'Image not found',
        tried: possiblePaths
      });
    }

    console.log('✅ Serving image from:', foundPath);

    // Configurar headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');

    return res.status(200).send(imageBuffer);
  } catch (error) {
    console.error('❌ Error serving image:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
