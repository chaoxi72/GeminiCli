/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import type { LoadedSettings } from '../../config/settings.js';
import { SettingScope } from '../../config/settings.js';
import { AuthType, type Config } from '@google/gemini-cli-core';
import {
  clearCachedCredentialFile,
  getErrorMessage,
} from '@google/gemini-cli-core';
import { runExitCleanup } from '../../utils/cleanup.js';

function isInitAuth(settings: LoadedSettings) {
  // 检查是否设置了绕过认证的环境变量
  if (process.env['BYPASS_AUTH'] === 'true') {
    return false; // 不显示认证对话框
  }
  
  if (process.env['USE_CUSTOM_LLM'] && process.env['USE_CUSTOM_LLM'] !== 'false') {
    return false;
  }
  if (settings.merged.security?.auth?.selectedType !== AuthType.CUSTOM_LLM_API) {
    return !settings.merged.security?.auth?.selectedType === undefined;
  }
  return true;
}

export const useAuthCommand = (
  settings: LoadedSettings,
  setAuthError: (error: string | null) => void,
  config: Config,
) => {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(
    isInitAuth(settings),
  );
  // const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(
  //   settings.merged.security?.auth?.selectedType === undefined,
  // );

  const openAuthDialog = useCallback(() => {
    setIsAuthDialogOpen(true);
  }, []);

  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const authFlow = async () => {
      // 检查是否设置了绕过认证
      if (process.env['BYPASS_AUTH'] === 'true') {
        console.log('Authentication bypassed via BYPASS_AUTH environment variable.');
        // 如果使用自定义模型，自动设置认证类型
        if (process.env['USE_CUSTOM_LLM'] === 'true') {
          settings.setValue(SettingScope.User, 'security.auth.selectedType', AuthType.CUSTOM_LLM_API);
          console.log('Using custom LLM API as specified.');
        }
        return;
      }
      
      const authType = settings.merged.security?.auth?.selectedType;
      if (isAuthDialogOpen || !authType) {
        return;
      }

      try {
        setIsAuthenticating(true);
        await config.refreshAuth(authType);
        console.log(`Authenticated via "${authType}".`);
      } catch (e) {
        setAuthError(`Failed to login. Message: ${getErrorMessage(e)}`);
        openAuthDialog();
      } finally {
        setIsAuthenticating(false);
      }
    };

    void authFlow();
  }, [isAuthDialogOpen, settings, config, setAuthError, openAuthDialog]);

  const handleAuthSelect = useCallback(
    async (authType: AuthType | undefined, scope: SettingScope) => {
      if (authType) {
        await clearCachedCredentialFile();

        settings.setValue(scope, 'security.auth.selectedType', authType);
        if (
          authType === AuthType.LOGIN_WITH_GOOGLE &&
          config.isBrowserLaunchSuppressed()
        ) {
          runExitCleanup();
          console.log(
            `
----------------------------------------------------------------
Logging in with Google... Please restart Gemini CLI to continue.
----------------------------------------------------------------
            `,
          );
          process.exit(0);
        }
      }
      setIsAuthDialogOpen(false);
      setAuthError(null);
    },
    [settings, setAuthError, config],
  );

  const cancelAuthentication = useCallback(() => {
    setIsAuthenticating(false);
  }, []);

  return {
    isAuthDialogOpen,
    openAuthDialog,
    handleAuthSelect,
    isAuthenticating,
    cancelAuthentication,
  };
};
