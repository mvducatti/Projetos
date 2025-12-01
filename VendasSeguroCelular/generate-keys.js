import crypto from 'crypto';
import fs from 'fs';

// Generate RSA key pair (2048 bits)
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Save keys to files
fs.writeFileSync('private.key', privateKey);
fs.writeFileSync('public.key', publicKey);

console.log('✅ Chaves geradas com sucesso!');
console.log('\n📄 Chave Privada (private.key):');
console.log('Copie esta chave para a variável de ambiente PRIVATE_KEY no Vercel\n');

console.log('\n📄 Chave Pública (public.key):');
console.log('Envie esta chave para o WhatsApp Business Manager\n');
console.log(publicKey);
