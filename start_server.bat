@echo off
chcp 65001 > nul
title AI Domus Music Studio - Presentation Server Launcher

echo ===================================================
echo [AI Domus Music Studio] 프레젠테이션 웹 서버 실행 중...
echo ===================================================

cd /d "%~dp0"

if exist ".venv\Scripts\python.exe" (
    echo [INFO] 현재 프로젝트 독립 가상환경(.venv)으로 실행합니다.
    ".venv\Scripts\python.exe" main.py
) else (
    echo [INFO] 시스템 기본 Python으로 실행합니다.
    python main.py
)

pause
