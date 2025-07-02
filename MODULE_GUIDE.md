# Guía Completa para Gestión de Módulos

## 1. Conceptos Básicos

### Tipos de Módulos:
- **Module**: Contenedor principal (ej: "Users", "Dashboard")
- **Group**: Agrupación dentro de un módulo (ej: "Reportes" dentro de "Analytics")
- **Page**: Página específica con componente React (ej: "Lista de Usuarios")
- **Button**: Acción específica (ej: "Exportar", "Imprimir")

### Jerarquía:
```
Module
├── Group (opcional)
│   ├── Page
│   ├── Page
│   └── Button
├── Page
└── Page
```

## 2. Crear Módulos desde la Interfaz

### Paso 1: Acceder a Módulos
1. Ve a **Dashboard → System → Módulos**
2. Haz clic en **"Agregar Módulo"**

### Paso 2: Crear un Módulo Principal
```
Nombre: Inventario
Slug: inventory (se genera automáticamente)
Descripción: Gestión de inventario y productos
Icono: StorageIcon
Tipo: Module
Módulo Padre: Ninguno (Nivel Raíz)
Estado: Activo
Mostrar en Menú: ✓
Crear Permisos Automáticamente: ✓
```

### Paso 3: Crear un Grupo (opcional)
```
Nombre: Productos
Slug: inventory.products
Descripción: Gestión de productos
Icono: CategoryIcon
Tipo: Group
Módulo Padre: Inventario
Estado: Activo
Mostrar en Menú: ✓
```

### Paso 4: Crear Páginas
```
Nombre: Lista de Productos
Slug: inventory.products.list
Descripción: Listado de productos
Icono: ListIcon
Ruta: /dashboard/inventory/products
Componente: ProductList
Permiso: inventory.products.view
Tipo: Page
Módulo Padre: Productos
Estado: Activo
Mostrar en Menú: ✓
Crear Permisos Automáticamente: ✓
```

## 3. Configuración en el Frontend

### Archivo Central: `src/config/moduleConfig.js`

```javascript
// src/config/moduleConfig.js
import React from 'react';

// Importar todos los componentes
import { Dashboard } from '../pages/Dashboard';
import { Analytics } from '../pages/Analytics';
import { Users } from '../pages/Users';
import { UserRoles } from '../pages/UserRoles';
import { UserPermissions } from '../pages/UserPermissions';
import { Customers } from '../pages/Customers';
import { Statistics } from '../pages/Statistics';
import { DataPage } from '../pages/DataPage';
import { ChartPage } from '../pages/ChartPage';
import { Chat } from '../pages/Chat';
import { Kanban } from '../pages/Kanban';
import { Mail } from '../pages/Mail';
import { Calendar } from '../pages/Calendar';
import { Modules } from '../pages/Modules';
import { Settings } from '../pages/Settings';

// Importar iconos
import {
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  Storage as StorageIcon,
  PieChart as PieChartIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  VpnKey as VpnKeyIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
  ViewKanban as ViewKanbanIcon,
  Mail as MailIcon,
  CalendarToday as CalendarTodayIcon,
  Article as ArticleIcon,
  Settings as SettingsIcon,
  Apps as AppsIcon,
  Widgets as WidgetsIcon,
} from '@mui/icons-material';

// Mapeo de componentes
export const componentMap = {
  Dashboard,
  Analytics,
  Users,
  UserRoles,
  UserPermissions,
  Customers,
  Statistics,
  DataPage,
  ChartPage,
  Chat,
  Kanban,
  Mail,
  Calendar,
  Modules,
  Settings,
  // Agregar nuevos componentes aquí
};

// Mapeo de iconos
export const iconMap = {
  DashboardIcon: <DashboardIcon />,
  BarChartIcon: <BarChartIcon />,
  TrendingUpIcon: <TrendingUpIcon />,
  StorageIcon: <StorageIcon />,
  PieChartIcon: <PieChartIcon />,
  PeopleIcon: <PeopleIcon />,
  SecurityIcon: <SecurityIcon />,
  VpnKeyIcon: <VpnKeyIcon />,
  GroupIcon: <GroupIcon />,
  PersonIcon: <PersonIcon />,
  ChatIcon: <ChatIcon />,
  ViewKanbanIcon: <ViewKanbanIcon />,
  MailIcon: <MailIcon />,
  CalendarTodayIcon: <CalendarTodayIcon />,
  ArticleIcon: <ArticleIcon />,
  SettingsIcon: <SettingsIcon />,
  AppsIcon: <AppsIcon />,
  WidgetsIcon: <WidgetsIcon />,
  // Agregar nuevos iconos aquí
};

// Función para obtener icono
export const getIcon = (iconName) => {
  return iconMap[iconName] || <ArticleIcon />;
};

// Función para obtener componente
export const getComponent = (componentName) => {
  return componentMap[componentName];
};

export default {
  componentMap,
  iconMap,
  getIcon,
  getComponent,
};
```

## 4. Ejemplos Prácticos

### Ejemplo 1: Módulo de Inventario Completo

#### Backend (usando la interfaz):

1. **Módulo Principal**:
   - Nombre: "Inventario"
   - Slug: "inventory"
   - Tipo: "module"
   - Icono: "StorageIcon"

2. **Grupo de Productos**:
   - Nombre: "Productos"
   - Slug: "inventory.products"
   - Tipo: "group"
   - Padre: "Inventario"

3. **Páginas**:
   ```
   Lista de Productos:
   - Slug: inventory.products.list
   - Ruta: /dashboard/inventory/products
   - Componente: ProductList
   - Permiso: inventory.products.view
   
   Crear Producto:
   - Slug: inventory.products.create
   - Ruta: /dashboard/inventory/products/create
   - Componente: ProductCreate
   - Permiso: inventory.products.create
   - Mostrar en Menú: No
   
   Editar Producto:
   - Slug: inventory.products.edit
   - Ruta: /dashboard/inventory/products/:id/edit
   - Componente: ProductEdit
   - Permiso: inventory.products.edit
   - Mostrar en Menú: No
   ```

#### Frontend:

1. **Crear componentes**:
```javascript
// src/pages/inventory/ProductList.js
export const ProductList = () => {
  return <div>Lista de Productos</div>;
};

// src/pages/inventory/ProductCreate.js
export const ProductCreate = () => {
  return <div>Crear Producto</div>;
};

// src/pages/inventory/ProductEdit.js
export const ProductEdit = () => {
  return <div>Editar Producto</div>;
};
```

2. **Actualizar moduleConfig.js**:
```javascript
// Agregar imports
import { ProductList } from '../pages/inventory/ProductList';
import { ProductCreate } from '../pages/inventory/ProductCreate';
import { ProductEdit } from '../pages/inventory/ProductEdit';

// Agregar al componentMap
export const componentMap = {
  // ... componentes existentes
  ProductList,
  ProductCreate,
  ProductEdit,
};
```

### Ejemplo 2: Módulo Simple (sin grupos)

#### Backend:
```
Módulo: Reportes
├── Reporte de Ventas (page)
├── Reporte de Usuarios (page)
└── Exportar Datos (button)
```

#### Configuración:
1. **Módulo**: "Reportes" (type: module)
2. **Páginas directas**:
   - "Reporte de Ventas" (parent: Reportes)
   - "Reporte de Usuarios" (parent: Reportes)

## 5. Flujo de Trabajo Recomendado

### Para Desarrolladores:

1. **Planificar la estructura**:
   ```
   Nuevo Módulo
   ├── ¿Necesita grupos?
   ├── ¿Qué páginas tendrá?
   ├── ¿Qué permisos necesita?
   └── ¿Qué rutas usará?
   ```

2. **Crear en la interfaz**:
   - Usar la página de Módulos para crear la estructura
   - Definir rutas y componentes
   - Configurar permisos

3. **Desarrollar componentes**:
   - Crear los componentes React
   - Actualizar `moduleConfig.js`
   - Probar la navegación

4. **Asignar permisos**:
   - Ir a Roles y asignar permisos
   - Probar con diferentes usuarios

### Para Administradores:

1. **Crear módulo desde interfaz**
2. **Los permisos se crean automáticamente**
3. **Asignar permisos a roles**
4. **El menú se actualiza automáticamente**

## 6. Mejores Prácticas

### Nomenclatura:
- **Slugs**: usar puntos para jerarquía (`module.group.page`)
- **Rutas**: usar barras (`/dashboard/module/group/page`)
- **Componentes**: PascalCase (`ProductList`)
- **Permisos**: puntos con acción (`inventory.products.view`)

### Estructura:
- Máximo 3 niveles de profundidad
- Agrupar funcionalidades relacionadas
- Usar nombres descriptivos
- Mantener consistencia en iconos

### Permisos:
- Usar permisos granulares
- Seguir patrón: `module.action` o `module.submodule.action`
- Crear permisos para: view, create, edit, delete, manage

## 7. Comandos Útiles

```bash
# Sincronizar módulos con permisos
php artisan modules:sync

# Limpiar caché de permisos
php artisan permission:cache-reset

# Ejecutar seeders
php artisan db:seed --class=ModuleSeeder
php artisan db:seed --class=PermissionSeeder
```

## 8. Troubleshooting

### Problema: Módulo no aparece en menú
- Verificar que `show_in_menu = true`
- Verificar que el usuario tenga permisos
- Verificar que el estado sea `active`

### Problema: Ruta no funciona
- Verificar que el componente esté en `moduleConfig.js`
- Verificar que la ruta esté bien definida
- Verificar permisos de acceso

### Problema: Permisos no se crean
- Verificar que `auto_create_permissions = true`
- Ejecutar `php artisan modules:sync`
- Verificar que el tipo sea `page`