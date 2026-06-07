# VSMD

Markdown 文件的 VS Code 扩展，可将 Markdown 渲染为 HTML 预览。

## 功能特点

- **一键预览** - 点击编辑器标题栏的 Markdown 图标即可切换预览
- **语法高亮** - 代码块使用 highlight.js 高亮显示
- **深色/浅色模式** - 自动跟随 VSCode 主题，也可手动切换
- **主题自定义** - 支持自定义 CSS 主题

## 快速开始

1. 打开一个 Markdown (.md) 文件
2. 点击编辑器标题栏的 Markdown 图标
3. 预览面板将显示渲染后的 HTML

## 主题自定义

自定义主题存放在 `themes/` 目录下。每个主题目录包含：

- `vsmd.json` - 主题元数据（名称、css 文件名、图片文件名、描述）
- `theme.css` - 主题样式文件
- `preview.jpg` 或 `preview.png` - 主题预览图

使用 `.vsmd-content-inner` 选择器来设置 Markdown 内容区域样式：

```css
.vsmd-content-inner h1 {
  font-size: 2rem;
  color: #569cd6;
}
```

## 许可证

MIT
