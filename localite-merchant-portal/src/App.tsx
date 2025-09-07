/**
 * 商家系統主應用組件
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';

// 創建主題
const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50', // 綠色主題，區別於管理員系統的藍色
    },
    secondary: {
      main: '#FF9800',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// 簡單的商家布局
const MerchantLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { merchant, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Localite 商家管理系統 - {merchant?.businessName}
          </Typography>
          <Button color="inherit" onClick={handleSignOut}>
            登出
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

// 受保護的路由組件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isMerchant, loading } = useAuth();

  if (loading) {
    return <div>載入中...</div>;
  }

  if (!user || !isMerchant) {
    return <Navigate to="/login" replace />;
  }

  return <MerchantLayout>{children}</MerchantLayout>;
};

// 主要路由組件
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;