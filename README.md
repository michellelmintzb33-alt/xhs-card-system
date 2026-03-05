# 小红书内容卡片 · 配色模板系统

> Vibe Marketing OS 的视觉素材自动生成模块

## 概述

7 种风格模板 × 自定义配色系统，用于小红书长图文内容的自动化生产。

## 模板清单

| # | 风格 | 适用场景 |
|---|------|---------|
| 1 | 杂志编辑风 | 方法论、高级感内容 |
| 2 | 暗黑科技风 | 数据拆解、分析类 |
| 3 | New York 杂志风 | 观点鲜明的方法论 |
| 4 | 数据叙事风 | ROI 对比、数据驱动 |
| 5 | NY + SVG 插画 | 图文并茂的案例 |
| 6 | Data + 环形图 | 完成度、占比分析 |
| 7 | 暗色图文叠加 | 产品案例、截图类 |

## 配色系统

三色分离架构：

- **背景 (BG)** → 卡片底色
- **强调 (Accent)** → 标题重点、kicker、引号、下划线
- **辅助 (Secondary)** → 数据数字、进度条、环形图、标签、底栏

### Agent 调用参数

```json
{
  "template": "ny_editorial",
  "theme": {
    "bg": "#0e0e0e",
    "accent": "#e03131",
    "secondary": "#ff6b35"
  },
  "content": {
    "kicker": "出海案例",
    "headline": "上了亚马逊\n却隐身了",
    "deck": "产品搞定了...",
    "quote": "你只要懂三件事...",
    "author": "Derek"
  }
}
```

## 项目结构

```
xhs-card-system/
├── playground.html      # 交互式配色 playground（浏览器打开）
├── templates/           # 7 个独立 HTML 模板（TODO）
├── render.js            # Puppeteer 渲染脚本（TODO）
├── theme-engine.js      # 配色派生引擎（TODO）
└── README.md
```

## 下一步

- [ ] 拆分 7 个模板为独立文件
- [ ] 封装 theme-engine.js（颜色派生逻辑）
- [ ] 封装 render.js（Puppeteer 截图）
- [ ] 对接现有 Agent 工作流
