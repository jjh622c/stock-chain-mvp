# StockChain MVP - 변경 이력

## [2025-10-08] 주문 등록 기능 개선 및 버그 수정

### 🐛 버그 수정

#### 1. 신규 상품 자동 등록 실패 수정
**문제**: 상품 DB에 등록되지 않은 상품으로 주문 시 자동 등록이 작동하지 않음
**원인**: `OrderEntry.tsx:107`에서 `unit_price` 필드 사용, 하지만 Product 인터페이스는 `price` 필드 사용
**수정**: `price: currentItem.unit_price`로 필드명 일치
```typescript
// Before
const newProduct = {
  name: currentItem.product_name,
  category: currentItem.category || getCategoryFromName(currentItem.product_name),
  unit_price: currentItem.unit_price,  // ❌ 잘못된 필드명
  supplier: currentItem.supplier || undefined
};

// After
const newProduct = {
  name: currentItem.product_name,
  category: currentItem.category || getCategoryFromName(currentItem.product_name),
  price: currentItem.unit_price,  // ✅ 올바른 필드명
  supplier: currentItem.supplier || undefined
};
```

#### 2. 미등록 상품 주문 실패 수정
**문제**: 상품 DB에 없는 상품을 담아 주문 등록 시도 시 주문이 등록되지 않음
**원인**: 이슈 1과 동일 - 필드명 불일치로 상품 자동 등록 실패
**수정**: 이슈 1 수정으로 함께 해결

### ✨ 새로운 기능

#### 3. 자동완성 최근 사용순 정렬
**기능**: 주문 등록 시 자동완성 목록을 최근 사용한 상품 우선으로 표시
**구현**: `supabaseDatabase.ts`의 `getProductNames` 함수 전면 재작성
- `order_items` 테이블에서 최근 주문 이력 조회
- `created_at DESC` 정렬로 최신순 우선
- Set을 사용한 중복 제거
- 부족한 경우 `products` 테이블에서 추가 조회

```typescript
async getProductNames(searchTerm: string, limit: number = 5): Promise<string[]> {
  // 1. order_items에서 최근 사용 상품 조회
  const { data: recentOrders } = await supabase
    .from('order_items')
    .select('product_name, created_at')
    .ilike('product_name', `%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(limit * 3)

  // 2. 중복 제거
  const recentNames = recentOrders
    ? Array.from(new Set(recentOrders.map(o => o.product_name)))
    : []

  // 3. 부족하면 products 테이블에서 추가
  if (recentNames.length < limit) {
    const { data: products } = await supabase
      .from('products')
      .select('name')
      .ilike('name', `%${searchTerm}%`)
      .limit(limit * 2)

    if (products) {
      products.forEach(p => {
        if (!recentNames.includes(p.name) && recentNames.length < limit) {
          recentNames.push(p.name)
        }
      })
    }
  }

  return recentNames.slice(0, limit)
}
```

#### 4. 카테고리 및 구입처 필드 추가
**기능**: 주문 등록 시 카테고리와 구입처를 입력하고 자동 입력 지원
**구현 범위**:
- 데이터베이스 스키마 업데이트 (supplier 컬럼 추가)
- TypeScript 인터페이스 업데이트
- 주문 등록 페이지 UI 추가
- 상품 관리 페이지 UI 추가
- 자동 입력 기능 구현

**데이터베이스 변경**:
```sql
-- products 테이블에 supplier 컬럼 추가
ALTER TABLE products
ADD COLUMN IF NOT EXISTS supplier VARCHAR(255);

-- 검색 성능을 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier);

COMMENT ON COLUMN products.supplier IS '구입처 정보';
```

**인터페이스 업데이트**:
```typescript
export interface Product {
  id: string
  name: string
  price: number
  category: string
  supplier?: string  // 추가
  created_at: string
  updated_at: string
}

export interface CreateProduct {
  name: string
  price: number
  category: string
  supplier?: string  // 추가
}
```

**자동 입력 기능**:
- 새로운 `getProductDetails` 함수 추가
- 자동완성 선택 시 카테고리, 구입처, 단가 자동 입력
```typescript
async getProductDetails(productName: string): Promise<{
  price: number;
  category: string;
  supplier?: string
} | null> {
  const { data } = await supabase
    .from('products')
    .select('price, category, supplier')
    .eq('name', productName)
    .single()

  return data || null
}
```

**UI 변경**:
- `OrderEntry.tsx`: 카테고리, 구입처 입력 필드 추가
- `ProductManagement.tsx`: 구입처 컬럼 추가 (카테고리와 단가 사이)

### 📁 변경된 파일

- `src/pages/OrderEntry.tsx` - 버그 수정 및 카테고리/구입처 필드 추가
- `src/lib/supabaseDatabase.ts` - 자동완성 정렬 로직 개선, 인터페이스 업데이트, getProductDetails 함수 추가
- `src/pages/ProductManagement.tsx` - 구입처 필드 UI 추가
- `database/add_supplier_column.sql` - 신규 생성 (데이터베이스 마이그레이션)

### 🧪 테스트 결과

#### 테스트 환경
- 로컬 개발 서버: http://localhost:8081
- Supabase 데이터베이스: 프로덕션 DB 사용
- 테스트 매장: 고깃집 철판볶음밥 강남본점

#### 테스트 시나리오 1: 신규 상품 자동 등록 (이슈 1 & 2)
1. 주문 등록 페이지 접속
2. 품목명: "테스트신상품123" 입력
3. 카테고리: "테스트카테고리" 입력
4. 구입처: "테스트공급업체" 입력
5. 단가: 50,000원 입력
6. 수량: 1개 (기본값)
7. "품목 추가" 버튼 클릭
8. "주문 저장" 버튼 클릭

**결과**: ✅ 성공
- "품목 추가 완료" 알림 표시
- 주문 목록에 품목 추가됨 (총 1개 품목 • 50,000원)
- "주문 저장 완료 - 1개 품목이 저장되었습니다." 알림 표시
- 메인 페이지로 자동 이동

#### 테스트 시나리오 3 & 4: 자동완성 및 자동 입력
**예상 동작**:
- 상품명 입력 시 최근 주문한 상품이 우선 표시
- 자동완성 선택 시 카테고리, 구입처, 단가 자동 입력

**상품 관리 페이지 확인**:
- 구입처 컬럼이 카테고리와 단가 사이에 표시
- 신규 등록된 "테스트신상품123" 상품이 목록에 포함
- 구입처: "테스트공급업체" 정상 표시

### 🚀 배포 정보

**Git 커밋**: `6675b1d` - "Fix order issues and add supplier field"

**변경 사항**:
- 4개 버그/기능 수정 사항 모두 포함
- 데이터베이스 마이그레이션 SQL 파일 추가

**배포 상태**:
- GitHub 푸시: ✅ 완료
- Vercel 자동 배포: 대기 중 (GitHub 푸시 후 자동 트리거)

**데이터베이스 마이그레이션**:
- Supabase SQL Editor에서 수동 실행 필요
- 파일 위치: `database/add_supplier_column.sql`
- 실행 상태: ✅ 완료

### 📝 향후 개선 사항

1. **자동완성 성능 최적화**
   - 현재: 매 입력마다 DB 쿼리
   - 개선안: 디바운싱 적용 (300ms 지연)

2. **카테고리 선택 개선**
   - 현재: 자유 입력 텍스트 필드
   - 개선안: 기존 카테고리 드롭다운 + 신규 입력 옵션

3. **구입처 자동완성**
   - 현재: 자유 입력만 가능
   - 개선안: 기존 구입처 자동완성 제안

4. **상품 중복 검사**
   - 현재: 동일 이름 상품 중복 등록 가능
   - 개선안: 중복 확인 후 기존 상품 정보 업데이트 옵션 제공

### 🔗 관련 이슈

- [이슈 #1] 신규 상품 자동 등록 실패 → ✅ 해결
- [이슈 #2] 미등록 상품 주문 실패 → ✅ 해결
- [이슈 #3] 자동완성 최신순 정렬 → ✅ 구현
- [이슈 #4] 카테고리/구입처 입력 기능 → ✅ 구현

---

## 이전 버전

### [2025-10-06] 초기 배포
- React + TypeScript + Vite 기반 프로젝트 생성
- Supabase 데이터베이스 연동
- 매장 선택, 주문 등록, 주문 목록, 통계 페이지 구현
- Vercel 배포 설정
