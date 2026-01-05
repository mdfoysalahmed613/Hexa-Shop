-- ============================================================================
-- HEXA SHOP DATABASE SCHEMA
-- ============================================================================
-- ============================================================================
-- CATEGORIES
-- ============================================================================
CREATE TABLE categories (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   NAME text NOT NULL,
   slug text UNIQUE NOT NULL,
   description text,
   is_active BOOLEAN NOT NULL DEFAULT TRUE,
   image_url text,
   parent_id uuid REFERENCES categories(id) ON
   DELETE
      CASCADE,
      created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- PRODUCTS
-- ============================================================================
CREATE TABLE products (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   NAME text NOT NULL,
   slug text UNIQUE NOT NULL,
   description text,
   category_id uuid NOT NULL REFERENCES categories(id) ON
   DELETE
      CASCADE,
      created_at timestamptz DEFAULT now()
      updated_at timestamptz DEFAULT now()
);

CREATE TABLE products_variants (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   product_id uuid NOT NULL REFERENCES products(id) ON
   DELETE
      CASCADE,
      price numeric(10, 2) NOT NULL CHECK (price >= 0),
      compare_price numeric(10, 2) CHECK (
         compare_price IS NULL
         OR compare_price >= price
      ),
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      variant_name text,
      created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE product_images (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   product_id uuid NOT NULL REFERENCES products(id) ON
   DELETE
      CASCADE,
      image_url text NOT NULL,
      is_primary BOOLEAN NOT NULL DEFAULT FALSE,
      display_order INTEGER DEFAULT 0,
      created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- ORDERS
-- ============================================================================
-- Order status enum type
CREATE TYPE order_status AS ENUM (
   'pending',
   'confirmed',
   'processing',
   'shipped',
   'delivered',
   'cancelled',
   'refunded'
);

-- Payment status enum type
CREATE TYPE payment_status AS ENUM (
   'pending',
   'paid',
   'failed',
   'refunded'
);

-- Main orders table
CREATE TABLE orders (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   order_number text UNIQUE NOT NULL,
   user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
   -- Customer info (stored for order history even if user is deleted)
   customer_email text NOT NULL,
   customer_name text NOT NULL,
   customer_phone text,
   -- Shipping address
   shipping_address_line1 text NOT NULL,
   shipping_city text NOT NULL,
   shipping_postal_code text NOT NULL,
   shipping_country text NOT NULL DEFAULT 'BD',
   -- Order totals
   subtotal numeric(10, 2) NOT NULL CHECK (subtotal >= 0),
   shipping_cost numeric(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
   discount_amount numeric(10, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
   total numeric(10, 2) NOT NULL CHECK (total >= 0),
   -- Status
   order_status text not null CHECK (order_status IN ('processing', 'delivered', 'cancelled')),
   payment_status text not null CHECK (payment_status IN ('paid', 'unpaid')),
   -- Notes
   customer_notes text,
   -- Timestamps
   created_at timestamptz NOT NULL DEFAULT now(),
   updated_at timestamptz NOT NULL DEFAULT now(),
);

-- Order items table
CREATE TABLE order_items (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
   variant_id uuid REFERENCES products_variants(id) ON DELETE SET NULL,
   -- Snapshot of product data at time of order
   product_name text NOT NULL,
   variant_name text,
   product_image_url text,
   -- Pricing
   unit_price numeric(10, 2) NOT NULL CHECK (unit_price >= 0),
   quantity INTEGER NOT NULL CHECK (quantity > 0),
   total_price numeric(10, 2) NOT NULL ,
   created_at timestamptz NOT NULL DEFAULT now()
);
-- ============================================================================
-- INDEXES
-- ============================================================================
-- Categories
CREATE INDEX idx_categories_slug ON categories(slug);

CREATE INDEX idx_categories_is_active ON categories(is_active);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);

-- Products
CREATE INDEX idx_products_slug ON products(slug);

CREATE INDEX idx_products_category_id ON products(category_id);

CREATE INDEX idx_products_is_active ON products(is_active);

CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Product variants
CREATE INDEX idx_products_variants_product_id ON products_variants(product_id);

CREATE INDEX idx_products_variants_is_active ON products_variants(is_active);

-- Product images
CREATE INDEX idx_product_images_product_id ON product_images(product_id);

CREATE INDEX idx_product_images_is_primary ON product_images(is_primary);

-- Orders
CREATE INDEX idx_orders_user_id ON orders(user_id);

CREATE INDEX idx_orders_order_number ON orders(order_number);

CREATE INDEX idx_orders_status ON orders(status);

CREATE INDEX idx_orders_payment_status ON orders(payment_status);

CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX idx_orders_customer_email ON orders(customer_email);

-- Order items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Order status history
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Function to update updated_at timestamp
CREATE
OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN
   NEW .updated_at = now();

RETURN NEW;

END;

$$ LANGUAGE 'plpgsql';

-- Trigger for orders updated_at
CREATE TRIGGER update_orders_updated_at BEFORE
UPDATE
   ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order number
CREATE
OR REPLACE FUNCTION generate_order_number() RETURNS TRIGGER AS $$
DECLARE
   year_month text;

sequence_num INTEGER;

BEGIN
   year_month := to_char(now(), 'YYMM');

-- Get the next sequence number for this month
SELECT
   COALESCE(
      MAX(
         CAST(
            SUBSTRING(
               order_number
               FROM
                  8
            ) AS INTEGER
         )
      ),
      0
   ) + 1 INTO sequence_num
FROM
   orders
WHERE
   order_number LIKE 'HS-' || year_month || '-%';

NEW .order_number := 'HS-' || year_month || '-' || LPAD(sequence_num :: text, 5, '0');

RETURN NEW;

END;

$$ LANGUAGE 'plpgsql';

-- Trigger to auto-generate order number
CREATE TRIGGER generate_order_number_trigger BEFORE
INSERT
   ON orders FOR EACH ROW
   WHEN (NEW .order_number IS NULL) EXECUTE FUNCTION generate_order_number();

-- Function to log order status changes
CREATE
OR REPLACE FUNCTION log_order_status_change() RETURNS TRIGGER AS $$ BEGIN
   IF OLD .status IS DISTINCT
   FROM
      NEW .status THEN
   INSERT INTO
      order_status_history (order_id, status, created_by)
   VALUES
      (NEW .id, NEW .status, auth.uid());

END IF;

RETURN NEW;

END;

$$ LANGUAGE 'plpgsql';

-- Trigger to log status changes
CREATE TRIGGER log_order_status_change_trigger AFTER
UPDATE
   ON orders FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE
   categories ENABLE ROW LEVEL SECURITY;

ALTER TABLE
   products ENABLE ROW LEVEL SECURITY;

ALTER TABLE
   products_variants ENABLE ROW LEVEL SECURITY;

ALTER TABLE
   product_images ENABLE ROW LEVEL SECURITY;

ALTER TABLE
   orders ENABLE ROW LEVEL SECURITY;

ALTER TABLE
   order_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE
   order_status_history ENABLE ROW LEVEL SECURITY;

-- Categories: Public read, admin write
CREATE POLICY "Categories are viewable by everyone" ON categories FOR
SELECT
   USING (TRUE);

CREATE POLICY "Categories are editable by admins" ON categories FOR ALL USING (
   auth.jwt() ->> 'role' = 'admin'
   OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
   OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'demo_admin'
);

-- Products: Public read, admin write
CREATE POLICY "Products are viewable by everyone" ON products FOR
SELECT
   USING (TRUE);

CREATE POLICY "Products are editable by admins" ON products FOR ALL USING (
   auth.jwt() ->> 'role' = 'admin'
   OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
   OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'demo_admin'
);

-- Product variants: Public read, admin write
CREATE POLICY "Product variants are viewable by everyone" ON products_variants FOR
SELECT
   USING (TRUE);

CREATE POLICY "Product variants are editable by admins" ON products_variants FOR ALL USING (
   auth.jwt() ->> 'role' = 'admin'
   OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
   OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'demo_admin'
);

-- Product images: Public read, admin write
CREATE POLICY "Product images are viewable by everyone" ON product_images FOR
SELECT
   USING (TRUE);

CREATE POLICY "Product images are editable by admins" ON product_images FOR ALL USING (
   auth.jwt() ->> 'role' = 'admin'
   OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
   OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'demo_admin'
);

-- Orders: Users can view their own orders, admins can view all
CREATE POLICY "Users can view their own orders" ON orders FOR
SELECT
   USING (
      auth.uid() = user_id
      OR auth.jwt() ->> 'role' = 'admin'
      OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'demo_admin'
   );

CREATE POLICY "Users can create orders" ON orders FOR
INSERT
   WITH CHECK (TRUE);

CREATE POLICY "Admins can update orders" ON orders FOR
UPDATE
   USING (
      auth.jwt() ->> 'role' = 'admin'
      OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'demo_admin'
   );

-- Order items: Same as orders
CREATE POLICY "Users can view their own order items" ON order_items FOR
SELECT
   USING (
      EXISTS (
         SELECT
            1
         FROM
            orders
         WHERE
            orders.id = order_items.order_id
            AND (
               orders.user_id = auth.uid()
               OR auth.jwt() ->> 'role' = 'admin'
               OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
               OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'demo_admin'
            )
      )
   );

CREATE POLICY "Order items are insertable during checkout" ON order_items FOR
INSERT
   WITH CHECK (TRUE);

-- Order status history: Same as orders
CREATE POLICY "Order status history viewable by order owner or admin" ON order_status_history FOR
SELECT
   USING (
      EXISTS (
         SELECT
            1
         FROM
            orders
         WHERE
            orders.id = order_status_history.order_id
            AND (
               orders.user_id = auth.uid()
               OR auth.jwt() ->> 'role' = 'admin'
               OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
               OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'demo_admin'
            )
      )
   );

CREATE POLICY "Status history insertable by admins" ON order_status_history FOR
INSERT
   WITH CHECK (
      auth.jwt() ->> 'role' = 'admin'
      OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'demo_admin'
   );