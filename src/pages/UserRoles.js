import React, { useState, useEffect } from 'react';
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
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/formatters';
import Swal from 'sweetalert2';

const mockRoles = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    permissions: ['dashboard.view', 'dashboard.analytics', 'users.view', 'users.create', 'users.edit', 'users.delete', 'users.roles', 'users.permissions'],
    userCount: 1,
    status: 'active',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Manager',
    description: 'Management level access with limited permissions',
    permissions: ['dashboard.view', 'dashboard.analytics', 'users.view', 'users.edit'],
    userCount: 3,
    status: 'active',
    createdAt: '2024-01-02',
  },
  {
    id: '3',
    name: 'Content Editor',
    description: 'Content management and editing permissions',
    permissions: ['dashboard.view', 'content.view', 'content.create', 'content.edit'],
    userCount: 5,
    status: 'active',
    createdAt: '2024-01-03',
  },
  {
    id: '4',
    name: 'Basic User',
    description: 'Basic access with minimal permissions',
    permissions: ['dashboard.view'],
    userCount: 12,
    status: 'active',
    createdAt: '2024-01-04',
  },
];

const availablePermissions = [
  { id: 'dashboard.view', name: 'View Dashboard', module: 'Dashboard' },
  { id: 'dashboard.analytics', name: 'View Analytics', module: 'Dashboard' },
  { id: 'users.view', name: 'View Users', module: 'Users' },
  { id: 'users.create', name: 'Create Users', module: 'Users' },
  { id: 'users.edit', name: 'Edit Users', module: 'Users' },
  { id: 'users.delete', name: 'Delete Users', module: 'Users' },
  { id: 'users.roles', name: 'Manage Roles', module: 'Users' },
  { id: 'users.permissions', name: 'Manage Permissions', module: 'Users' },
  { id: 'content.view', name: 'View Content', module: 'Content' },
  { id: 'content.create', name: 'Create Content', module: 'Content' },
  { id: 'content.edit', name: 'Edit Content', module: 'Content' },
  { id: 'content.delete', name: 'Delete Content', module: 'Content' },
];

export const UserRoles = () => {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState(mockRoles);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
    status: 'active',
  });

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        status: role.status,
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: [],
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRole(null);
  };

  const handleSaveRole = () => {
    if (editingRole) {
      // Update existing role
      setRoles(prev => prev.map(role =>
        role.id === editingRole.id
          ? { ...role, ...formData }
          : role
      ));
      
      Swal.fire({
        title: 'Role Updated!',
        text: 'The role has been updated successfully.',
        icon: 'success',
        confirmButtonColor: '#673ab7',
      });
    } else {
      // Add new role
      const newRole = {
        id: Date.now().toString(),
        ...formData,
        userCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setRoles(prev => [...prev, newRole]);
      
      Swal.fire({
        title: 'Role Created!',
        text: 'The new role has been created successfully.',
        icon: 'success',
        confirmButtonColor: '#673ab7',
      });
    }
    handleCloseDialog();
  };

  const handleDeleteRole = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    
    if (role.userCount > 0) {
      Swal.fire({
        title: 'Cannot Delete Role',
        text: `This role is assigned to ${role.userCount} user(s). Please reassign users before deleting.`,
        icon: 'warning',
        confirmButtonColor: '#673ab7',
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#673ab7',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setRoles(prev => prev.filter(role => role.id !== roleId));
        Swal.fire({
          title: 'Deleted!',
          text: 'The role has been deleted.',
          icon: 'success',
          confirmButtonColor: '#673ab7',
        });
      }
    });
  };

  const handlePermissionChange = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'default';
  };

  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {});

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          User Roles
        </Typography>
        {hasPermission('users.roles') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)',
            }}
          >
            Add Role
          </Button>
        )}
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search roles..."
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
                  <TableCell>Role Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Users</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SecurityIcon color="primary" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {role.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {role.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {role.permissions.length} permissions
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${role.userCount} users`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={role.status}
                        size="small"
                        color={getStatusColor(role.status)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>{formatDate(role.createdAt)}</TableCell>
                    <TableCell align="right">
                      {hasPermission('users.roles') && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(role)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRole(role.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Role Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRole ? 'Edit Role' : 'Add New Role'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Role Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Permissions
              </Typography>
              {Object.entries(groupedPermissions).map(([module, permissions]) => (
                <Box key={module} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    {module}
                  </Typography>
                  <List dense>
                    {permissions.map((permission) => (
                      <ListItem key={permission.id} sx={{ py: 0 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.permissions.includes(permission.id)}
                              onChange={() => handlePermissionChange(permission.id)}
                            />
                          }
                          label={permission.name}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Divider />
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveRole}
            variant="contained"
            disabled={!formData.name || !formData.description}
            sx={{
              background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)',
            }}
          >
            {editingRole ? 'Update' : 'Create'} Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};