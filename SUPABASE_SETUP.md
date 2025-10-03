# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [https://supabase.com](https://supabase.com) 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인
4. "New project" 클릭
5. 프로젝트 정보 입력:
   - **Name**: `stockchain-mvp`
   - **Database Password**: 강력한 비밀번호 설정
   - **Region**: Northeast Asia (Seoul) 선택
6. "Create new project" 클릭 (2-3분 소요)

## 2. 데이터베이스 스키마 생성

1. Supabase 대시보드에서 **SQL Editor** 클릭
2. "New query" 클릭
3. `database/schema.sql` 파일 내용을 복사해서 붙여넣기
4. **RUN** 버튼 클릭
5. 성공 메시지 확인

## 3. 환경 변수 설정

1. Supabase 대시보드에서 **Settings** → **API** 클릭
2. 다음 정보 복사:
   - **Project URL**
   - **anon public** 키

3. `.env.local` 파일 수정:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. 연결 테스트

개발 서버를 재시작하고 브라우저 콘솔에서 테스트:

```javascript
// 브라우저 콘솔에서 실행
import { supabase } from './src/lib/supabase'

// 매장 목록 조회 테스트
const stores = await supabase.from('stores').select('*')
console.log('Stores:', stores.data)
```

## 5. 데이터 확인

Supabase 대시보드에서 **Table Editor** 클릭:
- `stores` 테이블에 3개 매장 데이터 확인
- `orders`, `order_items` 테이블 구조 확인

## 구현된 주요 기능

### ✅ 완료된 기능
- [x] 데이터베이스 스키마 (stores, orders, order_items)
- [x] 자동 총액 계산 (트리거)
- [x] 인덱스 최적화
- [x] TypeScript 타입 정의
- [x] 서비스 레이어 구현

### 🎯 사용 가능한 API

**매장 관리**:
```typescript
import { storeService } from './src/lib/database'

// 모든 매장 조회
const stores = await storeService.getAll()

// 특정 매장 조회
const store = await storeService.getById(storeId)
```

**주문 관리**:
```typescript
import { orderService } from './src/lib/database'

// 오늘 주문 요약
const summary = await orderService.getTodaysSummary(storeId)
// { orderCount: 5, totalAmount: 150000 }

// 월별 주문 조회
const thisMonth = await orderService.getByMonth(storeId, 0)  // 이번달
const lastMonth = await orderService.getByMonth(storeId, 1)  // 저번달

// 새 주문 생성
const newOrder = await orderService.create(storeId, [
  { product_name: '김치', quantity: 10, unit_price: 15000, total_price: 150000 }
])

// 일별 통계 (그래프용)
const dailyStats = await orderService.getDailyStats(storeId, 30)
```

**상품 자동완성**:
```typescript
import { productService } from './src/lib/database'

// 상품명 검색
const productNames = await productService.getProductNames('김치')
// ['김치 10kg', '김치찌개용 김치', '깍두기']
```

## 다음 단계

1. **환경 변수 설정** 완료 후
2. **개발 서버 재시작**: `npm run dev`
3. **첫 번째 기능 구현**: 대시보드에 오늘 주문 요약 표시

모든 준비가 완료되었습니다! 🚀