# Frontend - Flexi-book MVP

## 1. Descripción general
Este repositorio corresponde al **Frontend** del proyecto Flexi-book, un sistema de reservas tipo SaaS en contexto de MVP académico.  
Su propósito es implementar la capa visual del sistema, permitiendo que usuarios finales y responsables del negocio interactúen con la plataforma de forma clara y funcional.

## 2. Rol de este repositorio en el MVP
Dentro de la arquitectura `frontend + microservicios`, este repositorio cumple el rol de **capa de presentación e interacción**.  
Su objetivo en el MVP es ofrecer un flujo de punta a punta que permita demostrar el funcionamiento integral del sistema de reservas, desde el acceso hasta la gestión básica de operaciones visibles para el usuario.

## 3. Funcionalidades principales
En este repositorio se implementarán, dentro del alcance inicial del MVP, las vistas y flujos para:

1. Inicio de sesión (`login`).
2. Creación y gestión básica de reservas.
3. Consulta de disponibilidad.
4. Administración básica de información operativa del negocio en interfaz.

Estas funcionalidades se desarrollan únicamente a nivel de experiencia de usuario y consumo de APIs, dejando la lógica de negocio principal en los microservicios backend.

## 4. Relación con otros repositorios
Este frontend consume los servicios backend del proyecto:

1. `ms-auth`: autenticación y control de acceso.
2. `ms-configuration`: parámetros y configuración operativa necesarios para la interfaz.
3. `ms-reservation`: operaciones asociadas al ciclo de reservas y disponibilidad.

La relación está definida por contratos API, manteniendo separación de responsabilidades entre presentación y lógica de dominio.

## 5. Alcance inicial
El alcance inicial de este repositorio en el MVP es:

1. Construir una interfaz navegable y coherente para los casos principales de uso.
2. Integrar los flujos esenciales con los tres microservicios backend.
3. Validar una experiencia funcional mínima que permita presentar y evaluar el sistema completo.

Quedan fuera de este alcance inicial optimizaciones avanzadas, personalizaciones extensas y funcionalidades no esenciales para la validación del MVP.

## 6. Tecnologías esperadas
Para este repositorio se espera, como base tecnológica del MVP:

1. `React` para construcción de componentes y vistas.
2. `Vite` como entorno de desarrollo y empaquetado.
3. `Tailwind CSS` para estilos y consistencia visual.
4. Consumo de APIs HTTP para integración con microservicios.

La configuración final de herramientas y convenciones de desarrollo se ajustará conforme avance la implementación del MVP.
