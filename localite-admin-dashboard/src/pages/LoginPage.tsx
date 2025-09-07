/**
 * 管理員登入頁面
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Avatar,
  CssBaseline,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // 如果已經登入且是管理員，重定向到儀表板
  useEffect(() => {
    if (user && isAdmin && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      // 登入成功後，AuthContext 會檢查管理員權限
      // 如果是管理員，useEffect 會自動導向儀表板
    } catch (error: any) {
      console.error('登入錯誤:', error);
      
      // 處理不同的錯誤類型
      if (error.code === 'auth/user-not-found') {
        setError('找不到此用戶帳號');
      } else if (error.code === 'auth/wrong-password') {
        setError('密碼錯誤');
      } else if (error.code === 'auth/invalid-email') {
        setError('電子郵件格式錯誤');
      } else if (error.code === 'auth/too-many-requests') {
        setError('登入嘗試次數過多，請稍後再試');
      } else {
        setError('登入失敗，請檢查您的帳號密碼');
      }
    } finally {
      setLoading(false);
    }
  };

  // 如果正在載入認證狀態，顯示載入中
  if (authLoading) {
    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography>載入中...</Typography>
        </Box>
      </Container>
    );
  }

  // 如果已登入但不是管理員
  if (user && !isAdmin && !authLoading) {
    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper elevation={3} sx={{ padding: 4, textAlign: 'center' }}>
            <Typography variant="h5" color="error" gutterBottom>
              存取被拒絕
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              您沒有管理員權限，無法存取此系統。
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => {
                // 登出並返回登入頁面
                signIn('', '').catch(() => {});
              }}
            >
              返回登入
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
              <LockOutlined />
            </Avatar>
            <Typography component="h1" variant="h5">
              Localite 管理員登入
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="管理員電子郵件"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="密碼"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading || !email || !password}
              >
                {loading ? '登入中...' : '登入'}
              </Button>
            </Box>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                請使用管理員帳號登入系統
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                測試帳號: girofu@gmail.com
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
