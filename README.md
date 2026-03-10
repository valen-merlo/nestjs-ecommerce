# Challenge Sr Fullstack — E-commerce Event-Driven

Solución al Challenge Sr Fullstack (Microservicios): evolución de un monolito NestJS hacia un modelo event-driven con frontend React.

## URLs de acceso

- **Frontend:** https://ecommerce-frontend-ovz4.onrender.com
- **Backend:** https://ecommerce-backend-dl7d.onrender.com
- **Repositorio:** https://github.com/valen-merlo/nestjs-ecommerce

## Documentación completa

La documentación detallada (diagnóstico, eventos, decisiones técnicas, setup) se encuentra en:

📄 **[docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md)**

## Quick Start (local)

### Backend
```bash
docker-compose up -d
npm install
npm run migration:run
npm run seed:run
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

**Login admin:** `admin@admin.com` / `12345678`

## Stack

- **Backend:** NestJS, TypeORM, PostgreSQL, EventEmitter (event-driven)
- **Frontend:** React, TypeScript, Vite
- **Deploy:** Render (backend + DB + frontend)
```

---

## 2. Asegurate que las URLs en tu doc de `docs/` estén actualizadas

Verificá que en tu `docs/DOCUMENTATION.md` (o como se llame) tengas:
```
- Backend: https://ecommerce-backend-dl7d.onrender.com
- Frontend: https://ecommerce-frontend-ovz4.onrender.com