/**
 * 商家儀表板頁面
 */

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { merchant } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified': return '已驗證';
      case 'pending': return '待審核';
      case 'rejected': return '已駁回';
      default: return status;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        商家儀表板
      </Typography>
      
      {merchant && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            歡迎回來，{merchant.businessName}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {merchant.email}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={`狀態: ${getStatusText(merchant.status)}`}
              color={getStatusColor(merchant.status) as any}
              variant="outlined"
            />
            <Chip 
              label={`業務類型: ${merchant.businessType}`}
              variant="outlined"
              sx={{ ml: 1 }}
            />
          </Box>
          {merchant.businessDescription && (
            <Typography variant="body2" color="text.secondary">
              {merchant.businessDescription}
            </Typography>
          )}
        </Paper>
      )}

      <Grid container spacing={3}>
        <Grid size={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                商品管理
              </Typography>
              <Typography variant="body2" color="text.secondary">
                管理您的商品和服務項目
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                訂單管理
              </Typography>
              <Typography variant="body2" color="text.secondary">
                查看和處理客戶訂單
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                營業分析
              </Typography>
              <Typography variant="body2" color="text.secondary">
                查看銷售統計和分析報告
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                個人資料
              </Typography>
              <Typography variant="body2" color="text.secondary">
                管理商家基本資訊和設定
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
