/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolResponse {
  tool_call_id: string;
  role: "function";
  name: string;
  content: string;
}

export interface LogEntry {
  timestamp: string;                    // 请求时间，格式：YYYY-MM-DD hh:mm:ss
  request: {
    id: string;                         // 唯一请求ID，便于追踪
    url: string;                        // 请求地址
    model: string;                      // 请求的模型名称
    stream: boolean;                    // 是否流式返回
    function_call: boolean;             // 是否包含function call
    payload: {                          // 请求构造的具体数据
      messages: Array<{
        role: string;
        content: string;
      }>;
      tools?: Array<{
        type: "function";
        function: {
          name: string;
          description: string;
          parameters: any;
        };
      }>;
      tool_choice?: "auto" | "none" | string;
      temperature?: number;
      max_tokens?: number;
      [key: string]: any;               // 其他参数
    };
  };
  response: {
    status: number;                     // HTTP状态
    latency_ms: number;                 // 请求耗时（毫秒）
    usage?: {                           // token 使用统计
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
    choices: Array<{
      index: number;
      finish_reason: string;            // 结束原因
      message: {
        role: "assistant";              // 消息角色
        reasoning_content?: string;     // 模型的思考 / 推理内容
        content?: string;               // 最终回答的文本内容
        tool_calls?: ToolCall[];        // 工具调用意图
      };
    }>;
    tool_responses?: ToolResponse[];    // 工具调用返回结果
    raw?: string;                       // 保留原始响应，方便调试
  };
}

export class RequestLogger {
  private logFilePath: string;
  private pendingRequests: Map<string, {
    url: string;
    modelName: string;
    requestData: any;
    startTime: number;
  }> = new Map();

  constructor() {
    // 在用户临时目录下创建统一日志文件
    const tempDir = os.tmpdir();
    this.logFilePath = path.join(tempDir, 'llm_request_log.json');
  }

  /**
   * 生成唯一的请求ID
   */
  private generateRequestId(): string {
    return `req-${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 格式化时间为 YYYY-MM-DD hh:mm:ss 格式
   */
  private formatTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * 从响应数据中提取并格式化为新的日志格式
   */
  private extractResponseData(responseData: any, latencyMs: number): LogEntry['response'] {
    const response: LogEntry['response'] = {
      status: 200, // 默认为成功状态
      latency_ms: latencyMs,
      choices: []
    };

    // 提取usage信息
    if (responseData.usage || responseData.convertedResponse?.usage) {
      const usage = responseData.usage || responseData.convertedResponse.usage;
      response.usage = {
        prompt_tokens: usage.promptTokens || usage.prompt_tokens,
        completion_tokens: usage.completionTokens || usage.completion_tokens,
        total_tokens: usage.totalTokens || usage.total_tokens
      };
    }

    // 处理转换后的Gemini响应格式
    if (responseData.convertedResponse?.candidates?.[0]) {
      const candidate = responseData.convertedResponse.candidates[0];
      const choice: LogEntry['response']['choices'][0] = {
        index: 0,
        finish_reason: candidate.finishReason || 'stop',
        message: {
          role: 'assistant'
        }
      };

      // 提取内容和思考
      if (candidate.content?.parts) {
        const textParts = candidate.content.parts
          .filter((part: any) => part.text)
          .map((part: any) => part.text)
          .join('\n');
        
        if (textParts.trim()) {
          // 检查是否包含思考内容（通常在<thinking>标签内）
          const thinkingMatch = textParts.match(/<thinking>([\s\S]*?)<\/thinking>/);
          if (thinkingMatch) {
            choice.message.reasoning_content = thinkingMatch[1].trim();
            // 移除思考内容，保留实际回答
            const contentWithoutThinking = textParts.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim();
            if (contentWithoutThinking) {
              choice.message.content = contentWithoutThinking;
            }
          } else {
            choice.message.content = textParts.trim();
          }
        }

        // 提取工具调用
        const toolCalls = candidate.content.parts
          .filter((part: any) => part.functionCall)
          .map((part: any, index: number) => ({
            id: `chatcmpl-tool-${Date.now()}-${index}`,
            function: {
              name: part.functionCall.name,
              arguments: JSON.stringify(part.functionCall.args)
            }
          }));
        
        if (toolCalls.length > 0) {
          choice.message.tool_calls = toolCalls;
        }
      }

      response.choices.push(choice);
    }
    // 处理原始OpenAI格式
    else if (responseData.rawCompletion?.choices?.[0]) {
      const choice = responseData.rawCompletion.choices[0];
      const formattedChoice: LogEntry['response']['choices'][0] = {
        index: choice.index || 0,
        finish_reason: choice.finish_reason || 'stop',
        message: {
          role: 'assistant'
        }
      };

      if (choice.message?.content) {
        const content = choice.message.content.trim();
        // 检查是否包含思考内容
        const thinkingMatch = content.match(/<thinking>([\s\S]*?)<\/thinking>/);
        if (thinkingMatch) {
          formattedChoice.message.reasoning_content = thinkingMatch[1].trim();
          const contentWithoutThinking = content.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim();
          if (contentWithoutThinking) {
            formattedChoice.message.content = contentWithoutThinking;
          }
        } else {
          formattedChoice.message.content = content;
        }
      }

      // 提取工具调用（OpenAI格式）
      if (choice.message?.tool_calls) {
        formattedChoice.message.tool_calls = choice.message.tool_calls.map((call: any) => ({
          id: call.id || `chatcmpl-tool-${Date.now()}`,
          function: {
            name: call.function?.name || '',
            arguments: typeof call.function?.arguments === 'string' 
              ? call.function.arguments 
              : JSON.stringify(call.function?.arguments || {})
          }
        }));
      }

      response.choices.push(formattedChoice);
    }

    // 保存原始响应用于调试
    if (responseData) {
      response.raw = JSON.stringify(responseData);
    }

    return response;
  }

  /**
   * 开始记录请求，返回一个记录器实例
   * @param url API请求的URL
   * @param modelName 模型名称
   * @param requestData 发送给模型的完整请求数据
   * @returns 返回记录器实例和请求ID
   */
  startLogging(url: string, modelName: string, requestData: any): { requestId: string; complete: (responseData: any, latencyMs: number, toolResponses?: ToolResponse[]) => Promise<void> } {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    // 存储请求信息
    this.pendingRequests.set(requestId, {
      url,
      modelName,
      requestData,
      startTime
    });

    const complete = async (responseData: any, latencyMs: number, toolResponses?: ToolResponse[]): Promise<void> => {
      const requestInfo = this.pendingRequests.get(requestId);
      if (requestInfo) {
        await this.logComplete(requestId, requestInfo.url, requestInfo.modelName, requestInfo.requestData, responseData, latencyMs, toolResponses);
        // 清理已完成的请求信息
        this.pendingRequests.delete(requestId);
      } else {
        // 如果找不到请求信息，使用传入的参数作为备用
        await this.logComplete(requestId, url, modelName, requestData, responseData, latencyMs, toolResponses);
      }
    };

    return { requestId, complete };
  }

  /**
   * 记录完整的请求和响应到日志文件
   * @param requestId 请求ID
   * @param url API请求的URL
   * @param modelName 模型名称
   * @param requestData 发送给模型的完整请求数据
   * @param responseData 模型返回的完整响应数据
   * @param latencyMs 请求耗时（毫秒）
   * @param toolResponses 工具调用返回结果
   */
  private async logComplete(
    requestId: string, 
    url: string, 
    modelName: string, 
    requestData: any, 
    responseData: any, 
    latencyMs: number,
    toolResponses?: ToolResponse[]
  ): Promise<void> {
    const logEntry: LogEntry = {
      timestamp: this.formatTimestamp(),
      request: {
        id: requestId,
        url,
        model: modelName,
        stream: requestData.stream || false,
        function_call: Boolean(requestData.tools || requestData.functions),
        payload: {
          messages: requestData.messages || [],
          tools: requestData.tools,
          tool_choice: requestData.tool_choice,
          temperature: requestData.temperature,
          max_tokens: requestData.max_tokens,
          ...Object.fromEntries(
            Object.entries(requestData).filter(([key]) => 
              !['messages', 'tools', 'tool_choice', 'temperature', 'max_tokens'].includes(key)
            )
          )
        }
      },
      response: this.extractResponseData(responseData, latencyMs)
    };

    // 添加工具响应
    if (toolResponses && toolResponses.length > 0) {
      logEntry.response.tool_responses = toolResponses;
    }

    try {
      // 读取现有日志
      let existingLogs: LogEntry[] = [];
      try {
        const fileContent = await fs.readFile(this.logFilePath, 'utf-8');
        existingLogs = JSON.parse(fileContent);
      } catch (error) {
        // 文件不存在或解析失败，使用空数组
        existingLogs = [];
      }

      // 添加新的日志条目
      existingLogs.push(logEntry);

      // 写入文件，格式美观
      await fs.writeFile(
        this.logFilePath,
        JSON.stringify(existingLogs, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Failed to write request log:', error);
    }
  }

  /**
   * 兼容性方法：记录请求（保持向后兼容）
   * @deprecated 建议使用 startLogging 方法
   */
  async logRequest(url: string, modelName: string, requestData: any, vllmEndpoint?: string): Promise<string> {
    const { requestId } = this.startLogging(url, modelName, requestData);
    return requestId;
  }

  /**
   * 兼容性方法：记录响应（保持向后兼容）
   * @deprecated 建议使用 startLogging 返回的 complete 方法
   */
  async logResponse(requestId: string, responseData: any, latencyMs: number = 0): Promise<void> {
    // 尝试从存储的请求信息中获取数据
    const requestInfo = this.pendingRequests.get(requestId);
    
    let logEntry: LogEntry;
    
    if (requestInfo) {
      // 如果找到了请求信息，使用完整的数据记录
      logEntry = {
        timestamp: this.formatTimestamp(),
        request: {
          id: requestId,
          url: requestInfo.url,
          model: requestInfo.modelName,
          stream: requestInfo.requestData.stream || false,
          function_call: Boolean(requestInfo.requestData.tools || requestInfo.requestData.functions),
          payload: {
            messages: requestInfo.requestData.messages || [],
            tools: requestInfo.requestData.tools,
            tool_choice: requestInfo.requestData.tool_choice,
            temperature: requestInfo.requestData.temperature,
            max_tokens: requestInfo.requestData.max_tokens,
            ...Object.fromEntries(
              Object.entries(requestInfo.requestData).filter(([key]) => 
                !['messages', 'tools', 'tool_choice', 'temperature', 'max_tokens'].includes(key)
              )
            )
          }
        },
        response: this.extractResponseData(responseData, latencyMs)
      };
      
      // 清理已完成的请求信息
      this.pendingRequests.delete(requestId);
    } else {
      // 如果找不到请求信息，创建基本的日志条目（向后兼容）
      logEntry = {
        timestamp: this.formatTimestamp(),
        request: {
          id: requestId,
          url: 'unknown',
          model: 'unknown',
          stream: false,
          function_call: false,
          payload: {
            messages: []
          }
        },
        response: this.extractResponseData(responseData, latencyMs)
      };
    }

    try {
      let existingLogs: LogEntry[] = [];
      try {
        const fileContent = await fs.readFile(this.logFilePath, 'utf-8');
        existingLogs = JSON.parse(fileContent);
      } catch (error) {
        existingLogs = [];
      }

      existingLogs.push(logEntry);

      await fs.writeFile(
        this.logFilePath,
        JSON.stringify(existingLogs, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Failed to write response log:', error);
    }
  }

  /**
   * 获取日志文件路径
   */
  getLogFilePath(): string {
    return this.logFilePath;
  }

  /**
   * 兼容性方法：获取请求日志文件路径
   * @deprecated 建议使用 getLogFilePath
   */
  getRequestLogFilePath(): string {
    return this.logFilePath;
  }

  /**
   * 兼容性方法：获取响应日志文件路径
   * @deprecated 建议使用 getLogFilePath
   */
  getResponseLogFilePath(): string {
    return this.logFilePath;
  }
}
