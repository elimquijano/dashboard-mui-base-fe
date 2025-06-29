import axios from 'axios';
import Swal from 'sweetalert2';

// Configuración base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403) {
      Swal.fire({
        title: 'Access Denied',
        text: 'You do not have permission to perform this action.',
        icon: 'error',
        confirmButtonColor: '#673ab7',
      });
    }
    
    return Promise.reject(error);
  }
);

// Funciones de API para autenticación
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  refreshToken: () => api.post('/auth/refresh'),
  me: () => api.get('/auth/me'),
};

// Funciones de API para usuarios
export const usersAPI = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  updateStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
  assignRoles: (id, roleIds) => api.post(`/users/${id}/roles`, { role_ids: roleIds }),
};

// Funciones de API para roles
export const rolesAPI = {
  getAll: (params = {}) => api.get('/roles', { params }),
  getById: (id) => api.get(`/roles/${id}`),
  create: (roleData) => api.post('/roles', roleData),
  update: (id, roleData) => api.put(`/roles/${id}`, roleData),
  delete: (id) => api.delete(`/roles/${id}`),
  assignPermissions: (id, permissionIds) => api.post(`/roles/${id}/permissions`, { permission_ids: permissionIds }),
};

// Funciones de API para permisos
export const permissionsAPI = {
  getAll: (params = {}) => api.get('/permissions', { params }),
  getById: (id) => api.get(`/permissions/${id}`),
  create: (permissionData) => api.post('/permissions', permissionData),
  update: (id, permissionData) => api.put(`/permissions/${id}`, permissionData),
  delete: (id) => api.delete(`/permissions/${id}`),
  getByModule: (moduleId) => api.get(`/permissions/module/${moduleId}`),
};

// Funciones de API para módulos
export const modulesAPI = {
  getAll: (params = {}) => api.get('/modules', { params }),
  getById: (id) => api.get(`/modules/${id}`),
  create: (moduleData) => api.post('/modules', moduleData),
  update: (id, moduleData) => api.put(`/modules/${id}`, moduleData),
  delete: (id) => api.delete(`/modules/${id}`),
  getTree: () => api.get('/modules/tree'),
};

// Funciones de API para dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getChartData: (type) => api.get(`/dashboard/charts/${type}`),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
};

// Funciones de API para notificaciones
export const notificationsAPI = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

export default api;