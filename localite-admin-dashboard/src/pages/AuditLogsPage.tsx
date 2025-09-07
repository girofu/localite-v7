/**
 * 稽核日誌頁面
 */

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const AuditLogsPage: React.FC = () => {
  const { permissions } = useAuth();

  if (!permissions?.canAuditLogs) {
    return (
      <Box>
        <Alert severity="error">
          您沒有查看稽核日誌的權限
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        稽核日誌
      </Typography>
      <Typography variant="body1" color="text.secondary">
        稽核日誌功能開發中...
      </Typography>
    </Box>
  );
};

export default AuditLogsPage;
