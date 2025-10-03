@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: StockChain MVP 통합 실행 스크립트 (Windows)
:: 작성일: 2025-09-29

echo 🚀 StockChain MVP 시작 중...
echo ================================

:: 현재 디렉토리 확인
if not exist "package.json" (
    echo ❌ 오류: package.json을 찾을 수 없습니다.
    echo    이 스크립트를 프로젝트 루트에서 실행해주세요.
    pause
    exit /b 1
)

:: Node.js와 npm 설치 확인
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js가 설치되지 않았습니다.
    echo    https://nodejs.org 에서 다운로드하세요.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ npm이 설치되지 않았습니다.
    pause
    exit /b 1
)

echo 📦 의존성 확인 중...

:: node_modules 확인 및 설치
if not exist "node_modules" (
    echo ⚠️  node_modules가 없습니다. 의존성을 설치합니다...
    npm install
    if !ERRORLEVEL! neq 0 (
        echo ❌ 의존성 설치에 실패했습니다.
        pause
        exit /b 1
    )
)

echo ✅ 의존성 확인 완료

:: 환경 변수 파일 확인
if not exist ".env.local" (
    echo ⚠️  .env.local 파일이 없습니다.
    echo    필요하다면 환경 변수를 설정해주세요.
)

:: 포트 사용 확인 (Windows용)
netstat -an | find ":8080" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ⚠️  포트 8080이 이미 사용 중입니다.
    set /p choice="기존 프로세스를 종료하고 계속하시겠습니까? (y/n): "
    if /i "!choice!"=="y" (
        echo 🔄 포트 8080 프로세스를 종료합니다...
        for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do (
            taskkill /F /PID %%a >nul 2>&1
        )
        timeout /t 2 /nobreak >nul
    ) else (
        echo ❌ 실행을 중단합니다.
        pause
        exit /b 1
    )
)

echo 🎉 모든 준비가 완료되었습니다!
echo.
echo 📱 프론트엔드 서버를 시작합니다...
echo    URL: http://localhost:8080
echo    종료하려면 Ctrl+C를 누르세요
echo.

:: 브라우저 자동 열기 (3초 후)
start "" timeout /t 3 /nobreak >nul && start "" "http://localhost:8080"

:: 개발 서버 시작
npm run dev

echo.
echo 👋 StockChain MVP가 종료되었습니다.
pause