-- StockChain MVP 데이터베이스 스키마
-- Supabase SQL Editor에서 실행할 스크립트

-- 1. 매장 테이블
CREATE TABLE IF NOT EXISTS stores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 상품 테이블
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    category VARCHAR(100) NOT NULL DEFAULT '기타',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 주문 테이블
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'completed',
    order_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 주문 항목 테이블
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. updated_at 트리거 설정
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. 샘플 매장 데이터 삽입
INSERT INTO stores (name, address) VALUES
    ('강남점', '서울시 강남구 테헤란로 123'),
    ('홍대점', '서울시 마포구 홍익로 456'),
    ('부산점', '부산시 해운대구 센텀로 789')
ON CONFLICT DO NOTHING;

-- 8. 샘플 상품 데이터 삽입
INSERT INTO products (name, price, category) VALUES
    ('허니갈릭 윙', 15000, '치킨'),
    ('양념치킨', 18000, '치킨'),
    ('후라이드 치킨', 16000, '치킨'),
    ('치킨너겟', 8000, '사이드'),
    ('치즈볼', 6000, '사이드'),
    ('콜라', 2000, '음료'),
    ('사이다', 2000, '음료')
ON CONFLICT DO NOTHING;

-- 9. RLS (Row Level Security) 정책 설정 (선택사항)
-- 현재는 모든 사용자가 모든 데이터에 접근 가능하도록 설정
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 모든 사용자에게 모든 권한 부여 (MVP용)
CREATE POLICY "Allow all access to stores" ON stores FOR ALL USING (true);
CREATE POLICY "Allow all access to products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all access to orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all access to order_items" ON order_items FOR ALL USING (true);