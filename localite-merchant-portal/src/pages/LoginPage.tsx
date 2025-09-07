/**
 * 商家登入頁面
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
import { Business } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, user, isMerchant, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // 如果已經登入且是商家，重定向到儀表板
  useEffect(() => {
    if (user && isMerchant && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, isMerchant, authLoading, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      // 登入成功後，AuthContext 會檢查商家權限
    } catch (error: any) {
      console.error('登入錯誤:', error);
      
      if (error.code === 'auth/user-not-found') {
        setError('找不到此商家帳號');
      } else if (error.code === 'auth/wrong-password') {
        setError('密碼錯誤');
      } else if (error.code === 'auth/invalid-email') {
        setError('電子郵件格式錯誤');
      } else {
        setError('登入失敗，請檢查您的帳號密碼');
      }
    } finally {
      setLoading(false);
    }
  };

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

  // 如果已登入但不是商家
  if (user && !isMerchant && !authLoading) {
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
              此帳號不是商家帳號，無法存取商家管理系統。
            </Typography>
            <Button variant="outlined" onClick={() => window.location.reload()}>
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
            <Avatar sx={{ m: 1, bgcolor: 'success.main' }}>
              <Business />
            </Avatar>
            <Typography component="h1" variant="h5">
              Localite 商家登入
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
                label="商家電子郵件"
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
                請使用您的商家帳號登入系統
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                如需註冊商家帳號，請聯繫系統管理員
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
