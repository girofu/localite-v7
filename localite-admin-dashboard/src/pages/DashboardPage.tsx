/**
 * 管理員儀表板頁面
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  People,
  Business,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
  Analytics,
  Settings,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AdminService } from '../services/AdminService';
import { SystemStats } from '../types/admin.types';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, adminRole, permissions } = useAuth();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  const adminService = AdminService.getInstance();

  const loadDashboardData = useCallback(async () => {
    try {
      const systemStats = await adminService.getSystemStats();
      setStats(systemStats);
    } catch (error) {
      console.error('載入儀表板數據失敗:', error);
    } finally {
      setLoading(false);
    }
  }, [adminService]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const StatCard: React.FC<{
    title: string;
    value: number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    onClick?: () => void;
  }> = ({ title, value, subtitle, icon, color, onClick }) => (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { elevation: 4 } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ color: color, mr: 1 }}>
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ color: color, fontWeight: 'bold' }}>
          {value.toLocaleString()}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    action: string;
    onClick: () => void;
    disabled?: boolean;
  }> = ({ title, description, icon, action, onClick, disabled = false }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={onClick}
          disabled={disabled}
        >
          {action}
        </Button>
      </CardActions>
    </Card>
  );

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          載入儀表板中...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* 歡迎區域 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          歡迎回來，管理員
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {user?.displayName || user?.email} | 角色: {adminRole}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Chip 
            label={`權限等級: ${adminRole}`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label="系統狀態: 正常" 
            color="success" 
            variant="outlined" 
            sx={{ ml: 1 }}
          />
        </Box>
      </Paper>

      {/* 核心指標 */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        核心指標
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            title="總用戶數"
            value={stats?.users.total || 0}
            subtitle={`活躍用戶: ${stats?.users.active || 0}`}
            icon={<People />}
            color="#2196F3"
            onClick={() => permissions?.canViewUsers && navigate('/users')}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            title="總商家數"
            value={stats?.merchants.total || 0}
            subtitle={`已驗證: ${stats?.merchants.verified || 0}`}
            icon={<Business />}
            color="#4CAF50"
            onClick={() => permissions?.canViewMerchants && navigate('/merchants')}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            title="今日新增"
            value={stats?.users.newToday || 0}
            subtitle="新用戶註冊"
            icon={<TrendingUp />}
            color="#FF9800"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            title="待審核"
            value={stats?.merchants.pending || 0}
            subtitle="商家申請"
            icon={<Schedule />}
            color="#F44336"
            onClick={() => permissions?.canViewMerchants && navigate('/merchants?status=pending')}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* 快速操作 */}
        <Grid xs={12} md={8}>
          <Typography variant="h5" gutterBottom>
            快速操作
          </Typography>
          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <QuickActionCard
                title="用戶管理"
                description="查看和管理所有用戶帳號"
                icon={<People color="primary" />}
                action="進入管理"
                onClick={() => navigate('/users')}
                disabled={!permissions?.canViewUsers}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <QuickActionCard
                title="商家管理"
                description="審核和管理商家申請"
                icon={<Business color="primary" />}
                action="進入管理"
                onClick={() => navigate('/merchants')}
                disabled={!permissions?.canViewMerchants}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <QuickActionCard
                title="系統分析"
                description="查看系統使用統計和分析"
                icon={<Analytics color="primary" />}
                action="查看分析"
                onClick={() => navigate('/analytics')}
                disabled={!permissions?.canViewAnalytics}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <QuickActionCard
                title="系統設定"
                description="配置系統參數和設定"
                icon={<Settings color="primary" />}
                action="進入設定"
                onClick={() => navigate('/settings')}
                disabled={!permissions?.canManageSystem}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* 系統狀態 */}
        <Grid xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            系統狀態
          </Typography>
          <Paper sx={{ p: 2 }}>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="資料庫狀態"
                  secondary="正常運行"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="API 服務"
                  secondary={`平均回應: ${stats?.performance.avgResponseTime}ms`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="快取系統"
                  secondary={`命中率: ${stats?.performance.cacheHitRate.toFixed(1)}%`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  {(stats?.performance.errorRate || 0) > 5 ? (
                    <Warning color="warning" />
                  ) : (
                    <CheckCircle color="success" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary="錯誤率"
                  secondary={`${stats?.performance.errorRate.toFixed(2)}%`}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
