# Guía de Buenas Prácticas: Git y GitHub

Esta guía resume cómo trabajar de forma profesional en los repositorios de **Flexibook**.

## 1. Commits Semánticos (Conventional Commits)
Usa mensajes claros que indiquen el **tipo** de cambio. Esto facilita entender el historial del proyecto.

*   `feat`: Una nueva funcionalidad (ej. `feat: agregar login con Google`).
*   `fix`: Solución a un error (ej. `fix: corregir redirección tras registro`).
*   `chore`: Tareas de mantenimiento o configuración (ej. `chore: actualizar .gitignore`).
*   `docs`: Cambios en la documentación.
*   `style`: Cambios que no afectan la lógica (espacios, formato, punto y coma).

**Ejemplo**: `git commit -m "feat: implementar validación de JWT en el backend"`

## 2. Flujo de Trabajo (Branches y PRs)

Para mantener la rama principal (`main` o `develop`) siempre estable, sigue este flujo:

1.  **Crea una rama de feature**: Nunca trabajes directamente en `main`.
    ```bash
    git checkout -b feature/nombre-de-tu-funcionalidad
    ```
2.  **Sube tus cambios**:
    ```bash
    git push origin feature/nombre-de-tu-funcionalidad
    ```
3.  **Crea un Pull Request (PR)**:
    - Ve a GitHub y verás un botón que dice "Compare & pull request".
    - Describe qué hiciste y pide una revisión (si trabajas en equipo).
4.  **Merge**: Una vez aprobado y verificado, une los cambios a la rama principal.

## 3. Seguridad y Archivos Ignorados

*   **Nunca subas tokens o contraseñas**: He configurado `.gitignore` para ignorar `.npmrc` y archivos `.env`.
*   **No subas archivos compilados**: He configurado `.gitignore` para ignorar la carpeta `target/` de Maven y `node_modules/` de Node.

## 4. Comandos Útiles

*   `git status`: Revisa qué archivos están listos para subir.
*   `git pull origin develop`: Trae los últimos cambios de otros compañeros.
*   `git log --oneline`: Mira un resumen rápido del historial.
