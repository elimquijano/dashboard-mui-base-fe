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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { TreeView, TreeItem } from '@mui/x-tree-view';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  Article as ArticleIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { modulesAPI } from '../utils/api';
import { formatDate } from '../utils/formatters';
import Swal from 'sweetalert2';

const moduleTypes = [
  { value: 'module', label: 'Module', icon: <FolderIcon /> },
  { value: 'group', label: 'Group', icon: <FolderIcon /> },
  { value: 'page', label: 'Page', icon: <ArticleIcon /> },
  { value: 'button', label: 'Button', icon: <SettingsIcon /> },
];

const statusOptions = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'default' },
];

export const Modules = () => {
  const { hasPermission } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [treeData, setTreeData] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    sort_order: 0,
    parent_id: null,
    type: 'module',
    status: 'active',
  });

  useEffect(() => {
    loadModules();
    loadModuleTree();
  }, []);

  const loadModules = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        status: statusFilter,
        type: typeFilter,
      };
      const response = await modulesAPI.getAll(params);
      setModules(response.data.data || []);
    } catch (error) {
      console.error('Error loading modules:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to load modules.',
        icon: 'error',
        confirmButtonColor: '#673ab7',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadModuleTree = async () => {
    try {
      const response = await modulesAPI.getTree();
      setTreeData(response.data || []);
    } catch (error) {
      console.error('Error loading module tree:', error);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      loadModules();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, statusFilter, typeFilter]);

  const handleOpenDialog = (module) => {
    if (module) {
      setEditingModule(module);
      setFormData({
        name: module.name,
        slug: module.slug,
        description: module.description || '',
        icon: module.icon || '',
        sort_order: module.sort_order || 0,
        parent_id: module.parent_id,
        type: module.type,
        status: module.status,
      });
    } else {
      setEditingModule(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: '',
        sort_order: 0,
        parent_id: null,
        type: 'module',
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingModule(null);
  };

  const handleSaveModule = async () => {
    try {
      if (editingModule) {
        await modulesAPI.update(editingModule.id, formData);
        Swal.fire({
          title: 'Module Updated!',
          text: 'The module has been updated successfully.',
          icon: 'success',
          confirmButtonColor: '#673ab7',
        });
      } else {
        await modulesAPI.create(formData);
        Swal.fire({
          title: 'Module Created!',
          text: 'The new module has been created successfully.',
          icon: 'success',
          confirmButtonColor: '#673ab7',
        });
      }
      handleCloseDialog();
      loadModules();
      loadModuleTree();
    } catch (error) {
      console.error('Error saving module:', error);
      Swal.fire({
        title: 'Error!',
        text: 'There was an error saving the module.',
        icon: 'error',
        confirmButtonColor: '#673ab7',
      });
    }
  };

  const handleDeleteModule = async (moduleId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone. All child modules will also be deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#673ab7',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await modulesAPI.delete(moduleId);
        Swal.fire({
          title: 'Deleted!',
          text: 'The module has been deleted.',
          icon: 'success',
          confirmButtonColor: '#673ab7',
        });
        loadModules();
        loadModuleTree();
      } catch (error) {
        console.error('Error deleting module:', error);
        Swal.fire({
          title: 'Error!',
          text: 'There was an error deleting the module.',
          icon: 'error',
          confirmButtonColor: '#673ab7',
        });
      }
    }
  };

  const getStatusColor = (status) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return statusConfig ? statusConfig.color : 'default';
  };

  const getTypeIcon = (type) => {
    const typeConfig = moduleTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : <FolderIcon />;
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (value) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: generateSlug(value),
    }));
  };

  const renderTreeItem = (node) => (
    <TreeItem
      key={node.id}
      nodeId={node.id.toString()}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
          {getTypeIcon(node.type)}
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {node.name}
          </Typography>
          <Chip
            label={node.type}
            size="small"
            variant="outlined"
            sx={{ ml: 1 }}
          />
          <Chip
            label={node.status}
            size="small"
            color={getStatusColor(node.status)}
            sx={{ ml: 0.5 }}
          />
        </Box>
      }
    >
      {node.children && node.children.map(child => renderTreeItem(child))}
    </TreeItem>
  );

  const parentModules = modules.filter(module => !module.parent_id);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          System Modules
        </Typography>
        {hasPermission('system.settings') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)',
            }}
          >
            Add Module
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Module Tree */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Module Hierarchy
              </Typography>
              {treeData.length > 0 ? (
                <TreeView
                  defaultCollapseIcon={<ExpandMoreIcon />}
                  defaultExpandIcon={<ChevronRightIcon />}
                  sx={{ flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
                >
                  {treeData.map(node => renderTreeItem(node))}
                </TreeView>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No modules found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Module List */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search modules..."
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
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={typeFilter}
                      label="Type"
                      onChange={(e) => setTypeFilter(e.target.value)}
                    >
                      <MenuItem value="">All Types</MenuItem>
                      {moduleTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      {statusOptions.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Module</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Parent</TableCell>
                      <TableCell>Order</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {modules.map((module) => (
                      <TableRow key={module.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getTypeIcon(module.type)}
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {module.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {module.slug}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={module.type}
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          {module.parent ? (
                            <Typography variant="body2">
                              {module.parent.name}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Root
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{module.sort_order}</TableCell>
                        <TableCell>
                          <Chip
                            label={module.status}
                            size="small"
                            color={getStatusColor(module.status)}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>{formatDate(module.created_at)}</TableCell>
                        <TableCell align="right">
                          {hasPermission('system.settings') && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(module)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteModule(module.id)}
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
        </Grid>
      </Grid>

      {/* Add/Edit Module Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingModule ? 'Edit Module' : 'Add New Module'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Module Name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                helperText="URL-friendly identifier"
              />
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Icon"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                helperText="Material-UI icon name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sort Order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Parent Module</InputLabel>
                <Select
                  value={formData.parent_id || ''}
                  label="Parent Module"
                  onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value || null }))}
                >
                  <MenuItem value="">None (Root Level)</MenuItem>
                  {parentModules.map((module) => (
                    <MenuItem key={module.id} value={module.id}>
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
                  {moduleTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveModule}
            variant="contained"
            disabled={!formData.name || !formData.slug}
            sx={{
              background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)',
            }}
          >
            {editingModule ? 'Update' : 'Create'} Module
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};