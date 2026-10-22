# -*- coding: utf-8 -*-
"""
AI Domus Music Studio — GitHub One-Click Uploader GUI
더블클릭하면 그래픽 창이 열려 브라우저 로그인 또는 토큰 입력으로 즉시 푸시합니다.
"""

import os
import subprocess
import sys
import threading
import tkinter as tk
from pathlib import Path
from tkinter import messagebox, ttk

BASE_DIR = Path(__file__).resolve().parent
os.chdir(BASE_DIR)

REPO_URL = "https://github.com/oransee3/Final_Presentation_Webpage"


class UploaderApp:
    def __init__(self, root):
        self.root = root
        self.root.title("AI Domus Music Studio — GitHub Uploader")
        self.root.geometry("640x520")
        self.root.minsize(580, 460)
        self.root.configure(bg="#0b0f19")

        # 스타일
        self.create_widgets()

    def create_widgets(self):
        # 헤더
        header_frame = tk.Frame(self.root, bg="#111827", padx=16, pady=14)
        header_frame.pack(fill=tk.X)

        title_lbl = tk.Label(
            header_frame,
            text="🚀 AI Domus Music Studio GitHub Uploader",
            font=("Pretendard", 14, "bold"),
            fg="#38bdf8",
            bg="#111827",
        )
        title_lbl.pack(anchor="w")

        repo_lbl = tk.Label(
            header_frame,
            text=f"대상 저장소: {REPO_URL}",
            font=("Consolas", 10),
            fg="#94a3b8",
            bg="#111827",
        )
        repo_lbl.pack(anchor="w", pady=(4, 0))

        # 메인 컨테이너
        content = tk.Frame(self.root, bg="#0b0f19", padx=20, pady=16)
        content.pack(fill=tk.BOTH, expand=True)

        # 안내 박스
        info_box = tk.Label(
            content,
            text="현재 PC에 'oransee1' 자격증명이 등록되어 있어 'oransee3' 저장소 업로드 시\n403 오류가 발생합니다. 아래 2가지 방법 중 하나를 선택해 업로드하세요.",
            font=("Pretendard", 10),
            fg="#fcd34d",
            bg="#1e1b18",
            padx=12,
            pady=8,
            relief=tk.GROOVE,
            justify=tk.LEFT,
        )
        info_box.pack(fill=tk.X, pady=(0, 14))

        # 옵션 1: 브라우저 로그인 버튼
        btn_frame1 = tk.Frame(content, bg="#0b0f19")
        btn_frame1.pack(fill=tk.X, pady=6)

        self.btn_browser = tk.Button(
            btn_frame1,
            text="🌐 [방법 1] 브라우저 로그인으로 업로드 (추천)",
            font=("Pretendard", 11, "bold"),
            bg="#0284c7",
            fg="white",
            activebackground="#0369a1",
            activeforeground="white",
            relief=tk.FLAT,
            padx=14,
            pady=8,
            cursor="hand2",
            command=self.push_with_browser,
        )
        self.btn_browser.pack(fill=tk.X)

        desc1 = tk.Label(
            btn_frame1,
            text="* 기존 자격증명을 초기화하고 웹 브라우저를 띄워 oransee3 계정으로 로그인합니다.",
            font=("Pretendard", 9),
            fg="#94a3b8",
            bg="#0b0f19",
        )
        desc1.pack(anchor="w", pady=(3, 0))

        # 옵션 2: 토큰 입력 프레임
        token_frame = tk.LabelFrame(
            content,
            text=" [방법 2] Personal Access Token (PAT) 직접 입력 ",
            font=("Pretendard", 10, "bold"),
            fg="#a7f3d0",
            bg="#0b0f19",
            padx=12,
            pady=10,
        )
        token_frame.pack(fill=tk.X, pady=(12, 10))

        token_input_row = tk.Frame(token_frame, bg="#0b0f19")
        token_input_row.pack(fill=tk.X)

        self.token_entry = tk.Entry(
            token_input_row,
            font=("Consolas", 10),
            bg="#1f2937",
            fg="#f3f4f6",
            insertbackground="white",
            relief=tk.FLAT,
        )
        self.token_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, ipady=6, padx=(0, 8))

        self.btn_token = tk.Button(
            token_input_row,
            text="토큰으로 업로드",
            font=("Pretendard", 10, "bold"),
            bg="#059669",
            fg="white",
            activebackground="#047857",
            activeforeground="white",
            relief=tk.FLAT,
            padx=12,
            pady=6,
            cursor="hand2",
            command=self.push_with_token,
        )
        self.btn_token.pack(side=tk.RIGHT)

        # 로그 출력창
        log_frame = tk.LabelFrame(
            content,
            text=" 실시간 진행 로그 ",
            font=("Pretendard", 9),
            fg="#94a3b8",
            bg="#0b0f19",
            padx=8,
            pady=8,
        )
        log_frame.pack(fill=tk.BOTH, expand=True, pady=(6, 0))

        self.log_text = tk.Text(
            log_frame,
            font=("Consolas", 9),
            bg="#030712",
            fg="#e5e7eb",
            relief=tk.FLAT,
            height=8,
            wrap=tk.WORD,
        )
        self.log_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        scrollbar = ttk.Scrollbar(log_frame, command=self.log_text.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.log_text.config(yscrollcommand=scrollbar.set)

        self.log("준비 완료: 업로드 방법을 선택해 주세요.")

    def log(self, message):
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)
        self.root.update_idletasks()

    def set_buttons_state(self, state):
        self.btn_browser.config(state=state)
        self.btn_token.config(state=state)

    def push_with_browser(self):
        self.set_buttons_state(tk.DISABLED)
        threading.Thread(target=self._run_browser_push, daemon=True).start()

    def _run_browser_push(self):
        try:
            self.log("\n[1/3] 기존 Windows GitHub 자격 증명 초기화 중...")
            subprocess.run(
                "cmdkey /delete:LegacyGeneric:target=git:https://github.com",
                shell=True,
                capture_output=True,
            )
            subprocess.run(
                "cmdkey /delete:git:https://github.com", shell=True, capture_output=True
            )

            self.log("[2/3] 브라우저 인증 및 푸시 시작... (웹 브라우저가 뜨면 oransee3 로그인)")
            cmd = ["git", "push", "-u", "origin", "main"]
            proc = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding="utf-8",
                errors="replace",
            )
            stdout, stderr = proc.communicate()

            if stdout:
                self.log(stdout.strip())
            if stderr:
                self.log(stderr.strip())

            if proc.returncode == 0:
                self.log("\n🎉 [성공] 모든 파일이 GitHub에 완벽하게 업로드되었습니다!")
                messagebox.showinfo("성공", "GitHub에 모든 파일이 정상적으로 업로드되었습니다!")
            else:
                self.log("\n❌ [실패] 업로드 중 오류가 발생했습니다. 로그를 확인해 주세요.")
                messagebox.showerror(
                    "실패", "업로드에 실패했습니다. Personal Access Token을 사용해 보세요."
                )
        except Exception as e:
            self.log(f"\n[오류] {e}")
            messagebox.showerror("오류", str(e))
        finally:
            self.set_buttons_state(tk.NORMAL)

    def push_with_token(self):
        token = self.token_entry.get().strip()
        if not token:
            messagebox.showwarning("경고", "GitHub Personal Access Token을 입력해 주세요.")
            return

        self.set_buttons_state(tk.DISABLED)
        threading.Thread(target=self._run_token_push, args=(token,), daemon=True).start()

    def _run_token_push(self, token):
        try:
            self.log("\n[*] 토큰 인증을 통한 푸시 시작...")
            url_with_token = (
                f"https://{token}@github.com/oransee3/Final_Presentation_Webpage.git"
            )
            cmd = ["git", "push", url_with_token, "main"]
            proc = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding="utf-8",
                errors="replace",
            )
            stdout, stderr = proc.communicate()

            if stdout:
                self.log(stdout.strip())
            if stderr:
                self.log(stderr.strip())

            if proc.returncode == 0:
                self.log("\n🎉 [성공] 토큰 인증으로 모든 파일이 GitHub에 완벽하게 업로드되었습니다!")
                messagebox.showinfo("성공", "GitHub에 모든 파일이 정상적으로 업로드되었습니다!")
            else:
                self.log("\n❌ [실패] 토큰 권한(repo)을 확인해 주세요.")
                messagebox.showerror(
                    "실패", "토큰 인증 실패. 토큰에 'repo' 권한이 체크되어 있는지 확인해 주세요."
                )
        except Exception as e:
            self.log(f"\n[오류] {e}")
            messagebox.showerror("오류", str(e))
        finally:
            self.set_buttons_state(tk.NORMAL)


if __name__ == "__main__":
    root = tk.Tk()
    app = UploaderApp(root)
    root.mainloop()
