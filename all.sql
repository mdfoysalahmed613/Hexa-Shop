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
create table public.products (
  id uuid not null default gen_random_uuid (),
  name text not null,
  slug text not null,
  description text null,
  category_id uuid not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  is_active boolean not null default true,
  constraint products_pkey primary key (id),
  constraint products_slug_key unique (slug),
  constraint products_category_id_fkey foreign KEY (category_id) references categories (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger products_slug BEFORE INSERT
or
update on products for EACH row
execute FUNCTION generate_slug ();

-- ============================================================================
-- PRODUCT VARIANTS
-- ============================================================================

CREATE TABLE PUBLIC .product_variants (
   id uuid NOT NULL DEFAULT gen_random_uuid (),
   product_id uuid NOT NULL,
   price numeric(10, 2) NOT NULL,
   compare_price numeric(10, 2) NULL,
   stock INTEGER NOT NULL DEFAULT 0,
   is_active BOOLEAN NOT NULL DEFAULT TRUE,
   created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
   SIZE text NULL,
   color text NULL,
   sku text NOT NULL,
   constraint products_variants_pkey primary key (id),
   constraint product_variants_sku_key UNIQUE (sku),
   constraint products_variants_product_id_fkey foreign KEY (product_id) references products (id) ON
   DELETE
      CASCADE,
      constraint products_variants_stock_check CHECK ((stock >= 0)),
      constraint products_variants_price_check CHECK ((price >= (0) :: numeric)),
      constraint products_variants_check CHECK ((compare_price >= price)),
      constraint products_variants_size_check CHECK (
         (
            SIZE = ANY (
               ARRAY [ 'S' :: text,
               'M' :: text,
               'L' :: text,
               'XL' :: text,
               'XXL' :: text ]
            )
         )
      )
) TABLESPACE pg_default;

-- ============================================================================
-- ORDERS
-- ============================================================================

-- Main orders table
create table public.orders (
  id uuid not null default gen_random_uuid (),
  order_number text not null,
  user_id uuid not null,
  customer_email text not null,
  customer_name text not null,
  customer_phone text not null,
  shipping_address_line text not null,
  shipping_city text not null,
  shipping_postal_code text not null,
  shipping_country text not null default 'BD'::text,
  subtotal numeric(10, 2) not null,
  shipping_cost numeric(10, 2) not null default 0,
  discount_amount numeric(10, 2) not null default 0,
  order_status text not null,
  payment_status text not null,
  customer_notes text null,
  created_at timestamp with time zone not null default now(),
  total numeric(10, 2) not null,
  constraint orders_pkey primary key (id),
  constraint orders_order_number_key unique (order_number),
  constraint orders_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint orders_discount_amount_check check ((discount_amount >= (0)::numeric)),
  constraint orders_subtotal_check check ((subtotal >= (0)::numeric)),
  constraint orders_total_check check ((total > (0)::numeric)),
  constraint orders_total_math_check check (
    (
      total = ((subtotal + shipping_cost) - discount_amount)
    )
  ),
  constraint orders_shipping_coast_check check ((shipping_cost >= (0)::numeric)),
  constraint orders_order_status_check check (
    (
      order_status = any (
        array[
          'pending'::text,
          'processing'::text,
          'shipped'::text,
          'delivered'::text,
          'cancelled'::text
        ]
      )
    )
  ),
  constraint orders_payment_status_check check (
    (
      payment_status = any (
        array['unpaid'::text, 'pending'::text, 'paid'::text]
      )
    )
  )
) TABLESPACE pg_default;

create trigger orders_set_order_number BEFORE INSERT on orders for EACH row
execute FUNCTION set_order_number ();


-- Order items table
create table public.order_items (
  id uuid not null default gen_random_uuid (),
  order_id uuid not null,
  variant_id uuid null,
  product_name text not null,
  unit_price numeric(10, 2) not null,
  quantity integer not null,
  total_price numeric(10, 2) not null,
  created_at timestamp with time zone not null default now(),
  product_image_url text null,
  constraint order_items_pkey primary key (id),
  constraint order_items_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE,
  constraint order_items_variant_id_fkey foreign KEY (variant_id) references products_variants (id) on delete set null,
  constraint order_items_quantity_check check ((quantity > 0)),
  constraint order_items_unit_price_check check ((unit_price >= (0)::numeric))
) TABLESPACE pg_default;
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
OR REPLACE FUNCTION log_order_status_change() RETURNS TRIGGER AS $$ 
BEGIN
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

