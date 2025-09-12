# 项目信息总览

## 📋 基本信息

- **项目名称**: Himile CLI
- **GitHub 仓库**: [https://github.com/chaoxi72/gemini-cli.git](https://github.com/chaoxi72/gemini-cli.git)
- **用户名**: chaoxi72
- **npm 包名**: himile-cli
- **命令名**: `himile`
- **版本**: 1.0.0

## 🏗️ 项目结构

```
himile-cli/
├── packages/
│   ├── cli/                    # 主 CLI 包
│   │   ├── package.json        # 包名: himile-cli-core
│   │   └── bin: himile        # 命令名
│   ├── core/                   # 核心库
│   │   └── package.json        # 包名: himile-cli-core-lib
│   └── ...
├── package.json               # 主包: himile-cli
├── publish.js                 # 发布脚本
├── README-CUSTOM.md          # 使用文档
└── quick-start.md            # 快速入门
```

## 📦 包配置

### 主包 (package.json)
- **名称**: `himile-cli`
- **命令**: `himile`
- **入口**: `bundle/gemini.js`

### CLI 子包 (packages/cli/package.json)
- **名称**: `himile-cli-core`
- **命令**: `himile`
- **入口**: `dist/index.js`

### Core 子包 (packages/core/package.json)
- **名称**: `himile-cli-core-lib`

## 🚀 安装和使用

### 从源码安装
```bash
git clone https://github.com/chaoxi72/gemini-cli.git
cd gemini-cli
npm run publish:prepare
npm run publish:local
npm install -g ./himile-cli-1.0.0.tgz
```

### 使用命令
```bash
himile --help
himile --version
himile "你好，世界！"
```

## 🔧 环境变量

```bash
# 绕过认证模式
BYPASS_AUTH=true
USE_CUSTOM_LLM=true

# 自定义 LLM 配置
CUSTOM_LLM_ENDPOINT=http://localhost:11434/v1
CUSTOM_LLM_MODEL_NAME=llama2
CUSTOM_LLM_API_KEY=your-api-key

# 或使用 Gemini API
GEMINI_API_KEY=your-gemini-api-key
```

## 📝 与官方版本的区别

| 项目 | 官方版本 | Himile CLI |
|------|----------|------------|
| 包名 | `@google/gemini-cli` | `himile-cli` |
| 命令名 | `gemini` | `himile` |
| 仓库 | google-gemini/gemini-cli | chaoxi72/gemini-cli |
| 特性 | 标准功能 | + 自定义 LLM 支持<br>+ 绕过认证模式<br>+ 增强错误处理 |

## 🛠️ 开发命令

```bash
# 构建
npm run build

# 测试
npm test

# 发布准备
npm run publish:prepare

# 本地打包
npm run publish:local

# 发布到 npm
npm run publish:npm
```

## 🔗 相关文件

- `README-CUSTOM.md` - 详细使用说明
- `quick-start.md` - 快速入门指南
- `publish.js` - 发布脚本
- `.npmignore` - npm 发布忽略文件

---

**注意**: 确保命令名使用 `himile` 而不是 `gemini`，以避免与官方版本冲突。
