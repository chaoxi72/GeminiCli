# 🚀 Himile CLI 快速入门指南

## 📦 安装步骤

### 方法1: 从源码构建并安装

1. **克隆项目**
```bash
git clone https://github.com/chaoxi72/gemini-cli.git
cd gemini-cli
```

2. **准备发布包**
   ```bash
   npm run publish:prepare
   ```

3. **生成本地安装包**
   ```bash
   npm run publish:local
   ```

4. **全局安装**
   ```bash
   npm install -g ./himile-cli-1.0.0.tgz
   ```

### 方法2: 直接从 npm 安装（如果已发布）

```bash
npm install -g himile-cli
```

## ⚡ 快速配置

### 使用自定义 LLM

创建 `.env` 文件：

```bash
# 绕过 Google 认证
BYPASS_AUTH=true

# 启用自定义 LLM
USE_CUSTOM_LLM=true

# 配置您的 LLM 端点
CUSTOM_LLM_ENDPOINT=http://localhost:11434/v1  # 例如 Ollama
CUSTOM_LLM_MODEL_NAME=llama2
CUSTOM_LLM_API_KEY=optional-api-key
```

### 使用 Google Gemini API

```bash
# 设置 API 密钥
GEMINI_API_KEY=your-api-key-here
```

## 🎯 使用示例

```bash
# 启动交互式会话
himile

# 直接提问
himile "什么是机器学习？"

# 分析代码文件
himile "请分析这个文件的功能" --context ./src/main.js

# 查看帮助
himile --help
```

## 🔧 高级配置

### 环境变量完整列表

```bash
# 认证相关
BYPASS_AUTH=true|false
USE_CUSTOM_LLM=true|false

# 自定义 LLM 配置
CUSTOM_LLM_ENDPOINT=http://your-endpoint/v1
CUSTOM_LLM_MODEL_NAME=your-model
CUSTOM_LLM_API_KEY=your-key
CUSTOM_LLM_TEMPERATURE=0.7
CUSTOM_LLM_MAX_TOKENS=8192
CUSTOM_LLM_TOP_P=1.0

# Google API 配置
GEMINI_API_KEY=your-gemini-key
GOOGLE_CLOUD_PROJECT=your-project
GOOGLE_CLOUD_LOCATION=us-central1
```

## 🐛 故障排除

### 常见问题

1. **安装后找不到 `himile` 命令**
   ```bash
   # 检查全局 npm 路径
   npm config get prefix
   
   # 确保路径在 PATH 中
   echo $PATH
   ```

2. **认证错误**
   ```bash
   # 检查环境变量
   echo $BYPASS_AUTH
   echo $USE_CUSTOM_LLM
   ```

3. **自定义 LLM 连接失败**
   ```bash
   # 测试端点连接
   curl -X POST http://localhost:11434/v1/chat/completions \
     -H "Content-Type: application/json" \
     -d '{"model":"llama2","messages":[{"role":"user","content":"test"}]}'
   ```

### 调试模式

```bash
# 启用详细日志
DEBUG=1 himile
```

## 📝 开发模式

如果您想修改代码：

```bash
# 开发模式启动
npm run start

# 监听文件变化并重新构建
npm run build -- --watch

# 运行测试
npm test
```

## 🤝 获取帮助

- 查看完整文档：`README-CUSTOM.md`
- 检查环境配置
- 查看错误日志
- 提交 Issue

---

**提示**: 首次使用建议先在开发模式下测试配置，确认一切正常后再进行全局安装。
