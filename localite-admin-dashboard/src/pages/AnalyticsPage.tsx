/**
 * 系統分析頁面
 */

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const AnalyticsPage: React.FC = () => {
  const { permissions } = useAuth();

  if (!permissions?.canViewAnalytics) {
    return (
      <Box>
        <Alert severity="error">
          您沒有查看系統分析的權限
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        系統分析
      </Typography>
      <Typography variant="body1" color="text.secondary">
        系統分析功能開發中...
      </Typography>
    </Box>
  );
};

export default AnalyticsPage;
