# Caso de uso 03: Gestión de Sesión y Autenticación

## 1. Objetivo

Proporcionar al docente un sistema de acceso seguro (autenticación) para consultar y gestionar los datos de la base de datos, garantizando que ninguna vista de la aplicación quede expuesta a usuarios no autorizados.

## 2. Lógica de Interfaz y Flujo (UI/UX)

* **Vista de Login:** Se creará una página de "Inicio de sesión" independiente (`/login`). Constará de un panel central (`Card` de PrimeReact) que contendrá un formulario con los campos `InputText` (para el correo) y `Password` (para la contraseña, preferiblemente sin *feedback* de seguridad para agilizar el login), junto a un `Button` de envío.
* **Cabecera (Layout Global):** Una vez iniciada la sesión, el usuario accederá al *Layout* principal de la aplicación. En la barra superior (cabecera) deberá aparecer el correo o nombre del usuario logueado junto a un botón de "Salir" (`Button` con un icono de PrimeIcons como `pi-sign-out`).
* **Feedback:** Si las credenciales son incorrectas, se informará al usuario mediante el sistema global de notificaciones (`Toast` de PrimeReact).

## 3. Reglas de Negocio y Enrutamiento

* **Bloqueo Total (Protected Routes):** Se utilizará `react-router-dom` para crear un componente envoltorio de rutas privadas (ej. `<RutaPrivada>`). Si un usuario no autenticado intenta acceder a cualquier URL (como `/dashboard` o `/mantenimiento`), será redirigido forzosamente a `/login`.
* Si un usuario ya tiene sesión iniciada e intenta navegar a `/login`, el sistema debe redirigirlo automáticamente a la página principal (`/dashboard`).

## 4. Obtención de Datos y Arquitectura de Estados

* **Supabase Auth:** Se utilizará exclusivamente el servicio nativo de Supabase de Autenticación mediante Email/Contraseña (`signInWithPassword` y `signOut`). No se habilitarán proveedores sociales (OAuth) de momento.
* **Contexto Global:** Se creará un contexto (`AuthContext`) que escuchará los cambios de estado de la sesión de Supabase (`onAuthStateChange`).
* **Custom Hook:** Se expondrá un hook llamado `useAuth` para que cualquier componente de la aplicación pueda acceder fácilmente al usuario actual (`user`) y a las funciones de `login` y `logout`, aislando así la lógica directa del SDK de Supabase.
