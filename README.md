# 🚀 AI Domus Music Studio — Final Presentation Hub

> **AI 멀티모달 에이전트 기반 음악동영상 자동화 시스템 개발 및 쇼케이스**  
> 단 몇 줄의 프롬프트로 음원 생성 · 썸네일 디자인 · 9분할 영상 합성 · YouTube 원스톱 자동 업로드 파이프라인

---

## 📌 프레젠테이션 파트 구성

| 파트 | 제목 | 세부 내용 | 주요 기능 |
|:---:|:---|:---|:---|
| **Part 01** | **AI 단계별 학습내용 쇼케이스** | 1단계 Basic(도구 학습), 2단계 Advanced(활용), 3단계 Master(응용) 총 8대 실습 미션 | 16:9 반응형 뷰어, 미션 딥링크 |
| **Part 02** | **AI Domus Music Studio 인트로** | 차세대 AI 파이프라인 공식 인트로 쇼케이스 | 4K/FHD Master WebM 플레이어, 전체화면(F) |
| **Part 03** | **시스템 워크플로우 & 아키텍처** | AI Music Studio & 썸네일 디자이너 다계층 설계도 | 4종 상호작용 다이어그램 뷰어 |
| **Part 04** | **실시간 라이브 시연 & 채널 연동** | 원스톱 유튜브 음악동영상 생성 및 업로드 라이브 데모 | 대형 QR 코드 즉시 연동 |

---

## ⚡ 빠른 실행 방법 (Python Launcher)

본 프로젝트는 파이썬 내장 멀티스레드 스트리밍 서버(`main.py`)를 탑재하여, 별도의 패키지 설치(`pip install`) 없이 즉시 실행할 수 있습니다.

```bash
# 기본 실행 (포트 자동 탐색 및 기본 웹 브라우저 자동 오픈)
python main.py
```

### 선택 옵션
```bash
# 포트 수동 지정 (예: 8080)
python main.py --port 8080

# 브라우저 자동 실행 끄기
python main.py --no-browser

# 외부 로컬 네트워크 공유
python main.py --host 0.0.0.0
```

---

## ⌨️ 프레젠테이션 인터랙티브 단축키

* **`1` ~ `4`** : Part 01 ~ Part 04 즉시 이동
* **`F`** : 브라우저 전체화면 발표 모드 토글
* **`G`** : 서브페이지 공통 글로벌 네비게이션(GNB) 스니펫 안내 모달
* **`Alt + H`** : 서브페이지에서 메인 프레젠테이션 허브(홈)로 복귀
* **`Ctrl + C`** : 파이썬 서버 정상 종료 (터미널)

---

## 🛠️ 기술 스택

* **Frontend** : HTML5, CSS3 (Modern Flex/Grid, Starfield Canvas, Cybernetic Glassmorphism), Vanilla JavaScript ES6+
* **Backend / Launcher** : Python 3.8+ Standard Library (`http.server.ThreadingHTTPServer`, HTTP Range Requests RFC 7233)
* **Assets** : WebM 60fps Video, High-res PNG/WebP Architecture Diagrams
