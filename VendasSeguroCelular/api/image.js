import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
  try {
    const { name } = req.query;
    
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

    // Ler arquivo da pasta public
    const imagePath = join(process.cwd(), 'public', name);
    const imageBuffer = readFileSync(imagePath);

    // Configurar headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');

    return res.status(200).send(imageBuffer);
  } catch (error) {
    console.error('Error serving image:', error);
    return res.status(404).json({ error: 'Image not found' });
  }
}
