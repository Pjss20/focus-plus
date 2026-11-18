# FOCUS+ — Plataforma Integral de Productividad Personal

> Aplicación web full-stack para gestionar hábitos, tareas, objetivos y desarrollo académico.

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?logo=mysql)](https://mysql.com)
[![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)](https://vite.dev)

## 🚀 Stack tecnológico

| Componente | Tecnología |
|---|---|
| Frontend | React 19 + Vite 8 |
| Diseño | Tailwind CSS v4 |
| Iconos | Lucide React |
| Gráficos | Recharts |
| Navegación | React Router v6 |
| Backend | Node.js + Express |
| Base de datos | MySQL 8.0 |
| Autenticación | JWT + bcrypt |
| HTTP Client | Axios |
| Notificaciones | react-hot-toast |

## 📁 Estructura del proyecto

```
focus +/
├── frontend/           # React + Vite app
│   ├── src/
│   │   ├── components/ # UI + páginas (12 módulos)
│   │   ├── context/    # Auth + Theme
│   │   ├── services/   # 10 servicios API
│   │   ├── hooks/      # useApi, useTimer, useLocalStorage...
│   │   └── utils/      # constants, dateHelpers, formatters
│   └── public/         # PWA manifest + service worker
├── backend/            # Node.js + Express REST API
│   ├── src/
│   │   ├── routes/     # 15 módulos de rutas
│   │   ├── controllers/
│   │   ├── middleware/ # auth, errorHandler, rateLimiter
│   │   └── config/    # DB pool, JWT
│   └── server.js
├── database/
│   └── schema.sql      # 24 tablas relacionales completas
└── docs/               # Guías de despliegue y API
```

## ⚙️ Instalación local

### Requisitos previos
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **MySQL 8.0** — [mysql.com](https://mysql.com)
- **MySQL Workbench 8.0 CE** — para administrar la base de datos
- **Git**

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/focus-plus.git
cd "focus +"
```

### 2. Configurar la base de datos
1. Abre **MySQL Workbench**
2. Conecta a tu servidor MySQL local (`localhost:3306`)
3. Abre y ejecuta `database/schema.sql`
4. La base de datos `focus_plus_db` se creará automáticamente con tablas y datos iniciales

### 3. Configurar el backend
```bash
cd backend
copy .env.example .env
# Edita .env con tu contraseña MySQL y un JWT_SECRET seguro
npm install
npm run dev
# El servidor corre en http://localhost:5000
```

### 4. Configurar el frontend
```bash
cd frontend
copy .env.example .env
# Ajusta VITE_API_URL si es necesario
npm install
npm run dev
# La app corre en http://localhost:5173
```

### 5. Acceder a la aplicación
Abre `http://localhost:5173` en tu navegador y regístrate.

## 🌐 Despliegue en producción

Ver guía completa en [`docs/deployment.md`](docs/deployment.md)

| Servicio | Uso | Plan gratuito |
|---|---|---|
| **Vercel** | Frontend (React) | ✅ Sí |
| **Render** | Backend (Node.js) | ✅ Sí |
| **Aiven** | MySQL en la nube | ✅ Sí (hasta 5 GB) |

## 📱 PWA — Instalar en el celular
Abre FOCUS+ en Chrome móvil → menú ⋮ → "Añadir a pantalla de inicio"

## 🛡️ Seguridad implementada
- ✅ Contraseñas cifradas con **bcrypt** (12 rounds)
- ✅ Tokens **JWT** con expiración de 7 días
- ✅ Consultas parametrizadas (sin riesgo de SQL injection)
- ✅ **Rate limiting** en autenticación (5 intentos / 15 min)
- ✅ **Helmet** para cabeceras de seguridad HTTP
- ✅ **CORS** configurado por dominio
- ✅ Variables de entorno para todas las credenciales
- ✅ El puerto MySQL **nunca** se expone directamente al browser

## 📋 Módulos de la aplicación

| Módulo | Ruta | Descripción |
|---|---|---|
| Dashboard | `/` | Resumen, hábitos del día, tareas próximas |
| Hábitos | `/habits` | Seguimiento diario con rachas y heatmap |
| Tareas | `/tasks` | CRUD completo con subtareas y prioridades |
| Objetivos | `/goals` | Metas cuantificables con registro de avance |
| Académico | `/academic` | Asignaturas, exámenes y trabajos |
| Calendario | `/calendar` | Vista mensual con todos los eventos |
| Planificador | `/planner` | Horario semanal por días |
| Temporizador | `/focus` | Pomodoro con historial de sesiones |
| Estadísticas | `/statistics` | Gráficos reales basados en registros |
| Logros | `/achievements` | Gamificación con insignias y puntos |
| Notas | `/notes` | Notas personales con colores y fijado |
| Perfil | `/profile` | Cuenta, preferencias y exportación |

## 🤝 Contribuir
1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Añade nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request
