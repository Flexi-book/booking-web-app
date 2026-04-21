# 📋 Guía de Testing - Flexibook MVP

## 1. Requisitos Previos

### Backend
- **Java 11+** instalado
- **Maven 3.6+** instalado
- **PostgreSQL** (si lo usa el backend)

Verifica con:
```bash
java -version
mvn -version
```

### Frontend
- **Node.js 16+** instalado
- **npm 8+** instalado

Verifica con:
```bash
node -version
npm -version
```

---

## 2. Levantar el Ambiente Local

### Terminal 1: Backend (Puerto 8080)

```bash
cd C:\Users\Fran\Documents\Flexibook\flexibook-backend\servicio-autenticacion
mvn spring-boot:run
```

**Espera a ver:**
```
Tomcat started on port 8080
```

Verifica que funciona:
```bash
curl http://localhost:8080/api/auth/test
```

Respuesta esperada:
```
Auth service is running!
```

---

### Terminal 2: Frontend (Puerto 5173)

```bash
cd C:\Users\Fran\Documents\Flexibook\booking-web-app
npm run dev
```

**Espera a ver:**
```
VITE v4.x.x ready in xxx ms

➜ Local:   http://localhost:5173/
```

---

## 3. Pruebas Funcionales

### 3.1 Pantalla de Login

**URL:** http://localhost:5173

**Pruebas:**
- [ ] La pantalla se ve centrada y responsive
- [ ] Campo email acepta valores
- [ ] Campo password acepta valores
- [ ] Botón "¿Olvidé mi contraseña?" navega a `/forgot-password`
- [ ] Link "Regístrate" navega a `/register`
- [ ] Botón Google muestra UI (sin funcionalidad por ahora)

**Intenta login con datos aleatorios:**
```
Email: test@test.com
Password: password123
```

Deberías ver error:
```
Error al iniciar sesión
```

---

### 3.2 Pantalla de Registro

**URL:** http://localhost:5173/register

**Pruebas:**
- [ ] Formulario muestra todos los campos:
  - [ ] Nombre de empresa
  - [ ] Email de contacto
  - [ ] Tipo de negocio
  - [ ] Nombre de usuario
  - [ ] Email
  - [ ] Contraseña (mín. 8 caracteres)
  - [ ] Confirmar contraseña

**Test de validación:**

1. **Contraseña < 8 caracteres:**
   ```
   Contraseña: 1234567 (7 caracteres)
   ```
   Resultado esperado: Error "La contraseña debe tener al menos 8 caracteres"

2. **Contraseñas no coinciden:**
   ```
   Contraseña: password123
   Confirmar: password124
   ```
   Resultado esperado: Error "Las contraseñas no coinciden"

3. **Registro exitoso:**
   ```
   Nombre empresa: Mi Empresa SPA
   Email contacto: contacto@empresa.com
   Tipo negocio: Servicios
   Nombre usuario: juan_doe
   Email usuario: juan@empresa.com
   Contraseña: password123
   Confirmar: password123
   ```
   Resultado esperado: Redirige a login con mensaje de éxito

---

### 3.3 Pantalla de Olvide mi Contraseña

**URL:** http://localhost:5173/forgot-password

**Pruebas:**
- [ ] Campo email acepta valores
- [ ] Botón "Enviar enlace de recuperación" funciona
- [ ] Muestra mensaje: "Hemos enviado un enlace..."
- [ ] Link "Volver al inicio de sesión" regresa a `/login`

**Test:**
```
Email: test@test.com
```

Resultado esperado: Mensaje informativo de email enviado

---

### 3.4 Login con Credenciales Válidas

Después de registrarte en 3.2, prueba login:

**URL:** http://localhost:5173/login

```
Email: juan@empresa.com
Contraseña: password123
```

**Resultado esperado:**
- ✅ Redirige a `/dashboard`
- ✅ JWT guardado en localStorage
- ✅ Panel moestra "Bienvenido a Flexibook"
- ✅ Botón "Cerrar sesión" funciona

---

### 3.5 Google OAuth (Pendiente)

**Estado actual:** Mock (no integrado)

Para activar:
1. Crear proyecto en [Google Cloud Console](https://console.cloud.google.com)
2. Obtener `Client ID`
3. Agregar a `.env.local`:
   ```
   VITE_GOOGLE_CLIENT_ID=tu_client_id_aqui
   ```
4. Reiniciar frontend: `npm run dev`

**Prueba cuando esté configurado:**
- [ ] Botón "Continuar con Google" muestra selector de cuentas
- [ ] Login redirige a dashboard
- [ ] JWT se guarda en localStorage

---

## 4. Flujo de Ramas y PRs

### Estructura de Ramas

```
feature/autenticacion
        ↓ (PR - Code Review)
develop
        ↓ (PR - Testing)
test
        ↓ (PR - Release)
main (PRODUCCIÓN)
```

---

### 4.1 Trabajar en Feature

Ya estás en `feature/autenticacion`. Haz cambios, commits:

```bash
cd booking-web-app
git add .
git commit -m "fix: mejorar validación de login"
```

---

### 4.2 PR: Feature → Develop

**En GitHub:**
1. Push tu rama: `git push origin feature/autenticacion`
2. Abre Pull Request: `feature/autenticacion` → `develop`
3. Describe cambios
4. Espera code review
5. Merge cuando aprueban

```bash
git push origin feature/autenticacion
```

---

### 4.3 PR: Develop → Test (QA)

Cuando develop está listo para testing:

```bash
cd booking-web-app
git checkout develop
git pull origin develop
```

**En GitHub:**
1. Abre PR: `develop` → `test`
2. QA realiza pruebas (sección 3 de este documento)
3. Si todo OK → merge

---

### 4.4 PR: Test → Main (Release)

Cuando test está validado:

```bash
cd booking-web-app
git checkout test
git pull origin test
```

**En GitHub:**
1. Abre PR: `test` → `main`
2. Code review final
3. Merge → **VA A PRODUCCIÓN**

---

## 5. Checklist de Testing

Antes de hacer PR a `develop`:

### Frontend
- [ ] `npm run dev` levanta sin errores
- [ ] No hay warnings en consola
- [ ] Todos los formularios validan correctamente
- [ ] Navegación entre pantallas funciona
- [ ] JWT se guarda en localStorage
- [ ] Logout limpia localStorage
- [ ] Responsive en mobile/tablet/desktop

### Backend
- [ ] `mvn spring-boot:run` levanta sin errores
- [ ] Endpoints `/api/auth/*` responden correctamente
- [ ] Validaciones de entrada funcionan
- [ ] Errores de BD se manejan

### Integración
- [ ] Frontend → Backend (CORS funcionando)
- [ ] Request/Response son correctos
- [ ] Tokens JWT se generan
- [ ] Autenticación protege rutas

---

## 6. Comandos Útiles

### Frontend
```bash
# Levantar desarrollo
npm run dev

# Build producción
npm run build

# Preview build
npm run preview

# Limpiar
rm -rf node_modules
npm install
```

### Backend
```bash
# Levantar
mvn spring-boot:run

# Build
mvn clean install

# Test
mvn test
```

### Git
```bash
# Ver ramas
git branch -a

# Cambiar rama
git checkout feature/autenticacion

# Ver cambios
git diff

# Status
git status

# Commit
git commit -m "mensaje"

# Push
git push origin feature/autenticacion

# Pull
git pull origin develop
```

---

## 7. Troubleshooting

### Backend no levanta
```bash
# Verifica puerto 8080 está disponible
netstat -ano | grep 8080

# Mata proceso en puerto 8080
taskkill /PID <pid> /F
```

### Frontend error de módulos
```bash
rm package-lock.json
rm -rf node_modules
npm install
npm run dev
```

### CORS error en requests
- Verifica backend tiene `@CrossOrigin(origins = "*")`
- Backend debe estar en http://localhost:8080
- Frontend hace request a `http://localhost:8080/api/auth/*`

### JWT no se guarda
- Abre DevTools (F12)
- Ve a Application → localStorage
- Verifica que exista clave `token`

---

## 8. Próximos Pasos

- [ ] Testear todo localmente
- [ ] Hacer PR a `develop`
- [ ] Code review
- [ ] Merge a `develop`
- [ ] Hacer PR a `test`
- [ ] QA valida
- [ ] Merge a `test`
- [ ] Hacer PR a `main`
- [ ] Release a producción

---

**Última actualización:** 2026-04-21  
**Responsable:** Frontend - Autenticación
