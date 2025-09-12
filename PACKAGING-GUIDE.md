# 📦 Himile CLI 打包指南

## 🚀 快速打包流程

### 方法1: 使用内置脚本（推荐）

```bash
# 完整构建和准备发布
npm run publish:prepare

# 生成本地安装包
npm run publish:local

# 发布到 npm
npm run publish:npm
```

### 方法2: 手动步骤

```bash
# 1. 清理环境
npm run clean

# 2. 安装依赖
npm ci

# 3. 构建所有包
npm run build

# 4. 类型检查
npm run typecheck

# 5. 运行测试（可选）
npm test

# 6. 生成 bundle
npm run bundle

# 7. 准备包
npm run prepare:package

# 8. 打包
npm pack

# 9. 发布
npm publish --access public
```

## 📋 打包前检查清单

### ✅ 环境准备
- [ ] Node.js >= 20.0.0
- [ ] npm 已登录 (`npm login`)
- [ ] 版本号正确 (package.json)
- [ ] 所有更改已提交到 Git

### ✅ 配置验证
- [ ] 包名: `himile-cli`
- [ ] 命令名: `himile`
- [ ] 仓库地址: `https://github.com/chaoxi72/gemini-cli.git`
- [ ] 许可证: Apache-2.0

### ✅ 功能测试
- [ ] Logo 显示正确 (HIMILE)
- [ ] 命令行工具正常工作
- [ ] 自定义 LLM 功能正常
- [ ] 绕过认证模式正常

## 🔧 构建过程详解

### 1. 清理环境 (`npm run clean`)
- 删除所有 `dist/` 目录
- 删除 `bundle/` 目录
- 删除临时文件

### 2. 安装依赖 (`npm ci`)
- 安装所有工作区依赖
- 确保依赖版本一致

### 3. 构建包 (`npm run build`)
- 构建 `packages/cli`
- 构建 `packages/core`
- 构建 `packages/test-utils`

### 4. 生成 Bundle (`npm run bundle`)
- 将所有包打包成单个可执行文件
- 生成 `bundle/gemini.js`
- 复制必要的资产文件

### 5. 准备发布 (`npm run prepare:package`)
- 验证包结构
- 检查文件完整性
- 准备发布元数据

## 📁 打包输出结构

```
himile-cli-1.0.0.tgz
├── bundle/
│   ├── gemini.js           # 主执行文件
│   └── ...                 # 其他资产文件
├── package.json            # 包元数据
├── README.md              # 说明文档
└── LICENSE                # 许可证文件
```

## 🎯 本地测试

### 测试打包结果
```bash
# 生成本地包
npm pack

# 检查包内容
tar -tzf himile-cli-1.0.0.tgz

# 本地安装测试
npm install -g ./himile-cli-1.0.0.tgz

# 测试命令
himile --version
himile --help

# 测试功能
himile "Hello, world!"
```

### 清理测试环境
```bash
# 卸载测试包
npm uninstall -g himile-cli

# 删除本地包文件
rm himile-cli-1.0.0.tgz
```

## 🌐 发布到 npm

### 首次发布
```bash
# 登录 npm
npm login

# 发布包
npm publish --access public
```

### 更新发布
```bash
# 更新版本号
npm version patch  # 或 minor, major

# 重新构建
npm run publish:prepare

# 发布更新
npm publish
```

## 🔍 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 检查 Node.js 版本
node --version

# 清理并重新安装
npm run clean
npm ci
```

#### 2. 权限错误
```bash
# 检查 npm 登录状态
npm whoami

# 重新登录
npm logout
npm login
```

#### 3. 包名冲突
```bash
# 检查包名是否可用
npm info himile-cli

# 如果冲突，修改 package.json 中的名称
```

#### 4. Bundle 生成失败
```bash
# 检查所有包是否构建成功
ls -la packages/*/dist/

# 手动运行 bundle 脚本
npm run bundle
```

## 📊 发布后验证

### 验证发布成功
```bash
# 检查 npm 上的包信息
npm info himile-cli

# 全局安装测试
npm install -g himile-cli

# 功能测试
himile --version
```

### 更新文档
- [ ] 更新 README.md
- [ ] 更新版本说明
- [ ] 更新安装指南

## 🎉 完成！

发布成功后，用户可以通过以下方式安装：

```bash
# 全局安装
npm install -g himile-cli

# 使用 npx
npx himile-cli

# 使用命令
himile --help
```

---

**注意**: 确保在发布前充分测试所有功能，特别是自定义的 HIMILE logo 和增强功能。
