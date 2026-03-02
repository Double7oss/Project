# MecaPro Backend — API Reference

**Base URL:** `http://localhost:3001/api`  
**Auth:** All protected endpoints require `Authorization: Bearer <access_token>`  
**Content-Type:** `application/json` (except file uploads which use `multipart/form-data`)

---

## Table of Contents

1. [Auth](#1-auth)
2. [Cities](#2-cities)
3. [Garages](#3-garages)
4. [Suppliers](#4-suppliers)
5. [Products](#5-products)
6. [Bookings](#6-bookings)
7. [Orders & Cart](#7-orders--cart)
8. [Notifications](#8-notifications)
9. [Upload](#9-upload)

---

## 1. Auth

### POST /api/auth/register
Create a new account with email or phone.

**Request**
```json
{
  "first_name": "Youssef",
  "last_name": "Amine",
  "email": "youssef@example.com",
  "password": "SecurePass123!",
  "role": "car_owner"
}
```
> You can register with `phone` instead of `email`. Roles: `car_owner`, `garage_owner`, `supplier`, `admin`.

**Response `201`**
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "email": "youssef@example.com",
    "first_name": "Youssef",
    "role": "car_owner"
  }
}
```

---

### POST /api/auth/login
Email/password login.

**Request**
```json
{
  "email": "youssef@example.com",
  "password": "SecurePass123!"
}
```

**Response `200`**
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "email": "youssef@example.com",
    "role": "car_owner"
  }
}
```

**Error `401`** — Wrong credentials
```json
{ "statusCode": 401, "message": "Unauthorized" }
```

---

### POST /api/auth/otp/send
Send a 6-digit OTP to a phone number.

**Request**
```json
{ "phone": "+212612345678" }
```

**Response `200`**
```json
{ "message": "OTP sent successfully" }
```

---

### POST /api/auth/otp/verify
Verify the OTP and mark phone as verified.

**Request**
```json
{
  "phone": "+212612345678",
  "code": "483920"
}
```

**Response `200`**
```json
{ "message": "Phone verified successfully" }
```

---

### POST /api/auth/refresh
Rotate refresh token and get a new access token.

**Request**
```json
{ "refresh_token": "eyJhbGci..." }
```

**Response `200`**
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci..."
}
```

---

### POST /api/auth/logout
🔒 Requires auth. Revokes the current refresh token.

**Headers:** `Authorization: Bearer <token>`  
**Body:** none

**Response `200`**
```json
{ "message": "Logged out successfully" }
```

---

### GET /api/auth/me
🔒 Requires auth. Returns current user profile.

**Response `200`**
```json
{
  "id": "uuid",
  "email": "youssef@example.com",
  "first_name": "Youssef",
  "last_name": "Amine",
  "role": "car_owner",
  "phone": "+212612345678",
  "phone_verified": true,
  "created_at": "2026-03-01T10:00:00Z"
}
```

---

## 2. Cities

### GET /api/cities
Returns all cities, ordered alphabetically. Used for dropdown menus.

**Response `200`**
```json
[
  { "id": 1, "name_fr": "Casablanca", "name_ar": "الدار البيضاء", "region": "Grand Casablanca", "latitude": "33.5731", "longitude": "-7.5898" },
  { "id": 2, "name_fr": "Rabat",      "name_ar": "الرباط",         "region": "Rabat-Salé",    "latitude": "34.0209", "longitude": "-6.8416" }
]
```

---

### GET /api/cities/:id

**Response `200`**
```json
{ "id": 1, "name_fr": "Casablanca", "name_ar": "الدار البيضاء", "region": "Grand Casablanca" }
```

---

## 3. Garages

### GET /api/garages
Search garages with filters.

**Query Params**
| Param | Type | Description |
|---|---|---|
| `city_id` | number | Filter by city |
| `type` | string | Garage type enum |
| `specialization` | string | Keyword filter |
| `rating_min` | number | Minimum rating |
| `page` | number | Default 1 |
| `limit` | number | Default 20 |

**Example:** `GET /api/garages?city_id=1&page=1&limit=10`

**Response `200`**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Garage Atlas",
      "slug": "garage-atlas",
      "garage_type": "general",
      "rating_avg": "4.50",
      "rating_count": 38,
      "is_featured": true,
      "city_id": 1,
      "cities": { "id": 1, "name_fr": "Casablanca" }
    }
  ],
  "meta": { "total": 42, "page": 1, "limit": 10, "pages": 5 }
}
```

---

### GET /api/garages/:slug
Public garage profile page.

**Response `200`**
```json
{
  "id": "uuid",
  "name": "Garage Atlas",
  "slug": "garage-atlas",
  "description": "Expert en réparation toutes marques",
  "phone": "+212522000000",
  "address": "12 Rue Ibn Batouta, Casablanca",
  "rating_avg": "4.50",
  "garage_type": "general",
  "specializations": ["brakes", "engine", "ac"],
  "garage_photos": [{ "id": "uuid", "url": "https://...", "is_primary": true }],
  "garage_services": [{ "id": "uuid", "service_type": "oil_change", "name": "Vidange", "price_from": 150, "price_to": 300 }]
}
```

**Error `404`**
```json
{ "statusCode": 404, "message": "Garage not found" }
```

---

### POST /api/garages
🔒 Role: `garage_owner`. Create a garage profile.

**Request**
```json
{
  "name": "Garage Atlas",
  "garage_type": "general",
  "city_id": 1,
  "address": "12 Rue Ibn Batouta, Casablanca",
  "phone": "+212522000000",
  "specializations": ["brakes", "engine"],
  "brands_served": ["Renault", "Peugeot"]
}
```

**Response `201`**
```json
{
  "id": "uuid",
  "slug": "garage-atlas",
  "status": "pending_review",
  "created_at": "2026-03-01T10:00:00Z"
}
```

---

### GET /api/garages/me
🔒 Role: `garage_owner`. Own garage profile with all details.

**Response `200`** — Same shape as public profile but includes all documents and services.

---

### PUT /api/garages/me
🔒 Role: `garage_owner`. Update garage profile. All fields optional.

**Request**
```json
{
  "description": "Spécialiste moteur et freins",
  "whatsapp": "+212612345678",
  "opening_hours": { "mon": "8:00-18:00", "fri": "8:00-12:00" }
}
```

**Response `200`** — Updated garage object.

---

### POST /api/garages/me/photos
🔒 Role: `garage_owner`. Add a photo (client uploads file first, sends back URL).

**Request**
```json
{
  "url": "https://storage.example.com/garage-atlas-1.jpg",
  "caption": "Workshop entrance",
  "is_primary": false
}
```

**Response `201`**
```json
{ "id": "uuid", "url": "https://...", "is_primary": false, "sort_order": 0 }
```

---

### DELETE /api/garages/me/photos/:id
🔒 Role: `garage_owner`. Delete a photo.

**Response `200`**
```json
{ "message": "Photo deleted" }
```

---

### POST /api/garages/me/services
🔒 Role: `garage_owner`.

**Request**
```json
{
  "service_type": "oil_change",
  "name": "Vidange moteur",
  "name_ar": "تغيير زيت المحرك",
  "price_from": 150,
  "price_to": 300,
  "duration_minutes": 30
}
```

**Response `201`** — Service object.

---

### PUT /api/garages/me/services/:id
🔒 Role: `garage_owner`. Update a service. All fields optional.

---

### DELETE /api/garages/me/services/:id
🔒 Role: `garage_owner`.

**Response `200`**
```json
{ "message": "Service removed" }
```

---

### POST /api/garages/me/documents
🔒 Role: `garage_owner`. Upload a verification document URL.

**Request**
```json
{
  "doc_type": "business_registration",
  "file_url": "https://storage.example.com/rc-garage-atlas.pdf",
  "file_name": "rc-garage-atlas.pdf",
  "file_size": 204800
}
```

**Response `201`** — Document object with `status: "pending"`.

---

### GET /api/admin/garages/pending
🔒 Role: `admin`. List garages awaiting review.

**Query Params:** `page`, `limit`

**Response `200`**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Garage Atlas",
      "status": "pending_review",
      "created_at": "...",
      "users": { "id": "uuid", "email": "owner@example.com" },
      "garage_documents": [{ "doc_type": "business_registration", "status": "pending" }]
    }
  ],
  "meta": { "total": 3, "page": 1, "limit": 20, "pages": 1 }
}
```

---

### POST /api/admin/garages/:id/approve
🔒 Role: `admin`.

**Response `200`**
```json
{ "id": "uuid", "status": "approved", "accepted_at": "2026-03-01T10:00:00Z" }
```

---

### POST /api/admin/garages/:id/reject
🔒 Role: `admin`.

**Request**
```json
{ "reason": "Documents manquants — veuillez fournir le RC et l'ICE." }
```

**Response `200`**
```json
{ "id": "uuid", "status": "rejected", "rejected_reason": "Documents manquants..." }
```

---

## 4. Suppliers

### GET /api/suppliers
Public search.

**Query Params:** `city_id`, `q` (name search), `page`, `limit`

**Response `200`**
```json
{
  "data": [
    {
      "id": "uuid",
      "business_name": "Pièces Auto Casablanca",
      "city_id": 1,
      "rating_avg": "4.20",
      "is_verified": true,
      "brands_carried": ["Bosch", "NGK", "Valeo"],
      "cities": { "id": 1, "name_fr": "Casablanca" }
    }
  ],
  "meta": { "total": 8, "page": 1, "limit": 20, "pages": 1 }
}
```

---

### GET /api/suppliers/:id
Public supplier profile.

**Response `200`** — Full supplier object with cities + document status list.

---

### POST /api/suppliers
🔒 Role: `supplier`. Create supplier profile.

**Request**
```json
{
  "business_name": "Pièces Auto Casablanca",
  "business_name_ar": "قطع غيار الدار البيضاء",
  "description": "Spécialiste pièces d'origine et compatibles",
  "city_id": 1,
  "address": "Derb Omar, Casablanca",
  "phone": "+212522111111",
  "specializations": ["brakes", "filters"],
  "brands_carried": ["Bosch", "NGK"]
}
```

**Response `201`**
```json
{ "id": "uuid", "status": "pending_review" }
```

---

### GET /api/suppliers/me
🔒 Role: `supplier`. Own profile with full document list.

---

### PUT /api/suppliers/me
🔒 Role: `supplier`. All fields optional.

---

### POST /api/suppliers/me/documents
🔒 Role: `supplier`.

**Request**
```json
{
  "doc_type": "business_registration",
  "file_url": "https://storage.example.com/rc.pdf",
  "file_name": "rc.pdf"
}
```

---

### GET /api/admin/suppliers/pending
🔒 Role: `admin`. Same shape as garages pending.

### POST /api/admin/suppliers/:id/approve
🔒 Role: `admin`.

### POST /api/admin/suppliers/:id/reject
🔒 Role: `admin`.

**Request** `{ "reason": "..." }`

---

## 5. Products

### GET /api/products
Public search.

**Query Params**
| Param | Type | Description |
|---|---|---|
| `q` | string | Name search |
| `category_id` | number | Category filter |
| `supplier_id` | string (UUID) | Filter by supplier |
| `condition` | string | `new`, `used`, `refurbished` |
| `price_min` | number | Min price (DH) |
| `price_max` | number | Max price (DH) |
| `part_brand` | string | Brand name |
| `page` | number | Default 1 |
| `limit` | number | Default 24 |

**Example:** `GET /api/products?category_id=5&condition=new&price_max=500`

**Response `200`**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Filtre à huile Bosch",
      "price": 85,
      "condition": "new",
      "part_brand": "Bosch",
      "stock_qty": 42,
      "categories": { "id": 5, "name_fr": "Filtres", "name_ar": "فلاتر" },
      "suppliers": { "id": "uuid", "business_name": "Pièces Auto Casa" },
      "product_images": [{ "url": "https://..." }]
    }
  ],
  "meta": { "total": 128, "page": 1, "limit": 24, "pages": 6 }
}
```

---

### GET /api/products/:id
Full product with images and car compatibility.

**Response `200`**
```json
{
  "id": "uuid",
  "name": "Filtre à huile Bosch",
  "price": 85,
  "oem_number": "0451103370",
  "product_images": [{ "url": "...", "is_primary": true }],
  "product_compatibility": [
    { "car_models": { "name": "Clio", "car_brands": { "name": "Renault" } }, "year_from": 2015, "year_to": 2022 }
  ]
}
```

---

### GET /api/products/me
🔒 Role: `supplier`. Supplier's own products with pagination.

---

### POST /api/products
🔒 Role: `supplier`. Create a product.

**Request**
```json
{
  "name": "Filtre à huile Bosch",
  "category_id": 5,
  "price": 85,
  "condition": "new",
  "part_brand": "Bosch",
  "oem_number": "0451103370",
  "stock_quantity": 50,
  "images": [
    "https://storage.example.com/products/filtre-bosch-1.jpg"
  ]
}
```

**Response `201`** — Product object with `status: "draft"`.

---

### PUT /api/products/:id
🔒 Role: `supplier` (ownership enforced). All fields optional.

**Request**
```json
{ "price": 90, "stock_quantity": 45 }
```

---

### DELETE /api/products/:id
🔒 Role: `supplier` (ownership enforced). Soft delete.

**Response `200`**
```json
{ "message": "Product deleted successfully" }
```

---

## 6. Bookings

### POST /api/bookings
🔒 Role: `car_owner`. Create a garage booking.

**Request**
```json
{
  "garage_id": "uuid-of-garage",
  "vehicle_id": "uuid-of-vehicle",
  "service_quote_id": "uuid-optional",
  "service_date": "2026-03-15T09:00:00Z",
  "notes": "Freins qui grincent à l'arrêt"
}
```

**Response `201`**
```json
{
  "id": "uuid",
  "status": "pending",
  "scheduled_at": "2026-03-15T09:00:00Z",
  "garages": { "id": "uuid", "name": "Garage Atlas", "phone": "+212522..." }
}
```

---

### GET /api/bookings
🔒 Requires auth. List own bookings.

**Query Params:** `page`, `limit`

**Response `200`**
```json
{
  "data": [
    {
      "id": "uuid",
      "scheduled_at": "2026-03-15T09:00:00Z",
      "status": "confirmed",
      "garages": { "name": "Garage Atlas", "logo_url": "https://..." }
    }
  ],
  "meta": { "total": 5, "page": 1, "limit": 20, "pages": 1 }
}
```

---

### GET /api/bookings/:id
🔒 Requires auth. Full booking detail.

---

### POST /api/bookings/:id/cancel
🔒 Requires auth. Cancel a `pending` or `confirmed` booking.

**Response `200`**
```json
{ "id": "uuid", "status": "cancelled", "cancelled_at": "2026-03-02T12:00:00Z" }
```

**Error `400`** — If already completed
```json
{ "statusCode": 400, "message": "Cannot cancel a booking with status 'completed'" }
```

---

### GET /api/garages/me/bookings
🔒 Role: `garage_owner`. Incoming bookings for own garage, ordered by scheduled date.

**Response `200`**
```json
{
  "data": [
    {
      "id": "uuid",
      "scheduled_at": "2026-03-15T09:00:00Z",
      "status": "pending",
      "client_notes": "Freins qui grincent",
      "users": { "first_name": "Youssef", "phone": "+212..." }
    }
  ],
  "meta": { "total": 12, "page": 1, "limit": 20, "pages": 1 }
}
```

---

### PUT /api/garages/me/bookings/:id/status
🔒 Role: `garage_owner`. Update booking status.

**Request**
```json
{ "status": "confirmed" }
```
> Status values: `confirmed`, `in_progress`, `completed`, `cancelled`

**Response `200`** — Updated booking object.

---

## 7. Orders & Cart

### GET /api/cart
🔒 Requires auth. Returns active cart (creates one if none exists).

**Response `200`**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "cart_items": [
    {
      "id": "uuid",
      "quantity": 2,
      "products": {
        "id": "uuid",
        "name": "Filtre à huile Bosch",
        "price": 85,
        "stock_qty": 42,
        "product_images": [{ "url": "https://..." }]
      }
    }
  ]
}
```

---

### POST /api/cart/items
🔒 Requires auth. Add a product to cart. If already in cart, increments quantity.

**Request**
```json
{
  "product_id": "uuid-of-product",
  "supplier_id": "uuid-of-supplier",
  "quantity": 2
}
```

**Response `200/201`** — Cart item object.

**Error `400`** — Insufficient stock
```json
{ "statusCode": 400, "message": "Only 5 units available" }
```

---

### PUT /api/cart/items/:id
🔒 Requires auth. Update quantity of a cart item.

**Request**
```json
{ "quantity": 3 }
```

---

### DELETE /api/cart/items/:id
🔒 Requires auth.

**Response `200`**
```json
{ "message": "Item removed from cart" }
```

---

### POST /api/orders
🔒 Requires auth. Checkout — converts active cart to an order and clears the cart.

**Request**
```json
{
  "delivery_address": {
    "full_name": "Youssef Amine",
    "phone": "+212612345678",
    "address": "12 Rue Allal Ben Abdallah",
    "city_id": 1
  },
  "payment_method": "cod",
  "notes": "Livraison après 14h svp"
}
```
> `payment_method` values: `cod`, `card`, `virement`

**Response `201`**
```json
{
  "id": "uuid",
  "status": "pending",
  "subtotal": 340,
  "total_amount": 340,
  "payment_method": "cod",
  "order_items": [
    {
      "product_name": "Filtre à huile Bosch",
      "unit_price": 85,
      "quantity": 2,
      "total_price": 170
    }
  ]
}
```

**Error `400`** — Empty cart
```json
{ "statusCode": 400, "message": "Cart is empty" }
```

---

### GET /api/orders
🔒 Requires auth. List own orders.

**Query Params:** `page`, `limit`

---

### GET /api/orders/:id
🔒 Requires auth. Full order with items, payment, and shipment info.

---

## 8. Notifications

### GET /api/notifications
🔒 Requires auth. Paginated list.

**Query Params:** `page`, `limit` (default 30)

**Response `200`**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "booking_confirmed",
      "title": "Réservation confirmée",
      "body": "Votre réservation chez Garage Atlas est confirmée pour le 15 mars.",
      "is_read": false,
      "created_at": "2026-03-02T10:00:00Z"
    }
  ],
  "meta": {
    "total": 24,
    "page": 1,
    "limit": 30,
    "pages": 1,
    "unread_count": 5
  }
}
```

---

### POST /api/notifications/read-all
🔒 Requires auth.

**Response `200`**
```json
{ "message": "5 notifications marked as read" }
```

---

### POST /api/notifications/:id/read
🔒 Requires auth.

**Response `200`** — Updated notification object with `is_read: true`.

---

## 9. Upload

> Send as `multipart/form-data`. Field name must be `file`.  
> Returns a `url` string — pass this URL to other endpoints (photos, documents, product images).

### POST /api/upload/image
🔒 Requires auth. Max 5 MB. Accepted: `jpg`, `jpeg`, `png`, `gif`, `webp`.

**Request** — `multipart/form-data`
```
Content-Type: multipart/form-data
field: file = <image file>
```

**Response `201`**
```json
{
  "url": "/uploads/images/1709423189234-847362910.jpg",
  "filename": "1709423189234-847362910.jpg",
  "size": 204800,
  "mimetype": "image/jpeg"
}
```

---

### POST /api/upload/document
🔒 Requires auth. Max 10 MB. Accepted: `pdf`, `jpg`, `jpeg`, `png`.

**Response `201`**
```json
{
  "url": "/uploads/documents/1709423200000-123456789.pdf",
  "filename": "1709423200000-123456789.pdf",
  "size": 512000,
  "mimetype": "application/pdf"
}
```

---

## Common Errors

| Status | Meaning |
|---|---|
| `400` | Bad request — validation failed or business rule violation |
| `401` | Not authenticated — missing or invalid token |
| `403` | Forbidden — wrong role or resource doesn't belong to you |
| `404` | Resource not found |
| `409` | Conflict — e.g. profile already exists |

**Error shape**
```json
{
  "statusCode": 400,
  "message": ["name must be longer than or equal to 2 characters"],
  "error": "Bad Request"
}
```
