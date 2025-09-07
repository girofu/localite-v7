/**
 * 用戶管理頁面
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit,
  Refresh,
  Search,
} from '@mui/icons-material';
import { AdminService } from '../services/AdminService';
import { User, AdminRole } from '../types/admin.types';
import { useAuth } from '../contexts/AuthContext';

const UsersPage: React.FC = () => {
  const { permissions } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [error, setError] = useState('');

  const adminService = AdminService.getInstance();

  useEffect(() => {
    loadUsers();
  }, [searchText, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersList = await adminService.getUsers(searchText, roleFilter);
      setUsers(usersList);
      setError('');
    } catch (error) {
      console.error('載入用戶失敗:', error);
      setError('載入用戶列表失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      await adminService.updateUser(selectedUser.uid, selectedUser);
      setEditDialogOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (error) {
      console.error('更新用戶失敗:', error);
      setError('更新用戶失敗');
    }
  };

  const handleRoleChange = async (userId: string, newRole: AdminRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      await loadUsers();
    } catch (error) {
      console.error('更新用戶角色失敗:', error);
      setError('更新用戶角色失敗');
    }
  };

  const getRoleColor = (role: string) => {
    const colorMap: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'error' } = {
      'super_admin': 'error',
      'user_manager': 'warning',
      'merchant_manager': 'success',
      'analyst': 'primary',
      'auditor': 'secondary',
      'tourist': 'default',
      'merchant': 'success'
    };
    return colorMap[role] || 'default';
  };

  const getRoleText = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'super_admin': '超級管理員',
      'user_manager': '用戶管理員',
      'merchant_manager': '商家管理員',
      'analyst': '分析師',
      'auditor': '稽核員',
      'tourist': '遊客',
      'merchant': '商家'
    };
    return roleMap[role] || role;
  };

  if (!permissions?.canViewUsers) {
    return (
      <Box>
        <Alert severity="error">
          您沒有查看用戶的權限
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        用戶管理
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 搜索和篩選 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="搜索用戶"
            placeholder="輸入 email 或姓名"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
            }}
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>角色篩選</InputLabel>
            <Select
              value={roleFilter}
              label="角色篩選"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="all">全部</MenuItem>
              <MenuItem value="tourist">遊客</MenuItem>
              <MenuItem value="merchant">商家</MenuItem>
              <MenuItem value="user_manager">用戶管理員</MenuItem>
              <MenuItem value="merchant_manager">商家管理員</MenuItem>
              <MenuItem value="analyst">分析師</MenuItem>
              <MenuItem value="super_admin">超級管理員</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={loadUsers}
            startIcon={<Refresh />}
            disabled={loading}
          >
            刷新
          </Button>
        </Box>
      </Paper>

      {/* 用戶列表 */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>顯示名稱</TableCell>
                <TableCell>角色</TableCell>
                <TableCell>狀態</TableCell>
                <TableCell>註冊時間</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    沒有找到用戶
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.displayName || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleText(user.role)}
                        color={getRoleColor(user.role) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? '啟用' : '停用'}
                        color={user.isActive ? 'success' : 'error'}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.createdAt?.toDate?.().toLocaleDateString() || '-'}
                    </TableCell>
                    <TableCell>
                      {permissions?.canEditUsers && (
                        <IconButton
                          size="small"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 編輯用戶對話框 */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>編輯用戶</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Email"
                value={selectedUser.email}
                disabled
                margin="normal"
              />
              <TextField
                fullWidth
                label="顯示名稱"
                value={selectedUser.displayName || ''}
                onChange={(e) => setSelectedUser({
                  ...selectedUser,
                  displayName: e.target.value
                })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>角色</InputLabel>
                <Select
                  value={selectedUser.role}
                  label="角色"
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    role: e.target.value
                  })}
                >
                  <MenuItem value="tourist">遊客</MenuItem>
                  <MenuItem value="merchant">商家</MenuItem>
                  <MenuItem value="user_manager">用戶管理員</MenuItem>
                  <MenuItem value="merchant_manager">商家管理員</MenuItem>
                  <MenuItem value="analyst">分析師</MenuItem>
                  <MenuItem value="super_admin">超級管理員</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedUser.isActive}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      isActive: e.target.checked
                    })}
                  />
                }
                label="帳號啟用"
                sx={{ mt: 1 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSaveUser} variant="contained">
            儲存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;
