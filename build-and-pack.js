#!/usr/bin/env node

/**
 * Himile CLI 简化打包脚本
 * 专门用于快速打包和测试
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const log = (message) => console.log(`🔨 ${message}`);
const success = (message) => console.log(`✅ ${message}`);
const warn = (message) => console.warn(`⚠️  ${message}`);
const error = (message) => console.error(`❌ ${message}`);

function runCommand(command, description) {
  try {
    log(description);
    execSync(command, { stdio: 'inherit' });
    success(`${description} - 完成`);
    return true;
  } catch (err) {
    error(`${description} - 失败: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 开始 Himile CLI 打包流程...\n');

  // 检查 Node.js 版本
  const nodeVersion = process.version;
  log(`Node.js 版本: ${nodeVersion}`);
  
  if (parseInt(nodeVersion.slice(1)) < 20) {
    error('需要 Node.js 20 或更高版本');
    process.exit(1);
  }

  // 步骤 1: 清理
  if (!runCommand('npm run clean', '清理旧文件')) {
    warn('清理失败，继续...');
  }

  // 步骤 2: 安装依赖
  if (!runCommand('npm ci', '安装依赖')) {
    error('依赖安装失败');
    process.exit(1);
  }

  // 步骤 3: 构建
  if (!runCommand('npm run build', '构建所有包')) {
    error('构建失败');
    process.exit(1);
  }

  // 步骤 4: 类型检查（可选）
  if (!runCommand('npm run typecheck', '类型检查')) {
    warn('类型检查失败，但继续...');
  }

  // 步骤 5: 生成 bundle
  if (!runCommand('npm run bundle', '生成 bundle')) {
    error('Bundle 生成失败');
    process.exit(1);
  }

  // 步骤 6: 检查 bundle 文件
  const bundlePath = path.join(process.cwd(), 'bundle', 'gemini.js');
  if (!existsSync(bundlePath)) {
    error('Bundle 文件不存在: bundle/gemini.js');
    process.exit(1);
  }
  success('Bundle 文件检查通过');

  // 步骤 7: 打包
  if (!runCommand('npm pack', '生成 npm 包')) {
    error('打包失败');
    process.exit(1);
  }

  // 检查生成的包文件
  const packageFile = 'himile-cli-1.0.0.tgz';
  if (!existsSync(packageFile)) {
    error(`包文件不存在: ${packageFile}`);
    process.exit(1);
  }

  console.log('\n🎉 打包完成！');
  console.log('\n📦 生成的包文件:');
  console.log(`   ${packageFile}`);
  
  console.log('\n🧪 测试安装:');
  console.log(`   npm install -g ./${packageFile}`);
  
  console.log('\n🚀 测试命令:');
  console.log('   himile --version');
  console.log('   himile --help');
  
  console.log('\n📤 发布到 npm:');
  console.log('   npm publish --access public');
  
  console.log('\n🗑️  清理:');
  console.log(`   rm ${packageFile}`);
  console.log('   npm uninstall -g himile-cli');
}

main().catch(err => {
  error(`打包过程出错: ${err.message}`);
  process.exit(1);
});
