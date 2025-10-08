-- 샘플 상품 데이터 추가
INSERT INTO products (name, category, unit_price, description) VALUES
('양념목전지 6kg', '육가공품', 39500, '양념에 절인 목전지 6kg 포장'),
('김치 5kg', '채소/김치', 25000, '전통 배추김치 5kg'),
('간장 1L', '소스류', 8500, '진간장 1리터'),
('참기름 500ml', '조미료/오일', 15000, '순수 참기름 500ml'),
('고춧가루 1kg', '분말류/조미료', 12000, '고운 고춧가루 1kg'),
('마늘 1kg', '채소/양념', 6000, '국산 마늘 1kg'),
('양파 3kg', '채소/양념', 4500, '국산 양파 3kg'),
('대파 1단', '채소/양념', 2000, '신선한 대파 1단'),
('두부 300g', '두부/콩제품', 2500, '연두부 300g'),
('계란 30개', '달걀/유제품', 8000, '신선한 계란 30개입');

-- 추가 샘플 주문 데이터 (선택사항)
INSERT INTO orders (store_id, total_amount, status, order_date) VALUES
((SELECT id FROM stores WHERE name = '강남점'), 75000, 'completed', '2025-01-15'),
((SELECT id FROM stores WHERE name = '홍대점'), 42000, 'completed', '2025-01-14'),
((SELECT id FROM stores WHERE name = '부산점'), 89500, 'completed', '2025-01-13');

-- 주문 항목 추가 (위 주문들에 대한)
WITH recent_orders AS (
  SELECT id, store_id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
  FROM orders
  WHERE created_at >= '2025-01-13'
)
INSERT INTO order_items (order_id, product_name, quantity, unit_price, total_price)
SELECT
  ro.id,
  '양념목전지 6kg',
  1,
  39500,
  39500
FROM recent_orders ro WHERE ro.rn = 1

UNION ALL

SELECT
  ro.id,
  '김치 5kg',
  2,
  25000,
  50000
FROM recent_orders ro WHERE ro.rn = 1

UNION ALL

SELECT
  ro.id,
  '김치 5kg',
  1,
  25000,
  25000
FROM recent_orders ro WHERE ro.rn = 2

UNION ALL

SELECT
  ro.id,
  '간장 1L',
  2,
  8500,
  17000
FROM recent_orders ro WHERE ro.rn = 2

UNION ALL

SELECT
  ro.id,
  '양념목전지 6kg',
  2,
  39500,
  79000
FROM recent_orders ro WHERE ro.rn = 3

UNION ALL

SELECT
  ro.id,
  '고춧가루 1kg',
  1,
  12000,
  12000
FROM recent_orders ro WHERE ro.rn = 3;