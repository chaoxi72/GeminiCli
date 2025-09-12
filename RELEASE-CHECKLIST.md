# ✅ Himile CLI 发布清单

## 📋 发布前检查

### 🔧 环境检查
- [ ] Node.js >= 20.0.0 (`node --version`)
- [ ] npm 已登录 (`npm whoami`)
- [ ] Git 仓库状态干净 (`git status`)
- [ ] 所有更改已提交并推送

### 📦 包配置检查
- [ ] 包名: `himile-cli` (不冲突)
- [ ] 版本号: `1.0.0` (符合语义化版本)
- [ ] 命令名: `himile` (不与其他包冲突)
- [ ] 仓库地址: `https://github.com/chaoxi72/gemini-cli.git`
- [ ] 许可证: Apache-2.0

### 🎨 功能检查
- [ ] HIMILE logo 显示正确
- [ ] 自定义 LLM 功能正常
- [ ] 绕过认证模式正常
- [ ] 所有子包名称正确

## 🚀 打包流程

### 方法1: 快速打包（推荐）
```bash
npm run build-and-pack
```

### 方法2: 完整流程
```bash
npm run publish:prepare
```

### 方法3: 手动步骤
```bash
# 清理环境
npm run clean

# 安装依赖
npm ci

# 构建所有包
npm run build

# 类型检查
npm run typecheck

# 生成 bundle
npm run bundle

# 打包
npm pack
```

## 🧪 本地测试

### 1. 检查包内容
```bash
tar -tzf himile-cli-1.0.0.tgz
```

### 2. 本地安装测试
```bash
# 全局安装
npm install -g ./himile-cli-1.0.0.tgz

# 测试版本
himile --version

# 测试帮助
himile --help

# 测试基本功能
himile "Hello, world!"
```

### 3. 环境变量测试
```bash
# 测试绕过认证
BYPASS_AUTH=true himile "Test message"

# 测试自定义 LLM
BYPASS_AUTH=true USE_CUSTOM_LLM=true CUSTOM_LLM_ENDPOINT=http://localhost:8080/v1 himile "Test"
```

### 4. 清理测试环境
```bash
npm uninstall -g himile-cli
rm himile-cli-1.0.0.tgz
```

## 📤 发布到 npm

### 首次发布
```bash
# 确保已登录
npm login

# 发布包
npm publish --access public

# 或使用脚本
npm run publish:npm
```

### 验证发布
```bash
# 检查 npm 上的包信息
npm info himile-cli

# 从 npm 安装测试
npm install -g himile-cli

# 测试功能
himile --version
```

## 🔍 故障排除

### 常见问题及解决方案

#### 1. 构建失败
```bash
# 检查 Node.js 版本
node --version

# 清理并重新开始
npm run clean
rm -rf node_modules
npm ci
```

#### 2. Bundle 生成失败
```bash
# 检查各个包的构建状态
ls -la packages/*/dist/

# 手动构建单个包
cd packages/cli && npm run build
cd packages/core && npm run build
```

#### 3. 权限错误
```bash
# 检查 npm 登录状态
npm whoami

# 重新登录
npm logout
npm login
```

#### 4. 包名冲突
```bash
# 检查包名可用性
npm info himile-cli

# 如果冲突，修改 package.json 中的名称
```

#### 5. 版本问题
```bash
# 更新版本号
npm version patch

# 或手动编辑 package.json
```

## 📊 发布后任务

### 1. 更新文档
- [ ] 更新 README.md 安装说明
- [ ] 更新版本历史
- [ ] 更新使用示例

### 2. 创建 GitHub Release
- [ ] 创建新的 Release 标签
- [ ] 编写 Release Notes
- [ ] 上传构建产物（可选）

### 3. 通知和推广
- [ ] 更新项目文档
- [ ] 通知相关用户
- [ ] 社交媒体分享（可选）

## 🎯 成功标准

发布成功后，用户应该能够：

1. **安装包**:
   ```bash
   npm install -g himile-cli
   ```

2. **使用命令**:
   ```bash
   himile --help
   himile --version
   himile "Hello, world!"
   ```

3. **看到正确的品牌**:
   - HIMILE ASCII logo
   - 正确的命令名 (`himile`)
   - 正确的包信息

4. **使用增强功能**:
   - 自定义 LLM 支持
   - 绕过认证模式
   - 所有原有功能

## ⚡ 快速命令参考

```bash
# 完整打包流程
npm run build-and-pack

# 本地测试
npm install -g ./himile-cli-1.0.0.tgz && himile --version

# 发布到 npm
npm publish --access public

# 清理
npm uninstall -g himile-cli && rm himile-cli-1.0.0.tgz
```

---

**注意**: 在发布前请确保所有检查项都已完成，特别是功能测试和本地安装测试。
