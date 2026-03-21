# TODOS

## Maker 产品化（v1 Blocker）

### [P0] 模板精选 + 示例内容设计
- **What:** 从 33 个模板中精选 3-5 个"保底好看"的模板用于 maker，并为每个模板设计示例内容
- **Why:** CEO design 标注为 v1 blocker。设计评审确认「示例卡片」是首次访问体验的核心——用户打开 maker 第一眼看到的精美示例卡片决定了他们对产品的第一印象
- **Where:** 需要在 playground 中逐个测试模板效果
- **How:** 打开 playground，对每个模板测试多种内容+多种配色组合，筛选标准：「无论填什么内容+什么配色，出来的效果都不会丑」
- **Depends on:** 无，但必须在 maker 实现前完成

## 安全

### [P0] 修复 XSS 漏洞 — importSeries + renderSeriesList
- **What:** 对系列导入数据做校验 + 所有 innerHTML 插入点用 escH() 转义
- **Why:** OWASP XSS 漏洞，用户导入恶意 JSON 可执行任意脚本
- **Where:** presets.js renderSeriesList(), loadSeries(), importSeries()
- **How:** escH() 已存在于 templates.js:268，在所有 `${s.name}` 等用户数据插值外加 escH()
- **Depends on:** 无

## DRY / 代码质量

### [P1] 合并 GROUP_A 和 TEXT_CARDS 重复数组
- **What:** 将 GROUP_A 和 TEXT_CARDS 合并为单一数据源
- **Why:** DRY 违规，两个几乎一样的数组导致 c29-c33 的 ghost 系统失效
- **Where:** templates.js:361 (GROUP_A), templates.js:397 (TEXT_CARDS)
- **How:** 在 CONTENT_MAP 中加 `type: 'text'|'data'` 字段，从中派生两个列表
- **Depends on:** 无

### [P1] 重构风格变换函数，消除与 derive() 的重复
- **What:** 风格变换函数只返回修改后的 bg/accent/sec，由统一层调用 derive()
- **Why:** 5 个变换函数重复了 derive() 中 accentA/secA/fg/muted/border/grid 的计算
- **Where:** templates.js:79-152 STYLE_TRANSFORMS
- **How:** 每个变换只返回 {bg, accent, sec}，transformForStyle() 调用 derive() 生成完整变量
- **Depends on:** 无

## 导出系统

### [P1] 导出系统改用 data-attribute 匹配替代索引对齐
- **What:** scaleForExport/resolveVarsForExport 改用 data-export-role 属性匹配
- **Why:** 装饰贴纸等动态 DOM 元素会破坏索引对齐，导致导出 PNG 样式错乱
- **Where:** export.js:24-73 scaleForExport, export.js:78-108 resolveVarsForExport
- **How:** 给模板元素加 data-export-role 属性，匹配时用属性而非数组索引
- **Depends on:** 无

## 文档

### [P2] 更新 CLAUDE.md 映射实际代码库状态
- **What:** 更新模板清单（7→33），添加探索模式、系列系统、背景图融合等功能说明
- **Why:** 文档严重过时，新进入者（包括 AI）会被误导
- **Where:** CLAUDE.md
- **Depends on:** 无

## 架构（未来重构方向）

### [P3] playground.html 单体拆分
- 拆出 explore.js、canvas.js、image-blend.js、interactions.js、platform.js
- 当前 1747 行，目标每文件 200-400 行

### [P3] 全局变量封装为 AppState
- 20+ 全局可变变量收进单一状态对象

### [P3] inline onclick 迁移为 addEventListener
- ~50 个内联事件处理器需要统一迁移

### [P3] 业务函数重命名
- gS→getColor, sS→setColor, hT→handleHexInput, nP→onPickerChange, tL→toggleLock 等
