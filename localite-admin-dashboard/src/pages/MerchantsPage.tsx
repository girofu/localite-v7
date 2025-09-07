/**
 * 商家管理頁面
 */

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const MerchantsPage: React.FC = () => {
  const { permissions } = useAuth();

  if (!permissions?.canViewMerchants) {
    return (
      <Box>
        <Alert severity="error">
          您沒有查看商家的權限
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        商家管理
      </Typography>
      <Typography variant="body1" color="text.secondary">
        商家管理功能開發中...
      </Typography>
    </Box>
  );
};

export default MerchantsPage;
