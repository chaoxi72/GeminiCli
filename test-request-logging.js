/**
 * 简单的测试脚本来验证请求日志记录功能
 */

import { RequestLogger } from './packages/core/src/custom-llm/requestLogger.js';
import { promises as fs } from 'node:fs';

async function testRequestLogging() {
  console.log('测试请求日志记录功能...');
  
  const logger = new RequestLogger();
  const logFilePath = logger.getLogFilePath();
  
  console.log(`日志文件路径: ${logFilePath}`);
  
  // 模拟一个请求日志
  const testRequestData = {
    messages: [
      { role: 'user', content: '你好，这是一个测试' }
    ],
    stream: false,
    model: 'test-model',
    temperature: 0.7,
    max_tokens: 1024
  };
  
  try {
    await logger.logRequest(
      'http://localhost:8080/v1/chat/completions',
      'test-model',
      testRequestData
    );
    
    console.log('✅ 日志记录成功');
    
    // 读取并显示日志内容
    try {
      const logContent = await fs.readFile(logFilePath, 'utf-8');
      const logs = JSON.parse(logContent);
      console.log('📝 当前日志内容:');
      console.log(JSON.stringify(logs, null, 2));
    } catch (readError) {
      console.error('❌ 读取日志文件失败:', readError.message);
    }
    
  } catch (error) {
    console.error('❌ 日志记录失败:', error.message);
  }
}

// 运行测试
testRequestLogging().catch(console.error);
