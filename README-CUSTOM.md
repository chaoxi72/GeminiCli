# Himile CLI

这是一个基于 Google Gemini CLI 的自定义版本，添加了增强功能和自定义配置。

## 🚀 特性

- **自定义 LLM 支持**: 支持连接自定义的 LLM 端点
- **绕过认证模式**: 可以通过环境变量绕过标准认证流程
- **增强的错误处理**: 改进的错误处理和调试信息
- **兼容性**: 与原版 Gemini CLI 完全兼容

## 📦 安装

### 全局安装

```bash
npm install -g himile-cli
```

### 使用 npx 运行

```bash
npx himile-cli
```

## 🔧 配置

### 环境变量

创建一个 `.env` 文件或设置以下环境变量：

```bash
# 绕过标准认证（用于自定义 LLM）
BYPASS_AUTH=true

# 使用自定义 LLM
USE_CUSTOM_LLM=true

# 自定义 LLM 配置
CUSTOM_LLM_ENDPOINT=http://localhost:8080/v1
CUSTOM_LLM_MODEL_NAME=your-model-name
CUSTOM_LLM_API_KEY=your-api-key
CUSTOM_LLM_TEMPERATURE=0.7
CUSTOM_LLM_MAX_TOKENS=8192
CUSTOM_LLM_TOP_P=1

# 或者使用标准 Gemini API
GEMINI_API_KEY=your-gemini-api-key
```

## 🚀 使用

### 基本用法

```bash
# 启动交互式 CLI
himile

# 运行单个命令
himile "解释一下这段代码的作用"

# 查看帮助
himile --help
```

### 自定义 LLM 模式

当设置了 `BYPASS_AUTH=true` 和 `USE_CUSTOM_LLM=true` 时，CLI 会：

1. 跳过 Google 认证流程
2. 使用您配置的自定义 LLM 端点
3. 自动处理 OpenAI 兼容的 API 调用

## 🛠️ 开发

### 构建项目

```bash
# 快速打包（推荐）
npm run build-and-pack

# 或完整流程
npm run publish:prepare

# 或手动步骤
npm ci                    # 安装依赖
npm run build            # 构建所有包
npm run typecheck        # 类型检查
npm test                 # 运行测试
npm run bundle           # 生成 bundle
npm pack                 # 打包
```

### 本地测试

```bash
# 生成本地包
npm pack

# 全局安装本地包
npm install -g ./himile-cli-1.0.0.tgz

# 测试安装
himile --version
```

## 📝 与官方版本的区别

1. **包名**: `himile-cli` vs `@google/gemini-cli`
2. **命令名**: `himile` vs `gemini`
3. **自定义功能**: 
   - 支持绕过认证
   - 支持自定义 LLM 端点
   - 增强的错误处理
4. **配置**: 额外的环境变量支持

## 🔒 安全注意事项

- 在生产环境中使用自定义 LLM 时，确保端点的安全性
- 妥善保管 API 密钥
- 定期更新依赖包

## 📄 许可证

基于原项目的 Apache 2.0 许可证

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如果您遇到问题或需要帮助，请：

1. 查看本文档
2. 检查环境变量配置
3. 查看日志输出
4. 提交 Issue

---

**注意**: 这是一个非官方的自定义版本，不隶属于 Google。
