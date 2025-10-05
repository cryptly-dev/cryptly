<div align="center" width="100%">
    <img src="https://i.ibb.co/NghM11t8/download.png" alt="Cryptly Logo" width="100"/>
    <h1>Cryptly</h1>
</div>

<div align="center">
    <b>A secure, collaborative secrets management platform with end-to-end encryption</b>
</div>

<div align="center">
    <a href="https://cryptly.dev">cryptly.dev</a>
</div>

## ⭐ Features

- **🔒 End-to-end encryption** - Your secrets are encrypted on the client side, server never sees plaintext
- **👥 Team collaboration** - Share encrypted secrets with team members via secure invitations
- **📝 Version history** - Track all changes to your secrets with full version control
- **🔄 GitHub integration** - Sync secrets directly to your GitHub repositories
- **🎨 Modern UI** - Beautiful, responsive interface built with React
- **🚀 Real-time updates** - See changes instantly with SSE support
- **🔑 Multiple auth ooptions** - Login with Google, GitHub, or local development mode
- **📦 Project organization** - Organize secrets by projects for better management

## 🚀 Quick Start

### Local Development

Get up and running in one command:

```bash
make local
```

This will:

- Install all dependencies (npm + pnpm)
- Set up environment files automatically
- Start MongoDB in Docker (port 2137)
- Launch backend on `http://localhost:3000`
- Launch frontend on `http://localhost:5173`

> **Note:** Local development mode includes simplified authentication - just enter any email to log in!

## 🔐 Security

- All secrets are encrypted client-side using **AES-256-GCM**
- Your keys for encrypting secrets are encrypted client-side using **RSA-OAEP**,
- Private keys never leave the browser
- Server only stores encrypted data
- Per-project encryption keys
- Zero-knowledge architecture

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

<div align="center">
    Made with ❤️ for developers who care about security
</div>
