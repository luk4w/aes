# aes

Browser-based text encryption with AES-256-GCM. Everything runs locally through the Web Crypto API: no text or password leaves the page.

Try it at https://luk4w.github.io/aes/

## Usage

Type the text and a password, then click `encrypt`. To decrypt, paste the Base64 output, enter the same password and click `decrypt`.

Shortcuts: `Ctrl+Enter` encrypts, `Shift+Enter` decrypts.

## How it works

- **Key derivation:** PBKDF2 (HMAC-SHA-256, 100,000 iterations) with a random 16-byte salt.
- **Encryption:** AES-GCM with a 256-bit key and a random 12-byte IV.
- **Output:** Base64 of `salt (16 bytes) | IV (12 bytes) | ciphertext + auth tag`.

A wrong password or tampered data fails the GCM authentication check.

## Run locally

The Web Crypto API requires a secure context (HTTPS or `localhost`):

```
python -m http.server 8000
```

## Notes

Study project, not audited. Security depends on password strength.
