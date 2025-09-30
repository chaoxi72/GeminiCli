/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export interface RequestLogEntry {
  requestId: string;
  timestamp: string;
  url: string;
  modelName: string;
  requestData: any;
  vllmConfig: {
    deploymentFramework: 'vllm';
    endpoint: string;
    modelPath: string;
  };
}

export interface ResponseLogEntry {
  requestId: string;
  timestamp: string;
  responseData: {
    content?: string;           // 主要回答内容
    thinking?: string;          // 思考内容
    toolCalls?: Array<{         // 工具调用内容
      name: string;
      arguments: any;
      result?: any;
    }>;
    finishReason?: string;      // 完成原因
  };
}

export class RequestLogger {
  private requestLogFilePath: string;
  private responseLogFilePath: string;

  constructor() {
    // 在用户临时目录下创建日志文件
    const tempDir = os.tmpdir();
    this.requestLogFilePath = path.join(tempDir, 'request_log.json');
    this.responseLogFilePath = path.join(tempDir, 'response_log.json');
  }

  /**
   * 生成唯一的请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 格式化时间为 2024/09/20: 17:24:10 格式
   */
  private formatTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day}: ${hours}:${minutes}:${seconds}`;
  }

  /**
   * 从响应中提取有意义的内容（回答、思考、工具调用）
   * 专门针对vLLM部署框架优化
   */
  private extractMeaningfulContent(responseData: any): ResponseLogEntry['responseData'] {
    const extracted: ResponseLogEntry['responseData'] = {};

    // 处理转换后的Gemini响应格式
    if (responseData.convertedResponse?.candidates?.[0]) {
      const candidate = responseData.convertedResponse.candidates[0];
      
      // 提取主要内容
      if (candidate.content?.parts) {
        const textParts = candidate.content.parts
          .filter((part: any) => part.text)
          .map((part: any) => part.text)
          .join('\n');
        if (textParts.trim()) {
          // 检查是否包含思考内容（通常在<thinking>标签内）
          const thinkingMatch = textParts.match(/<thinking>([\s\S]*?)<\/thinking>/);
          if (thinkingMatch) {
            extracted.thinking = thinkingMatch[1].trim();
            // 移除思考内容，保留实际回答
            const contentWithoutThinking = textParts.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim();
            if (contentWithoutThinking) {
              extracted.content = contentWithoutThinking;
            }
          } else {
            extracted.content = textParts.trim();
          }
        }
      }

      // 提取工具调用
      if (candidate.content?.parts) {
        const toolCalls = candidate.content.parts
          .filter((part: any) => part.functionCall)
          .map((part: any) => ({
            name: part.functionCall.name,
            arguments: part.functionCall.args,
          }));
        if (toolCalls.length > 0) {
          extracted.toolCalls = toolCalls;
        }
      }

      // 提取完成原因
      if (candidate.finishReason) {
        extracted.finishReason = candidate.finishReason;
      }
    }

    // 处理原始OpenAI格式（vLLM通常使用OpenAI兼容格式）
    if (responseData.rawCompletion?.choices?.[0]) {
      const choice = responseData.rawCompletion.choices[0];
      
      // 如果没有从转换格式中提取到内容，尝试从原始格式提取
      if (!extracted.content && choice.message?.content) {
        const content = choice.message.content.trim();
        // 检查是否包含思考内容
        const thinkingMatch = content.match(/<thinking>([\s\S]*?)<\/thinking>/);
        if (thinkingMatch) {
          extracted.thinking = thinkingMatch[1].trim();
          const contentWithoutThinking = content.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim();
          if (contentWithoutThinking) {
            extracted.content = contentWithoutThinking;
          }
        } else {
          extracted.content = content;
        }
      }

      // 提取工具调用（OpenAI格式）
      if (choice.message?.tool_calls && !extracted.toolCalls) {
        extracted.toolCalls = choice.message.tool_calls.map((call: any) => ({
          name: call.function?.name,
          arguments: typeof call.function?.arguments === 'string' 
            ? JSON.parse(call.function.arguments) 
            : call.function?.arguments,
        }));
      }

      // 提取完成原因
      if (choice.finish_reason && !extracted.finishReason) {
        extracted.finishReason = choice.finish_reason;
      }
    }

    // 处理流式响应
    if (responseData.streamChunks && responseData.finalResponse) {
      // 从最终响应中提取内容
      if (responseData.finalResponse.candidates?.[0]) {
        const candidate = responseData.finalResponse.candidates[0];
        
        if (candidate.content?.parts) {
          const textParts = candidate.content.parts
            .filter((part: any) => part.text)
            .map((part: any) => part.text)
            .join('\n');
          if (textParts.trim()) {
            // 检查思考内容
            const thinkingMatch = textParts.match(/<thinking>([\s\S]*?)<\/thinking>/);
            if (thinkingMatch) {
              extracted.thinking = thinkingMatch[1].trim();
              const contentWithoutThinking = textParts.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim();
              if (contentWithoutThinking) {
                extracted.content = contentWithoutThinking;
              }
            } else {
              extracted.content = textParts.trim();
            }
          }

          // 提取工具调用
          const toolCalls = candidate.content.parts
            .filter((part: any) => part.functionCall)
            .map((part: any) => ({
              name: part.functionCall.name,
              arguments: part.functionCall.args,
            }));
          if (toolCalls.length > 0) {
            extracted.toolCalls = toolCalls;
          }
        }

        if (candidate.finishReason) {
          extracted.finishReason = candidate.finishReason;
        }
      }
    }

    return extracted;
  }

  /**
   * 记录模型请求到日志文件
   * @param url API请求的URL
   * @param modelName 模型名称
   * @param requestData 发送给模型的完整请求数据
   * @param vllmEndpoint vLLM部署的端点地址
   * @returns 返回生成的请求ID
   */
  async logRequest(url: string, modelName: string, requestData: any, vllmEndpoint: string): Promise<string> {
    const requestId = this.generateRequestId();
    const logEntry: RequestLogEntry = {
      requestId,
      timestamp: this.formatTimestamp(),
      url,
      modelName,
      requestData,
      vllmConfig: {
        deploymentFramework: 'vllm',
        endpoint: vllmEndpoint,
        modelPath: modelName,
      },
    };

    try {
      // 读取现有日志
      let existingLogs: RequestLogEntry[] = [];
      try {
        const fileContent = await fs.readFile(this.requestLogFilePath, 'utf-8');
        existingLogs = JSON.parse(fileContent);
      } catch (error) {
        // 文件不存在或解析失败，使用空数组
        existingLogs = [];
      }

      // 添加新的日志条目
      existingLogs.push(logEntry);

      // 写入文件，格式美观
      await fs.writeFile(
        this.requestLogFilePath,
        JSON.stringify(existingLogs, null, 2),
        'utf-8'
      );

      return requestId;
    } catch (error) {
      console.error('Failed to write request log:', error);
      return requestId;
    }
  }

  /**
   * 记录模型响应到日志文件
   * @param requestId 关联的请求ID
   * @param responseData 模型返回的完整响应数据
   */
  async logResponse(requestId: string, responseData: any): Promise<void> {
    const logEntry: ResponseLogEntry = {
      requestId,
      timestamp: this.formatTimestamp(),
      responseData: this.extractMeaningfulContent(responseData),
    };

    try {
      // 读取现有日志
      let existingLogs: ResponseLogEntry[] = [];
      try {
        const fileContent = await fs.readFile(this.responseLogFilePath, 'utf-8');
        existingLogs = JSON.parse(fileContent);
      } catch (error) {
        // 文件不存在或解析失败，使用空数组
        existingLogs = [];
      }

      // 添加新的日志条目
      existingLogs.push(logEntry);

      // 写入文件，格式美观
      await fs.writeFile(
        this.responseLogFilePath,
        JSON.stringify(existingLogs, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Failed to write response log:', error);
    }
  }

  /**
   * 获取请求日志文件路径
   */
  getRequestLogFilePath(): string {
    return this.requestLogFilePath;
  }

  /**
   * 获取响应日志文件路径
   */
  getResponseLogFilePath(): string {
    return this.responseLogFilePath;
  }
}
