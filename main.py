# -*- coding: utf-8 -*-
"""
========================================================================================
  AI DOMUS MUSIC STUDIO — FINAL PRESENTATION LAUNCHER & HTTP SERVER
========================================================================================
  프로젝트명 : AI 멀티모달 에이전트 기반 음악동영상 자동화 시스템 개발 쇼케이스
  역할      : 프레젠테이션 웹 애플리케이션 원클릭 구동 로컬 멀티스레드 웹 서버 (main.py)
  특징      :
    1) 파이썬 표준 라이브러리(Standard Library)만으로 구현 (추가 설치/pip 불필요)
    2) ThreadingHTTPServer 기반 멀티스레딩 지원 (대용량 WebM 영상 비동기 스트리밍)
    3) HTTP Range Requests (RFC 7233, HTTP 206 Partial Content) 완벽 지원 (영상 시킹/탐색)
    4) 자동 포트 충돌 회피 (8000번 점유 시 8001, 8002 등 사용 가능한 포트 자동 탐색)
    5) 서버 구동 즉시 기본 웹 브라우저 자동 오픈
    6) Windows / Mac / Linux 전 플랫폼 완벽 호환 (윈도우 콘솔 인코딩 대응)
========================================================================================
"""

import argparse
import http.server
import mimetypes
import os
import socket
import sys
import threading
import time
import urllib.parse
import webbrowser
from pathlib import Path

# 윈도우 레거시 콘솔(cp949) UnicodeEncodeError 방지
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# 프로젝트 루트 디렉터리 경로 고정
BASE_DIR = Path(__file__).resolve().parent
os.chdir(BASE_DIR)

# MIME 타입 명시적 등록 (브라우저 호환성 극대화)
mimetypes.init()
mimetypes.add_type("video/webm", ".webm")
mimetypes.add_type("text/javascript", ".js")
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("text/html; charset=utf-8", ".html")
mimetypes.add_type("text/html; charset=utf-8", ".HTML")
mimetypes.add_type("image/png", ".png")
mimetypes.add_type("image/jpeg", ".jpg")
mimetypes.add_type("image/jpeg", ".jpeg")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("font/woff2", ".woff2")


class RangeFileWrapper:
    """
    HTTP 206 Partial Content 처리를 위한 파일 래퍼 스트림
    지정된 바이트 길이(length)만큼만 읽고 자동으로 파일을 닫습니다.
    """
    def __init__(self, file_obj, length):
        self.file_obj = file_obj
        self.remaining = length

    def read(self, size=-1):
        if self.remaining <= 0:
            return b""
        if size < 0 or size > self.remaining:
            size = self.remaining
        chunk = self.file_obj.read(size)
        self.remaining -= len(chunk)
        return chunk

    def close(self):
        try:
            self.file_obj.close()
        except Exception:
            pass


class PresentationHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """
    멀티스레드 정적 웹 서버 핸들러:
    - HTTP Range Requests (206 Partial Content) 지원 (대용량 비디오 버퍼링 및 Seek 최적화)
    - CORS 및 캐시 제어 헤더 주입
    - 대소문자 확장자(.HTML 등) 및 UTF-8 인코딩 보장
    """

    server_version = "AIDomusPresentationServer/1.0"

    def end_headers(self):
        # 영상 스트리밍 및 iframe 상호작용 지원 헤더
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache, must-revalidate")
        super().end_headers()

    def guess_type(self, path):
        lower_path = str(path).lower()
        if lower_path.endswith(".html") or lower_path.endswith(".htm"):
            return "text/html; charset=utf-8"
        if lower_path.endswith(".css"):
            return "text/css; charset=utf-8"
        if lower_path.endswith(".js"):
            return "application/javascript; charset=utf-8"
        if lower_path.endswith(".webm"):
            return "video/webm"
        if lower_path.endswith(".png"):
            return "image/png"
        if lower_path.endswith(".jpg") or lower_path.endswith(".jpeg"):
            return "image/jpeg"
        return super().guess_type(path)

    def send_head(self):
        path = self.translate_path(self.path)

        # 디렉터리 요청 시 index.html 자동 매핑
        if os.path.isdir(path):
            parts = urllib.parse.urlsplit(self.path)
            if not parts.path.endswith('/'):
                self.send_response(301)
                new_parts = (parts[0], parts[1], parts[2] + '/', parts[3], parts[4])
                self.send_header("Location", urllib.parse.urlunsplit(new_parts))
                self.send_header("Content-Length", "0")
                self.end_headers()
                return None
            for index in ("index.html", "index.htm"):
                index_path = os.path.join(path, index)
                if os.path.exists(index_path):
                    path = index_path
                    break
            else:
                return super().send_head()

        if not os.path.exists(path):
            self.send_error(404, "File not found")
            return None

        ctype = self.guess_type(path)
        try:
            f = open(path, "rb")
        except OSError:
            self.send_error(404, "File not found")
            return None

        fs = os.fstat(f.fileno())
        total_length = fs.st_size

        # HTTP Range 헤더 체크 (동영상 Seeking 및 버퍼링 요청 처리)
        range_header = self.headers.get("Range")
        if range_header and range_header.startswith("bytes="):
            range_val = range_header[6:].strip()
            parts = range_val.split("-")
            try:
                if parts[0] and parts[1]:
                    start = int(parts[0])
                    end = int(parts[1])
                elif parts[0]:
                    start = int(parts[0])
                    end = total_length - 1
                elif parts[1]:
                    start = total_length - int(parts[1])
                    end = total_length - 1
                else:
                    start = 0
                    end = total_length - 1
            except ValueError:
                f.close()
                self.send_error(400, "Bad Request (Invalid Range)")
                return None

            if start < 0 or start >= total_length or end >= total_length or start > end:
                f.close()
                self.send_response(416, "Requested Range Not Satisfiable")
                self.send_header("Content-Range", f"bytes */{total_length}")
                self.send_header("Content-Length", "0")
                self.end_headers()
                return None

            content_length = end - start + 1
            self.send_response(206, "Partial Content")
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Range", f"bytes {start}-{end}/{total_length}")
            self.send_header("Content-Length", str(content_length))
            self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
            self.end_headers()
            f.seek(start)
            return RangeFileWrapper(f, content_length)

        # 일반 GET 요청 (200 OK)
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(total_length))
        self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
        self.end_headers()
        return f

    def log_message(self, format, *args):
        # 불필요하게 긴 스트리밍 로그는 압축하고 오류만 출력
        msg = format % args
        if " 200 " in msg or " 206 " in msg:
            return
        sys.stderr.write(f"[{self.log_date_time_string()}] {msg}\n")


def find_available_port(host: str, start_port: int, max_attempts: int = 50) -> int:
    """사용 가능한 포트를 검색하여 반환합니다."""
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                s.bind((host, port))
                return port
            except OSError:
                continue
    return start_port


def print_banner(host: str, port: int, url: str):
    """사이버네틱 콘솔 안내 배너 출력"""
    print("\n" + "=" * 76)
    print("  [AI DOMUS MUSIC STUDIO] FINAL PRESENTATION SYSTEM")
    print("  >> AI 멀티모달 에이전트 기반 음악동영상 자동화 시스템 개발 쇼케이스")
    print("=" * 76)
    print(f"  * 로컬 웹 서버가 성공적으로 시작되었습니다.")
    print(f"  * 접속 주소 (URL)   : {url}")
    print(f"  * 웹 루트 디렉터리 : {BASE_DIR}")
    print("-" * 76)
    print("  [ 프레젠테이션 인터랙티브 단축키 안내 ]")
    print("   - 숫자키 [1] : Part 01 - AI 단계별 학습내용 쇼케이스 (8대 미션)")
    print("   - 숫자키 [2] : Part 02 - 인트로 영상 쇼케이스 (4K/FHD WebM Player)")
    print("   - 숫자키 [3] : Part 03 - 시스템 워크플로우 & 아키텍처 다이어그램 (4종 뷰어)")
    print("   - 숫자키 [4] : Part 04 - 실시간 라이브 시연 및 유튜브 채널 QR 연동")
    print("   - 영문키 [F] : 브라우저 전체화면 프레젠테이션 모드 전환")
    print("   - 영문키 [G] : 서브페이지 공통 GNB 스니펫 가이드 열기")
    print("   - [Alt + H]  : 서브페이지에서 메인 프레젠테이션 허브(홈)로 즉시 복귀")
    print("-" * 76)
    print("  * 서버를 종료하려면 터미널에서 [Ctrl + C]를 누르세요.")
    print("=" * 76 + "\n")


def launch_browser(url: str, delay: float = 0.6):
    """지연 후 시스템 기본 웹 브라우저를 실행합니다."""
    time.sleep(delay)
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"[!] 브라우저 자동 실행 실패 (수동으로 브라우저에 접속해 주세요): {e}")


def main():
    parser = argparse.ArgumentParser(
        description="AI Domus Music Studio Final Presentation Web Launcher"
    )
    parser.add_argument(
        "--host",
        type=str,
        default="127.0.0.1",
        help="바인딩할 호스트 IP 주소 (기본값: 127.0.0.1, 네트워크 공유 시 0.0.0.0)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="바인딩할 기본 포트 번호 (기본값: 8000, 점유 시 자동 탐색)",
    )
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="기본 웹 브라우저 자동 오픈 비활성화",
    )
    args = parser.parse_args()

    # 인덱스 파일 존재 여부 검증
    index_file = BASE_DIR / "index.html"
    if not index_file.is_file():
        print(f"[!] 오류: 메인 웹페이지({index_file})를 찾을 수 없습니다.", file=sys.stderr)
        sys.exit(1)

    # 포트 자동 탐색 및 바인딩
    actual_port = find_available_port(args.host, args.port)
    url_host = "localhost" if args.host in ("127.0.0.1", "0.0.0.0") else args.host
    presentation_url = f"http://{url_host}:{actual_port}/index.html"

    # 멀티스레드 HTTP 서버 객체 생성
    server_address = (args.host, actual_port)
    try:
        httpd = http.server.ThreadingHTTPServer(server_address, PresentationHTTPRequestHandler)
    except Exception as e:
        print(f"[!] 서버 바인딩 실패 ({args.host}:{actual_port}): {e}", file=sys.stderr)
        sys.exit(1)

    print_banner(args.host, actual_port, presentation_url)

    # 브라우저 자동 실행 스레드
    if not args.no_browser:
        browser_thread = threading.Thread(
            target=launch_browser, args=(presentation_url,), daemon=True
        )
        browser_thread.start()

    # 서버 루프 실행 및 정상 종료 처리
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] 종료 신호(Ctrl+C)가 감지되었습니다. 서버를 안전하게 종료합니다...")
    finally:
        httpd.server_close()
        print("[*] AI Domus Music Studio 서버가 정상적으로 종료되었습니다. 감사합니다.\n")


if __name__ == "__main__":
    main()
