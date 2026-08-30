# Caso de uso: incio sesión de usuario.

## 1. Objetivo

Proporcionar al docente un sistema de inicio de sesión para poder consultar los datos del servicio de Supabase.

## 2. Lógica de Interfaz y Flujo (UI/UX)

Ya existe un apartado para iniciar sesión que deberá ser modificado. Se deberá crear una página extra para iniciar sesión que contendrá un formulario para inciar sesión.

## 3. Reglas de Negocio

Si no hay sesión iniciada enviará al usuario a una página de "Inicio de sesión". Cuando se inicie la sesión el usuario tendrá acceso a todo el contenido de la aplicación y aparecerá la información de usuario y el botón de "Salir" (exactamente igual que está ahora). Si el usuario no tiene la sesión iniciada no podrá acceder a ninguna parte de la web. Crea un hook y un contexto para esta funcionalidad.

## 4. Obtención de Datos (Services) y Estados

Deberás utilizar el sistema que ofrece Supabase de usuario/contraseña y evitar usar cualquier otro.
