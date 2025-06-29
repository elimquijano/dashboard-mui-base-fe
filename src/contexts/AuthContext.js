import React, { createContext, useContext, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Usuarios de prueba con diferentes roles y privilegios
const mockUsers = [
  {
    id: '1',
    email: 'admin@berry.com',
    password: 'admin123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'Super Admin',
    avatar: 'JD',
    permissions: [
      // Dashboard Module
      'dashboard.view',
      'dashboard.analytics',
      
      // Widget Module
      'widget.statistics',
      'widget.data',
      'widget.chart',
      
      // User Management Module
      'users.view',
      'users.create',
      'users.edit',
      'users.delete',
      'users.roles',
      'users.permissions',
      
      // Application Module
      'customers.view',
      'customers.details',
      'chat.view',
      'kanban.view',
      'mail.view',
      'calendar.view',
      
      // System Module
      'system.settings',
      'system.logs',
      'system.backup',
    ]
  },
  {
    id: '2',
    email: 'manager@berry.com',
    password: 'manager123',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'Manager',
    avatar: 'JS',
    permissions: [
      'dashboard.view',
      'dashboard.analytics',
      'widget.statistics',
      'widget.data',
      'users.view',
      'users.edit',
      'customers.view',
      'customers.details',
      'chat.view',
      'mail.view',
      'calendar.view',
    ]
  },
  {
    id: '3',
    email: 'editor@berry.com',
    password: 'editor123',
    firstName: 'Mike',
    lastName: 'Johnson',
    role: 'Content Editor',
    avatar: 'MJ',
    permissions: [
      'dashboard.view',
      'widget.statistics',
      'customers.view',
      'chat.view',
      'kanban.view',
    ]
  },
  {
    id: '4',
    email: 'user@berry.com',
    password: 'user123',
    firstName: 'Sarah',
    lastName: 'Wilson',
    role: 'Basic User',
    avatar: 'SW',
    permissions: [
      'dashboard.view',
      'widget.statistics',
    ]
  },
  {
    id: '5',
    email: 'analyst@berry.com',
    password: 'analyst123',
    firstName: 'Tom',
    lastName: 'Brown',
    role: 'Data Analyst',
    avatar: 'TB',
    permissions: [
      'dashboard.view',
      'dashboard.analytics',
      'widget.statistics',
      'widget.data',
      'widget.chart',
    ]
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      // Show success alert
      MySwal.fire({
        title: 'Welcome Back!',
        text: `Hello ${foundUser.firstName}, you have successfully logged in.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
      
      return true;
    }
    
    // Show error alert
    MySwal.fire({
      title: 'Login Failed',
      text: 'Invalid email or password. Please try again.',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#673ab7',
    });
    
    return false;
  };

  const signup = async (userData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser = {
      id: Date.now().toString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'Basic User',
      avatar: userData.firstName.charAt(0) + userData.lastName.charAt(0),
      permissions: ['dashboard.view', 'widget.statistics']
    };
    
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    // Show success alert
    MySwal.fire({
      title: 'Account Created!',
      text: `Welcome ${userData.firstName}! Your account has been created successfully.`,
      icon: 'success',
      confirmButtonText: 'Get Started',
      confirmButtonColor: '#673ab7',
    });
    
    return true;
  };

  const logout = () => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your account.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#673ab7',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setUser(null);
        localStorage.removeItem('user');
        
        MySwal.fire({
          title: 'Logged Out',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
        });
      }
    });
  };

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false;
  };

  // Initialize user from localStorage
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};