# GM Authentication

GM Authentication is a modern authentication system that supports **passkeys**, **password login**, and **two-factor authentication (2FA)**. It’s built with a strong understanding of the WebAuthn standard and provides a clean, working prototype for multi-method authentication.

**Live Demo:** [gm-authentication.netlify.app](https://gm-authentication.netlify.app)

---

## Features

- 🔐 **Passkey login** using WebAuthn (via `@simplewebauthn`)
- 🔑 **Password-based login** with bcrypt
- ✅ **Two-Factor Authentication** using QR codes and TOTP
- ➕ Support for **adding passkeys** after account creation
- 🧠 Deep understanding of the WebAuthn registration and authentication flows

> ⚠️ **Note**: The project is frontend-only and lacks a real backend server, which limits the overall security. For production use, a full backend implementation with HTTPS, secure cookie handling, and server-side validation is essential.

---

## 📦 Dependencies

| Package | Description |
|--------|-------------|
| [`@simplewebauthn/browser`](https://www.npmjs.com/package/@simplewebauthn/browser) | Handles WebAuthn logic on the client side (can be replaced easily) |
| [`@simplewebauthn/server`](https://www.npmjs.com/package/@simplewebauthn/server) | Validates WebAuthn requests server-side (supports multiple algorithms; more complex) |
| [`bcryptjs`](https://www.npmjs.com/package/bcryptjs) | Lightweight password hashing for secure credential storage |
| [`qrcode`](https://www.npmjs.com/package/qrcode) | Generates QR codes for 2FA setup |
| [`vite`](https://www.npmjs.com/package/vite) | Fast and simple dev/build tool for modern frontend apps |

---

## Folder Structure
```
  ├── public/           # Images
  ├── src/              # Source code (JS & CSS)
  │   ├── helpers/
  │   ├── methods/
  │   ├── main.js
  │   └── style.css
  ├── index.html        
  ├── package.json      # Neessary depenencies        
  └── README.md         # This file
```


## 📚 Resources That Helped Us

We relied on these resources (and many more) to understand and implement passkeys:

- [SimpleWebAuthn GitHub Repository](https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/)
- [Passkeys Guide](https://www.passkeys.com/guide#running-application)
- [WebAuthn Guide](https://webauthn.guide/)
- [web.dev: Passkey Registration](https://web.dev/articles/passkey-registration)

---

## 👥 Authors

| Name               | GitHub / Contact            |
|--------------------|-----------------------------|
| Gabriel Stegmaier  | https://github.com/Marc-hei |
| Marc Heinimann     | https://github.com/gstegm   |

---

