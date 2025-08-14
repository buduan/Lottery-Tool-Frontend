# 🎯 Lottery Tool 2

[![Vue](https://img.shields.io/badge/Vue-3.x-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-latest-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[English](README.md) | [中文](README-cn.md)

A modern, user-friendly lottery management system that helps event organizers easily create and manage lottery activities. The system is designed to be intuitive and straightforward, suitable for various online and offline event scenarios.

## ✨ Features

Supports two flexible lottery modes:
1. **Mode 1 (Offline Redemption)**: Distribute lottery codes -> Users redeem prizes by entering codes on the administrator's device -> Receive prizes on-site
2. **Mode 2 (Online Redemption)**: Distribute lottery codes -> Users redeem prizes by themselves through a link provided by the event organizer -> Get redemption vouchers

## 🚀 Tech Stack

### Frontend
- **Vue 3** - With Composition API for reactive and composable component logic
- **TypeScript** - For enhanced code maintainability and developer experience
- **Vite** - Lightning fast frontend build tool
- **Vue Router** - Official router for single-page application navigation
- **Pinia** - Intuitive, type-safe state management solution
- **i18n**(developing) - Comprehensive internationalization support
- **Shadcn UI** - Beautiful UI component library for modern visual experience

### Backend
The backend repository is available at: [Lottery-Tool-Backend](https://github.com/buduan/Lottery-Tool-Backend)

## 📚 API Documentation

Detailed API documentation is available at: [api-doc.lottery.ibuduan.com](http://api-doc.lottery.ibuduan.com)

## 📷 Screenshots

![Lottery Management Interface](https://via.placeholder.com/800x450.png?text=Lottery+Management+Interface)
![User Redemption Page](https://via.placeholder.com/800x450.png?text=User+Redemption+Page)

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 🔧 Configuration

Project configuration files are located in the `src/config` directory. You can adjust the following settings as needed:

- API endpoints
- Theme settings
- Internationalization options
- Other system parameters

## 👥 Contribution

We welcome all forms of contributions!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

LLMs.txt is provided in the documentation. Everyone is welcome to join Vibe Coding!

## 📄 License

This project is licensed under the [MIT](LICENSE) License - see the LICENSE file for details
