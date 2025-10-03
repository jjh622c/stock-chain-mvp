# 🚀 StockChain MVP 빠른 시작

## 한 번에 실행하기

### 🖥️ 현재 버전 (프론트엔드만)

```bash
# Linux/Mac
./start.sh

# Windows
start.bat

# 또는 npm 사용
npm start
```

### 🔧 향후 풀스택 버전

백엔드가 추가되면 다음 스크립트를 사용하세요:

```bash
# 백엔드 + 프론트엔드 동시 실행
./start-full.sh
```

## 📋 사용 가능한 명령어

```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 개발 모드 빌드
npm run build:dev

# 코드 린팅
npm run lint

# 빌드된 결과 미리보기
npm run preview
```

## 🌐 접속 정보

- **프론트엔드**: http://localhost:8080
- **백엔드** (향후): http://localhost:3001

## 🛠️ 개발 환경 요구사항

- Node.js (v18 이상 권장)
- npm 또는 yarn
- 현대적인 웹 브라우저

## 📱 주요 기능

### 🏪 매장 관리
- 세션 기반 매장 선택
- 매장별 주문 및 통계 관리

### 📦 주문 관리
- 직관적인 주문 등록
- 제품 자동완성 및 가격 자동 입력
- CSV 형태 주문 목록 내보내기

### 📊 통계 및 분석
- 일별/월별 매출 통계
- 인터랙티브 차트 (Recharts)
- 실시간 요약 정보

### 🛒 상품 관리
- 상품 CRUD 작업
- 자동 카테고리 분류
- 주문 등록 시 신규 상품 자동 추가

## 🎨 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui, Tailwind CSS
- **Charts**: Recharts
- **Routing**: React Router
- **State**: Local Storage + Session Storage
- **Icons**: Lucide React

## 🚨 문제 해결

### 포트 충돌 시
```bash
# 포트 사용 중인 프로세스 확인
lsof -i:8080

# 프로세스 종료
fuser -k 8080/tcp
```

### 의존성 문제 시
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 권한 문제 시 (Linux/Mac)
```bash
# 스크립트 실행 권한 부여
chmod +x start.sh start-full.sh
```

## 📄 라이센스

이 프로젝트는 개발 및 학습 목적으로 제작되었습니다.

---

**Happy Coding! 🎉**