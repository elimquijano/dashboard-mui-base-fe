# Laravel Backend API Guide for Berry Admin Dashboard

## 📋 Overview

Esta guía te ayudará a crear un backend completo en Laravel para el sistema de administración Berry Dashboard. Incluye autenticación, gestión de usuarios, roles, permisos y todas las funcionalidades necesarias.

## 🚀 Instalación y Configuración Inicial

### 1. Crear el proyecto Laravel

```bash
composer create-project laravel/laravel dashboard-miu-base-be
cd dashboard-miu-base-be
```

### 2. Instalar dependencias necesarias

```bash
composer require laravel/sanctum
composer require spatie/laravel-permission
composer require laravel/telescope
composer require barryvdh/laravel-cors
```

### 3. Configurar variables de entorno

```env
# .env
APP_NAME="Berry Admin API"
APP_ENV=local
APP_KEY=base64:your-app-key
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=berry_admin
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
SESSION_DRIVER=database
```

### 4. Configurar CORS

```php
// config/cors.php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

## 🗄️ Migraciones de Base de Datos

### 1. Migración de usuarios extendida

```php
// database/migrations/2024_01_01_000001_create_users_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('avatar')->nullable();
            $table->enum('status', ['active', 'inactive', 'pending'])->default('active');
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};
```

### 2. Migración de módulos del sistema

```php
// database/migrations/2024_01_01_000002_create_modules_table.php
<?php

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
            $table->integer('sort_order')->default(0);
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->enum('type', ['module', 'group', 'page', 'button'])->default('module');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();

            $table->foreign('parent_id')->references('id')->on('modules')->onDelete('cascade');
            $table->index(['parent_id', 'sort_order']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('modules');
    }
};
```

### 3. Migración de notificaciones

```php
// database/migrations/2024_01_01_000003_create_notifications_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['notifiable_type', 'notifiable_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('notifications');
    }
};
```

## 🏗️ Modelos

### 1. Modelo User

```php
// app/Models/User.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'avatar',
        'status',
        'last_login_at',
        'last_login_ip',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
    ];

    protected $appends = ['full_name', 'initials'];

    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function getInitialsAttribute()
    {
        return strtoupper(substr($this->first_name, 0, 1) . substr($this->last_name, 0, 1));
    }

    public function updateLastLogin($ip = null)
    {
        $this->update([
            'last_login_at' => now(),
            'last_login_ip' => $ip ?? request()->ip(),
        ]);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }
}
```

### 2. Modelo Module

```php
// app/Models/Module.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'sort_order',
        'parent_id',
        'type',
        'status',
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
        return $this->hasMany(Permission::class);
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

    public static function getTree()
    {
        return static::with('children.children.children')
            ->roots()
            ->active()
            ->orderBy('sort_order')
            ->get();
    }
}
```

## 🎮 Controladores

### 1. AuthController

```php
// app/Http/Controllers/Api/AuthController.php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['Your account is not active.'],
            ]);
        }

        $user->updateLastLogin(request()->ip());

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user->load('roles.permissions'),
            'token' => $token,
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    }

    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Assign default role
        $user->assignRole('user');

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user->load('roles.permissions'),
            'token' => $token,
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('roles.permissions'),
            'permissions' => $request->user()->getAllPermissions()->pluck('name'),
        ]);
    }

    public function refresh(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
        ]);
    }
}
```

### 2. UserController

```php
// app/Http/Controllers/Api/UserController.php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roles');

        if ($request->has('search')) {
            $query->search($request->search);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('role')) {
            $query->role($request->role);
        }

        $users = $query->paginate($request->get('per_page', 15));

        return response()->json($users);
    }

    public function store(StoreUserRequest $request)
    {
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'status' => $request->status ?? 'active',
        ]);

        if ($request->has('roles')) {
            $user->assignRole($request->roles);
        }

        return response()->json($user->load('roles'), 201);
    }

    public function show(User $user)
    {
        return response()->json($user->load('roles.permissions'));
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        if ($request->has('roles')) {
            $user->syncRoles($request->roles);
        }

        return response()->json($user->load('roles'));
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Cannot delete your own account'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function updateStatus(Request $request, User $user)
    {
        $request->validate([
            'status' => 'required|in:active,inactive,pending',
        ]);

        $user->update(['status' => $request->status]);

        return response()->json($user);
    }

    public function assignRoles(Request $request, User $user)
    {
        $request->validate([
            'role_ids' => 'required|array',
            'role_ids.*' => 'exists:roles,id',
        ]);

        $user->syncRoles($request->role_ids);

        return response()->json($user->load('roles'));
    }
}
```

## 📝 Requests de Validación

### 1. LoginRequest

```php
// app/Http/Requests/LoginRequest.php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ];
    }
}
```

### 2. RegisterRequest

```php
// app/Http/Requests/RegisterRequest.php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ];
    }
}
```

## 🛣️ Rutas API

```php
// routes/api.php
<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NotificationController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);

    // Dashboard routes
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/charts/{type}', [DashboardController::class, 'chartData']);
    Route::get('/dashboard/recent-activity', [DashboardController::class, 'recentActivity']);

    // User management routes
    Route::apiResource('users', UserController::class);
    Route::patch('/users/{user}/status', [UserController::class, 'updateStatus']);
    Route::post('/users/{user}/roles', [UserController::class, 'assignRoles']);

    // Role management routes
    Route::apiResource('roles', RoleController::class);
    Route::post('/roles/{role}/permissions', [RoleController::class, 'assignPermissions']);

    // Permission management routes
    Route::apiResource('permissions', PermissionController::class);
    Route::get('/permissions/module/{module}', [PermissionController::class, 'getByModule']);

    // Module management routes
    Route::apiResource('modules', ModuleController::class);
    Route::get('/modules/tree', [ModuleController::class, 'getTree']);

    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
});
```

## 🌱 Seeders

### 1. RoleSeeder

```php
// database/seeders/RoleSeeder.php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run()
    {
        // Create permissions
        $permissions = [
            // Dashboard
            'dashboard.view',
            'dashboard.analytics',
            
            // Users
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'users.roles',
            'users.permissions',
            
            // Widgets
            'widget.statistics',
            'widget.data',
            'widget.chart',
            
            // Applications
            'customers.view',
            'customers.details',
            'chat.view',
            'kanban.view',
            'mail.view',
            'calendar.view',
            
            // System
            'system.settings',
            'system.logs',
            'system.backup',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles
        $superAdmin = Role::create(['name' => 'Super Admin']);
        $superAdmin->givePermissionTo(Permission::all());

        $manager = Role::create(['name' => 'Manager']);
        $manager->givePermissionTo([
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
        ]);

        $editor = Role::create(['name' => 'Content Editor']);
        $editor->givePermissionTo([
            'dashboard.view',
            'widget.statistics',
            'customers.view',
            'chat.view',
            'kanban.view',
        ]);

        $user = Role::create(['name' => 'Basic User']);
        $user->givePermissionTo([
            'dashboard.view',
            'widget.statistics',
        ]);

        $analyst = Role::create(['name' => 'Data Analyst']);
        $analyst->givePermissionTo([
            'dashboard.view',
            'dashboard.analytics',
            'widget.statistics',
            'widget.data',
            'widget.chart',
        ]);
    }
}
```

### 2. UserSeeder

```php
// database/seeders/UserSeeder.php
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        $users = [
            [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'admin@berry.com',
                'password' => Hash::make('admin123'),
                'role' => 'Super Admin',
            ],
            [
                'first_name' => 'Jane',
                'last_name' => 'Smith',
                'email' => 'manager@berry.com',
                'password' => Hash::make('manager123'),
                'role' => 'Manager',
            ],
            [
                'first_name' => 'Mike',
                'last_name' => 'Johnson',
                'email' => 'editor@berry.com',
                'password' => Hash::make('editor123'),
                'role' => 'Content Editor',
            ],
            [
                'first_name' => 'Sarah',
                'last_name' => 'Wilson',
                'email' => 'user@berry.com',
                'password' => Hash::make('user123'),
                'role' => 'Basic User',
            ],
            [
                'first_name' => 'Tom',
                'last_name' => 'Brown',
                'email' => 'analyst@berry.com',
                'password' => Hash::make('analyst123'),
                'role' => 'Data Analyst',
            ],
        ];

        foreach ($users as $userData) {
            $role = $userData['role'];
            unset($userData['role']);
            
            $user = User::create($userData);
            $user->assignRole($role);
        }
    }
}
```

## 🚀 Comandos de Instalación

```bash
# Ejecutar migraciones
php artisan migrate

# Publicar configuraciones
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Ejecutar seeders
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=UserSeeder

# Crear storage link
php artisan storage:link

# Limpiar cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

## 🔧 Middleware Personalizado

```php
// app/Http/Middleware/CheckPermission.php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPermission
{
    public function handle(Request $request, Closure $next, $permission)
    {
        if (!$request->user()->can($permission)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $next($request);
    }
}
```

## 📊 Configuración Final

### 1. Registrar middleware

```php
// app/Http/Kernel.php
protected $routeMiddleware = [
    // ... otros middleware
    'permission' => \App\Http\Middleware\CheckPermission::class,
];
```

### 2. Configurar Sanctum

```php
// config/sanctum.php
'expiration' => 60 * 24, // 24 horas
```

## 🎯 Uso en Producción

1. **Configurar variables de entorno de producción**
2. **Configurar SSL/HTTPS**
3. **Configurar cache de rutas y configuración**
4. **Configurar queue workers para notificaciones**
5. **Configurar backup automático de base de datos**

¡Con esta guía tienes todo lo necesario para crear un backend completo y funcional para el Berry Admin Dashboard!