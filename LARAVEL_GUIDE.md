## Guía Definitiva y Corregida: Backend para Berry Dashboard con Laravel

### Fase 1: Preparación del Entorno

1.  **Requisitos Previos**: Asegúrate de tener instalado Composer y un entorno de desarrollo como XAMPP (con Apache y MySQL en funcionamiento).
2.  **Crear el Proyecto Laravel**: Abre tu terminal (se recomienda usar Git Bash o la Terminal de Windows) y ejecuta:
    ```bash
    composer create-project laravel/laravel dashboard-miu-base-be
    ```
3.  **Acceder al Directorio**:
    ```bash
    cd dashboard-miu-base-be
    ```

### Fase 2: Instalación de Dependencias

Instalaremos todos los paquetes necesarios en un solo comando.
```bash
composer require laravel/sanctum spatie/laravel-permission barryvdh/laravel-cors laravel/telescope --dev
```

### Fase 3: Configuración Inicial del Proyecto

1.  **Configurar el Archivo `.env`**: Abre el archivo `.env` y modifica las siguientes líneas. **Estos valores son cruciales y ya incluyen las correcciones para evitar errores posteriores.**

    ```env
    APP_NAME="Berry Admin API"
    APP_URL=http://localhost:8000

    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=berry_admin  # Usaremos este nombre
    DB_USERNAME=root
    DB_PASSWORD=

    # Corrección: Usamos 'file' para evitar errores antes de la migración.
    CACHE_STORE=file 
    
    SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
    ```

2.  **Configurar CORS**: Abre el archivo `config/cors.php` y reemplaza su contenido:
    ```php
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

### Fase 4: Creación de la Base de Datos

1.  Abre tu navegador y ve a `http://localhost/phpmyadmin/`.
2.  Haz clic en la pestaña "Bases de datos".
3.  En "Crear base de datos", escribe `berry_admin` y haz clic en "Crear".

### Fase 5: Migraciones (El Código Corregido)

1.  **Modificar la migración `users`**: Busca en `database/migrations/` el archivo `..._create_users_table.php` y reemplaza su contenido:
    ```php
    // .../database/migrations/..._create_users_table.php
    <?php
    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;
    return new class extends Migration {
        public function up(): void {
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
        public function down(): void { Schema::dropIfExists('users'); }
    };
    ```

2.  **Crear y llenar la migración de `modules`**:
    ```bash
    php artisan make:migration create_modules_table
    ```
    Abre el archivo nuevo en `database/migrations/` y ponle este contenido:
    ```php
    // .../database/migrations/..._create_modules_table.php
    <?php
    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;
    return new class extends Migration {
        public function up(): void {
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
            });
        }
        public function down(): void { Schema::dropIfExists('modules'); }
    };
    ```

3.  **Corregir la migración de `notifications`**: Busca en `database/migrations/` el archivo `..._create_notifications_table.php` y reemplaza su método `up()` con esta versión **corregida** para evitar el error `Duplicate key name`.
    ```php
    // .../database/migrations/..._create_notifications_table.php
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable'); // Esta línea ya crea el índice, no se necesita más.
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }
    ```

### Fase 6: Modelos, Requests y Controladores

1.  **Crear Modelos**:
    ```bash
    php artisan make:model Module
    ```
    (El modelo `User` ya existe, solo lo modificaremos).

2.  **Crear Requests de Validación**:
    ```bash
    php artisan make:request LoginRequest
    php artisan make:request RegisterRequest
    php artisan make:request StoreUserRequest
    php artisan make:request UpdateUserRequest
    ```

3.  **Crear todos los Controladores**:
    ```bash
    php artisan make:controller Api/AuthController
    php artisan make:controller Api/UserController --api
    php artisan make:controller Api/RoleController --api
    php artisan make:controller Api/PermissionController --api
    php artisan make:controller Api/ModuleController --api
    php artisan make:controller Api/DashboardController
    php artisan make:controller Api/NotificationController
    ```

4.  **Rellenar el Código**: Ahora, copia y pega el contenido completo para cada uno de los archivos generados. *(Por brevedad, te pido que uses los códigos de mi respuesta anterior, ya que son los correctos y completos. Si los necesitas de nuevo, solo dilo y los volveré a poner aquí).*

### Fase 7: Rutas de la API

Abre `routes/api.php` y reemplaza todo su contenido con esto:
```php
<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Rutas Públicas
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Rutas Protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::apiResource('users', UserController::class);
    Route::patch('/users/{user}/status', [UserController::class, 'updateStatus']);
    Route::post('/users/{user}/roles', [UserController::class, 'assignRoles']);
    Route::apiResource('roles', RoleController::class);
    Route::post('/roles/{role}/permissions', [RoleController::class, 'assignPermissions']);
    Route::apiResource('permissions', PermissionController::class)->only(['index']);
    Route::get('/permissions/module/{module}', [PermissionController::class, 'getByModule']);
    Route::apiResource('modules', ModuleController::class);
    Route::get('/modules/tree', [ModuleController::class, 'getTree']);
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/charts/{type}', [DashboardController::class, 'chartData']);
    Route::get('/dashboard/recent-activity', [DashboardController::class, 'recentActivity']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
});
```

### Fase 8: Seeders (Datos Iniciales)

1.  **Crear los archivos Seeders**:
    ```bash
    php artisan make:seeder RoleSeeder
    php artisan make:seeder UserSeeder
    ```
2.  **Rellenar `DatabaseSeeder.php`**: Abre `database/seeders/DatabaseSeeder.php` y asegúrate de que su método `run()` llame a los otros seeders.
    ```php
    <?php
    namespace Database\Seeders;
    use Illuminate\Database\Seeder;
    class DatabaseSeeder extends Seeder {
        public function run(): void {
            $this->call([
                RoleSeeder::class,
                UserSeeder::class,
            ]);
        }
    }
    ```
    *(Asegúrate de rellenar también `RoleSeeder.php` y `UserSeeder.php` con el código proporcionado anteriormente).*

### Fase 9: La Secuencia Final de Comandos

Ejecuta estos comandos en tu terminal, **en este orden exacto**. Esta es la secuencia que prepara, migra, enlaza y puebla todo tu proyecto.

1.  **Publicar archivos de configuración de los paquetes**:
    ```bash
    php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
    php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
    ```

2.  **Limpiar la caché de configuración**:
    ```bash
    php artisan config:clear
    ```

3.  **Borrar tablas antiguas y ejecutar todas las migraciones**:
    ```bash
    php artisan migrate:fresh
    ```

4.  **Crear el enlace simbólico para el almacenamiento de archivos**:
    ```bash
    php artisan storage:link
    ```

5.  **Poblar la base de datos con los datos de ejemplo**:
    ```bash
    php artisan db:seed
    ```

### Fase 10: ¡Ejecutar y Probar!

¡Todo está listo! Inicia el servidor:

```bash
php artisan serve
```

Tu API estará funcionando en `http://localhost:8000`. Puedes usar Postman para probar el endpoint `POST http://localhost:8000/api/auth/login` con el email `admin@berry.com` y la contraseña `admin123`.