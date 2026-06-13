# LifeOS 前端路由设计

## 路由结构

```
/                          → 今日视图（默认首页）
/inbox                     → 收件箱（所有未分类任务）
/today                     → 今日任务
/calendar                  → 日历视图
/calendar/:view            → 日历视图（day/week/month）
/study                     → 学习计划列表
/study/:id                 → 学习计划详情
/pomodoro                  → 番茄钟
/notes                     → 备忘录列表
/notes/:id                 → 备忘录编辑
/tasks                     → 任务管理
/tasks/:view               → 任务视图（list/board）
/project/:id               → 项目/标签筛选
/tags                      → 标签管理
/archive                   → 归档
/settings                  → 设置
/settings/:section         → 设置子页面
/search                    → 全局搜索（模态框）
```

## 路由配置

```typescript
// src/router/routes.ts
import { lazy } from 'react';

const routes = [
  {
    path: '/',
    component: lazy(() => import('@/pages/Dashboard')),
    meta: { title: '今日', icon: 'today' }
  },
  {
    path: '/inbox',
    component: lazy(() => import('@/pages/Inbox')),
    meta: { title: '收件箱', icon: 'inbox' }
  },
  {
    path: '/today',
    component: lazy(() => import('@/pages/Today')),
    meta: { title: '今日', icon: 'sun' }
  },
  {
    path: '/calendar',
    component: lazy(() => import('@/pages/Calendar')),
    children: [
      { path: '', redirect: '/calendar/week' },
      { path: ':view', component: lazy(() => import('@/pages/Calendar/View')) }
    ],
    meta: { title: '日历', icon: 'calendar' }
  },
  {
    path: '/study',
    component: lazy(() => import('@/pages/Study')),
    meta: { title: '学习', icon: 'book' }
  },
  {
    path: '/study/:id',
    component: lazy(() => import('@/pages/Study/Detail')),
    meta: { title: '学习计划详情', hidden: true }
  },
  {
    path: '/pomodoro',
    component: lazy(() => import('@/pages/Pomodoro')),
    meta: { title: '番茄钟', icon: 'timer' }
  },
  {
    path: '/notes',
    component: lazy(() => import('@/pages/Notes')),
    meta: { title: '备忘', icon: 'note' }
  },
  {
    path: '/notes/:id',
    component: lazy(() => import('@/pages/Notes/Editor')),
    meta: { title: '备忘编辑', hidden: true }
  },
  {
    path: '/tasks',
    component: lazy(() => import('@/pages/Tasks')),
    meta: { title: '任务', icon: 'task' }
  },
  {
    path: '/project/:id',
    component: lazy(() => import('@/pages/Project')),
    meta: { title: '项目', hidden: true }
  },
  {
    path: '/archive',
    component: lazy(() => import('@/pages/Archive')),
    meta: { title: '归档', icon: 'archive' }
  },
  {
    path: '/settings',
    component: lazy(() => import('@/pages/Settings')),
    meta: { title: '设置', icon: 'settings' }
  }
];
```

## 侧边栏导航映射

```typescript
// src/components/Sidebar/navigation.ts
export const navigation = [
  { label: '收件箱', path: '/inbox', icon: 'inbox', shortcut: 'G I' },
  { label: '今日', path: '/today', icon: 'sun', shortcut: 'G D' },
  { label: '日历', path: '/calendar', icon: 'calendar', shortcut: 'G C' },
  { label: '学习', path: '/study', icon: 'book', shortcut: 'G S' },
  { label: '备忘', path: '/notes', icon: 'note', shortcut: 'G N' },
  { divider: true },
  { label: '任务', path: '/tasks', icon: 'task', shortcut: 'G T' },
  { label: '归档', path: '/archive', icon: 'archive', shortcut: 'G A' },
  { divider: true },
  { label: '设置', path: '/settings', icon: 'settings', shortcut: 'G ,' }
];
```

## 全局快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/⌘ + K` | 打开命令面板 |
| `N` | 新建任务 |
| `G then I` | 前往收件箱 |
| `G then D` | 前往今日 |
| `G then C` | 前往日历 |
| `G then S` | 前往学习 |
| `G then T` | 前往任务 |
| `Space` | 开始/暂停番茄钟 |
| `Esc` | 关闭模态框 |

## 页面组件映射

```
src/pages/
├── Dashboard/          → / (今日视图)
│   ├── index.tsx
│   ├── TaskSummary.tsx
│   └── QuickAdd.tsx
├── Inbox/              → /inbox
├── Today/              → /today
├── Calendar/           → /calendar
│   ├── index.tsx
│   ├── DayView.tsx
│   ├── WeekView.tsx
│   └── MonthView.tsx
├── Study/              → /study
│   ├── index.tsx
│   └── Detail.tsx
├── Pomodoro/           → /pomodoro
│   ├── index.tsx
│   └── Timer.tsx
├── Notes/              → /notes
│   ├── index.tsx
│   └── Editor.tsx
├── Tasks/              → /tasks
│   ├── index.tsx
│   ├── ListView.tsx
│   └── BoardView.tsx
├── Project/            → /project/:id
├── Archive/            → /archive
└── Settings/           → /settings
    ├── index.tsx
    ├── General.tsx
    ├── Shortcuts.tsx
    └── Data.tsx
```
