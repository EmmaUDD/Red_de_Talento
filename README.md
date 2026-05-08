# Red Talento Caro

Plataforma web que conecta a los estudiantes técnico-profesionales del **Liceo Cardenal Caro** (Lo Espejo, Santiago) con empresas locales. Los docentes validan las habilidades de los alumnos con un sello institucional, y las empresas pueden buscar, contactar y contratar talento directamente desde la plataforma.

---

## Descripción general

Red Talento Caro es un proyecto de Ingeniería de Software desarrollado para resolver un problema real: los estudiantes TP del liceo no tienen una forma estructurada de mostrar sus habilidades a empleadores, y las empresas locales no tienen acceso fácil a ese talento.

La plataforma tiene **tres roles**:

| Rol | Descripción |
|---|---|
| **Estudiante** | Crea su perfil, agrega habilidades y evidencias, postula a ofertas laborales, genera su QR de presentación |
| **Docente** | Valida las habilidades de los estudiantes, gestiona cursos, aprueba cuentas nuevas, ve estadísticas |
| **Empresa** | Publica ofertas laborales, busca estudiantes, ve recomendaciones personalizadas, contrata |

---

## Stack tecnológico

### Backend
- **Python / Django 6.0.3** + Django REST Framework
- **SimpleJWT** — autenticación con tokens JWT
- **MySQL** — base de datos relacional
- **Gunicorn** — servidor WSGI en producción
- **qrcode** — generación de QR por estudiante

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Motion (motion/react)** — animaciones
- **React Router v7** — navegación SPA
- **Lucide React** — íconos
- **qrcode.react** — renderizado del QR en el perfil

### Infraestructura
- **AWS EC2 (t3.micro)** — servidor Ubuntu
- **Nginx** — proxy reverso + servir frontend estático
- **MySQL** en el mismo servidor

---

## Funcionalidades principales

### Estudiantes
- Perfil con foto, bio, especialidad y video pitch (YouTube u otro enlace)
- Agregar habilidades técnicas y blandas (validadas por docentes con nivel Alto/Medio/Bajo)
- Subir evidencias y proyectos con imágenes
- Postular a ofertas laborales con mensaje personalizado
- Ver estado de postulaciones en tiempo real
- Código QR personal que genera un perfil público compartible (sin login)
- Sistema de insignias: se ganan automáticamente al cumplir logros

### Docentes
- Validar habilidades de estudiantes
- Gestionar y validar cursos completados
- Aprobar cuentas nuevas de estudiantes
- Ver estadísticas de la plataforma (contrataciones por mes, totales)
- Publicar eventos y anuncios en el feed

### Empresas
- Publicar ofertas laborales (full-time, part-time, práctica) con filtros de modalidad, salario y ubicación
- Buscar estudiantes por nombre, especialidad y disponibilidad
- Ver recomendaciones personalizadas basadas en las habilidades requeridas en sus ofertas
- Gestionar postulaciones y marcar contrataciones

### Sistema de insignias
Los estudiantes desbloquean insignias automáticamente:

| Insignia | Criterio |
|---|---|
| ⭐ Primera Habilidad Validada | Un docente aprueba su primera habilidad |
| 💼 Primer Empleo | Una empresa los marca como contratados |
| 📚 3 Cursos Completados | Validan 3 cursos |
| 🎓 5 Cursos Completados | Validan 5 cursos |
| 🏆 10 Cursos Completados | Validan 10 cursos |
| ✅ Perfil Completo | Completan bio, foto y especialidad |

### Perfil público (QR)
Al escanear el QR de un estudiante, cualquier persona puede ver (sin login):
- Foto, nombre, especialidad y estado de validación
- Bio e insignias obtenidas
- Video pitch (miniatura clicable si es YouTube)
- Habilidades validadas con barras de nivel
- Proyectos y evidencias con imágenes

---

## Estructura del proyecto

```
Proyecto Inge Softw/
├── red_talento/                  # App principal Django
│   ├── models.py                 # Modelos de datos
│   ├── views.py                  # Vistas y lógica de negocio
│   ├── serializers.py            # Serializers DRF
│   ├── urls.py                   # Rutas del API
│   ├── permissions.py            # Permisos por rol
│   ├── utils.py                  # Score de recomendaciones
│   └── management/commands/      # Comandos de gestión
│       └── crear_insignias.py    # Seed de insignias base
├── redtalentocaro_api/           # Configuración Django
│   ├── settings.py
│   └── urls.py
├── red_talento_front/            # Frontend React
│   ├── src/
│   │   ├── api/api.ts            # Todas las llamadas al backend
│   │   └── app/
│   │       ├── components/       # Componentes por rol
│   │       │   ├── student/
│   │       │   ├── teacher/
│   │       │   ├── company/
│   │       │   ├── shared/
│   │       │   └── vistas/       # Vistas de perfil de otros usuarios
│   │       ├── types/index.ts    # Tipos TypeScript
│   │       └── routes.tsx        # Rutas de la SPA
│   └── dist/                     # Build de producción
└── manage.py
```

---

## Instalación local

### Requisitos
- Python 3.11+
- Node.js 18+
- MySQL

### Backend

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd "Proyecto Inge Softw"

# Crear y activar entorno virtual
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno (crear archivo .env)
# SECRET_KEY=...
# DB_NAME=red_talento
# DB_USER=...
# DB_PASSWORD=...
# DB_HOST=localhost
# ALLOWED_HOSTS=localhost,127.0.0.1

# Aplicar migraciones
python manage.py migrate

# Crear insignias base
python manage.py crear_insignias

# Iniciar servidor
python manage.py runserver
```

### Frontend

```bash
cd red_talento_front

# Instalar dependencias
npm install

# Crear archivo .env
# VITE_API_URL=http://127.0.0.1:8000

# Iniciar en desarrollo
npm run dev

# Compilar para producción
npm run build
```

---

## API — Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/login/` | Login — retorna JWT con rol |
| POST | `/api/registro/estudiante/` | Registro estudiante |
| POST | `/api/registro/empresa/` | Registro empresa |
| POST | `/api/registro/docente/` | Registro docente |
| GET/PATCH | `/api/me/` | Perfil del usuario autenticado |
| GET | `/api/perfil/estudiante/<id>/` | Perfil público estudiante |
| GET | `/api/perfil/estudiante/<id>/qr/` | QR del estudiante |
| GET/POST | `/api/habilidades/` | Habilidades del estudiante |
| PATCH | `/api/habilidades/<id>/validar/` | Validar habilidad (docente) |
| GET/POST | `/api/ofertas/` | Ofertas laborales |
| GET/POST | `/api/postulaciones/` | Postulaciones |
| PATCH | `/api/postulaciones/<id>/` | Actualizar estado postulación |
| GET/POST | `/api/feed/` | Feed de publicaciones |
| GET | `/api/estudiantes/` | Buscar estudiantes |
| GET | `/api/empresa/recomendaciones/` | Recomendaciones para empresa |
| GET | `/api/mis-insignias/` | Insignias del estudiante autenticado |
| GET | `/api/estadisticas/` | Estadísticas (solo docentes) |
| PATCH | `/api/estudiantes/<id>/activar/` | Aprobar cuenta estudiante |

---

## Despliegue (producción)

El proyecto corre en una instancia AWS EC2 con Ubuntu:

- **Nginx** sirve el frontend desde `/var/www/html/` y hace proxy de `/api/` a Gunicorn
- **Gunicorn** escucha en socket Unix `/home/ubuntu/app/gunicorn.sock`
- **MySQL** configurado con bajo consumo de memoria para t3.micro (1GB RAM)

---

## Equipo

Proyecto desarrollado como trabajo de Ingeniería de Software para el **Liceo Cardenal Caro**, Lo Espejo, Santiago de Chile.
