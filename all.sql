CREATE TABLE categories (
   id uuid primary key DEFAULT gen_random_uuid(),
   NAME text NOT NULL,
   slug text UNIQUE NOT NULL,
   description text,
   is_active BOOLEAN NOT NULL DEFAULT TRUE,
   image_url text,
   parent_id uuid REFERENCES categories(id) ON
   DELETE
      CASCADE,
      created_at timestamptz DEFAULT now(),
);

CREATE TABLE products (
   id uuid primary key DEFAULT gen_random_uuid(),
   NAME text NOT NULL,
   slug text UNIQUE NOT NULL,
   description text,
   category_id uuid NOT NULL REFERENCES categories(id) ON
   DELETE
      CASCADE,
      created_at timestamptz DEFAULT now(),
);

CREATE TABLE products_variants (
   id uuid primary key DEFAULT gen_random_uuid(),
   product_id uuid NOT NULL REFERENCES products(id) ON
   DELETE
      CASCADE,
      price numeric(10, 2) NOT NULL CHECK (price >= 0),
      compare_price numeric(10, 2) CHECK (compare_price >= price),
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      variant_name text,
      created_at timestamptz NOT NULL DEFAULT now(),
);

CREATE TABLE product_images (
   id uuid primary key DEFAULT gen_random_uuid(),
   product_id uuid NOT NULL REFERENCES products(id) ON
   DELETE
      CASCADE,
      image_url text NOT NULL,
      is_primary BOOLEAN NOT NULL DEFAULT FALSE,
      created_at timestamptz DEFAULT now(),
);