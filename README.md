# MSLX Manager

MSLX 面板的 Android 客户端应用，用于移动端管理 Minecraft 服务器。

## 简介

MSLX Manager 是 [MSLX 面板](https://github.com/MSLTeam/MSLX) 的移动端应用，提供便捷的 Minecraft 服务器管理体验。

## 功能特性

- **多服务器管理** - 添加、编辑、删除多个服务器连接
- **服务器实例管理** - 创建、启动、停止 Minecraft 服务端实例
- **实时控制台** - 实时查看日志并发送命令
- **Frp 隧道管理** - 管理内网穿透隧道
- **用户权限管理** - 管理面板用户和权限
- **文件管理系统** - 在线浏览和编辑服务器文件
- **备份管理** - 创建和恢复服务器备份
- **定时任务调度** - 自动化管理任务
- **玩家管理** - 查看在线玩家和管理白名单
- **地图可视化** - 查看服务器世界地图

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **移动框架**: Ionic Framework
- **状态管理**: Pinia
- **构建工具**: Vite
- **原生封装**: Capacitor
- **实时通信**: SignalR

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建 Web 应用
npm run build

# 添加 Android 平台
npx cap add android

# 同步到 Android
npx cap sync android

# 打开 Android Studio
npx cap open android
```

## APK 构建

```bash
# 一键构建 APK
npm run android

# 或手动构建
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

构建完成的 APK 文件位于 `android/app/build/outputs/apk/debug/app-debug.apk`

## 相关链接

- **MSLX 面板**: https://github.com/MSLTeam/MSLX
- **Android 客户端**: https://github.com/LingMowen/mslx-manager-app
- **作者 GitHub**: https://github.com/LingMowen
- **作者哔哩哔哩**: https://b23.tv/1yabrrp

## 许可证

本项目基于 GNU Affero General Public License v3.0 (AGPL-3.0) 许可证开源。

详细信息请参阅 [LICENSE](LICENSE) 文件。

**重要提示**：使用本项目即表示您同意以下条款：
- 如果您通过网络（如 SaaS）使用本项目，必须开源您的修改版本
- 修改后的版本必须同样使用 AGPL-3.0 许可证开源
