/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Config } from '@google/gemini-cli-core';
import { AuthType } from '@google/gemini-cli-core';
import { USER_SETTINGS_PATH } from './config/settings.js';
import { validateAuthMethod } from './config/auth.js';

function getAuthTypeFromEnv(): AuthType | undefined {
  // 如果设置了绕过认证且使用自定义模型，直接返回自定义LLM类型
  if (process.env['BYPASS_AUTH'] === 'true' && process.env['USE_CUSTOM_LLM'] === 'true') {
    return AuthType.CUSTOM_LLM_API;
  }
  
  if (process.env['GOOGLE_GENAI_USE_GCA'] === 'true') {
    return AuthType.LOGIN_WITH_GOOGLE;
  }
  if (process.env['GOOGLE_GENAI_USE_VERTEXAI'] === 'true') {
    return AuthType.USE_VERTEX_AI;
  }
  if (process.env['GEMINI_API_KEY']) {
    return AuthType.USE_GEMINI;
  }
  return undefined;
}

export async function validateNonInteractiveAuth(
  configuredAuthType: AuthType | undefined,
  useExternalAuth: boolean | undefined,
  nonInteractiveConfig: Config,
) {
  // 检查是否设置了绕过认证
  if (process.env['BYPASS_AUTH'] === 'true') {
    console.log('Non-interactive authentication bypassed via BYPASS_AUTH environment variable.');
    
    // 如果使用自定义模型，需要初始化 GeminiClient
    if (process.env['USE_CUSTOM_LLM'] === 'true') {
      await nonInteractiveConfig.refreshAuth(AuthType.CUSTOM_LLM_API);
    }
    
    return nonInteractiveConfig;
  }
  
  const effectiveAuthType = configuredAuthType || getAuthTypeFromEnv();

  if (!effectiveAuthType) {
    console.error(
      `Please set an Auth method in your ${USER_SETTINGS_PATH} or specify one of the following environment variables before running: GEMINI_API_KEY, GOOGLE_GENAI_USE_VERTEXAI, GOOGLE_GENAI_USE_GCA`,
    );
    process.exit(1);
  }

  if (!useExternalAuth) {
    const err = validateAuthMethod(effectiveAuthType);
    if (err != null) {
      console.error(err);
      process.exit(1);
    }
  }

  await nonInteractiveConfig.refreshAuth(effectiveAuthType);
  return nonInteractiveConfig;
}
