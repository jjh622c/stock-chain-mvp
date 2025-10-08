-- Add supplier column to products table
-- Run this in Supabase SQL Editor

ALTER TABLE products
ADD COLUMN IF NOT EXISTS supplier VARCHAR(255);

-- Create index for supplier search
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier);

COMMENT ON COLUMN products.supplier IS '구입처 정보';
