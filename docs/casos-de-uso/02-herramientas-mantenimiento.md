# Caso de uso: mantenimiento de tablas (CRUD a tablas de datos)

## 1. Objetivo

Proporcionar al docente una serie de herramientas para el mantenimiento de las tablas Ciclos, Cursos, Módulos, Prácticas, Discentes, RA, CE y Evaluaciones para que pueda hacer el CRUD en estas tablas de forma sencilla.

## 2. Lógica de Interfaz y Flujo (UI/UX)

En el menú "Herramientas" se habilitará un submenú "Mantenimiento" y dentro de éste una entrada por cada tabla enumerada enteriormente. UNa entrada para Ciclos, otra para Cursos...

## 3. Reglas de Negocio

Se creará una página para cada tabla que dispondrá de un título con el nombre de la tabla y un DataTable de Primereact con los datos de una de las tablas. En ese datatable se permitirá crear nuevas entradas en la tabla, modificar datos existentes (previa confirmación) y eliminar datos (previa confirmación). Se informará al usuario con el resultado ed realizar cada acción a través de un sistema de Toast. Este sistema se utilizará en toda la aplicación por lo que debe estar preparado para usarse en cualquier parte de la aplicación.

## 4. Obtención de Datos (Services) y Estados

Se creará un contexto para cada unidad de infromación (tabla) que contará con todas las acciones referidas a esas tablas utilizando un hook personalizado para cada uno de ellos (recuerda que estos hooks deben utilizar, a su vez, useDatos para interactuar con el servicio de Supabase). Además, se creará un hook para utilizar los contextos creados.