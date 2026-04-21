# 👥 Usuarios de Prueba - Flexibook MVP

## 1. Usuario DEVELOPER (Tú - Para Testing)

### Credenciales
```
Nombre empresa:      Flexibook Dev
Email contacto:      dev@flexibook.local
Tipo negocio:        Desarrollo/Testing
Nombre usuario:      dev_user
Email usuario:       dev@flexibook.local
Contraseña:          DevPassword123!
```

### Cómo Crear

**Opción 1: Via Interfaz (Recomendado)**

1. Abre http://localhost:5173/register
2. Rellena los datos de arriba
3. Click **Regístrate**
4. Deberías ver: "Registro exitoso"

**Opción 2: Via Base de Datos (Directo)**

```sql
-- Si usas PostgreSQL
INSERT INTO empresa (nombre, email, tipo_negocio) 
VALUES ('Flexibook Dev', 'dev@flexibook.local', 'Desarrollo/Testing');

INSERT INTO usuario (nombre, email, password, empresa_id) 
VALUES ('dev_user', 'dev@flexibook.local', '$2a$10$...hash...', 1);
```

---

## 2. Usuario COMERCIO (Cliente de Prueba)

### Credenciales - Comercio 1
```
Nombre empresa:      Peluquería La Bella
Email contacto:      contacto@labellabeauty.com
Tipo negocio:        Peluquería/Salón de Belleza
Nombre usuario:      peluqueria_admin
Email usuario:       admin@labellabeauty.com
Contraseña:          ComercioPassword123!
```

### Credenciales - Comercio 2
```
Nombre empresa:      Restaurante La Cocina
Email contacto:      info@lacocina.com
Tipo negocio:        Restaurante/Café
Nombre usuario:      cocina_admin
Email usuario:       admin@lacocina.com
Contraseña:          CocinPassword123!
```

### Cómo Crear

1. Abre http://localhost:5173/register
2. Rellena datos de "Comercio 1"
3. Click **Regístrate**
4. Repite para "Comercio 2"

---

## 3. Flujo de Testing Completo

### Escenario 1: Login como Developer
```bash
1. Abre http://localhost:5173/login
2. Email:    dev@flexibook.local
3. Password: DevPassword123!
4. Click "Iniciar sesión"
5. Resultado: Redirige a /dashboard
```

### Escenario 2: Login como Comercio
```bash
1. Abre http://localhost:5173/login
2. Email:    admin@labellabeauty.com
3. Password: ComercioPassword123!
4. Click "Iniciar sesión"
5. Resultado: Redirige a /dashboard
```

### Escenario 3: Registro Nuevo Usuario
```bash
1. Abre http://localhost:5173/register
2. Llena formulario con datos reales
3. Click "Regístrate"
4. Resultado: Redirige a /login con mensaje de éxito
5. Luego login con los datos creados
```

### Escenario 4: Google Auth (Una vez configurado)
```bash
1. Abre http://localhost:5173/login
2. Click "Continuar con Google"
3. Selecciona cuenta: fr.sanhueza.25@gmail.com
4. Resultado: Login automático y redirige a /dashboard
```

---

## 4. Datos a Guardar en localStorage

Después de login exitoso, verifica en DevTools (F12):

**Application → localStorage**

Deberías ver:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "token": "...",
    "type": "Bearer",
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "dev_user",
    "correo": "dev@flexibook.local"
  }
}
```

---

## 5. Estados de Autenticación

### No Autenticado
- Acceso a: `/login`, `/register`, `/forgot-password`
- No acceso a: `/dashboard`
- Resultado: Redirige a `/login`

### Autenticado
- Acceso a: `/dashboard`
- No acceso a: `/login`, `/register`
- Resultado: Navega a `/dashboard`

### Logout
- Limpia localStorage
- Redirige a `/login`

---

## 6. Validaciones a Probar

### Contraseña
- ✅ Mínimo 8 caracteres
- ✅ Máximo sin límite
- ✅ Acepta caracteres especiales
- ✅ Case-sensitive (mayúsculas/minúsculas importan)

### Email
- ✅ Formato válido (xxx@xxx.xxx)
- ✅ No duplicado al registrar (debería dar error)
- ✅ Sensible a mayúsculas en BD (verificar)

### Empresa
- ✅ Nombre requerido
- ✅ Email contacto requerido
- ✅ Tipo negocio requerido

---

## 7. Respuestas Esperadas del Backend

### Registro Exitoso (201)
```json
{
  "message": "User registered successfully!"
}
```

### Login Exitoso (200)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "nombre": "dev_user",
  "correo": "dev@flexibook.local"
}
```

### Error: Email Duplicado (400)
```json
{
  "error": "Email already exists"
}
```

### Error: Contraseña Incorrecta (401)
```json
{
  "error": "Invalid credentials"
}
```

### Error: Google Token Inválido (400)
```json
{
  "error": "Invalid Google token"
}
```

---

## 8. Checklist de Testing

- [ ] Developer login exitoso
- [ ] Developer ve dashboard
- [ ] Developer logout limpia token
- [ ] Comercio 1 login exitoso
- [ ] Comercio 2 login exitoso
- [ ] Registro nuevo usuario funciona
- [ ] Email duplicado da error
- [ ] Contraseña < 8 chars da error
- [ ] Google Auth muestra selector (si configurado)
- [ ] localStorage tiene token después de login
- [ ] Dashboard no accesible sin token
- [ ] Forgot password muestra pantalla

---

## 9. Reset de Usuarios (Limpieza)

Si necesitas empezar de nuevo:

**Opción 1: Borrar desde BD**
```sql
DELETE FROM usuario;
DELETE FROM empresa;
```

**Opción 2: Borrar localStorage en navegador**
```javascript
// En consola (F12)
localStorage.clear()
location.reload()
```

**Opción 3: Modo Incógnito/Privado**
- Abre navegador en modo privado
- Todos los datos se borran al cerrar

---

**Última actualización:** 2026-04-21  
**Estado:** Lista para testing
