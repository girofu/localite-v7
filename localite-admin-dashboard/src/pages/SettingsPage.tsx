/**
 * 系統設定頁面
 */

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage: React.FC = () => {
  const { permissions } = useAuth();

  if (!permissions?.canManageSystem) {
    return (
      <Box>
        <Alert severity="error">
          您沒有管理系統設定的權限
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        系統設定
      </Typography>
      <Typography variant="body1" color="text.secondary">
        系統設定功能開發中...
      </Typography>
    </Box>
  );
};

export default SettingsPage;
