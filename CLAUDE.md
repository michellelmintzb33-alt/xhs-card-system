# XHS Card System

## 项目定位

小红书内容卡片自动生成系统，用于快速生产高质量长图文素材。

核心能力：
- 7 种风格模板（杂志风、科技风、数据叙事等）
- 三色配色系统（背景/强调/辅助）
- 浏览器内实时预览 + PNG 导出
- 支持多平台尺寸切换（小红书/抖音/微信）

---

## 技术栈

### 前端
- **纯 HTML/CSS/JS** — 无构建工具，直接浏览器运行
- **html-to-image** (ESM) — 卡片导出为 PNG
- **Google Fonts** — Noto Sans/Serif SC, Playfair Display, Space Mono 等

### 样式系统
- **CSS Variables** — 动态配色注入
- **SVG Filters** — 噪点纹理 (fx-noise)、荧光笔效果 (fx-marker)
- **Flexbox/Grid** — 响应式布局

### 未来计划
- Puppeteer 无头渲染（批量生成）
- 配色引擎独立封装
- Agent 工作流对接

---

## 文件结构

```
xhs-card-system/
├── playground.html              # 主交互界面（配色实验室）
├── gallery.html                 # 模板画廊展示
├── preview-*.html               # 各种预览测试页面
│
├── js/
│   ├── templates.js             # 7 个模板的 HTML 生成逻辑
│   ├── presets.js               # 预设配色方案
│   └── export.js                # PNG 导出 + 尺寸缩放
│
├── styles/
│   └── main.css                 # 全局样式 + 卡片基础样式
│
└── README.md                    # 项目说明
```

---

## 核心概念

### 三色配色系统

所有模板共用同一套颜色变量：

| 变量 | 用途 | 示例 |
|------|------|------|
| `--bg` | 卡片背景 | `#0e0e0e` |
| `--accent` | 主强调色（标题、引号、下划线） | `#e03131` |
| `--sec` | 辅助色（数据、标签、进度条） | `#ff6b35` |
| `--fg` | 正文颜色（自动推导） | `#f0f0f0` |
| `--muted` | 次要文字（自动推导） | `rgba(255,255,255,0.6)` |

### 模板清单

| ID | 风格 | 适用场景 |
|----|------|---------|
| `editorial` | 杂志编辑风 | 方法论、高级感内容 |
| `dark_tech` | 暗黑科技风 | 数据拆解、分析类 |
| `ny_editorial` | New York 杂志风 | 观点鲜明的方法论 |
| `data_story` | 数据叙事风 | ROI 对比、数据驱动 |
| `ny_svg` | NY + SVG 插画 | 图文并茂的案例 |
| `data_ring` | Data + 环形图 | 完成度、占比分析 |
| `dark_overlay` | 暗色图文叠加 | 产品案例、截图类 |

### 尺寸规格

| 平台 | 尺寸 | 比例 |
|------|------|------|
| 小红书 | 1242×1660 | 3:4 |
| 抖音 | 1080×1920 | 9:16 |
| 微信 | 1080×1260 | 6:7 |

---

## 使用方式

### 本地开发
```bash
# 直接用浏览器打开
open playground.html
```

### 导出卡片
1. 在 playground 中调整配色和内容
2. 点击卡片上的「导出 PNG」按钮
3. 自动下载 1242×1660 高清图片

---

## 开发规范

### 代码风格
- 极简压缩风格（单字母变量名用于工具函数）
- 颜色工具函数：`h2r` (hex→rgb), `r2h` (rgb→hex), `lum` (亮度), `mix` (混合)
- 所有模板生成函数返回 HTML 字符串

### 配色推导逻辑
```javascript
// 根据背景亮度自动推导文字颜色
const dk = lum(bg) < 0.45  // 是否为深色背景
const fg = dk ? '#f0f0f0' : '#111111'
const muted = dk ? mix(bg, '#ffffff', 0.3) : mix(bg, '#000000', 0.38)
```

### 新增模板
1. 在 `js/templates.js` 中添加生成函数
2. 函数签名：`function tmpl_xxx(d) { return html }`
3. 使用 `d.kicker`, `d.headline`, `d.deck` 等字段
4. 在 `playground.html` 的模板选择器中注册

---

## 已知问题

- [ ] 标签文字过长时会截断（已修复部分）
- [ ] 探索模式的配色随机性需要优化
- [ ] 部分模板的元素定位在不同尺寸下需要调整

---

## 下一步计划

- [ ] 拆分 7 个模板为独立 HTML 文件
- [ ] 封装 `theme-engine.js`（配色派生逻辑）
- [ ] 封装 `render.js`（Puppeteer 批量渲染）
- [ ] 对接 Agent 工作流（API 调用接口）
