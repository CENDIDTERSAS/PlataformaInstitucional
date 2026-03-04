# Configuración del Backend (Supabase)

Esta carpeta contiene la lógica de base de datos y la estructura necesaria para que el proyecto funcione correctamente. En Supabase, el backend se configura principalmente ejecutando scripts SQL.

## Archivos Incluidos
1. **`schema.sql`**: Es el archivo principal. Contiene:
   - Definición de tablas (Inventario, Bodegas, Movimientos, Perfiles, Solicitudes).
   - Políticas de Seguridad (RLS) para proteger los datos.
   - Triggers y Funciones para el descuento automático de inventario.
   - Datos iniciales (Seed) para que el catálogo no esté vacío.

2. **`alter_perfiles.sql`**: Comandos específicos para adaptar tu tabla de referencia externa a este sistema.

## Pasos para Configurar en Supabase

### 1. Inicializar la Estructura
- Ve a tu proyecto en [Supabase Dashboard](https://supabase.com).
- Entra en la sección **SQL Editor**.
- Copia el contenido de `backend/schema.sql` y pégalo en una nueva consulta.
- Haz clic en **Run**.

### 2. Habilitar la Sincronización de Usuarios
- Asegúrate de que el Trigger `on_auth_user_created` se haya creado correctamente (está incluido al final del `schema.sql`).
- Esto hará que cada vez que alguien se registre en la App, se cree automáticamente su perfil en la tabla `perfiles` con su Cargo y Dependencia.

### 3. Configuración de Autenticación
- Ve a **Authentication > Providers > Email**.
- Asegúrate de que "Confirm Email" esté desactivado si quieres probar rápidamente, o configurado según tus necesidades de seguridad.

### 4. (Opcional) Adaptar Tabla Externa
- Si ya tienes datos en una tabla llamada `perfiles` en otro lugar y quieres traerlos aquí con el formato correcto, usa los comandos de `backend/alter_perfiles.sql`.

---
**Nota**: El backend de Supabase no requiere un archivo `.env` local. Las credenciales de conexión se ponen únicamente en el frontend (`.env.local`) para que este pueda comunicarse con la API de Supabase.
