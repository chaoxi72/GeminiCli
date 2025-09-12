/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthType } from '@google/gemini-cli-core';
import { loadEnvironment, loadSettings } from './settings.js';

export function validateAuthMethod(authMethod: string): string | null {
  // 检查是否设置了绕过认证
  if (process.env['BYPASS_AUTH'] === 'true') {
    console.log('Auth validation bypassed via BYPASS_AUTH environment variable.');
    return null; // 绕过所有校验
  }
  
  loadEnvironment(loadSettings(process.cwd()).merged);
  if (
    authMethod === AuthType.LOGIN_WITH_GOOGLE ||
    authMethod === AuthType.CLOUD_SHELL
  ) {
    return null;
  }

  if (authMethod === AuthType.USE_GEMINI) {
    if (!process.env['GEMINI_API_KEY']) {
      return 'GEMINI_API_KEY environment variable not found. Add that to your environment and try again (no reload needed if using .env)!';
    }
    return null;
  }

  if (authMethod === AuthType.USE_VERTEX_AI) {
    const hasVertexProjectLocationConfig =
      !!process.env['GOOGLE_CLOUD_PROJECT'] &&
      !!process.env['GOOGLE_CLOUD_LOCATION'];
    const hasGoogleApiKey = !!process.env['GOOGLE_API_KEY'];
    if (!hasVertexProjectLocationConfig && !hasGoogleApiKey) {
      return (
        'When using Vertex AI, you must specify either:\n' +
        '• GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION environment variables.\n' +
        '• GOOGLE_API_KEY environment variable (if using express mode).\n' +
        'Update your environment and try again (no reload needed if using .env)!'
      );
    }
    return null;
  }

  if (authMethod === AuthType.CUSTOM_LLM_API) {
    // 如果使用自定义模型且设置了绕过，则不检查环境变量
    if (process.env['USE_CUSTOM_LLM'] === 'true' && process.env['BYPASS_AUTH'] === 'true') {
      return null;
    }
    
    if (!process.env['CUSTOM_LLM_ENDPOINT']) {
      return 'CUSTOM_LLM_ENDPOINT environment variable not found. Add that to your .env and try again, no reload needed!';
    }

    if (!process.env['CUSTOM_LLM_MODEL_NAME']) {
      return 'CUSTOM_LLM_MODEL_NAME environment variable not found. Add that to your .env and try again, no reload needed!';
    }
    return null;
  }

  return 'Invalid auth method selected.';
}
