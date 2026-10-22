@echo off
chcp 65001 > nul
title AI Domus Music Studio - GitHub 업로더
cls
echo ========================================================================
echo   🚀 AI DOMUS MUSIC STUDIO — GITHUB 자동 업로더
echo ========================================================================
echo.
echo  * 대상 저장소 : https://github.com/oransee3/Final_Presentation_Webpage
echo  * 로컬 브랜치 : main (35개 파일 전체 커밋 완료 상태)
echo.
echo ------------------------------------------------------------------------
echo  [안내] 현재 PC의 기본 자격증명이 'oransee1'로 설정되어 있어
echo         'oransee3' 저장소 업로드 시 403 권한 거부가 발생합니다.
echo ------------------------------------------------------------------------
echo.
echo  [1] 브라우저 로그인으로 바로 업로드 (oransee3 계정으로 웹 로그인)
echo  [2] GitHub Personal Access Token (PAT) 입력으로 바로 업로드
echo  [Q] 종료
echo.
set /p choice="원하시는 작업 번호를 입력하세요 (1 또는 2): "

if /i "%choice%"=="Q" exit /b

if "%choice%"=="1" (
    echo.
    echo [*] 기존 'oransee1' 자격 증명을 초기화하고 웹 브라우저 인증을 시작합니다...
    cmdkey /delete:LegacyGeneric:target=git:https://github.com > nul 2>&1
    cmdkey /delete:git:https://github.com > nul 2>&1
    echo [*] 잠시 후 웹 브라우저 창이 열리면 'oransee3' 계정으로 로그인/승인해 주세요.
    echo.
    git push -u origin main
    if %errorlevel% equ 0 (
        echo.
        echo ====================================================================
        echo   [SUCCESS] 모든 파일이 성공적으로 GitHub에 업로드되었습니다!
        echo   확인 링크: https://github.com/oransee3/Final_Presentation_Webpage
        echo ====================================================================
    ) else (
        echo.
        echo [!] 업로드 중 오류가 발생했습니다. 토큰 방식을 이용해 보세요.
    )
    echo.
    pause
    exit /b
)

if "%choice%"=="2" (
    echo.
    set /p token="oransee3 계정의 GitHub 토큰을 입력하세요: "
    if "%token%"=="" (
        echo [!] 토큰이 입력되지 않았습니다.
        pause
        exit /b
    )
    echo.
    echo [*] 토큰 인증으로 GitHub 업로드를 진행합니다...
    git push https://%token%@github.com/oransee3/Final_Presentation_Webpage.git main
    if %errorlevel% equ 0 (
        echo.
        echo ====================================================================
        echo   [SUCCESS] 모든 파일이 성공적으로 GitHub에 업로드되었습니다!
        echo   확인 링크: https://github.com/oransee3/Final_Presentation_Webpage
        echo ====================================================================
    ) else (
        echo.
        echo [!] 업로드 실패. 토큰에 'repo' 권한이 포함되어 있는지 확인해 주세요.
    )
    echo.
    pause
    exit /b
)

echo [!] 잘못된 입력입니다.
pause
