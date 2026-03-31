# 🎮 MSLX Manager

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.1.6.5-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/License-AGPL--3.0-green?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/Platform-Android-brightgreen?style=flat-square" alt="Platform">
  <img src="https://img.shields.io/badge/Vue-3.4+-42b883?style=flat-square" alt="Vue">
</p>

<p align="center">
  <a href="https://github.com/MSLTeam/MSLX">📦 MSLX 面板</a> •
  <a href="https://github.com/LingMowen/mslx-manager-app">📱 Android 客户端</a> •
  <a href="https://b23.tv/1yabrrp">🎬 哔哩哔哩</a>
</p>

---

## 📖 项目简介

**MSLX Manager** 是 [MSLX 面板服务端](https://github.com/MSLTeam/MSLX) 的官方 Android 客户端应用，专为 Minecraft 服务器管理员设计的移动端管理工具。

使用 MSLX Manager，您可以随时随地通过手机管理您的 Minecraft 服务器，无需打开电脑即可完成服务器的日常运维工作。

### 🔗 相关项目

| 项目 | 描述 | 链接 |
|------|------|------|
| MSLX 面板服务端 | Minecraft 服务器管理面板后端 | [GitHub](https://github.com/MSLTeam/MSLX) |
| MSLX Manager | Android 客户端（当前项目） | [GitHub](https://github.com/LingMowen/mslx-manager-app) |

---

## ✨ 功能特性

### 📊 服务器管理
| 功能 | 描述 |
|------|------|
| 🔗 **多服务器支持** | 同时管理多个 Minecraft 服务器实例 |
| ➕ **快速连接** | 一键添加和配置服务器连接 |
| 🔄 **连接管理** | 轻松切换不同服务器 |

### 🎮 实例控制
| 功能 | 描述 |
|------|------|
| 🚀 **实例启停** | 一键启动、停止、重启服务器实例 |
| 📝 **实时控制台** | SignalR 实时推送，零延迟查看日志 |
| ⌨️ **命令发送** | 直接在手机上发送控制台命令 |
| 📜 **历史日志** | 查看最近 100 条历史日志记录 |

### 🌐 网络管理
| 功能 | 描述 |
|------|------|
| 🕳️ **Frp 隧道** | 图形化管理内网穿透隧道 |
| 🔌 **隧道控制** | 启动/停止 Frp 隧道服务 |
| 📡 **实时日志** | 查看 Frp 隧道运行日志 |

### 👥 用户权限
| 功能 | 描述 |
|------|------|
| 👤 **用户管理** | 添加、编辑、删除面板用户 |
| 🔐 **权限控制** | 管理用户角色和权限 |
| 🛡️ **安全管理** | 安全的认证机制 |

### 📁 文件管理
| 功能 | 描述 |
|------|------|
| 📂 **文件浏览** | 类似浏览器的文件管理器 |
| ✏️ **在线编辑** | 直接编辑服务器配置文件 |
| 📤 **上传下载** | 上传和下载服务器文件 |
| 📁 **压缩解压** | 支持文件和文件夹的压缩解压 |

### 💾 备份管理
| 功能 | 描述 |
|------|------|
| 💿 **创建备份** | 一键创建服务器存档备份 |
| 🔄 **恢复备份** | 快速恢复到指定备份点 |
| 🗑️ **删除备份** | 管理备份文件释放空间 |

### ⏰ 定时任务
| 功能 | 描述 |
|------|------|
| ⏱️ **任务调度** | 创建和管理定时任务 |
| 🔄 **自动执行** | 自动执行预设的管理任务 |
| 📋 **任务列表** | 统一管理所有定时任务 |

### 🎯 玩家管理
| 功能 | 描述 |
|------|------|
| 👥 **在线玩家** | 实时查看当前在线玩家 |
| 📋 **玩家列表** | 查看历史登录玩家记录 |
| 🚫 **白名单** | 管理服务器白名单 |
| 🔨 **封禁管理** | 管理封禁玩家和 IP |

### 🗺️ 世界地图
| 功能 | 描述 |
|------|------|
| 🗺️ **地图浏览** | 查看 Minecraft 世界地图 |
| 📍 **位置导航** | 快速定位出生点坐标 |

---

## 🛠️ 技术架构

```
┌─────────────────────────────────────────────────────┐
│                    MSLX Manager                      │
│                   (Android App)                       │
├─────────────────────────────────────────────────────┤
│  UI Layer         │  Ionic Vue Components            │
├─────────────────────────────────────────────────────┤
│  State Layer      │  Pinia Store                    │
├─────────────────────────────────────────────────────┤
│  Network Layer    │  Axios + SignalR                │
├─────────────────────────────────────────────────────┤
│  Native Layer     │  Capacitor Bridge               │
├─────────────────────────────────────────────────────┤
│                   REST API / WebSocket              │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                   MSLX Panel Server                  │
│                (Java Spring Boot)                    │
└─────────────────────────────────────────────────────┘
```

### 📦 核心技术栈

| 分类 | 技术 | 版本 | 说明 |
|------|------|------|------|
| ⚡ 前端框架 | Vue.js | 3.4+ | 渐进式 JavaScript 框架 |
| 🔷 类型系统 | TypeScript | 5.x | JavaScript 超集，提供类型检查 |
| 📱 移动框架 | Ionic | 8.x | 强大的跨平台移动 UI 框架 |
| ⚡ 构建工具 | Vite | 5.x | 下一代前端构建工具 |
| 📦 状态管理 | Pinia | 2.x | Vue 官方推荐的状态管理库 |
| 🔌 实时通信 | SignalR | - | ASP.NET Core 实时通信库 |
| 📲 原生封装 | Capacitor | 6.x | 将 Web 应用转换为原生 App |

---

## 🚀 快速开始

### 📋 环境要求

| 环境 | 要求 |
|------|------|
| Node.js | >= 18.0.0 |
| npm | >= 9.0.0 |
| JDK | >= 17 (用于 Android 构建) |
| Android SDK | 最新版本 |
| Android Studio | 可选，用于高级调试 |

### 📥 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/LingMowen/mslx-manager-app.git
cd mslx-manager-app

# 2. 安装依赖
npm install

# 3. 开发模式运行
npm run dev

# 4. 添加 Android 平台
npx cap add android

# 5. 同步到 Android
npx cap sync android

# 6. 在 Android Studio 中打开
npx cap open android
```

### 📱 构建 APK

```bash
# 方式一：使用 npm 脚本（推荐）
npm run android

# 方式二：手动构建
npm run build              # 构建 Web 应用
npx cap sync android       # 同步到 Android
cd android && ./gradlew assembleDebug    # 编译 APK

# 输出位置
android/app/build/outputs/apk/debug/app-debug.apk
```

### ⚙️ 配置说明

在 `capacitor.config.json` 中配置 Android 相关设置：

```json
{
  "appId": "com.mslx.manager",
  "appName": "MSLX Manager",
  "android": {
    "allowMixedContent": true,
    "webContentsDebuggingEnabled": false
  }
}
```

---

## 📱 应用截图

> 暂无截图（欢迎提交 PR 添加）

---

## 🎯 使用流程

```
┌─────────────┐
│  安装 APK   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 添加服务器   │ ──► 输入面板地址和 API Key
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  连接面板   │ ──► 验证连接成功
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 开始管理！  │ ──► 享受便捷的移动管理体验
└─────────────┘
```

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 🐛 Bug 反馈

请通过 [GitHub Issues](https://github.com/LingMowen/mslx-manager-app/issues) 反馈 Bug，包含以下信息：
- 清晰的 Bug 描述
- 复现步骤
- 预期行为 vs 实际行为
- 环境信息（Android 版本、App 版本等）

### 💡 功能建议

欢迎提交功能建议，我们会在评估后考虑实现。

---

## 📄 开源许可证

本项目基于 **GNU Affero General Public License v3.0 (AGPL-3.0)** 开源。

[![AGPL-3.0 License](https://img.shields.io/badge/License-AGPL--3.0-blue.svg?style=flat-square)](https://www.gnu.org/licenses/agpl-3.0.html)

### ⚠️ 重要条款

使用本项目即表示您同意以下条款：

1. 📢 如果您通过网络（如 SaaS）使用本项目，必须开源您的修改版本
2. 🔓 修改后的版本必须同样使用 AGPL-3.0 许可证开源
3. 📜 请在明显位置注明本项目的开源协议

详细许可证条款请参阅 [LICENSE](LICENSE) 文件。

---

## 👨‍💻 作者信息

| 信息 | 内容 |
|------|------|
| 👤 作者 | LingMowen |
| 🐙 GitHub | [https://github.com/LingMowen](https://github.com/LingMowen) |
| 🎬 哔哩哔哩 | [https://b23.tv/1yabrrp](https://b23.tv/1yabrrp) |

---

## 🙏 鸣谢

- [Vue.js](https://vuejs.org/) - 优雅的前端框架
- [Ionic Framework](https://ionicframework.com/) - 强大的移动 UI 框架
- [Capacitor](https://capacitorjs.com/) - 优秀的跨平台解决方案
- [MSLX Team](https://github.com/MSLTeam/MSLX) - 提供优质的面板后端 API

---

<p align="center">
  <sub>Made with ❤️ by LingMowen</sub>
</p>
