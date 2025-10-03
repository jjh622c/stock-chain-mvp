#!/bin/bash

# StockChain MVP 확장 가능한 통합 실행 스크립트
# 백엔드가 추가되면 이 스크립트를 사용하세요
# 작성일: 2025-09-29

echo "🚀 StockChain MVP Full Stack 시작 중..."
echo "====================================="

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# 백엔드 디렉토리 확인
BACKEND_DIR="./backend"
FRONTEND_DIR="."

# 함수: 프로세스 종료
cleanup() {
    echo -e "\n${YELLOW}🛑 서버들을 종료하는 중...${NC}"
    jobs -p | xargs -r kill
    exit 0
}

# Ctrl+C 시 정리 함수 실행
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}🔍 프로젝트 구조 확인 중...${NC}"

# 백엔드 존재 확인
if [ -d "$BACKEND_DIR" ]; then
    echo -e "${GREEN}✅ 백엔드 디렉토리 발견: $BACKEND_DIR${NC}"
    BACKEND_EXISTS=true

    # 백엔드 의존성 확인
    if [ -f "$BACKEND_DIR/package.json" ]; then
        if [ ! -d "$BACKEND_DIR/node_modules" ]; then
            echo -e "${YELLOW}📦 백엔드 의존성 설치 중...${NC}"
            (cd "$BACKEND_DIR" && npm install)
        fi
    fi
else
    echo -e "${YELLOW}⚠️  백엔드 디렉토리를 찾을 수 없습니다.${NC}"
    echo -e "${BLUE}   프론트엔드만 실행합니다.${NC}"
    BACKEND_EXISTS=false
fi

# 프론트엔드 의존성 확인
echo -e "${BLUE}📦 프론트엔드 의존성 확인 중...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules가 없습니다. 의존성을 설치합니다...${NC}"
    npm install
fi

echo -e "${GREEN}✅ 의존성 확인 완료${NC}"

# 포트 확인 함수
check_port() {
    if lsof -i:$1 &> /dev/null; then
        echo -e "${YELLOW}⚠️  포트 $1이 이미 사용 중입니다.${NC}"
        read -p "기존 프로세스를 종료하고 계속하시겠습니까? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}🔄 포트 $1 프로세스를 종료합니다...${NC}"
            fuser -k $1/tcp 2>/dev/null || true
            sleep 2
        else
            echo -e "${RED}❌ 실행을 중단합니다.${NC}"
            exit 1
        fi
    fi
}

# 포트 확인
check_port 8080  # 프론트엔드
if [ "$BACKEND_EXISTS" = true ]; then
    check_port 3001  # 백엔드 (예상 포트)
fi

echo -e "${GREEN}🎉 모든 준비가 완료되었습니다!${NC}"
echo ""

# 서버 시작
if [ "$BACKEND_EXISTS" = true ]; then
    echo -e "${PURPLE}🔧 백엔드 서버 시작 중... (포트 3001)${NC}"
    (cd "$BACKEND_DIR" && npm run dev) &
    BACKEND_PID=$!
    sleep 3
fi

echo -e "${BLUE}📱 프론트엔드 서버 시작 중... (포트 8080)${NC}"
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}🌐 서비스가 실행 중입니다:${NC}"
if [ "$BACKEND_EXISTS" = true ]; then
    echo -e "${PURPLE}   🔧 백엔드: http://localhost:3001${NC}"
fi
echo -e "${BLUE}   📱 프론트엔드: http://localhost:8080${NC}"
echo ""
echo -e "${YELLOW}   종료하려면 Ctrl+C를 누르세요${NC}"

# 브라우저 자동 열기
if command -v xdg-open &> /dev/null; then
    sleep 5 && xdg-open http://localhost:8080 &
elif command -v open &> /dev/null; then
    sleep 5 && open http://localhost:8080 &
fi

# 모든 백그라운드 작업이 끝날 때까지 대기
wait