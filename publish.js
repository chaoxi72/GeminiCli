#!/usr/bin/env node

/**
 * Himile CLI 发布脚本
 * 用于将项目打包并发布到 npm
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const log = (message) => console.log(`📦 ${message}`);
const error = (message) => console.error(`❌ ${message}`);

async function main() {
  try {
    log('开始构建 Himile CLI...');

    // 1. 清理旧的构建文件
    log('清理旧的构建文件...');
    execSync('npm run clean', { stdio: 'inherit' });

    // 2. 安装依赖
    log('安装依赖...');
    execSync('npm ci', { stdio: 'inherit' });

    // 3. 构建所有包
    log('构建所有包...');
    execSync('npm run build', { stdio: 'inherit' });

    // 4. 运行类型检查
    log('运行类型检查...');
    execSync('npm run typecheck', { stdio: 'inherit' });

    // 5. 运行测试
    log('运行测试...');
    try {
      execSync('npm test', { stdio: 'inherit' });
    } catch (e) {
      console.warn('⚠️  测试失败，但继续构建过程...');
    }

    // 6. 生成 bundle
    log('生成 bundle...');
    execSync('npm run bundle', { stdio: 'inherit' });

    // 7. 准备发布包
    log('准备发布包...');
    execSync('npm run prepare:package', { stdio: 'inherit' });

    log('✅ 构建完成！');
    log('');
    log('要发布到 npm，请运行以下命令：');
    log('  npm publish --access public');
    log('');
    log('要测试本地安装，请运行：');
    log('  npm pack');
    log('  npm install -g ./himile-cli-1.0.0.tgz');
    log('');
    log('安装后，您可以使用以下命令：');
    log('  himile --help');

  } catch (err) {
    error(`构建失败: ${err.message}`);
    process.exit(1);
  }
}

main();
