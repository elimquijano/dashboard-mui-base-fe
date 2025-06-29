import React, { createContext, useContext, useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { authAPI } from "../utils/api";

const MySwal = withReactContent(Swal);

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Inicialmente true para verificar sesión
  const [isInitialized, setIsInitialized] = useState(false);

  // Función para verificar si hay una sesión válida
  const checkAuthStatus = async () => {
    const token = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      setLoading(false);
      setIsInitialized(true);
      return;
    }

    try {
      // Verificar si el token es válido consultando al servidor
      const response = await authAPI.me();

      // CÓDIGO CORRECTO - Estructura de datos del API
      const responseData = response.data;

      // Creamos un nuevo objeto 'user' para el estado que combina los datos del usuario
      // con la lista de permisos del nivel superior.
      const userForState = {
        ...responseData.user, // Copia todas las propiedades del usuario
        permissions: responseData.permissions, // Sobrescribe/añade la propiedad 'permissions' con el array correcto
      };

      setUser(userForState);
      localStorage.setItem("user", JSON.stringify(userForState));
    } catch (error) {
      console.error("Token validation failed:", error);

      // Si el token no es válido, intentar con datos guardados localmente
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.permissions) {
          setUser(parsedUser);
        } else {
          // Limpiar datos inválidos
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
        }
      } catch (parseError) {
        console.error("Error parsing saved user:", parseError);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
      }
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  // Verificar sesión al cargar la aplicación
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Intentar login con API
      const response = await authAPI.login({ email, password });

      // CÓDIGO CORRECTO - Estructura de datos del API
      const responseData = response.data;

      // Creamos un nuevo objeto 'user' para el estado que combina los datos del usuario
      // con la lista de permisos del nivel superior.
      const userForState = {
        ...responseData.user, // Copia todas las propiedades del usuario
        permissions: responseData.permissions, // Sobrescribe/añade la propiedad 'permissions' con el array correcto
      };

      setUser(userForState);
      localStorage.setItem("auth_token", responseData.token);
      localStorage.setItem("user", JSON.stringify(userForState));

      MySwal.fire({
        title: "Welcome Back!",
        text: `Hello ${userForState.first_name}, you have successfully logged in.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });

      return true;
    } catch (error) {
      console.error("API login failed, trying mock data:", error);

      MySwal.fire({
        title: "Login Failed",
        text: "Invalid email or password. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#673ab7",
      });

      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      // Intentar registro con API
      const response = await authAPI.register(userData);

      // CÓDIGO CORRECTO - Estructura de datos del API
      const responseData = response.data;

      // Creamos un nuevo objeto 'user' para el estado que combine los datos del usuario
      // con la lista de permisos del nivel superior.
      const userForState = {
        ...responseData.user, // Copia todas las propiedades del usuario
        permissions: responseData.permissions, // Sobrescribe/añade la propiedad 'permissions' con el array correcto
      };

      setUser(userForState);
      localStorage.setItem("auth_token", responseData.token);
      localStorage.setItem("user", JSON.stringify(userForState));

      MySwal.fire({
        title: "Account Created!",
        text: `Welcome ${userData.first_name}! Your account has been created successfully.`,
        icon: "success",
        confirmButtonText: "Get Started",
        confirmButtonColor: "#673ab7",
      });

      return true;
    } catch (error) {
      console.error("API signup failed, using mock data:", error);
      MySwal.fire({
        title: "Account Not Created!",
        text: `Not possible to create account.`,
        icon: "error",
        confirmButtonText: "Try Again",
        confirmButtonColor: "#673ab7",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#673ab7",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        // Intentar logout desde API
        await authAPI.logout();
      } catch (error) {
        console.error("API logout failed:", error);
      }

      // Limpiar estado local
      setUser(null);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");

      MySwal.fire({
        title: "Logged Out",
        text: "You have been successfully logged out.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    }
  };

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false;
  };

  const refreshToken = async () => {
    try {
      const response = await authAPI.refreshToken();
      localStorage.setItem("auth_token", response.data.token);
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      return false;
    }
  };

  // Función para actualizar el usuario (útil para actualizaciones de perfil)
  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    isInitialized,
    isAuthenticated: !!user,
    hasPermission,
    refreshToken,
    updateUser,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
