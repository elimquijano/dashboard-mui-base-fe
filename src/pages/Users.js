import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'admin@berry.com',
    role: 'Super Admin',
    status: 'active',
    lastLogin: '2024-01-15',
    avatar: 'JD',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'manager@berry.com',
    role: 'Manager',
    status: 'active',
    lastLogin: '2024-01-14',
    avatar: 'JS',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'editor@berry.com',
    role: 'Content Editor',
    status: 'inactive',
    lastLogin: '2024-01-10',
    avatar: 'MJ',
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'user@berry.com',
    role: 'Basic User',
    status: 'active',
    lastLogin: '2024-01-13',
    avatar: 'SW',
  },
  {
    id: '5',
    name: 'Tom Brown',
    email: 'analyst@berry.com',
    role: 'Data Analyst',
    status: 'active',
    lastLogin: '2024-01-12',
    avatar: 'TB',
  },
];

export const Users = () => {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Basic User',
    status: 'active',
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (user) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'Basic User',
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      // Update existing user
      setUsers(prev => prev.map(user =>
        user.id === editingUser.id
          ? { ...user, ...formData }
          : user
      ));
    } else {
      // Add new user
      const newUser = {
        id: Date.now().toString(),
        ...formData,
        lastLogin: new Date().toISOString().split('T')[0],
        avatar: formData.name.split(' ').map(n => n.charAt(0)).join(''),
      };
      setUsers(prev => [...prev, newUser]);
    }
    handleCloseDialog();
  };

  const handleDeleteUser = (userId) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Super Admin':
        return 'error';
      case 'Manager':
        return 'warning';
      case 'Content Editor':
        return 'info';
      case 'Data Analyst':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Users
        </Typography>
        {hasPermission('users.create') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)',
            }}
          >
            Add User
          </Button>
        )}
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: 400 }}
            />
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {user.avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {user.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={getRoleColor(user.role)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        size="small"
                        color={getStatusColor(user.status)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell align="right">
                      {hasPermission('users.edit') && (
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(user)}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      {hasPermission('users.delete') && (
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteUser(user.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                >
                  <MenuItem value="Basic User">Basic User</MenuItem>
                  <MenuItem value="Content Editor">Content Editor</MenuItem>
                  <MenuItem value="Data Analyst">Data Analyst</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                  <MenuItem value="Super Admin">Super Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={!formData.name || !formData.email}
            sx={{
              background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)',
            }}
          >
            {editingUser ? 'Update' : 'Add'} User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};