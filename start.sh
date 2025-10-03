#!/bin/bash

# StockChain MVP 통합 실행 스크립트
# 작성일: 2025-09-29

echo "🚀 StockChain MVP 시작 중..."
echo "================================"

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 현재 디렉토리 확인
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 오류: package.json을 찾을 수 없습니다.${NC}"
    echo -e "${YELLOW}   이 스크립트를 프로젝트 루트에서 실행해주세요.${NC}"
    exit 1
fi

# Node.js와 npm 설치 확인
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js가 설치되지 않았습니다.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm이 설치되지 않았습니다.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 의존성 확인 중...${NC}"

# node_modules 확인 및 설치
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules가 없습니다. 의존성을 설치합니다...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 의존성 설치에 실패했습니다.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ 의존성 확인 완료${NC}"

# 환경 변수 파일 확인
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local 파일이 없습니다.${NC}"
    echo -e "${BLUE}   필요하다면 환경 변수를 설정해주세요.${NC}"
fi

# 현재 실행 중인 프로세스 확인
if lsof -i:8080 &> /dev/null; then
    echo -e "${YELLOW}⚠️  포트 8080이 이미 사용 중입니다.${NC}"
    read -p "기존 프로세스를 종료하고 계속하시겠습니까? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🔄 포트 8080 프로세스를 종료합니다...${NC}"
        fuser -k 8080/tcp 2>/dev/null || true
        sleep 2
    else
        echo -e "${RED}❌ 실행을 중단합니다.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}🎉 모든 준비가 완료되었습니다!${NC}"
echo ""
echo -e "${BLUE}📱 프론트엔드 서버를 시작합니다...${NC}"
echo -e "${YELLOW}   URL: http://localhost:8080${NC}"
echo -e "${YELLOW}   종료하려면 Ctrl+C를 누르세요${NC}"
echo ""

# 브라우저 자동 열기 (선택사항)
if command -v xdg-open &> /dev/null; then
    sleep 3 && xdg-open http://localhost:8080 &
elif command -v open &> /dev/null; then
    sleep 3 && open http://localhost:8080 &
fi

# 개발 서버 시작
npm run dev

echo ""
echo -e "${BLUE}👋 StockChain MVP가 종료되었습니다.${NC}"