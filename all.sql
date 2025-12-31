CREATE TABLE categories (
   id uuid primary key DEFAULT gen_random_uuid(),
   name text NOT NULL,
   slug text UNIQUE NOT NULL,
   description text,
   is_active BOOLEAN not null DEFAULT TRUE,
   image_url text,
   parent_id uuid REFERENCES categories(id) ON DELETE cascade,
   created_at timestamptz DEFAULT now(),
);

create table products (
   id uuid primary key DEFAULT gen_random_uuid(),
   name text NOT NULL,
   slug text UNIQUE NOT NULL,
   description text,
   is_active BOOLEAN not null DEFAULT TRUE,
   category_id uuid not null REFERENCES categories(id) ON DELETE cascade,
   created_at timestamptz DEFAULT now(),
);

create table products_variants (
   id uuid primary key DEFAULT gen_random_uuid(),
   product_id uuid not null REFERENCES products(id) ON DELETE cascade,
   price numeric(10, 2) NOT NULL CHECK (price >= 0),
   compare_price numeric(10, 2) CHECK (compare_price >= price),
   stock integer not null DEFAULT 0 CHECK (stock >= 0),
   is_active BOOLEAN not null DEFAULT TRUE,
   attributes jsonb,
   created_at timestamptz not null DEFAULT now(),
);

CREATE TABLE product_images (
   id uuid primary key DEFAULT gen_random_uuid(),
   product_id uuid not null REFERENCES products(id) ON
   DELETE
      CASCADE,
      image_url text NOT NULL,
      is_primary BOOLEAN NOT NULL DEFAULT FALSE,
      created_at timestamptz DEFAULT now(),
);