# MecaPro Backend — Development Notes

Living documentation of changes made, how they work, and why decisions were made.

---

## Table of Contents
- [Project Setup](#1-project-setup)
- [Database & Prisma](#2-database--prisma)
- [Auth Module](#3-auth-module)
- [Garages Module](#4-garages-module)

---

## 1. Project Setup

**Date:** Feb 2026  
**Branch:** `develop`

### What was done
- Initialized **NestJS** project in `Backend/` with TypeScript
- Initialized **Next.js** project in `Frontend/` with TypeScript + Tailwind CSS + App Router
- Created `.env` (not committed) and `.env.example` (committed as template)
- Set up `.gitignore` with NestJS standards (excludes `.env`, `node_modules`, `dist`)

### .env structure
```
DATABASE_URL=postgresql://user:password@localhost:5432/mecapro
PORT=3001
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
TWILIO_ACCOUNT_SID=   # optional
TWILIO_AUTH_TOKEN=    # optional
TWILIO_PHONE_NUMBER=  # optional
```

---

## 2. Database & Prisma

**Date:** Feb 2026  
**Files:** `prisma/schema.prisma`, `prisma.config.ts`, `src/prisma/`

### What was done
- Created PostgreSQL database `mecapro`
- Applied `schema.sql` — 35 tables, 28 enums, 80+ indexes, seed data (cities, categories, car brands, admin user)
- Installed Prisma 7 (`prisma` dev, `@prisma/client` runtime)
- Ran `prisma db pull` to introspect the existing DB and generate `prisma/schema.prisma`

### How it works
```
prisma.config.ts          ← Prisma CLI config (for db pull, migrations, studio)
prisma/schema.prisma      ← Auto-generated models from DB introspection
src/prisma/prisma.service.ts  ← NestJS service wrapping PrismaClient
src/prisma/prisma.module.ts   ← @Global() module — available in all modules
```

### Prisma 7 NOTE ⚠️
Prisma 7 removed the binary query engine. It now uses **WASM** (`query_compiler_fast_bg.wasm`).  
This means `PrismaClient` requires a **Driver Adapter** to connect:

```typescript
// prisma.service.ts
import { PrismaPg } from '@prisma/adapter-pg';

constructor() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  super({ adapter });
}
```

Package installed: `@prisma/adapter-pg`, `pg`

### Usign Prisma in any service
```typescript
constructor(private prisma: PrismaService) {}

this.prisma.users.findMany()
this.prisma.garages.findFirst({ where: { id } })
```

### Useful commands
```bash
npx prisma studio          # Visual browser UI at http://localhost:5555
npx prisma db pull         # Re-sync schema from DB
npx prisma generate        # Regenerate typed client after schema changes
npx prisma validate        # Validate schema.prisma
```

---

## 3. Auth Module

**Date:** Feb 2026  
**Files:** `src/auth/`

### What was done
Full authentication system built from scratch.

### Packages installed
```
@nestjs/jwt, @nestjs/passport, passport, passport-jwt, passport-local
bcrypt, twilio, class-validator, class-transformer
@types/bcrypt, @types/passport-jwt, @types/passport-local, @types/passport
```

### Endpoints

| Method | Route | Guard | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register with email or phone |
| POST | `/api/auth/login` | LocalAuthGuard | Login, returns JWT pair |
| POST | `/api/auth/otp/send` | — | Send 6-digit SMS OTP (Twilio) |
| POST | `/api/auth/otp/verify` | — | Verify OTP, mark phone verified |
| POST | `/api/auth/refresh` | — | Rotate refresh token |
| POST | `/api/auth/logout` | JwtAuthGuard | Revoke refresh token |
| GET | `/api/auth/me` | JwtAuthGuard | Return current user profile |

### How tokens work

**Access token:** Short-lived (15min), sent as `Authorization: Bearer <token>` header.  
**Refresh token:** Long-lived (7d), stored **hashed** (SHA-256) in the `refresh_tokens` DB table.  
On refresh: old token is revoked, new pair is issued (rotation).  
On logout: refresh token is revoked.

### OTP flow
1. Client calls `POST /otp/send` with phone number
2. Server generates 6-digit code, **bcrypt hashes** it, stores in `otp_codes` table (10min expiry)
3. SMS sent via Twilio. If no Twilio credentials in `.env`, code is printed to **server console** (dev mode)
4. Client calls `POST /otp/verify` with phone + code
5. Server compares code against hash, marks user `is_phone_verified = true` and status `active`

### Guards & Decorators (use in any module)

```typescript
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard }   from '../auth/guards/roles.guard';
import { CurrentUser }  from '../auth/decorators/current-user.decorator';
import { Roles }        from '../auth/decorators/roles.decorator';

// Protect a route (any logged-in user)
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: any) { ... }

// Restrict to specific roles
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
deleteUser() { ... }

// Available roles: car_owner | garage_owner | supplier | admin
```

### File structure
```
src/auth/
  dto/
    register.dto.ts      email? | phone? (at least one), password?, name, role?
    login.dto.ts         identifier (email or phone) + password
    send-otp.dto.ts      phone
    verify-otp.dto.ts    phone + code (6 chars)
    refresh.dto.ts       refresh_token
  strategies/
    jwt.strategy.ts      Reads Bearer token, loads user from DB, attaches to req.user
    local.strategy.ts    Validates identifier + password for login route
  guards/
    jwt-auth.guard.ts    Extends AuthGuard('jwt') — use on protected routes
    local-auth.guard.ts  Extends AuthGuard('local') — used only on /login
    roles.guard.ts       Reads @Roles() metadata, checks req.user.role
  decorators/
    current-user.decorator.ts   @CurrentUser() — injects req.user into param
    roles.decorator.ts          @Roles(...roles) — metadata decorator
  auth.service.ts        All business logic
  auth.controller.ts     Route handlers
  auth.module.ts         Wires JwtModule + PassportModule, exports guards
```

### Password hashing
bcrypt with **12 salt rounds**. Password is optional at registration (social login / OTP-only accounts).

### main.ts changes
- `app.setGlobalPrefix('api')` → all routes under `/api/...`
- `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`
- `dotenv.config()` called at very top — required so `DATABASE_URL` is set before Prisma WASM engine initializes

---

## 4. Garages Module

**Date:** Feb 2026  
**Files:** `src/garages/`

### What was done
Built 12 endpoints across 3 access levels — public, garage owner, and admin.

### Endpoints

| Method | Route | Guard | Description |
|---|---|---|---|
| GET | `/api/garages` | — | Search with filters (city, type, specialization, rating) |
| GET | `/api/garages/:slug` | — | Public garage profile |
| POST | `/api/garages` | garage_owner | Create garage profile |
| GET | `/api/garages/me` | garage_owner | Own profile with full detail |
| PUT | `/api/garages/me` | garage_owner | Update profile |
| POST | `/api/garages/me/photos` | garage_owner | Add photo (client uploads, sends URL) |
| DELETE | `/api/garages/me/photos/:id` | garage_owner | Delete photo |
| POST | `/api/garages/me/services` | garage_owner | Add a service |
| PUT | `/api/garages/me/services/:id` | garage_owner | Update a service |
| DELETE | `/api/garages/me/services/:id` | garage_owner | Remove a service |
| POST | `/api/garages/me/documents` | garage_owner | Upload verification document |
| GET | `/api/admin/garages/pending` | admin | List pending applications |
| POST | `/api/admin/garages/:id/approve` | admin | Approve garage |
| POST | `/api/admin/garages/:id/reject` | admin | Reject with reason |

### Key design decisions

**Slug auto-generation:** Created from garage name using a `slugify()` helper. Uniqueness is guaranteed by retrying with a numeric suffix (`garage-karim-2` etc).

**File uploads:** Photos and documents accept a `file_url`/`url` string — the client uploads to storage (Cloudinary, S3, etc.) and sends the URL back. No server-side file handling yet (planned for storage module).

**Routing conflict fix:** `GET /api/garages/me` is registered **before** `GET /api/garages/:slug` in the controller — otherwise NestJS would match "me" as the slug param.

**Ownership checks:** Every owner action verifies the photo/service/document belongs to the requesting user's garage using a private `assertServiceOwnership()` / garage lookup before any mutation.

**Admin approval flow:**
- Garage created → `status: pending_review`
- Admin approves → `status: approved`, `accepted_at` set
- Admin rejects → `status: rejected`, `rejected_reason` stored
- Only `pending_review` garages can be approved/rejected (guard throws `BadRequestException` otherwise)

### File structure
```
src/garages/
  dto/
    create-garage.dto.ts       name, city_id, address, phone + optional fields
    update-garage.dto.ts       all fields optional (partial update)
    search-garages.dto.ts      city_id, type, specialization, rating_min, q, page, limit
    add-photo.dto.ts           url, caption?, is_primary?, sort_order?
    add-service.dto.ts         service_type, name, price_from/to, duration_minutes
    update-service.dto.ts      all optional + is_active toggle
    upload-document.dto.ts     doc_type, file_url, file_name?, file_size?
    reject-garage.dto.ts       reason (required string)
  garages.service.ts           all business logic (search, CRUD, admin ops)
  garages.controller.ts        GaragesController + AdminGaragesController
  garages.module.ts            registers both controllers + service
```

### garage_type enum values
`general` | `specialist` | `bodywork` | `dealer_service` | `mobile_mechanic`

### service_type enum values
`oil_change` | `brakes` | `ac` | `engine` | `bodywork` | `diagnostic` | `tires` | `electrical` | `exhaust` | `transmission` | `suspension` | `other`

### document_type enum values
`rc` | `ice` | `id_card` | `patent` | `insurance` | `certification` | `other`

