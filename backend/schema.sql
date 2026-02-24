-- =============================================================================
-- MecaPro.ma — Full PostgreSQL Database Schema
-- Sprint 1 Deliverable — February 2026
-- =============================================================================
-- Modules:
--   1. Users & Authentication
--   2. Garages & Professionals
--   3. Parts Suppliers
--   4. Products & Parts Catalog
--   5. Bookings & Service Quotes
--   6. Orders & Cart
--   7. Delivery & Shipments
--   8. Notifications
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";     -- for accent-insensitive search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- for fuzzy text search

-- =============================================================================
-- ENUMS
-- =============================================================================

-- Users
CREATE TYPE user_role AS ENUM ('car_owner', 'garage_owner', 'supplier', 'admin');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'banned');
CREATE TYPE otp_purpose AS ENUM ('phone_verification', 'login', 'password_reset');

-- Garages
CREATE TYPE garage_type AS ENUM (
  'general',
  'specialist',
  'bodywork',
  'dealer_service',
  'mobile_mechanic'
);
CREATE TYPE garage_status AS ENUM (
  'pending_review',
  'approved',
  'suspended',
  'rejected'
);
CREATE TYPE service_type AS ENUM (
  'oil_change',
  'brakes',
  'ac',
  'engine',
  'bodywork',
  'diagnostic',
  'tires',
  'electrical',
  'exhaust',
  'transmission',
  'suspension',
  'other'
);

-- Suppliers
CREATE TYPE supplier_status AS ENUM (
  'pending_review',
  'approved',
  'suspended',
  'rejected'
);

-- Shared
CREATE TYPE subscription_plan AS ENUM ('free', 'starter', 'pro', 'premium');
CREATE TYPE document_type AS ENUM (
  'rc', 'ice', 'id_card', 'patent', 'insurance', 'certification', 'other'
);
CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected');

-- Products
CREATE TYPE product_status AS ENUM ('draft', 'active', 'out_of_stock', 'archived');
CREATE TYPE product_condition AS ENUM ('new', 'used', 'refurbished');
CREATE TYPE part_type AS ENUM ('genuine', 'aftermarket', 'compatible');

-- Bookings & Quotes
CREATE TYPE request_urgency AS ENUM ('flexible', 'this_week', 'urgent', 'emergency');
CREATE TYPE request_status AS ENUM (
  'open', 'quotes_received', 'booked', 'completed', 'cancelled'
);
CREATE TYPE quote_status AS ENUM (
  'pending', 'accepted', 'rejected', 'expired', 'withdrawn'
);
CREATE TYPE booking_status AS ENUM (
  'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
);

-- Orders
CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
);
CREATE TYPE payment_method AS ENUM (
  'cod', 'cmi_card', 'paypal', 'bank_transfer', 'invoice'
);
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Delivery
CREATE TYPE shipment_status AS ENUM (
  'pending', 'picked_up', 'in_transit', 'out_for_delivery',
  'delivered', 'failed', 'returned'
);
CREATE TYPE return_reason AS ENUM (
  'wrong_part', 'defective', 'not_as_described', 'changed_mind'
);
CREATE TYPE return_status AS ENUM (
  'requested', 'approved', 'rejected', 'received', 'refunded'
);

-- Notifications
CREATE TYPE notification_type AS ENUM (
  'booking_request',
  'quote_received',
  'booking_confirmed',
  'booking_completed',
  'order_shipped',
  'order_delivered',
  'garage_approved',
  'supplier_approved',
  'new_review',
  'low_stock',
  'message'
);


-- =============================================================================
-- MODULE 1 — USERS & AUTHENTICATION
-- =============================================================================

CREATE TABLE cities (
  id           SERIAL PRIMARY KEY,
  name_fr      VARCHAR(100) NOT NULL,
  name_ar      VARCHAR(100) NOT NULL,
  region       VARCHAR(100),
  latitude     DECIMAL(10, 8),
  longitude    DECIMAL(11, 8)
);

CREATE TABLE users (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email              VARCHAR(255) UNIQUE,
  phone              VARCHAR(20) UNIQUE,
  password_hash      VARCHAR(255),
  first_name         VARCHAR(100) NOT NULL,
  last_name          VARCHAR(100) NOT NULL,
  role               user_role NOT NULL DEFAULT 'car_owner',
  status             user_status NOT NULL DEFAULT 'pending',
  preferred_lang     VARCHAR(5) NOT NULL DEFAULT 'ar',
  avatar_url         TEXT,
  city_id            INTEGER REFERENCES cities(id) ON DELETE SET NULL,
  is_phone_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  is_email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at      TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at         TIMESTAMPTZ,

  CONSTRAINT users_email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE TABLE otp_codes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  identifier  VARCHAR(255) NOT NULL,
  code_hash   VARCHAR(255) NOT NULL,
  purpose     otp_purpose NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  attempts    SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  device_info JSONB,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_activity_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id    UUID NOT NULL REFERENCES users(id),
  action      VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id   UUID,
  details     JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- MODULE 2 — GARAGES & PROFESSIONALS
-- =============================================================================

CREATE TABLE garages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name             VARCHAR(255) NOT NULL,
  name_ar          VARCHAR(255),
  slug             VARCHAR(255) NOT NULL UNIQUE,
  description      TEXT,
  description_ar   TEXT,
  garage_type      garage_type NOT NULL DEFAULT 'general',
  city_id          INTEGER NOT NULL REFERENCES cities(id),
  address          TEXT NOT NULL,
  latitude         DECIMAL(10, 8),
  longitude        DECIMAL(11, 8),
  phone            VARCHAR(20) NOT NULL,
  whatsapp         VARCHAR(20),
  email            VARCHAR(255),
  website_url      TEXT,
  logo_url         TEXT,
  banner_url       TEXT,
  status           garage_status NOT NULL DEFAULT 'pending_review',
  plan             subscription_plan NOT NULL DEFAULT 'free',
  plan_expires_at  TIMESTAMPTZ,
  is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
  is_certified     BOOLEAN NOT NULL DEFAULT FALSE,
  specializations  TEXT[],
  brands_served    TEXT[],
  opening_hours    JSONB,
  -- Example: {"mon":{"open":"08:00","close":"18:00"},"fri":{"open":"08:00","close":"13:00"},"sat":null,"sun":null}
  price_range      VARCHAR(5),        -- '€' | '€€' | '€€€'
  rating_avg       DECIMAL(3, 2) NOT NULL DEFAULT 0,
  rating_count     INTEGER NOT NULL DEFAULT 0,
  response_rate    SMALLINT,          -- percentage 0-100
  total_bookings   INTEGER NOT NULL DEFAULT 0,
  accepted_at      TIMESTAMPTZ,
  rejected_reason  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

CREATE TABLE garage_photos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id   UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  caption     VARCHAR(255),
  is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE garage_services (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id        UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  service_type     service_type NOT NULL,
  name             VARCHAR(255) NOT NULL,
  name_ar          VARCHAR(255),
  price_from       INTEGER,           -- centimes
  price_to         INTEGER,           -- centimes
  duration_minutes SMALLINT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE garage_documents (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id        UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  doc_type         document_type NOT NULL,
  file_url         TEXT NOT NULL,
  file_name        VARCHAR(255),
  file_size        INTEGER,
  status           document_status NOT NULL DEFAULT 'pending',
  reviewed_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at      TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE garage_reviews (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id        UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  reviewer_id      UUID NOT NULL REFERENCES users(id),
  booking_id       UUID NOT NULL,     -- FK added after bookings table: see below
  rating           SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  quality_rating   SMALLINT CHECK (quality_rating BETWEEN 1 AND 5),
  price_rating     SMALLINT CHECK (price_rating BETWEEN 1 AND 5),
  speed_rating     SMALLINT CHECK (speed_rating BETWEEN 1 AND 5),
  comment          TEXT,
  garage_reply     TEXT,
  garage_replied_at TIMESTAMPTZ,
  is_visible       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- MODULE 3 — PARTS SUPPLIERS
-- =============================================================================

CREATE TABLE suppliers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name    VARCHAR(255) NOT NULL,
  business_name_ar VARCHAR(255),
  description      TEXT,
  rc_number        VARCHAR(50),
  ice_number       VARCHAR(50),
  city_id          INTEGER REFERENCES cities(id),
  address          TEXT,
  phone            VARCHAR(20) NOT NULL,
  whatsapp         VARCHAR(20),
  logo_url         TEXT,
  status           supplier_status NOT NULL DEFAULT 'pending_review',
  plan             subscription_plan NOT NULL DEFAULT 'free',
  plan_expires_at  TIMESTAMPTZ,
  is_verified      BOOLEAN NOT NULL DEFAULT FALSE,
  specializations  TEXT[],
  brands_carried   TEXT[],
  rating_avg       DECIMAL(3, 2) NOT NULL DEFAULT 0,
  rating_count     INTEGER NOT NULL DEFAULT 0,
  total_orders     INTEGER NOT NULL DEFAULT 0,
  rejected_reason  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

CREATE TABLE supplier_documents (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id      UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  doc_type         document_type NOT NULL,
  file_url         TEXT NOT NULL,
  file_name        VARCHAR(255),
  file_size        INTEGER,
  status           document_status NOT NULL DEFAULT 'pending',
  reviewed_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at      TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE supplier_reviews (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id  UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  reviewer_id  UUID NOT NULL REFERENCES users(id),
  order_id     UUID NOT NULL,         -- FK added after orders table: see below
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  is_visible   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscription_plans_history (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type  VARCHAR(20) NOT NULL CHECK (entity_type IN ('garage', 'supplier')),
  entity_id    UUID NOT NULL,
  plan         subscription_plan NOT NULL,
  price_paid   INTEGER NOT NULL DEFAULT 0,   -- centimes
  started_at   TIMESTAMPTZ NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  payment_ref  VARCHAR(100),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- MODULE 4 — PRODUCTS & PARTS CATALOG
-- =============================================================================

CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  parent_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name_fr     VARCHAR(100) NOT NULL,
  name_ar     VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  icon        VARCHAR(50),
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE car_brands (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  logo_url    TEXT,
  is_popular  BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE car_models (
  id           SERIAL PRIMARY KEY,
  brand_id     INTEGER NOT NULL REFERENCES car_brands(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  year_from    SMALLINT,
  year_to      SMALLINT,
  body_type    VARCHAR(50),
  engine_codes TEXT[]
);

CREATE TABLE products (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id           UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  category_id           INTEGER NOT NULL REFERENCES categories(id),
  name                  VARCHAR(255) NOT NULL,
  name_ar               VARCHAR(255),
  description           TEXT,
  oem_number            VARCHAR(100),
  part_brand            VARCHAR(100),
  condition             product_condition NOT NULL DEFAULT 'new',
  part_type             part_type NOT NULL DEFAULT 'aftermarket',
  price                 INTEGER NOT NULL,          -- centimes
  price_before_discount INTEGER,                   -- centimes
  stock_qty             INTEGER NOT NULL DEFAULT 0, -- -1 = unlimited
  low_stock_threshold   INTEGER,
  weight_grams          INTEGER,
  status                product_status NOT NULL DEFAULT 'draft',
  is_featured           BOOLEAN NOT NULL DEFAULT FALSE,
  view_count            INTEGER NOT NULL DEFAULT 0,
  sale_count            INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ
);

CREATE TABLE product_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt_text    VARCHAR(255),
  is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE product_compatibility (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  car_model_id INTEGER NOT NULL REFERENCES car_models(id) ON DELETE CASCADE,
  year_from    SMALLINT,
  year_to      SMALLINT,
  engine_code  VARCHAR(50),
  notes        TEXT,

  UNIQUE (product_id, car_model_id, engine_code)
);


-- =============================================================================
-- MODULE 5 — BOOKINGS & SERVICE QUOTES
-- =============================================================================

CREATE TABLE user_vehicles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_model_id  INTEGER NOT NULL REFERENCES car_models(id),
  year          SMALLINT NOT NULL,
  engine_code   VARCHAR(50),
  color         VARCHAR(50),
  mileage       INTEGER,
  license_plate VARCHAR(20),
  nickname      VARCHAR(100),
  is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE service_requests (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id),
  vehicle_id    UUID REFERENCES user_vehicles(id) ON DELETE SET NULL,
  city_id       INTEGER NOT NULL REFERENCES cities(id),
  service_types TEXT[] NOT NULL,
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  photos        TEXT[],
  urgency       request_urgency NOT NULL DEFAULT 'flexible',
  budget_max    INTEGER,               -- centimes
  status        request_status NOT NULL DEFAULT 'open',
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE service_quotes (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id          UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  garage_id           UUID NOT NULL REFERENCES garages(id),
  price_estimate      INTEGER NOT NULL,      -- centimes
  price_parts         INTEGER,               -- centimes breakdown
  price_labor         INTEGER,               -- centimes breakdown
  estimated_duration  SMALLINT,              -- hours
  available_from      TIMESTAMPTZ,
  message             TEXT,
  status              quote_status NOT NULL DEFAULT 'pending',
  valid_until         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (request_id, garage_id)
);

CREATE TABLE bookings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id),
  garage_id           UUID NOT NULL REFERENCES garages(id),
  vehicle_id          UUID REFERENCES user_vehicles(id) ON DELETE SET NULL,
  quote_id            UUID REFERENCES service_quotes(id) ON DELETE SET NULL,
  request_id          UUID REFERENCES service_requests(id) ON DELETE SET NULL,
  service_types       TEXT[] NOT NULL,
  scheduled_at        TIMESTAMPTZ NOT NULL,
  duration_minutes    SMALLINT,
  status              booking_status NOT NULL DEFAULT 'pending',
  final_price         INTEGER,               -- centimes — set at completion
  garage_notes        TEXT,
  client_notes        TEXT,
  completed_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK constraint for garage_reviews.booking_id now that bookings table exists
ALTER TABLE garage_reviews
  ADD CONSTRAINT fk_garage_reviews_booking
  FOREIGN KEY (booking_id) REFERENCES bookings(id);


-- =============================================================================
-- MODULE 6 — ORDERS & CART
-- =============================================================================

CREATE TABLE carts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cart_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id     UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id),
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (cart_id, product_id)
);

CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id         UUID NOT NULL REFERENCES users(id),
  buyer_type       VARCHAR(20) NOT NULL DEFAULT 'car_owner'
                     CHECK (buyer_type IN ('car_owner', 'garage')),
  status           order_status NOT NULL DEFAULT 'pending',
  subtotal         INTEGER NOT NULL DEFAULT 0,    -- centimes
  delivery_fee     INTEGER NOT NULL DEFAULT 0,    -- centimes
  discount_amount  INTEGER NOT NULL DEFAULT 0,    -- centimes
  total_amount     INTEGER NOT NULL DEFAULT 0,    -- centimes
  payment_method   payment_method NOT NULL DEFAULT 'cod',
  payment_status   payment_status NOT NULL DEFAULT 'pending',
  delivery_address JSONB NOT NULL,
  -- { "name": "", "phone": "", "address": "", "city": "", "notes": "" }
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products(id),
  supplier_id   UUID NOT NULL REFERENCES suppliers(id),  -- denormalized
  product_name  VARCHAR(255) NOT NULL,                   -- snapshot
  unit_price    INTEGER NOT NULL,                        -- snapshot centimes
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  total_price   INTEGER NOT NULL                         -- unit_price × quantity
);

CREATE TABLE payments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id         UUID NOT NULL REFERENCES orders(id),
  method           payment_method NOT NULL,
  amount           INTEGER NOT NULL,           -- centimes
  currency         VARCHAR(3) NOT NULL DEFAULT 'MAD',
  status           payment_status NOT NULL DEFAULT 'pending',
  gateway_ref      VARCHAR(255),
  gateway_response JSONB,
  paid_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK constraint for supplier_reviews.order_id now that orders table exists
ALTER TABLE supplier_reviews
  ADD CONSTRAINT fk_supplier_reviews_order
  FOREIGN KEY (order_id) REFERENCES orders(id);


-- =============================================================================
-- MODULE 7 — DELIVERY & SHIPMENTS
-- =============================================================================

CREATE TABLE delivery_zones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id     UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  city_id         INTEGER NOT NULL REFERENCES cities(id),
  price           INTEGER NOT NULL DEFAULT 0,   -- centimes
  estimated_days  SMALLINT NOT NULL DEFAULT 3,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,

  UNIQUE (supplier_id, city_id)
);

CREATE TABLE shipments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id),
  supplier_id     UUID NOT NULL REFERENCES suppliers(id),
  carrier         VARCHAR(100),
  tracking_number VARCHAR(100),
  status          shipment_status NOT NULL DEFAULT 'pending',
  shipped_at      TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE shipment_events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id  UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  status       VARCHAR(100) NOT NULL,
  location     VARCHAR(255),
  note         TEXT,
  occurred_at  TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE return_requests (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id       UUID NOT NULL REFERENCES orders(id),
  buyer_id       UUID NOT NULL REFERENCES users(id),
  reason         return_reason NOT NULL,
  description    TEXT,
  status         return_status NOT NULL DEFAULT 'requested',
  refund_amount  INTEGER,              -- centimes
  admin_notes    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- MODULE 8 — NOTIFICATIONS
-- =============================================================================

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       VARCHAR(255) NOT NULL,
  body        TEXT NOT NULL,
  data        JSONB,
  -- { "entity_type": "booking", "entity_id": "uuid" } for deep linking
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notification_preferences (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  sms_enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  push_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  whatsapp_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  booking_updates   BOOLEAN NOT NULL DEFAULT TRUE,
  order_updates     BOOLEAN NOT NULL DEFAULT TRUE,
  quote_updates     BOOLEAN NOT NULL DEFAULT TRUE,
  promotions        BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- TRIGGERS — auto-update updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables that have updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users', 'garages', 'suppliers', 'products',
    'user_vehicles', 'service_requests', 'service_quotes',
    'bookings', 'carts', 'orders', 'shipments',
    'return_requests', 'notification_preferences'
  ]
  LOOP
    EXECUTE format('
      CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
    ', t);
  END LOOP;
END;
$$;


-- =============================================================================
-- INDEXES
-- =============================================================================

-- users
CREATE INDEX idx_users_email          ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_phone          ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_users_role           ON users(role);
CREATE INDEX idx_users_status         ON users(status);
CREATE INDEX idx_users_city           ON users(city_id);
CREATE INDEX idx_users_deleted        ON users(deleted_at) WHERE deleted_at IS NULL;

-- otp_codes
CREATE INDEX idx_otp_identifier       ON otp_codes(identifier, purpose);
CREATE INDEX idx_otp_user             ON otp_codes(user_id);
CREATE INDEX idx_otp_expires          ON otp_codes(expires_at);

-- refresh_tokens
CREATE INDEX idx_refresh_user         ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_hash         ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_expires      ON refresh_tokens(expires_at);

-- garages
CREATE INDEX idx_garages_user         ON garages(user_id);
CREATE INDEX idx_garages_city         ON garages(city_id);
CREATE INDEX idx_garages_status       ON garages(status);
CREATE INDEX idx_garages_plan         ON garages(plan);
CREATE INDEX idx_garages_type         ON garages(garage_type);
CREATE INDEX idx_garages_rating       ON garages(rating_avg DESC);
CREATE INDEX idx_garages_featured     ON garages(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_garages_deleted      ON garages(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_garages_slug         ON garages(slug);
-- Full-text search on garage names
CREATE INDEX idx_garages_name_trgm    ON garages USING gin(name gin_trgm_ops);
-- Geolocation index for proximity search
CREATE INDEX idx_garages_location     ON garages(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- garage_services
CREATE INDEX idx_garage_svc_garage    ON garage_services(garage_id);
CREATE INDEX idx_garage_svc_type      ON garage_services(service_type);

-- suppliers
CREATE INDEX idx_suppliers_user       ON suppliers(user_id);
CREATE INDEX idx_suppliers_city       ON suppliers(city_id);
CREATE INDEX idx_suppliers_status     ON suppliers(status);
CREATE INDEX idx_suppliers_plan       ON suppliers(plan);
CREATE INDEX idx_suppliers_deleted    ON suppliers(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_suppliers_name_trgm  ON suppliers USING gin(business_name gin_trgm_ops);

-- products
CREATE INDEX idx_products_supplier    ON products(supplier_id);
CREATE INDEX idx_products_category    ON products(category_id);
CREATE INDEX idx_products_status      ON products(status);
CREATE INDEX idx_products_oem         ON products(oem_number) WHERE oem_number IS NOT NULL;
CREATE INDEX idx_products_brand       ON products(part_brand) WHERE part_brand IS NOT NULL;
CREATE INDEX idx_products_price       ON products(price);
CREATE INDEX idx_products_deleted     ON products(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_name_trgm   ON products USING gin(name gin_trgm_ops);

-- product_compatibility
CREATE INDEX idx_compat_product       ON product_compatibility(product_id);
CREATE INDEX idx_compat_model         ON product_compatibility(car_model_id);

-- car_models
CREATE INDEX idx_car_models_brand     ON car_models(brand_id);

-- user_vehicles
CREATE INDEX idx_vehicles_user        ON user_vehicles(user_id);
CREATE INDEX idx_vehicles_model       ON user_vehicles(car_model_id);

-- service_requests
CREATE INDEX idx_sreq_user            ON service_requests(user_id);
CREATE INDEX idx_sreq_city            ON service_requests(city_id);
CREATE INDEX idx_sreq_status          ON service_requests(status);
CREATE INDEX idx_sreq_urgency         ON service_requests(urgency);
CREATE INDEX idx_sreq_created         ON service_requests(created_at DESC);

-- service_quotes
CREATE INDEX idx_squote_request       ON service_quotes(request_id);
CREATE INDEX idx_squote_garage        ON service_quotes(garage_id);
CREATE INDEX idx_squote_status        ON service_quotes(status);

-- bookings
CREATE INDEX idx_bookings_user        ON bookings(user_id);
CREATE INDEX idx_bookings_garage      ON bookings(garage_id);
CREATE INDEX idx_bookings_status      ON bookings(status);
CREATE INDEX idx_bookings_scheduled   ON bookings(scheduled_at);
CREATE INDEX idx_bookings_vehicle     ON bookings(vehicle_id);

-- orders
CREATE INDEX idx_orders_buyer         ON orders(buyer_id);
CREATE INDEX idx_orders_status        ON orders(status);
CREATE INDEX idx_orders_payment       ON orders(payment_status);
CREATE INDEX idx_orders_created       ON orders(created_at DESC);

-- order_items
CREATE INDEX idx_oi_order             ON order_items(order_id);
CREATE INDEX idx_oi_product           ON order_items(product_id);
CREATE INDEX idx_oi_supplier          ON order_items(supplier_id);

-- shipments
CREATE INDEX idx_ship_order           ON shipments(order_id);
CREATE INDEX idx_ship_supplier        ON shipments(supplier_id);
CREATE INDEX idx_ship_status          ON shipments(status);

-- delivery_zones
CREATE INDEX idx_dz_supplier          ON delivery_zones(supplier_id);
CREATE INDEX idx_dz_city              ON delivery_zones(city_id);

-- notifications
CREATE INDEX idx_notif_user           ON notifications(user_id);
CREATE INDEX idx_notif_read           ON notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notif_created        ON notifications(created_at DESC);

-- garage_reviews
CREATE INDEX idx_grev_garage          ON garage_reviews(garage_id);
CREATE INDEX idx_grev_reviewer        ON garage_reviews(reviewer_id);

-- supplier_reviews
CREATE INDEX idx_srev_supplier        ON supplier_reviews(supplier_id);
CREATE INDEX idx_srev_reviewer        ON supplier_reviews(reviewer_id);

-- admin_activity_log
CREATE INDEX idx_aal_admin            ON admin_activity_log(admin_id);
CREATE INDEX idx_aal_target           ON admin_activity_log(target_type, target_id);
CREATE INDEX idx_aal_created          ON admin_activity_log(created_at DESC);


-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Moroccan cities
INSERT INTO cities (name_fr, name_ar, region, latitude, longitude) VALUES
  ('Casablanca',   'الدار البيضاء', 'Casablanca-Settat',     33.5731, -7.5898),
  ('Rabat',        'الرباط',        'Rabat-Salé-Kénitra',    33.9716, -6.8498),
  ('Marrakech',    'مراكش',         'Marrakech-Safi',         31.6295, -7.9811),
  ('Fès',          'فاس',           'Fès-Meknès',             34.0181, -5.0078),
  ('Tanger',       'طنجة',          'Tanger-Tétouan-Al Hoceïma', 35.7595, -5.8340),
  ('Agadir',       'أكادير',        'Souss-Massa',            30.4278, -9.5981),
  ('Meknès',       'مكناس',         'Fès-Meknès',             33.8935, -5.5547),
  ('Oujda',        'وجدة',          'Oriental',               34.6867, -1.9114),
  ('Kénitra',      'القنيطرة',      'Rabat-Salé-Kénitra',    34.2610, -6.5802),
  ('Tétouan',      'تطوان',         'Tanger-Tétouan-Al Hoceïma', 35.5785, -5.3684),
  ('Safi',         'آسفي',          'Marrakech-Safi',         32.2994, -9.2372),
  ('El Jadida',    'الجديدة',       'Casablanca-Settat',      33.2316, -8.5007),
  ('Beni Mellal',  'بني ملال',      'Béni Mellal-Khénifra',   32.3373, -6.3498),
  ('Nador',        'الناظور',       'Oriental',               35.1740, -2.9287),
  ('Settat',       'سطات',          'Casablanca-Settat',      33.0000, -7.6167);

-- Categories (top-level)
INSERT INTO categories (name_fr, name_ar, slug, icon, sort_order) VALUES
  ('Moteur',          'المحرك',         'moteur',          'engine',        1),
  ('Freins',          'الفرامل',         'freins',          'disc-brake',    2),
  ('Suspension',      'التعليق',         'suspension',      'car-suspension',3),
  ('Transmission',    'ناقل الحركة',     'transmission',    'gears',         4),
  ('Électrique',      'الكهرباء',        'electrique',      'bolt',          5),
  ('Carrosserie',     'هيكل السيارة',    'carrosserie',     'car-body',      6),
  ('Climatisation',   'تكييف الهواء',    'climatisation',   'snowflake',     7),
  ('Filtration',      'الترشيح',         'filtration',      'filter',        8),
  ('Éclairage',       'الإضاءة',         'eclairage',       'lightbulb',     9),
  ('Pneus & Jantes',  'الإطارات والجنوط','pneus-jantes',    'tire',          10),
  ('Échappement',     'العادم',          'echappement',     'exhaust',       11),
  ('Refroidissement', 'التبريد',         'refroidissement', 'thermometer',   12);

-- Car brands popular in Morocco
INSERT INTO car_brands (name, is_popular, sort_order) VALUES
  ('Dacia',       TRUE,  1),
  ('Renault',     TRUE,  2),
  ('Peugeot',     TRUE,  3),
  ('Volkswagen',  TRUE,  4),
  ('Hyundai',     TRUE,  5),
  ('Toyota',      TRUE,  6),
  ('Citroën',     TRUE,  7),
  ('Ford',        TRUE,  8),
  ('Fiat',        FALSE, 9),
  ('Kia',         FALSE, 10),
  ('Seat',        FALSE, 11),
  ('Opel',        FALSE, 12),
  ('Nissan',      FALSE, 13),
  ('Chevrolet',   FALSE, 14),
  ('Mercedes',    FALSE, 15),
  ('BMW',         FALSE, 16),
  ('Audi',        FALSE, 17),
  ('Suzuki',      FALSE, 18);

-- Admin user (password: Admin@MecaPro2026 — change immediately in production!)
-- bcrypt hash of 'Admin@MecaPro2026' with 12 rounds:
INSERT INTO users (
  email, first_name, last_name, role, status,
  preferred_lang, is_email_verified, is_phone_verified,
  password_hash
) VALUES (
  'admin@mecapro.ma', 'Admin', 'MecaPro', 'admin', 'active',
  'fr', TRUE, TRUE,
  '$2b$12$LQv3c1yqBwEHFl/OSh.ZcuHE9JtFPREtCkjwfkA7bvKVn9Bwm.1Vu'
);


-- =============================================================================
-- HELPFUL VIEWS
-- =============================================================================

-- Active garages with city info (used in search API)
CREATE VIEW v_active_garages AS
SELECT
  g.*,
  c.name_fr AS city_name_fr,
  c.name_ar AS city_name_ar,
  c.region,
  u.phone AS owner_phone
FROM garages g
JOIN cities c ON g.city_id = c.id
JOIN users u ON g.user_id = u.id
WHERE g.status = 'approved'
  AND g.deleted_at IS NULL
  AND u.status = 'active';

-- Active suppliers with city info (used in supplier directory)
CREATE VIEW v_active_suppliers AS
SELECT
  s.*,
  c.name_fr AS city_name_fr,
  c.name_ar AS city_name_ar,
  u.email AS owner_email
FROM suppliers s
LEFT JOIN cities c ON s.city_id = c.id
JOIN users u ON s.user_id = u.id
WHERE s.status = 'approved'
  AND s.deleted_at IS NULL
  AND u.status = 'active';

-- Open service requests with vehicle and city info (used in garage dashboard)
CREATE VIEW v_open_service_requests AS
SELECT
  sr.*,
  c.name_fr AS city_name_fr,
  c.name_ar AS city_name_ar,
  u.first_name || ' ' || u.last_name AS requester_name,
  vm.name AS vehicle_model,
  vb.name AS vehicle_brand,
  uv.year AS vehicle_year
FROM service_requests sr
JOIN cities c ON sr.city_id = c.id
JOIN users u ON sr.user_id = u.id
LEFT JOIN user_vehicles uv ON sr.vehicle_id = uv.id
LEFT JOIN car_models vm ON uv.car_model_id = vm.id
LEFT JOIN car_brands vb ON vm.brand_id = vb.id
WHERE sr.status = 'open'
  AND (sr.expires_at IS NULL OR sr.expires_at > NOW());


-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
