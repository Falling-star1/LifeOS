# LifeOS

LifeOS 是一个基于 **Tauri + React + TypeScript** 的本地优先个人效率应用。  
它把任务管理、日历、学习计划、番茄钟、备忘录、标签、项目、全局搜索整合到一个桌面应用中。

## 功能概览

- 任务管理：状态切换、子任务、任务详情
- 日历：日视图 / 周视图 / 月视图
- 学习计划：进度追踪
- 番茄钟：计时与会话记录
- 备忘录：置顶与编辑
- 标签与项目管理
- 全局搜索
- 命令面板（快捷操作）
- 主题切换与背景自定义
- 本地 SQLite 存储（通过 Tauri 后端）

## 技术栈

**前端**
- React 18
- TypeScript
- React Router
- Zustand
- Tailwind CSS

**后端（桌面运行时）**
- Tauri 2
- Rust
- rusqlite（SQLite）

## 项目结构

```text
LifeOS/
├─ src/                     # 前端应用（React + TS）
│  ├─ components/
│  ├─ pages/
│  ├─ hooks/
│  ├─ stores/
│  ├─ services/
│  ├─ types/
│  └─ styles/
├─ src-tauri/               # Tauri 桌面后端（Rust）
│  ├─ src/
│  │  ├─ commands/
│  │  ├─ db/
│  │  │  └─ queries/
│  │  └─ models/
│  ├─ tauri.conf.json
│  └─ Cargo.toml
├─ docs/                    # 项目文档
└─ test-screenshots/        # 当前 UI 截图
```

## 快速开始

### 环境要求

- Node.js 18+
- npm
- Rust 工具链
- 已安装当前系统对应的 Tauri CLI 依赖

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm run dev
```

### 构建前端

```bash
npm run build
```

### 启动 Tauri 桌面应用

```bash
npm run tauri dev
```

## 常用脚本

- `npm run dev`：启动 Vite 开发服务
- `npm run build`：类型检查并构建前端
- `npm run preview`：预览构建产物
- `npm run tauri`：Tauri CLI
- `npm run test`：运行测试

## 当前状态

本项目目前处于 **早期原型 / Alpha 阶段**。  
核心功能已基本实现，但仍需要补充：

- 更完善的自动化测试
- 更完整的文档与使用说明
- 打包发布流程优化
- UI 细节与异常处理优化

## 许可证

待定
