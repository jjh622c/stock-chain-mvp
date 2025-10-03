-- StockChain Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stores table
CREATE TABLE stores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  manager_phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_name ON order_items(product_name);

-- Sample data for testing
INSERT INTO stores (name, address, manager_phone) VALUES
('본점', '서울 강남구 테헤란로 123', '010-1234-5678'),
('2호점', '서울 마포구 홍대입구 456', '010-2345-6789'),
('3호점', '서울 송파구 잠실동 789', '010-3456-7890');

-- Function to update order total automatically
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET total_amount = (
    SELECT COALESCE(SUM(total_price), 0)
    FROM order_items
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
  )
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update order totals
CREATE TRIGGER trigger_update_order_total_insert
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_order_total();

CREATE TRIGGER trigger_update_order_total_update
  AFTER UPDATE ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_order_total();

CREATE TRIGGER trigger_update_order_total_delete
  AFTER DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_order_total();

-- RLS (Row Level Security) policies
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (will add proper auth later)
CREATE POLICY "Allow all for now" ON stores FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON order_items FOR ALL USING (true);