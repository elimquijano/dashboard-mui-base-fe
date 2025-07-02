# Mejoras del Backend - Sistema Dinámico de Módulos

## 1. Migración actualizada para módulos

```php
<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_modules_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('route')->nullable(); // Nueva columna para la ruta
            $table->string('component')->nullable(); // Nueva columna para el componente
            $table->string('permission')->nullable(); // Permiso específico requerido
            $table->integer('sort_order')->default(0);
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->enum('type', ['module', 'group', 'page', 'button'])->default('module');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->boolean('show_in_menu')->default(true); // Si se muestra en el sidebar
            $table->boolean('auto_create_permissions')->default(true); // Si crea permisos automáticamente
            $table->timestamps();

            $table->foreign('parent_id')->references('id')->on('modules')->onDelete('cascade');
            $table->index(['parent_id', 'sort_order']);
            $table->index(['status', 'show_in_menu']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('modules');
    }
};
```

## 2. Modelo Module actualizado

```php
<?php
// app/Models/Module.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Models\Permission;

class Module extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'route',
        'component',
        'permission',
        'sort_order',
        'parent_id',
        'type',
        'status',
        'show_in_menu',
        'auto_create_permissions',
    ];

    protected $casts = [
        'show_in_menu' => 'boolean',
        'auto_create_permissions' => 'boolean',
    ];

    public function parent()
    {
        return $this->belongsTo(Module::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Module::class, 'parent_id')->orderBy('sort_order');
    }

    public function permissions()
    {
        return $this->hasMany(Permission::class, 'module', 'name');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeRoots($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeShowInMenu($query)
    {
        return $query->where('show_in_menu', true);
    }

    public static function getTree()
    {
        return static::with('children.children.children')
            ->whereNull('parent_id')
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->get();
    }

    public static function getMenuTree()
    {
        return static::with('children.children.children')
            ->whereNull('parent_id')
            ->where('status', 'active')
            ->where('show_in_menu', true)
            ->orderBy('sort_order')
            ->get();
    }

    // Crear permisos automáticamente al crear el módulo
    protected static function boot()
    {
        parent::boot();

        static::created(function ($module) {
            if ($module->auto_create_permissions && $module->type === 'page') {
                $module->createDefaultPermissions();
            }
        });

        static::deleted(function ($module) {
            // Eliminar permisos relacionados
            Permission::where('module', $module->name)->delete();
        });
    }

    public function createDefaultPermissions()
    {
        $basePermissions = [
            [
                'name' => "{$this->slug}.view",
                'display_name' => "Ver {$this->name}",
                'type' => 'view',
            ],
        ];

        // Agregar más permisos según el tipo
        if ($this->type === 'page') {
            $basePermissions = array_merge($basePermissions, [
                [
                    'name' => "{$this->slug}.create",
                    'display_name' => "Crear {$this->name}",
                    'type' => 'create',
                ],
                [
                    'name' => "{$this->slug}.edit",
                    'display_name' => "Editar {$this->name}",
                    'type' => 'edit',
                ],
                [
                    'name' => "{$this->slug}.delete",
                    'display_name' => "Eliminar {$this->name}",
                    'type' => 'delete',
                ],
            ]);
        }

        foreach ($basePermissions as $permissionData) {
            Permission::firstOrCreate(
                ['name' => $permissionData['name']],
                [
                    'display_name' => $permissionData['display_name'],
                    'module' => $this->name,
                    'type' => $permissionData['type'],
                    'description' => $permissionData['display_name'],
                    'guard_name' => 'web',
                ]
            );
        }
    }
}
```

## 3. ModuleController actualizado

```php
<?php
// app/Http/Controllers/ModuleController.php

namespace App\Http\Controllers;

use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ModuleController extends Controller
{
    public function index(Request $request)
    {
        $query = Module::with(['parent', 'children']);

        // Filtros
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $modules = $query->orderBy('sort_order')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $modules,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:modules',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'route' => 'nullable|string',
            'component' => 'nullable|string',
            'permission' => 'nullable|string',
            'sort_order' => 'integer',
            'parent_id' => 'nullable|exists:modules,id',
            'type' => 'required|in:module,group,page,button',
            'status' => 'required|in:active,inactive',
            'show_in_menu' => 'boolean',
            'auto_create_permissions' => 'boolean',
        ]);

        $module = Module::create($request->all());

        return response()->json([
            'success' => true,
            'data' => $module->load(['parent', 'children']),
            'message' => 'Módulo creado exitosamente',
        ], 201);
    }

    public function show(Module $module)
    {
        return response()->json([
            'success' => true,
            'data' => $module->load(['parent', 'children', 'permissions']),
        ]);
    }

    public function update(Request $request, Module $module)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:modules,slug,' . $module->id,
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'route' => 'nullable|string',
            'component' => 'nullable|string',
            'permission' => 'nullable|string',
            'sort_order' => 'integer',
            'parent_id' => 'nullable|exists:modules,id',
            'type' => 'required|in:module,group,page,button',
            'status' => 'required|in:active,inactive',
            'show_in_menu' => 'boolean',
            'auto_create_permissions' => 'boolean',
        ]);

        $module->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $module->load(['parent', 'children']),
            'message' => 'Módulo actualizado exitosamente',
        ]);
    }

    public function destroy(Module $module)
    {
        $module->delete();

        return response()->json([
            'success' => true,
            'message' => 'Módulo eliminado exitosamente',
        ]);
    }

    public function tree()
    {
        $modules = Module::getTree();
        
        return response()->json([
            'success' => true,
            'data' => $modules,
        ]);
    }

    public function menu()
    {
        $user = Auth::user();
        $modules = Module::getMenuTree();
        
        $filteredModules = $this->filterModulesByPermissions($modules, $user);
        
        return response()->json([
            'success' => true,
            'data' => $filteredModules,
        ]);
    }

    private function filterModulesByPermissions($modules, $user)
    {
        return $modules->filter(function ($module) use ($user) {
            // Si el módulo tiene un permiso específico, verificarlo
            if ($module->permission && !$user->can($module->permission)) {
                return false;
            }

            // Si es un grupo o módulo, verificar si tiene hijos con permisos
            if (in_array($module->type, ['module', 'group'])) {
                $filteredChildren = $this->filterModulesByPermissions($module->children, $user);
                $module->setRelation('children', $filteredChildren);
                
                // Solo mostrar si tiene hijos visibles o si es una página con permisos
                return $filteredChildren->count() > 0 || 
                       ($module->type === 'page' && (!$module->permission || $user->can($module->permission)));
            }

            // Para páginas, verificar permiso específico o permiso por defecto
            if ($module->type === 'page') {
                $permission = $module->permission ?: "{$module->slug}.view";
                return $user->can($permission);
            }

            return true;
        })->values();
    }

    public function getRouteConfig()
    {
        $modules = Module::where('status', 'active')
                        ->whereNotNull('route')
                        ->whereNotNull('component')
                        ->orderBy('sort_order')
                        ->get();

        $routeConfig = [];
        
        foreach ($modules as $module) {
            $routeConfig[] = [
                'path' => $module->route,
                'component' => $module->component,
                'permission' => $module->permission ?: "{$module->slug}.view",
                'name' => $module->name,
                'slug' => $module->slug,
                'type' => $module->type,
                'show_in_menu' => $module->show_in_menu,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $routeConfig,
        ]);
    }
}
```

## 4. Seeder actualizado

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
                'description' => 'Panel principal del sistema',
                'icon' => 'DashboardIcon',
                'type' => 'module',
                'sort_order' => 1,
                'show_in_menu' => true,
                'auto_create_permissions' => false,
                'children' => [
                    [
                        'name' => 'Dashboard Principal',
                        'slug' => 'dashboard.default',
                        'description' => 'Vista principal del dashboard',
                        'icon' => 'DashboardIcon',
                        'route' => '/dashboard',
                        'component' => 'Dashboard',
                        'permission' => 'dashboard.view',
                        'type' => 'page',
                        'sort_order' => 1,
                        'show_in_menu' => true,
                        'auto_create_permissions' => false,
                    ],
                    [
                        'name' => 'Analytics',
                        'slug' => 'dashboard.analytics',
                        'description' => 'Dashboard de analytics',
                        'icon' => 'BarChartIcon',
                        'route' => '/dashboard/analytics-dashboard',
                        'component' => 'Analytics',
                        'permission' => 'dashboard.analytics',
                        'type' => 'page',
                        'sort_order' => 2,
                        'show_in_menu' => true,
                        'auto_create_permissions' => false,
                    ],
                ]
            ],

            // Widget Module
            [
                'name' => 'Widget',
                'slug' => 'widget',
                'description' => 'Módulo de widgets y estadísticas',
                'icon' => 'WidgetsIcon',
                'type' => 'module',
                'sort_order' => 2,
                'show_in_menu' => true,
                'auto_create_permissions' => false,
                'children' => [
                    [
                        'name' => 'Estadísticas',
                        'slug' => 'widget.statistics',
                        'description' => 'Widget de estadísticas',
                        'icon' => 'TrendingUpIcon',
                        'route' => '/dashboard/statistics',
                        'component' => 'Statistics',
                        'permission' => 'widget.statistics',
                        'type' => 'page',
                        'sort_order' => 1,
                        'show_in_menu' => true,
                        'auto_create_permissions' => false,
                    ],
                    [
                        'name' => 'Datos',
                        'slug' => 'widget.data',
                        'description' => 'Widget de datos',
                        'icon' => 'StorageIcon',
                        'route' => '/dashboard/data',
                        'component' => 'DataPage',
                        'permission' => 'widget.data',
                        'type' => 'page',
                        'sort_order' => 2,
                        'show_in_menu' => true,
                        'auto_create_permissions' => false,
                    ],
                    [
                        'name' => 'Gráficos',
                        'slug' => 'widget.chart',
                        'description' => 'Widget de gráficos',
                        'icon' => 'PieChartIcon',
                        'route' => '/dashboard/chart',
                        'component' => 'ChartPage',
                        'permission' => 'widget.chart',
                        'type' => 'page',
                        'sort_order' => 3,
                        'show_in_menu' => true,
                        'auto_create_permissions' => false,
                    ],
                ]
            ],

            // Users Module
            [
                'name' => 'Users',
                'slug' => 'users',
                'description' => 'Gestión de usuarios del sistema',
                'icon' => 'PeopleIcon',
                'type' => 'module',
                'sort_order' => 3,
                'show_in_menu' => true,
                'auto_create_permissions' => false,
                'children' => [
                    [
                        'name' => 'Lista de Usuarios',
                        'slug' => 'users.list',
                        'description' => 'Gestión de usuarios',
                        'icon' => 'PeopleIcon',
                        'route' => '/dashboard/users',
                        'component' => 'Users',
                        'permission' => 'users.view',
                        'type' => 'page',
                        'sort_order' => 1,
                        'show_in_menu' => true,
                        'auto_create_permissions' => false,
                    ],
                    [
                        'name' => 'Roles',
                        'slug' => 'users.roles',
                        'description' => 'Gestión de roles',
                        'icon' => 'SecurityIcon',
                        'route' => '/dashboard/users/roles',
                        'component' => 'UserRoles',
                        'permission' => 'users.roles',
                        'type' => 'page',
                        'sort_order' => 2,
                        'show_in_menu' => true,
                        'auto_create_permissions' => false,
                    ],
                    [
                        'name' => 'Permisos',
                        'slug' => 'users.permissions',
                        'description' => 'Gestión de permisos',
                        'icon' => 'VpnKeyIcon',
                        'route' => '/dashboard/users/permissions',
                        'component' => 'UserPermissions',
                        'permission' => 'users.permissions',
                        'type' => 'page',
                        'sort_order' => 3,
                        'show_in_menu' => true,
                        'auto_create_permissions' => false,
                    ],
                ]
            ],

            // Customer Module
            [
                'name' => 'Customer',
                'slug' => 'customer',
                'description' => 'Gestión de clientes',
                'icon' => 'GroupIcon',
                'type' => 'module',
                'sort_order' => 4,
                'show_in_menu' => true,
                'auto_create_permissions' => false,
                'children' => [
                    [
                        'name' => 'Lista de Clientes',
                        'slug' => 'customers.list',
                        'description' => 'Gestión de clientes',
                        'icon' => 'GroupIcon',
                        'route' => '/dashboard/customers',
                        'component' => 'Customers',
                        'permission' => 'customers.view',
                        'type' => 'page',
                        'sort_order' => 1,
                        'show_in_menu' => true,
                        'auto_create_permissions' => false,
                    ],
                    [
                        'name' => 'Detalles de Cliente',
                        'slug' => 'customers.details',
                        'description' => 'Detalles de cliente',
                        'icon' => 'PersonIcon',
                        'route' => '/dashboard/customers/details',
                        'component' => 'CustomerDetails',
                        'permission' => 'customers.details',
                        'type' => 'page',
                        'sort_order' => 2,
                        'show_in_menu' => false, // No se muestra en el menú
                        'auto_create_permissions' => false,
                    ],
                ]
            ],

            // Application Module
            [
                'name' => 'Application',
                'slug' => 'application',
                'description' => 'Aplicaciones del sistema',
                'icon' => 'AppsIcon',
                'type' => 'module',
                'sort_order' => 5,
                'show_in_menu' => true,
                'auto_create_permissions' => false,
                'children' => [
                    [
                        'name' => 'Chat',
                        'slug' => 'chat',
                        'description' => 'Sistema de chat',
                        'icon' => 'ChatIcon',
                        'route' => '/dashboard/chat',
                        'component' => 'Chat',
                        'permission' => 'chat.view',
                        'type' => 'page',
                        'sort_order' => 1,
                        'show_in_menu' => true,
                        'auto_create_permissions' => false,
                    ],
                    [
                        'name' => 'Kanban',
                        'slug' => 'kanban',
                        'description' => 'Tablero Kanban',
                        'icon' => 'ViewKanbanIcon',
                        'route' => '/dashboard/kanban',
                        'component' => 'Kanban',
                        'permission' => 'kanban.view',
                        'type' => 'page',
                        'sort_order' => 2,
                        'show_in_menu' => true,
                        'auto_create_permissions' => false,
                    ],
                    [
                        'name' => 'Correo',
                        'slug' => 'mail',
                        'description' => 'Sistema de correo',
                        'icon' => 'MailIcon',
                        'route' => '/dashboard/mail',
                        'component' => 'Mail',
                        'permission' => 'mail.view',
                        'type' => 'page',
                        'sort_order' => 3,
                        'show_in_menu' => true,
                        'auto_create_permissions' => false,
                    ],
                    [
                        'name' => 'Calendario',
                        'slug' => 'calendar',
                        'description' => 'Sistema de calendario',
                        'icon' => 'CalendarTodayIcon',
                        'route' => '/dashboard/calendar',
                        'component' => 'Calendar',
                        'permission' => 'calendar.view',
                        'type' => 'page',
                        'sort_order' => 4,
                        'show_in_menu' => true,
                        'auto_create_permissions' => false,
                    ],
                ]
            ],

            // System Module
            [
                'name' => 'System',
                'slug' => 'system',
                'description' => 'Configuración del sistema',
                'icon' => 'SettingsIcon',
                'type' => 'module',
                'sort_order' => 6,
                'show_in_menu' => true,
                'auto_create_permissions' => false,
                'children' => [
                    [
                        'name' => 'Módulos',
                        'slug' => 'system.modules',
                        'description' => 'Gestión de módulos',
                        'icon' => 'AppsIcon',
                        'route' => '/dashboard/modules',
                        'component' => 'Modules',
                        'permission' => 'system.modules',
                        'type' => 'page',
                        'sort_order' => 1,
                        'show_in_menu' => true,
                        'auto_create_permissions' => false,
                    ],
                    [
                        'name' => 'Configuración',
                        'slug' => 'system.settings',
                        'description' => 'Configuración general',
                        'icon' => 'SettingsIcon',
                        'route' => '/dashboard/settings',
                        'component' => 'Settings',
                        'permission' => 'system.settings',
                        'type' => 'page',
                        'sort_order' => 2,
                        'show_in_menu' => true,
                        'auto_create_permissions' => false,
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

## 5. Rutas actualizadas

```php
<?php
// routes/api.php

Route::middleware(['auth:sanctum'])->group(function () {
    // Módulos
    Route::apiResource('modules', ModuleController::class);
    Route::get('modules/tree', [ModuleController::class, 'tree']);
    Route::get('modules/menu', [ModuleController::class, 'menu']);
    Route::get('modules/route-config', [ModuleController::class, 'getRouteConfig']);
    
    // ... otras rutas
});
```

## 6. Comando para sincronizar módulos

```php
<?php
// app/Console/Commands/SyncModules.php

namespace App\Console\Commands;

use App\Models\Module;
use Illuminate\Console\Command;

class SyncModules extends Command
{
    protected $signature = 'modules:sync';
    protected $description = 'Sincronizar módulos con permisos';

    public function handle()
    {
        $modules = Module::where('auto_create_permissions', true)
                        ->where('type', 'page')
                        ->get();

        foreach ($modules as $module) {
            $this->info("Sincronizando módulo: {$module->name}");
            $module->createDefaultPermissions();
        }

        $this->info('Sincronización completada');
    }
}
```

Registra el comando en `app/Console/Kernel.php`:

```php
protected $commands = [
    Commands\SyncModules::class,
];
```