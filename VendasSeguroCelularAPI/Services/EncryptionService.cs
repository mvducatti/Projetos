using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using VendasSeguroCelularAPI.Models;

namespace VendasSeguroCelularAPI.Services;

public class EncryptionService
{
    private readonly string _privateKey;

    public EncryptionService(IConfiguration configuration)
    {
        _privateKey = configuration["WhatsApp:PrivateKey"] 
            ?? throw new InvalidOperationException("Private key not configured");
    }

    public DecryptedFlowRequest DecryptRequest(string encryptedFlowData, string encryptedAesKey, string initialVector)
    {
        try
        {
            // Decrypt AES key using RSA private key
            byte[] decryptedAesKey = DecryptAesKey(encryptedAesKey);

            // Decrypt flow data using AES-GCM
            string decryptedJson = DecryptFlowData(encryptedFlowData, decryptedAesKey, initialVector);

            // Deserialize JSON
            var decryptedRequest = JsonSerializer.Deserialize<DecryptedFlowRequest>(decryptedJson)
                ?? throw new InvalidOperationException("Failed to deserialize decrypted request");

            return decryptedRequest;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Decryption failed: {ex.Message}", ex);
        }
    }

    public string EncryptResponse(object response, byte[] aesKey, string initialVector)
    {
        try
        {
            // Serialize response to JSON
            string json = JsonSerializer.Serialize(response);

            // Convert initial vector and flip bits
            byte[] ivBuffer = Convert.FromBase64String(initialVector);
            byte[] flippedIv = new byte[ivBuffer.Length];
            for (int i = 0; i < ivBuffer.Length; i++)
            {
                flippedIv[i] = (byte)~ivBuffer[i];
            }

            // Encrypt using AES-GCM
            using var aesGcm = new AesGcm(aesKey, 16); // 16 bytes = 128 bit tag
            byte[] plaintext = Encoding.UTF8.GetBytes(json);
            byte[] ciphertext = new byte[plaintext.Length];
            byte[] tag = new byte[16];

            aesGcm.Encrypt(flippedIv, plaintext, ciphertext, tag);

            // Combine ciphertext and tag
            byte[] encrypted = new byte[ciphertext.Length + tag.Length];
            Buffer.BlockCopy(ciphertext, 0, encrypted, 0, ciphertext.Length);
            Buffer.BlockCopy(tag, 0, encrypted, ciphertext.Length, tag.Length);

            return Convert.ToBase64String(encrypted);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Encryption failed: {ex.Message}", ex);
        }
    }

    private byte[] DecryptAesKey(string encryptedAesKey)
    {
        using var rsa = RSA.Create();
        rsa.ImportFromPem(_privateKey.ToCharArray());

        byte[] encryptedKeyBytes = Convert.FromBase64String(encryptedAesKey);
        
        return rsa.Decrypt(encryptedKeyBytes, RSAEncryptionPadding.OaepSHA256);
    }

    private string DecryptFlowData(string encryptedFlowData, byte[] aesKey, string initialVector)
    {
        byte[] encryptedBytes = Convert.FromBase64String(encryptedFlowData);
        byte[] ivBuffer = Convert.FromBase64String(initialVector);

        // Split ciphertext and auth tag (last 16 bytes)
        byte[] tag = new byte[16];
        byte[] ciphertext = new byte[encryptedBytes.Length - 16];
        
        Buffer.BlockCopy(encryptedBytes, 0, ciphertext, 0, ciphertext.Length);
        Buffer.BlockCopy(encryptedBytes, ciphertext.Length, tag, 0, 16);

        // Decrypt using AES-GCM
        using var aesGcm = new AesGcm(aesKey, 16);
        byte[] plaintext = new byte[ciphertext.Length];

        aesGcm.Decrypt(ivBuffer, ciphertext, tag, plaintext);

        return Encoding.UTF8.GetString(plaintext);
    }

    public bool ValidateSignature(string body, string signature, string appSecret)
    {
        string expectedSignature = "sha256=" + ComputeHmacSha256(body, appSecret);
        return signature == expectedSignature;
    }

    private static string ComputeHmacSha256(string data, string key)
    {
        byte[] keyBytes = Encoding.UTF8.GetBytes(key);
        byte[] dataBytes = Encoding.UTF8.GetBytes(data);

        using var hmac = new HMACSHA256(keyBytes);
        byte[] hashBytes = hmac.ComputeHash(dataBytes);

        return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
    }
}
