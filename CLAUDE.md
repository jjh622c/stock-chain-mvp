# StockChain MVP - 심플한 발주 등록 앱

## 프로젝트 개요
**목적**: 기존 마켓봄 대비 비용 절감을 위한 심플한 자체 발주 관리 시스템
**타겟**: 식당 운영자들의 간편한 발주 관리
**플랫폼**: 웹/모바일 겸용 (반응형)
**핵심 가치**: **심플함, 실용성, 빠른 처리**

## 기술 스택
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **UI 라이브러리**: ShadCN/UI + Tailwind CSS
- **라우팅**: React Router DOM
- **차트**: Recharts (통계용)
- **배포**: Vercel (자동 배포)
- **데이터베이스**: Supabase PostgreSQL with RLS

## 배포 정보
- **프로덕션 URL**: https://stock-chain-mvp.vercel.app
- **GitHub 저장소**: https://github.com/jjh622c/stock-chain-mvp.git
- **자동 배포**: GitHub main 브랜치 푸시 시 Vercel 자동 배포
- **데이터베이스**: Supabase 프로덕션 DB 사용

## 사양서 vs 마켓봄 비교 분석

### 🎯 사양서 요구사항 (우리 목표)
- **심플한 UI**: "쓸데없는 게 많아서 정리"
- **빠른 주문 등록**: 간단하게 주문 등록
- **월별 필터링**: 이번달/저번달/저저번달 버튼
- **CSV 내보내기**: 데이터 export 기능
- **마켓봄 스타일 통계**: "배껴서 넣으셈"

### 📊 마켓봄의 복잡함 (우리가 피할 것)
- 너무 많은 필터 옵션 (10개 이상)
- 복잡한 주문 프로세스 (담당자, 배송유형 등)
- 과도한 정보 밀도
- 어려운 네비게이션 구조

## 핵심 페이지 구조

### 1. 메인 페이지 (5개)
- **매장선택** (`/`) - 매장 선택 및 대시보드
- **주문등록** (`/order`) - 간단한 주문 등록 페이지
- **주문목록** (`/orders`) - 필터링 + CSV 내보내기
- **통계** (`/stats`) - 마켓봄 스타일 통계
- **상품관리** (`/products`) - 상품 CRUD 관리

## 상세 기능 명세

### 🏪 매장선택 (메인 화면)
**현재 구현**:
- 매장 목록 카드 형식 표시
- 선택된 매장 표시 및 세션 유지
- 빠른 작업 버튼 (주문등록, 주문목록, 통계, 상품관리)

### 📝 주문등록 (최적화 완료)
**마켓봄과의 차이점**:
- 거래처 선택 → **매장 내 간편 입력**
- 담당자 지정 → **제거**
- 배송유형 → **제거**
- 복잡한 상품 정보 → **간소화**

**입력 필드** (2025-10-08 업데이트):
```
품목명 → 카테고리 → 구입처 → 단가 → 수량 → (자동계산: 총액)
```

**핵심 기능** (구현 완료):
- ✅ **자동완성 (최근 사용순)**: 주문 이력 기반 최신순 정렬
- ✅ **포커스 자동완성**: 빈 입력 필드 클릭 시 최근 주문 5개 표시
- ✅ **자동 입력**: 자동완성 선택 시 카테고리, 구입처, 단가 자동 입력
- ✅ **실시간 총액 계산**: 단가 × 수량 자동 계산
- ✅ **신규 상품 자동 등록**: DB에 없는 상품 자동 등록
- ✅ **빠른 저장**: 주문 저장 후 매장선택 페이지로 이동

**자동완성 동작**:
```
1. 입력 필드 클릭 (포커스) → 최근 주문 5개 표시 (최신순)
2. "김" 입력 → "김"이 포함된 상품만 필터링 (최근 사용순)
3. 자동완성 선택 → 카테고리, 구입처, 단가 자동 입력
```

### 📦 상품관리 (신규 구현)
**기능**:
- 상품 목록 테이블 (상품명, 카테고리, 구입처, 단가, 등록일)
- 상품 추가/수정/삭제
- 카테고리별 필터링
- 상품명 검색

**표시 정보**:
- 상품명, 카테고리, 구입처, 단가, 등록일
- 구입처 필드는 선택 사항 (없으면 "-" 표시)

### 📋 주문목록 (월별 필터 중심)
**구현된 기능**:
- ✅ 월별 버튼: [이번달] [저번달] [2달 전]
- ✅ CSV 내보내기 기능
- ✅ 주문 상세 보기 (품목 목록)
- ✅ 주문 삭제 (DB에서 완전 삭제)

**필터링 (심플화)**:
- 월별 버튼으로 빠른 접근
- 주문 상태 표시 (완료/취소)

### 📊 통계 (구현 예정)
**사양서 요구사항**: "마켓봄 참고해서 배껴서 넣으셈"

**계획된 구성**:
```
[주문 현황]     [월간 요약]
당일: X건 XX원   이번달: X건 XX원
                저번달: X건 XX원

[일별 주문량 그래프 - 30일]
📈 Recharts 라인 차트
```

## 데이터 모델

### Supabase 테이블 구조

#### stores (매장)
```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  manager_phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### products (상품)
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL,
  supplier VARCHAR(255),  -- 2025-10-08 추가
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_supplier ON products(supplier);
```

#### orders (주문)
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  total_amount INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_store ON orders(store_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

#### order_items (주문 품목)
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_name);
CREATE INDEX idx_order_items_created_at ON order_items(created_at);
```

### TypeScript 인터페이스

```typescript
// 매장
interface Store {
  id: string;
  name: string;
  address: string;
  manager_phone: string;
  created_at: string;
  updated_at: string;
}

// 상품
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  supplier?: string;  // 선택 사항
  created_at: string;
  updated_at: string;
}

// 주문
interface Order {
  id: string;
  store_id: string;
  total_amount: number;
  status: 'completed' | 'cancelled';
  created_at: string;
}

// 주문 품목
interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}
```

## UI/UX 가이드라인

### 디자인 철학: "Less is More"
- **최소한의 클릭**: 3클릭 이내 모든 작업 완료
- **큰 터치 영역**: 모바일 친화적
- **명확한 액션**: 버튼 목적 즉시 이해
- **빠른 피드백**: 즉시 결과 표시 (Toast 알림)

### 색상 체계 (ShadCN/UI 기반)
```css
Primary: #2563eb     /* 파란색 - 주요 액션 */
Success: #16a34a     /* 초록색 - 완료 */
Warning: #ca8a04     /* 노란색 - 주의 */
Danger: #dc2626      /* 빨간색 - 삭제/취소 */
Gray: #6b7280        /* 회색 - 보조 정보 */
Background: #f9fafb  /* 연한 회색 */
```

### 레이아웃 패턴
- **모바일 First**: 320px부터 대응
- **하단 네비게이션**: 5개 메인 페이지 탭
- **카드 기반**: 정보 그룹핑
- **여백 충분**: 터치하기 쉬운 간격

## 개발 현황

### ✅ 완료된 기능 (Phase 1)
- [x] 기본 구조 (React + TypeScript + Vite)
- [x] Supabase 데이터베이스 연동
- [x] 매장 선택 및 세션 관리
- [x] 주문 등록 (자동완성, 자동 입력, 신규 상품 자동 등록)
- [x] 주문 목록 (월별 필터, 주문 상세, 삭제)
- [x] 상품 관리 (CRUD, 카테고리/구입처 필드)
- [x] CSV 내보내기
- [x] Vercel 배포 자동화

### 🚧 진행 중 (Phase 2)
- [ ] 통계 페이지 (마켓봄 스타일)
- [ ] 모바일 최적화 개선
- [ ] 성능 최적화

### 🔮 계획 중 (Phase 3)
- [ ] 사용자 인증 (선택적)
- [ ] 다크 모드
- [ ] PWA 지원

### 🚫 구현하지 않을 기능
- ~~복잡한 사용자 권한 관리~~
- ~~담당자 및 배송 관리~~
- ~~복잡한 재고 추적~~
- ~~다중 사용자 협업 기능~~

## 최근 업데이트 (2025-10-08)

### 🐛 버그 수정
1. **신규 상품 자동 등록 실패** - 필드명 불일치 수정 (`unit_price` → `price`)
2. **미등록 상품 주문 실패** - 위 수정으로 함께 해결

### ✨ 새로운 기능
1. **자동완성 최근 사용순 정렬** - `order_items` 테이블 기반 최신순 정렬
2. **포커스 자동완성** - 빈 입력 필드 클릭 시 최근 주문 5개 표시
3. **카테고리 및 구입처 필드 추가** - 주문 등록 및 상품 관리에 추가
4. **자동 입력 기능** - 자동완성 선택 시 상품 정보 자동 입력

### 📁 주요 파일
- `src/pages/OrderEntry.tsx` - 주문 등록 페이지
- `src/pages/OrderList.tsx` - 주문 목록 페이지
- `src/pages/ProductManagement.tsx` - 상품 관리 페이지
- `src/lib/supabaseDatabase.ts` - Supabase 데이터베이스 서비스
- `src/lib/sessionStore.ts` - 세션 스토리지 관리
- `database/add_supplier_column.sql` - 데이터베이스 마이그레이션

## 마켓봄 대비 차별화

### ✅ 구현 완료
- **10배 빠른 주문 등록**: 최소 입력 필드 + 자동완성 + 자동 입력
- **스마트 자동완성**: 최근 사용순 정렬 + 포커스 자동 표시
- **직관적 월별 네비게이션**: 버튼 클릭으로 즉시 이동
- **자동 상품 등록**: 신규 상품 자동 DB 저장
- **빠른 데이터 export**: CSV 원클릭 다운로드
- **모바일 최적화**: 반응형 디자인

### 📊 성능 지표
- 주문 등록 시간: **~20초** (자동완성 + 자동입력 사용 시)
- 월별 데이터 접근: **1클릭**
- 신규 상품 등록: **자동** (수동 등록 불필요)
- CSV 내보내기: **1클릭**

## 성공 지표
- ✅ 주문 등록 시간: 30초 이내 달성 (~20초)
- ✅ 월별 데이터 접근: 1클릭 달성
- ✅ 신규 상품 처리: 자동 등록으로 0초
- 🚧 모바일 사용성: 터치 오류율 5% 이하 (테스트 중)
- 🎯 사용자 만족도: "마켓봄보다 쉽고 빠르다" (목표)

## 개발자 가이드

### 로컬 개발 환경 설정
```bash
# 저장소 클론
git clone https://github.com/jjh622c/stock-chain-mvp.git
cd stock-chain-mvp-main

# 의존성 설치
npm install

# 환경 변수 설정 (.env 파일)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 개발 서버 실행
npm run dev
# → http://localhost:5173
```

### 배포 프로세스
```bash
# 변경사항 커밋
git add .
git commit -m "feat: 기능 설명"

# GitHub 푸시 (자동 배포 트리거)
git push origin main

# Vercel이 자동으로 감지하여 배포 시작
# 2-3분 후 https://stock-chain-mvp.vercel.app 에 반영
```

### 데이터베이스 마이그레이션
```sql
-- Supabase SQL Editor에서 실행
-- 파일: database/add_supplier_column.sql

ALTER TABLE products
ADD COLUMN IF NOT EXISTS supplier VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier);
```

## 문제 해결

### 일반적인 이슈
1. **Supabase 연결 실패**: 환경 변수 확인 (.env 파일)
2. **자동완성 안 나옴**: order_items 테이블에 데이터 있는지 확인
3. **신규 상품 등록 안 됨**: products 테이블 RLS 정책 확인

### 디버깅 팁
```typescript
// supabaseDatabase.ts에서 에러 로그 확인
console.error('Error fetching products:', error)

// 브라우저 콘솔에서 Supabase 상태 확인
localStorage.getItem('supabase.auth.token')
```

## 참고 자료
- [Supabase 문서](https://supabase.com/docs)
- [ShadCN/UI 컴포넌트](https://ui.shadcn.com/)
- [React Router v6](https://reactrouter.com/)
- [Recharts 문서](https://recharts.org/)
- [Vercel 배포 가이드](https://vercel.com/docs)

---

**마지막 업데이트**: 2025-10-08
**버전**: v1.1.0
**개발자**: Claude Code + Human Collaboration
