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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Article as ArticleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/formatters';
import Swal from 'sweetalert2';

const mockPermissions = [
  // Dashboard Module
  { id: '1', name: 'dashboard.view', displayName: 'View Dashboard', module: 'Dashboard', type: 'view', description: 'Access to main dashboard', createdAt: '2024-01-01' },
  { id: '2', name: 'dashboard.analytics', displayName: 'View Analytics', module: 'Dashboard', type: 'view', description: 'Access to analytics dashboard', createdAt: '2024-01-01' },
  
  // Users Module
  { id: '3', name: 'users.view', displayName: 'View Users', module: 'Users', type: 'view', description: 'View user list and details', createdAt: '2024-01-01' },
  { id: '4', name: 'users.create', displayName: 'Create Users', module: 'Users', type: 'create', description: 'Create new users', createdAt: '2024-01-01' },
  { id: '5', name: 'users.edit', displayName: 'Edit Users', module: 'Users', type: 'edit', description: 'Edit existing users', createdAt: '2024-01-01' },
  { id: '6', name: 'users.delete', displayName: 'Delete Users', module: 'Users', type: 'delete', description: 'Delete users', createdAt: '2024-01-01' },
  { id: '7', name: 'users.roles', displayName: 'Manage Roles', module: 'Users', type: 'manage', description: 'Manage user roles', createdAt: '2024-01-01' },
  { id: '8', name: 'users.permissions', displayName: 'Manage Permissions', module: 'Users', type: 'manage', description: 'Manage user permissions', createdAt: '2024-01-01' },
  
  // Content Module
  { id: '9', name: 'content.view', displayName: 'View Content', module: 'Content', type: 'view', description: 'View content items', createdAt: '2024-01-01' },
  { id: '10', name: 'content.create', displayName: 'Create Content', module: 'Content', type: 'create', description: 'Create new content', createdAt: '2024-01-01' },
  { id: '11', name: 'content.edit', displayName: 'Edit Content', module: 'Content', type: 'edit', description: 'Edit existing content', createdAt: '2024-01-01' },
  { id: '12', name: 'content.delete', displayName: 'Delete Content', module: 'Content', type: 'delete', description: 'Delete content', createdAt: '2024-01-01' },
  
  // System Module
  { id: '13', name: 'system.settings', displayName: 'System Settings', module: 'System', type: 'manage', description: 'Access system settings', createdAt: '2024-01-01' },
  { id: '14', name: 'system.logs', displayName: 'System Logs', module: 'System', type: 'view', description: 'View system logs', createdAt: '2024-01-01' },
  { id: '15', name: 'system.backup', displayName: 'System Backup', module: 'System', type: 'manage', description: 'Manage system backups', createdAt: '2024-01-01' },
];

const modules = [
  { name: 'Dashboard', icon: <DashboardIcon />, color: '#673ab7' },
  { name: 'Users', icon: <PeopleIcon />, color: '#2196f3' },
  { name: 'Content', icon: <ArticleIcon />, color: '#4caf50' },
  { name: 'System', icon: <SettingsIcon />, color: '#ff9800' },
];

const permissionTypes = [
  { value: 'view', label: 'View', color: 'info' },
  { value: 'create', label: 'Create', color: 'success' },
  { value: 'edit', label: 'Edit', color: 'warning' },
  { value: 'delete', label: 'Delete', color: 'error' },
  { value: 'manage', label: 'Manage', color: 'primary' },
];

export const UserPermissions = () => {
  const { hasPermission } = useAuth();
  const [permissions, setPermissions] = useState(mockPermissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    module: '',
    type: 'view',
    description: '',
  });

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = !selectedModule || permission.module === selectedModule;
    const matchesType = !selectedType || permission.type === selectedType;
    
    return matchesSearch && matchesModule && matchesType;
  });

  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {});

  const handleOpenDialog = (permission) => {
    if (permission) {
      setEditingPermission(permission);
      setFormData({
        name: permission.name,
        displayName: permission.displayName,
        module: permission.module,
        type: permission.type,
        description: permission.description,
      });
    } else {
      setEditingPermission(null);
      setFormData({
        name: '',
        displayName: '',
        module: '',
        type: 'view',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPermission(null);
  };

  const handleSavePermission = () => {
    if (editingPermission) {
      // Update existing permission
      setPermissions(prev => prev.map(permission =>
        permission.id === editingPermission.id
          ? { ...permission, ...formData }
          : permission
      ));
      
      Swal.fire({
        title: 'Permission Updated!',
        text: 'The permission has been updated successfully.',
        icon: 'success',
        confirmButtonColor: '#673ab7',
      });
    } else {
      // Add new permission
      const newPermission = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setPermissions(prev => [...prev, newPermission]);
      
      Swal.fire({
        title: 'Permission Created!',
        text: 'The new permission has been created successfully.',
        icon: 'success',
        confirmButtonColor: '#673ab7',
      });
    }
    handleCloseDialog();
  };

  const handleDeletePermission = (permissionId) => {
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
        setPermissions(prev => prev.filter(permission => permission.id !== permissionId));
        Swal.fire({
          title: 'Deleted!',
          text: 'The permission has been deleted.',
          icon: 'success',
          confirmButtonColor: '#673ab7',
        });
      }
    });
  };

  const getTypeColor = (type) => {
    const typeConfig = permissionTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.color : 'default';
  };

  const getModuleIcon = (moduleName) => {
    const module = modules.find(m => m.name === moduleName);
    return module ? module.icon : <SecurityIcon />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          User Permissions
        </Typography>
        {hasPermission('users.permissions') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)',
            }}
          >
            Add Permission
          </Button>
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Module</InputLabel>
                <Select
                  value={selectedModule}
                  label="Module"
                  onChange={(e) => setSelectedModule(e.target.value)}
                >
                  <MenuItem value="">All Modules</MenuItem>
                  {modules.map((module) => (
                    <MenuItem key={module.name} value={module.name}>
                      {module.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={selectedType}
                  label="Type"
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  {permissionTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Grouped Permissions */}
      {Object.entries(groupedPermissions).map(([moduleName, modulePermissions]) => (
        <Accordion key={moduleName} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getModuleIcon(moduleName)}
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {moduleName} ({modulePermissions.length})
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Permission</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modulePermissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {permission.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {permission.displayName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={permission.type}
                          size="small"
                          color={getTypeColor(permission.type)}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {permission.description}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(permission.createdAt)}</TableCell>
                      <TableCell align="right">
                        {hasPermission('users.permissions') && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(permission)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeletePermission(permission.id)}
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
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Add/Edit Permission Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPermission ? 'Edit Permission' : 'Add New Permission'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Permission Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., users.view"
                helperText="Use dot notation (module.action)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Display Name"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="e.g., View Users"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Module</InputLabel>
                <Select
                  value={formData.module}
                  label="Module"
                  onChange={(e) => setFormData(prev => ({ ...prev, module: e.target.value }))}
                >
                  {modules.map((module) => (
                    <MenuItem key={module.name} value={module.name}>
                      {module.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                >
                  {permissionTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
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
                placeholder="Describe what this permission allows"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSavePermission}
            variant="contained"
            disabled={!formData.name || !formData.displayName || !formData.module}
            sx={{
              background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)',
            }}
          >
            {editingPermission ? 'Update' : 'Create'} Permission
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};