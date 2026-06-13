# LifeOS 项目目录结构

## 根目录

```
LifeOS/
├── src-tauri/                # Tauri 后端（Rust）
├── src/                      # 前端代码（React + TypeScript）
├── docs/                     # 设计文档
├── public/                   # 静态资源
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## src-tauri/ - Tauri 后端

```
src-tauri/
├── Cargo.toml
├── tauri.conf.json
├── icons/                     # 应用图标
├── src/
│   ├── main.rs                # 入口
│   ├── lib.rs                 # 库入口
│   ├── commands/              # Tauri 命令
│   │   ├── mod.rs
│   │   ├── tasks.rs           # 任务相关命令
│   │   ├── calendar.rs        # 日历相关命令
│   │   ├── study.rs           # 学习计划相关命令
│   │   ├── pomodoro.rs        # 番茄钟相关命令
│   │   ├── notes.rs           # 备忘录相关命令
│   │   ├── tags.rs            # 标签相关命令
│   │   ├── projects.rs        # 项目相关命令
│   │   ├── settings.rs        # 设置相关命令
│   │   ├── search.rs          # 全局搜索
│   │   └── data.rs            # 数据导入导出
│   ├── db/                    # 数据库层
│   │   ├── mod.rs
│   │   ├── connection.rs      # 数据库连接管理
│   │   ├── migrations.rs      # 数据库迁移
│   │   └── queries/           # 查询模块
│   │       ├── mod.rs
│   │       ├── tasks.rs
│   │       ├── calendar.rs
│   │       ├── study.rs
│   │       ├── pomodoro.rs
│   │       ├── notes.rs
│   │       ├── tags.rs
│   │       ├── projects.rs
│   │       └── settings.rs
│   ├── models/                # 数据模型
│   │   ├── mod.rs
│   │   ├── task.rs
│   │   ├── calendar_event.rs
│   │   ├── study_plan.rs
│   │   ├── pomodoro_session.rs
│   │   ├── note.rs
│   │   ├── tag.rs
│   │   ├── project.rs
│   │   └── setting.rs
│   └── utils/                 # 工具函数
│       ├── mod.rs
│       ├── time.rs
│       └── export.rs
├── migrations/                # SQL 迁移文件
│   ├── 001_initial.sql
│   └── ...
└── fixtures/                  # 测试数据
    └── sample.sql
```

## src/ - 前端代码

```
src/
├── main.tsx                   # React 入口
├── App.tsx                    # 根组件
├── router/                    # 路由配置
│   ├── index.tsx
│   └── routes.ts
├── pages/                     # 页面组件
│   ├── Dashboard/
│   │   ├── index.tsx
│   │   ├── TaskSummary.tsx
│   │   ├── QuickAdd.tsx
│   │   └── CalendarMini.tsx
│   ├── Inbox/
│   │   └── index.tsx
│   ├── Today/
│   │   ├── index.tsx
│   │   ├── TaskList.tsx
│   │   └── TimeBlock.tsx
│   ├── Calendar/
│   │   ├── index.tsx
│   │   ├── DayView.tsx
│   │   ├── WeekView.tsx
│   │   ├── MonthView.tsx
│   │   ├── EventCard.tsx
│   │   └── CreateEventModal.tsx
│   ├── Study/
│   │   ├── index.tsx
│   │   ├── StudyCard.tsx
│   │   ├── Detail.tsx
│   │   ├── ProgressChart.tsx
│   │   └── CreateStudyModal.tsx
│   ├── Pomodoro/
│   │   ├── index.tsx
│   │   ├── Timer.tsx
│   │   ├── History.tsx
│   │   └── Settings.tsx
│   ├── Notes/
│   │   ├── index.tsx
│   │   ├── NoteList.tsx
│   │   └── Editor.tsx
│   ├── Tasks/
│   │   ├── index.tsx
│   │   ├── ListView.tsx
│   │   ├── BoardView.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskDetail.tsx
│   │   └── CreateTaskModal.tsx
│   ├── Project/
│   │   └── index.tsx
│   ├── Archive/
│   │   └── index.tsx
│   └── Settings/
│       ├── index.tsx
│       ├── General.tsx
│       ├── Shortcuts.tsx
│       ├── Data.tsx
│       └── About.tsx
├── components/                # 通用组件
│   ├── Layout/
│   │   ├── index.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── StatusBar.tsx
│   │   └── CommandPalette.tsx
│   ├── UI/                    # UI 基础组件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Calendar.tsx
│   │   ├── TimePicker.tsx
│   │   ├── ProgressRing.tsx
│   │   ├── Badge.tsx
│   │   ├── Tooltip.tsx
│   │   └── Toast.tsx
│   ├── Task/
│   │   ├── TaskCard.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskForm.tsx
│   │   └── TaskFilter.tsx
│   └── shared/                # 共享组件
│       ├── EmptyState.tsx
│       ├── LoadingSpinner.tsx
│       └── ErrorBoundary.tsx
├── hooks/                     # 自定义 Hooks
│   ├── useTasks.ts
│   ├── useCalendar.ts
│   ├── useStudy.ts
│   ├── usePomodoro.ts
│   ├── useNotes.ts
│   ├── useSearch.ts
│   ├── useSettings.ts
│   ├── useKeyboard.ts
│   └── useTheme.ts
├── stores/                    # 状态管理
│   ├── index.ts
│   ├── taskStore.ts
│   ├── calendarStore.ts
│   ├── studyStore.ts
│   ├── pomodoroStore.ts
│   ├── noteStore.ts
│   ├── settingsStore.ts
│   └── uiStore.ts
├── services/                  # API 服务
│   ├── index.ts
│   ├── taskService.ts
│   ├── calendarService.ts
│   ├── studyService.ts
│   ├── pomodoroService.ts
│   ├── noteService.ts
│   ├── tagService.ts
│   ├── projectService.ts
│   ├── settingService.ts
│   ├── searchService.ts
│   └── dataService.ts
├── types/                     # TypeScript 类型
│   ├── index.ts
│   ├── task.ts
│   ├── calendar.ts
│   ├── study.ts
│   ├── pomodoro.ts
│   ├── note.ts
│   ├── tag.ts
│   ├── project.ts
│   ├── setting.ts
│   └── common.ts
├── utils/                     # 工具函数
│   ├── date.ts
│   ├── format.ts
│   ├── validation.ts
│   └── constants.ts
├── styles/                    # 样式
│   ├── global.css
│   ├── themes/
│   │   ├── dark.css
│   │   └── light.css
│   └── components/
│       └── calendar.css
└── assets/                    # 静态资源
    ├── icons/
    └── images/
```

## public/ - 静态资源

```
public/
├── favicon.ico
├── manifest.json
└── fonts/
    └── Inter/
```

## 配置文件

```
LifeOS/
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── .env
├── .env.example
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 命名规范

- **文件夹**：kebab-case（`task-list/`）
- **组件文件**：PascalCase（`TaskCard.tsx`）
- **工具/服务文件**：camelCase（`taskService.ts`）
- **类型文件**：camelCase（`task.ts`）
- **样式文件**：camelCase（`global.css`）

## 导入别名

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/stores/*": ["./src/stores/*"],
      "@/services/*": ["./src/services/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  }
}
```
