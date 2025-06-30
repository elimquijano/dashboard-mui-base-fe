# Guía de Implementación Backend - Sistema de Módulos y Permisos

## 1. Migraciones

### Actualizar migración de permissions (si es necesario)
```php
<?php
// database/migrations/xxxx_xx_xx_xxxxxx_update_permissions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('permissions', function (Blueprint $table) {
            // Agregar columna module_id para relacionar con modules
            $table->unsignedBigInteger('module_id')->nullable()->after('module');
            $table->foreign('module_id')->references('id')->on('modules')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropForeign(['module_id']);
            $table->dropColumn('module_id');
        });
    }
};
```

## 2. Seeders

### ModuleSeeder
```php
<?php
// database/seeders/ModuleSeeder.php

namespace Database\Seeders;

use App\Models\Module;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    public function run()
    {
        $modules = [
            // Dashboard Module
            [
                'name' => 'Dashboard',
                'slug' => 'dashboard',
                'description' => 'Dashboard principal del sistema',
                'icon' => 'DashboardIcon',
                'sort_order' => 1,
                'type' => 'module',
                'status' => 'active',
                'children' => [
                    [
                        'name' => 'Default',
                        'slug' => 'dashboard.default',
                        'description' => 'Dashboard por defecto',
                        'icon' => 'DashboardIcon',
                        'sort_order' => 1,
                        'type' => 'page',
                        'status' => 'active',
                    ],
                    [
                        'name' => 'Analytics',
                        'slug' => 'dashboard.analytics',
                        'description' => 'Dashboard de analíticas',
                        'icon' => 'BarChartIcon',
                        'sort_order' => 2,
                        'type' => 'page',
                        'status' => 'active',
                    ],
                ]
            ],
            // Widget Module
            [
                'name' => 'Widget',
                'slug' => 'widget',
                'description' => 'Módulo de widgets',
                'icon' => 'WidgetsIcon',
                'sort_order' => 2,
                'type' => 'module',
                'status' => 'active',
                'children' => [
                    [
                        'name' => 'Statistics',
                        'slug' => 'widget.statistics',
                        'description' => 'Widget de estadísticas',
                        'icon' => 'TrendingUpIcon',
                        'sort_order' => 1,
                        'type' => 'page',
                        'status' => 'active',
                    ],
                    [
                        'name' => 'Data',
                        'slug' => 'widget.data',
                        'description' => 'Widget de datos',
                        'icon' => 'StorageIcon',
                        'sort_order' => 2,
                        'type' => 'page',
                        'status' => 'active',
                    ],
                    [
                        'name' => 'Chart',
                        'slug' => 'widget.chart',
                        'description' => 'Widget de gráficos',
                        'icon' => 'PieChartIcon',
                        'sort_order' => 3,
                        'type' => 'page',
                        'status' => 'active',
                    ],
                ]
            ],
            // Application Module
            [
                'name' => 'Application',
                'slug' => 'application',
                'description' => 'Módulo de aplicaciones',
                'icon' => 'AppsIcon',
                'sort_order' => 3,
                'type' => 'module',
                'status' => 'active',
                'children' => [
                    [
                        'name' => 'Users',
                        'slug' => 'users',
                        'description' => 'Gestión de usuarios',
                        'icon' => 'PeopleIcon',
                        'sort_order' => 1,
                        'type' => 'group',
                        'status' => 'active',
                        'children' => [
                            [
                                'name' => 'User List',
                                'slug' => 'users.list',
                                'description' => 'Lista de usuarios',
                                'icon' => 'PeopleIcon',
                                'sort_order' => 1,
                                'type' => 'page',
                                'status' => 'active',
                            ],
                            [
                                'name' => 'User Roles',
                                'slug' => 'users.roles',
                                'description' => 'Roles de usuarios',
                                'icon' => 'SecurityIcon',
                                'sort_order' => 2,
                                'type' => 'page',
                                'status' => 'active',
                            ],
                            [
                                'name' => 'Permissions',
                                'slug' => 'users.permissions',
                                'description' => 'Permisos de usuarios',
                                'icon' => 'VpnKeyIcon',
                                'sort_order' => 3,
                                'type' => 'page',
                                'status' => 'active',
                            ],
                        ]
                    ],
                    [
                        'name' => 'Customer',
                        'slug' => 'customers',
                        'description' => 'Gestión de clientes',
                        'icon' => 'GroupIcon',
                        'sort_order' => 2,
                        'type' => 'group',
                        'status' => 'active',
                        'children' => [
                            [
                                'name' => 'Customer List',
                                'slug' => 'customers.list',
                                'description' => 'Lista de clientes',
                                'icon' => 'GroupIcon',
                                'sort_order' => 1,
                                'type' => 'page',
                                'status' => 'active',
                            ],
                            [
                                'name' => 'Customer Details',
                                'slug' => 'customers.details',
                                'description' => 'Detalles de clientes',
                                'icon' => 'PersonIcon',
                                'sort_order' => 2,
                                'type' => 'page',
                                'status' => 'active',
                            ],
                        ]
                    ],
                    [
                        'name' => 'Chat',
                        'slug' => 'chat',
                        'description' => 'Sistema de chat',
                        'icon' => 'ChatIcon',
                        'sort_order' => 3,
                        'type' => 'page',
                        'status' => 'active',
                    ],
                    [
                        'name' => 'Kanban',
                        'slug' => 'kanban',
                        'description' => 'Tablero Kanban',
                        'icon' => 'ViewKanbanIcon',
                        'sort_order' => 4,
                        'type' => 'page',
                        'status' => 'active',
                    ],
                    [
                        'name' => 'Mail',
                        'slug' => 'mail',
                        'description' => 'Sistema de correo',
                        'icon' => 'MailIcon',
                        'sort_order' => 5,
                        'type' => 'page',
                        'status' => 'active',
                    ],
                    [
                        'name' => 'Calendar',
                        'slug' => 'calendar',
                        'description' => 'Calendario',
                        'icon' => 'CalendarTodayIcon',
                        'sort_order' => 6,
                        'type' => 'page',
                        'status' => 'active',
                    ],
                ]
            ],
            // System Module
            [
                'name' => 'System',
                'slug' => 'system',
                'description' => 'Configuración del sistema',
                'icon' => 'SettingsIcon',
                'sort_order' => 4,
                'type' => 'module',
                'status' => 'active',
                'children' => [
                    [
                        'name' => 'Modules',
                        'slug' => 'system.modules',
                        'description' => 'Gestión de módulos',
                        'icon' => 'ArticleIcon',
                        'sort_order' => 1,
                        'type' => 'page',
                        'status' => 'active',
                    ],
                    [
                        'name' => 'Settings',
                        'slug' => 'system.settings',
                        'description' => 'Configuraciones generales',
                        'icon' => 'SettingsIcon',
                        'sort_order' => 2,
                        'type' => 'page',
                        'status' => 'active',
                    ],
                ]
            ],
        ];

        $this->createModules($modules);
    }

    private function createModules($modules, $parentId = null)
    {
        foreach ($modules as $moduleData) {
            $children = $moduleData['children'] ?? [];
            unset($moduleData['children']);
            
            $moduleData['parent_id'] = $parentId;
            $module = Module::create($moduleData);
            
            if (!empty($children)) {
                $this->createModules($children, $module->id);
            }
        }
    }
}
```

### PermissionSeeder actualizado
```php
<?php
// database/seeders/PermissionSeeder.php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run()
    {
        $permissions = [
            // Dashboard permissions
            ['name' => 'dashboard.view', 'display_name' => 'Ver Dashboard', 'module' => 'Dashboard', 'type' => 'view'],
            ['name' => 'dashboard.analytics', 'display_name' => 'Ver Analytics', 'module' => 'Dashboard', 'type' => 'view'],
            
            // Widget permissions
            ['name' => 'widget.statistics', 'display_name' => 'Ver Estadísticas', 'module' => 'Widget', 'type' => 'view'],
            ['name' => 'widget.data', 'display_name' => 'Ver Datos', 'module' => 'Widget', 'type' => 'view'],
            ['name' => 'widget.chart', 'display_name' => 'Ver Gráficos', 'module' => 'Widget', 'type' => 'view'],
            
            // Users permissions
            ['name' => 'users.view', 'display_name' => 'Ver Usuarios', 'module' => 'Users', 'type' => 'view'],
            ['name' => 'users.create', 'display_name' => 'Crear Usuarios', 'module' => 'Users', 'type' => 'create'],
            ['name' => 'users.edit', 'display_name' => 'Editar Usuarios', 'module' => 'Users', 'type' => 'edit'],
            ['name' => 'users.delete', 'display_name' => 'Eliminar Usuarios', 'module' => 'Users', 'type' => 'delete'],
            ['name' => 'users.roles', 'display_name' => 'Gestionar Roles', 'module' => 'Users', 'type' => 'manage'],
            ['name' => 'users.permissions', 'display_name' => 'Gestionar Permisos', 'module' => 'Users', 'type' => 'manage'],
            
            // Customers permissions
            ['name' => 'customers.view', 'display_name' => 'Ver Clientes', 'module' => 'Customer', 'type' => 'view'],
            ['name' => 'customers.create', 'display_name' => 'Crear Clientes', 'module' => 'Customer', 'type' => 'create'],
            ['name' => 'customers.edit', 'display_name' => 'Editar Clientes', 'module' => 'Customer', 'type' => 'edit'],
            ['name' => 'customers.delete', 'display_name' => 'Eliminar Clientes', 'module' => 'Customer', 'type' => 'delete'],
            ['name' => 'customers.details', 'display_name' => 'Ver Detalles de Clientes', 'module' => 'Customer', 'type' => 'view'],
            
            // Application permissions
            ['name' => 'chat.view', 'display_name' => 'Ver Chat', 'module' => 'Application', 'type' => 'view'],
            ['name' => 'kanban.view', 'display_name' => 'Ver Kanban', 'module' => 'Application', 'type' => 'view'],
            ['name' => 'mail.view', 'display_name' => 'Ver Correo', 'module' => 'Application', 'type' => 'view'],
            ['name' => 'calendar.view', 'display_name' => 'Ver Calendario', 'module' => 'Application', 'type' => 'view'],
            
            // System permissions
            ['name' => 'system.settings', 'display_name' => 'Configuración del Sistema', 'module' => 'System', 'type' => 'manage'],
            ['name' => 'system.modules', 'display_name' => 'Gestionar Módulos', 'module' => 'System', 'type' => 'manage'],
        ];

        foreach ($permissions as $permission) {
            // Buscar el módulo correspondiente
            $module = Module::where('name', $permission['module'])->first();
            
            Permission::create([
                'name' => $permission['name'],
                'display_name' => $permission['display_name'],
                'module' => $permission['module'],
                'module_id' => $module?->id,
                'type' => $permission['type'],
                'description' => $permission['display_name'],
                'guard_name' => 'web',
            ]);
        }
    }
}
```

## 3. Controladores

### ModuleController
```php
<?php
// app/Http/Controllers/Api/ModuleController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ModuleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Module::with(['parent', 'children'])
            ->withCount(['permissions']);

        // Filtros
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->has('type')) {
            $query->where('type', $request->get('type'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->has('parent_id')) {
            $query->where('parent_id', $request->get('parent_id'));
        }

        $modules = $query->orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data' => $modules
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:modules',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'sort_order' => 'integer|min:0',
            'parent_id' => 'nullable|exists:modules,id',
            'type' => 'required|in:module,group,page,button',
            'status' => 'required|in:active,inactive',
        ]);

        $module = Module::create($request->all());

        return response()->json([
            'success' => true,
            'data' => $module->load(['parent', 'children']),
            'message' => 'Module created successfully'
        ], 201);
    }

    public function show(Module $module): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $module->load(['parent', 'children', 'permissions'])
        ]);
    }

    public function update(Request $request, Module $module): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:modules,slug,' . $module->id,
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'sort_order' => 'integer|min:0',
            'parent_id' => 'nullable|exists:modules,id',
            'type' => 'required|in:module,group,page,button',
            'status' => 'required|in:active,inactive',
        ]);

        $module->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $module->load(['parent', 'children']),
            'message' => 'Module updated successfully'
        ]);
    }

    public function destroy(Module $module): JsonResponse
    {
        // Verificar si tiene hijos
        if ($module->children()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete module with children'
            ], 422);
        }

        $module->delete();

        return response()->json([
            'success' => true,
            'message' => 'Module deleted successfully'
        ]);
    }

    public function tree(): JsonResponse
    {
        $modules = Module::getTree();

        return response()->json([
            'success' => true,
            'data' => $modules
        ]);
    }

    public function menu(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Obtener módulos activos con sus permisos
        $modules = Module::with(['children.children.children'])
            ->whereNull('parent_id')
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->get();

        // Filtrar módulos basado en permisos del usuario
        $filteredModules = $this->filterModulesByPermissions($modules, $user);

        return response()->json([
            'success' => true,
            'data' => $filteredModules
        ]);
    }

    private function filterModulesByPermissions($modules, $user)
    {
        return $modules->filter(function ($module) use ($user) {
            // Si el módulo tiene un permiso específico, verificarlo
            $permission = $this->getModulePermission($module);
            
            if ($permission && !$user->can($permission)) {
                return false;
            }

            // Filtrar hijos recursivamente
            if ($module->children) {
                $filteredChildren = $this->filterModulesByPermissions($module->children, $user);
                $module->setRelation('children', $filteredChildren);
                
                // Si no tiene hijos visibles y es un grupo, ocultarlo
                if ($module->type === 'group' && $filteredChildren->isEmpty()) {
                    return false;
                }
            }

            return true;
        })->values();
    }

    private function getModulePermission($module)
    {
        // Mapear slugs de módulos a permisos
        $permissionMap = [
            'dashboard.default' => 'dashboard.view',
            'dashboard.analytics' => 'dashboard.analytics',
            'widget.statistics' => 'widget.statistics',
            'widget.data' => 'widget.data',
            'widget.chart' => 'widget.chart',
            'users.list' => 'users.view',
            'users.roles' => 'users.roles',
            'users.permissions' => 'users.permissions',
            'customers.list' => 'customers.view',
            'customers.details' => 'customers.details',
            'chat' => 'chat.view',
            'kanban' => 'kanban.view',
            'mail' => 'mail.view',
            'calendar' => 'calendar.view',
            'system.modules' => 'system.modules',
            'system.settings' => 'system.settings',
        ];

        return $permissionMap[$module->slug] ?? null;
    }
}
```

### PermissionController actualizado
```php
<?php
// app/Http/Controllers/Api/PermissionController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Permission::with(['roles']);

        // Filtros
        if ($request->has('search')) {
            $query->search($request->get('search'));
        }

        if ($request->has('module')) {
            $query->byModule($request->get('module'));
        }

        if ($request->has('type')) {
            $query->byType($request->get('type'));
        }

        $permissions = $query->orderBy('module')->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $permissions
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:permissions',
            'display_name' => 'required|string|max:255',
            'module' => 'required|string|max:255',
            'module_id' => 'nullable|exists:modules,id',
            'type' => 'required|in:view,create,edit,delete,manage',
            'description' => 'nullable|string',
        ]);

        // Si no se proporciona module_id, intentar encontrarlo por nombre
        if (!$request->module_id && $request->module) {
            $module = Module::where('name', $request->module)->first();
            $request->merge(['module_id' => $module?->id]);
        }

        $permission = Permission::create([
            'name' => $request->name,
            'display_name' => $request->display_name,
            'module' => $request->module,
            'module_id' => $request->module_id,
            'type' => $request->type,
            'description' => $request->description,
            'guard_name' => 'web',
        ]);

        return response()->json([
            'success' => true,
            'data' => $permission,
            'message' => 'Permission created successfully'
        ], 201);
    }

    public function show(Permission $permission): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $permission->load(['roles'])
        ]);
    }

    public function update(Request $request, Permission $permission): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name,' . $permission->id,
            'display_name' => 'required|string|max:255',
            'module' => 'required|string|max:255',
            'module_id' => 'nullable|exists:modules,id',
            'type' => 'required|in:view,create,edit,delete,manage',
            'description' => 'nullable|string',
        ]);

        // Si no se proporciona module_id, intentar encontrarlo por nombre
        if (!$request->module_id && $request->module) {
            $module = Module::where('name', $request->module)->first();
            $request->merge(['module_id' => $module?->id]);
        }

        $permission->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $permission,
            'message' => 'Permission updated successfully'
        ]);
    }

    public function destroy(Permission $permission): JsonResponse
    {
        $permission->delete();

        return response()->json([
            'success' => true,
            'message' => 'Permission deleted successfully'
        ]);
    }

    public function byModule(Request $request, $moduleId): JsonResponse
    {
        $permissions = Permission::where('module_id', $moduleId)->get();

        return response()->json([
            'success' => true,
            'data' => $permissions
        ]);
    }
}
```

## 4. Rutas API

```php
<?php
// routes/api.php

use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NotificationController;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    // Dashboard routes
    Route::prefix('dashboard')->group(function () {
        Route::get('stats', [DashboardController::class, 'stats']);
        Route::get('charts/{type}', [DashboardController::class, 'chartData']);
        Route::get('recent-activity', [DashboardController::class, 'recentActivity']);
    });

    // Modules routes
    Route::apiResource('modules', ModuleController::class);
    Route::get('modules/tree', [ModuleController::class, 'tree']);
    Route::get('modules/menu', [ModuleController::class, 'menu']);

    // Permissions routes
    Route::apiResource('permissions', PermissionController::class);
    Route::get('permissions/module/{moduleId}', [PermissionController::class, 'byModule']);

    // Roles routes
    Route::apiResource('roles', RoleController::class);
    Route::post('roles/{role}/permissions', [RoleController::class, 'assignPermissions']);

    // Users routes
    Route::apiResource('users', UserController::class);
    Route::patch('users/{user}/status', [UserController::class, 'updateStatus']);
    Route::post('users/{user}/roles', [UserController::class, 'assignRoles']);

    // Notifications routes
    Route::apiResource('notifications', NotificationController::class)->only(['index', 'destroy']);
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
});
```

## 5. Actualizar DatabaseSeeder

```php
<?php
// database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            ModuleSeeder::class,
            PermissionSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
        ]);
    }
}
```

## 6. Comandos para ejecutar

```bash
# Ejecutar migraciones
php artisan migrate

# Ejecutar seeders
php artisan db:seed

# O ejecutar seeder específico
php artisan db:seed --class=ModuleSeeder
php artisan db:seed --class=PermissionSeeder

# Limpiar cache de permisos
php artisan permission:cache-reset
```

## 7. Middleware de permisos (opcional)

```php
<?php
// app/Http/Middleware/CheckPermission.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPermission
{
    public function handle(Request $request, Closure $next, $permission)
    {
        if (!$request->user()->can($permission)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        return $next($request);
    }
}
```

Registrar en `app/Http/Kernel.php`:
```php
protected $routeMiddleware = [
    // ... otros middlewares
    'permission' => \App\Http\Middleware\CheckPermission::class,
];
```

## 8. Notas importantes

1. **Relación Módulos-Permisos**: Los permisos ahora están relacionados con módulos tanto por nombre como por ID.

2. **Menú Dinámico**: El endpoint `/api/modules/menu` devuelve solo los módulos que el usuario tiene permiso para ver.

3. **Jerarquía de Módulos**: Los módulos soportan jerarquía ilimitada (padre-hijo-nieto, etc.).

4. **Filtrado por Permisos**: El sistema filtra automáticamente los módulos basado en los permisos del usuario.

5. **Tipos de Módulos**: 
   - `module`: Módulo principal
   - `group`: Grupo de páginas
   - `page`: Página individual
   - `button`: Botón o acción específica

6. **Cache de Permisos**: Recuerda limpiar el cache de permisos después de cambios con `php artisan permission:cache-reset`.