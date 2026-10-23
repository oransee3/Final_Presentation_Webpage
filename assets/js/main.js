/**
 * Final Presentation Hub & Global Navigation System (main.js)
 * - 1) 메인 대시보드(index.html): 스타필드 캔버스, 카드 마우스 글로우, 숫자키(1~4) 즉시 이동, GNB 스니펫 모달
 * - 2) 서브페이지(Part 1 ~ Part 4): 통일된 미니 글로벌 네비게이션 바(GNB) 자동 마운트 및 URL 파라미터 딥링크 지원
 */

const PRESENTATION_PARTS = [
  {
    num: 1,
    code: 'PART 01',
    title: 'AI 단계별 학습내용 쇼케이스',
    shortTitle: '학습내용 쇼케이스',
    hubPath: './part1/Part1.html',
    subPath: '../part1/Part1.html',
    folder: 'part1',
    desc: '1단계(Basic) · 2단계(Advanced) · 3단계(Master) 총 8대 실습 미션 쇼케이스'
  },
  {
    num: 2,
    code: 'PART 02',
    title: 'AI Domus Music Studio 인트로 쇼케이스',
    shortTitle: '인트로 영상 쇼케이스',
    hubPath: './part2/Part2.html',
    subPath: '../part2/Part2.html',
    folder: 'part2',
    desc: '4K/FHD 마스터 WebM 파이프라인 인트로 및 전체화면 발표 모드'
  },
  {
    num: 3,
    code: 'PART 03',
    title: '시스템 워크플로우 및 아키텍처 설계',
    shortTitle: '워크플로우 & 아키텍처',
    hubPath: './part3/Part3.html',
    subPath: '../part3/Part3.html',
    folder: 'part3',
    desc: 'AI Music Studio & 썸네일 디자이너 워크플로우/아키텍처 4대 뷰어'
  },
  {
    num: 4,
    code: 'PART 04',
    title: '실시간 시연 및 유튜브 채널 연동',
    shortTitle: '라이브 시연 & QR 채널',
    hubPath: './part4/Part4.HTML',
    subPath: '../part4/Part4.HTML',
    folder: 'part4',
    desc: '원스톱 유튜브 음악동영상 자동화 라이브 데모 및 QR 채널 연동'
  }
];

/* ==========================================================================
   1. 메인 대시보드 (index.html) 전용 초기화
   ========================================================================== */
function initHubPage() {
  const canvas = document.getElementById('hubBgCanvas');
  if (!canvas) return;

  // 1-1. 배경 스타필드 파티클 애니메이션
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const palette = ['#22d3ee', '#38bdf8', '#4ade80', '#10b981', '#818cf8'];
  const particles = Array.from({ length: 70 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.9 + 0.7,
    vx: (Math.random() - 0.5) * 0.22,
    vy: -(Math.random() * 0.35 + 0.1),
    color: palette[Math.floor(Math.random() * palette.length)],
    alpha: Math.random() * 0.65 + 0.25,
    pulse: Math.random() * 0.02 + 0.008
  }));

  function renderHubBg() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha += Math.sin(Date.now() * 0.002 * p.pulse) * 0.01;
      if (p.alpha < 0.2) p.alpha = 0.2;
      if (p.alpha > 0.92) p.alpha = 0.92;

      if (p.y < -10) p.y = height + 10;
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.r * 5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    requestAnimationFrame(renderHubBg);
  }
  renderHubBg();

  // 1-2. 카드 마우스 스포트라이트 효과
  document.querySelectorAll('.part-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  });

  // 1-3. 숫자 키 1, 2, 3, 4 단축키 및 F(전체화면), G(GNB 가이드) 이벤트
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    if (['1', '2', '3', '4'].includes(e.key)) {
      e.preventDefault();
      const idx = parseInt(e.key, 10) - 1;
      const targetPart = PRESENTATION_PARTS[idx];
      if (targetPart) {
        triggerHubShortcutJump(targetPart);
      }
    } else if (e.key === 'f' || e.key === 'F') {
      const modal = document.getElementById('gnbModalBackdrop');
      if (modal && modal.classList.contains('open')) return;
      e.preventDefault();
      toggleDocumentFullscreen();
    } else if (e.key === 'g' || e.key === 'G') {
      e.preventDefault();
      toggleGnbModal();
    } else if (e.key === 'Escape') {
      closeGnbModal();
    }
  });
}

function triggerHubShortcutJump(part) {
  const toast = document.getElementById('shortcutToast');
  if (toast) {
    toast.innerHTML = `<span class="kbd-badge">Key ${part.num}</span> <strong>${part.code}: ${part.title}</strong> 페이지로 이동합니다...`;
    toast.classList.add('show');
  }
  const card = document.querySelector(`.part-card[data-part="${part.num}"]`);
  if (card) {
    card.style.transform = 'translateY(-8px) scale(1.03)';
    card.style.borderColor = '#4ade80';
    card.style.boxShadow = '0 0 40px rgba(74, 222, 128, 0.45)';
  }
  setTimeout(() => {
    window.location.href = part.hubPath;
  }, 180);
}

function toggleDocumentFullscreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  }
}

function openGnbModal() {
  const modal = document.getElementById('gnbModalBackdrop');
  if (modal) modal.classList.add('open');
}

function closeGnbModal() {
  const modal = document.getElementById('gnbModalBackdrop');
  if (modal) modal.classList.remove('open');
}

function toggleGnbModal() {
  const modal = document.getElementById('gnbModalBackdrop');
  if (modal) modal.classList.toggle('open');
}

function copyGnbSnippet() {
  const codeEl = document.getElementById('gnbSnippetCode');
  const btn = document.getElementById('copyGnbBtn');
  if (!codeEl) return;
  navigator.clipboard.writeText(codeEl.innerText).then(() => {
    if (btn) {
      const orig = btn.innerText;
      btn.innerText = '✓ 클립보드에 복사됨!';
      setTimeout(() => (btn.innerText = orig), 2000);
    }
  });
}

/* ==========================================================================
   2. 서브페이지 (Part 1 ~ Part 4) 미니 글로벌 네비게이션 바 (GNB) 자동 마운트
   ========================================================================== */
function detectCurrentPartNumber() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('/part1/') || path.endsWith('part1.html')) return 1;
  if (path.includes('/part2/') || path.endsWith('part2.html')) return 2;
  if (path.includes('/part3/') || path.endsWith('part3.html')) return 3;
  if (path.includes('/part4/') || path.endsWith('part4.html')) return 4;
  return null;
}

function initSubpageGNB() {
  const currentNum = detectCurrentPartNumber();
  if (!currentNum) return;

  // Part 1에서는 좌측 상단 홈버튼 시스템(홈, 좌측 화살표, Part 01 학습내용 케이스, 우측 화살표) 삭제
  if (currentNum === 1) return;

  // 이미 마운트된 경우 중복 방지
  if (document.getElementById('fpGlobalMiniNav')) return;

  const currentIdx = currentNum - 1;
  const currentPart = PRESENTATION_PARTS[currentIdx];
  const prevPart = currentIdx > 0 ? PRESENTATION_PARTS[currentIdx - 1] : null;
  const nextPart = currentIdx < PRESENTATION_PARTS.length - 1 ? PRESENTATION_PARTS[currentIdx + 1] : null;

  // 서브페이지 전용 GNB 스타일 주입
  const style = document.createElement('style');
  style.textContent = `
    .fp-mini-gnb {
      position: fixed;
      top: 18px;
      left: 24px;
      z-index: 9999;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      background: rgba(8, 14, 28, 0.88);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(34, 211, 238, 0.42);
      border-radius: 999px;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.65), 0 0 18px rgba(34, 211, 238, 0.18);
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
      user-select: none;
      transition: all 0.25s ease;
    }
    .fp-mini-gnb:hover {
      border-color: rgba(34, 211, 238, 0.8);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.8), 0 0 24px rgba(34, 211, 238, 0.3);
    }
    .fp-gnb-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 6px 11px;
      border-radius: 999px;
      font-size: 12.5px;
      font-weight: 800;
      color: #e2e8f0;
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.12);
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      line-height: 1;
      white-space: nowrap;
    }
    .fp-gnb-btn:hover:not(.disabled) {
      background: rgba(14, 116, 144, 0.65);
      color: #ffffff;
      border-color: #22d3ee;
      box-shadow: 0 0 12px rgba(34, 211, 238, 0.35);
    }
    .fp-gnb-btn.home-btn {
      background: linear-gradient(135deg, rgba(14, 116, 144, 0.85), rgba(13, 148, 136, 0.85));
      border-color: rgba(34, 211, 238, 0.6);
      color: #ffffff;
    }
    .fp-gnb-btn.home-btn:hover {
      background: linear-gradient(135deg, #22d3ee, #10b981);
      color: #022c22;
    }
    .fp-gnb-btn.disabled {
      opacity: 0.35;
      pointer-events: none;
    }
    .fp-gnb-dropdown-wrap {
      position: relative;
    }
    .fp-gnb-trigger {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12.5px;
      font-weight: 800;
      color: #38bdf8;
      background: rgba(2, 6, 23, 0.75);
      border: 1px solid rgba(56, 189, 248, 0.4);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .fp-gnb-trigger:hover {
      background: rgba(56, 189, 248, 0.18);
      color: #ffffff;
    }
    .fp-gnb-menu {
      position: absolute;
      top: calc(100% + 10px);
      left: 0;
      width: 310px;
      background: rgba(10, 16, 30, 0.96);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1.5px solid rgba(34, 211, 238, 0.5);
      border-radius: 16px;
      padding: 10px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85), 0 0 25px rgba(34, 211, 238, 0.25);
      display: none;
      flex-direction: column;
      gap: 6px;
    }
    .fp-gnb-menu.open {
      display: flex;
    }
    .fp-gnb-menu-header {
      font-size: 11px;
      font-weight: 800;
      color: #94a3b8;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      padding: 4px 8px 6px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: space-between;
    }
    .fp-gnb-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 9px 11px;
      border-radius: 10px;
      text-decoration: none;
      color: #e2e8f0;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid transparent;
      transition: all 0.18s ease;
    }
    .fp-gnb-item:hover {
      background: rgba(14, 116, 144, 0.35);
      border-color: rgba(34, 211, 238, 0.5);
      transform: translateX(3px);
    }
    .fp-gnb-item.active {
      background: rgba(34, 211, 238, 0.18);
      border-color: #22d3ee;
      color: #ffffff;
    }
    .fp-gnb-item-left {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .fp-gnb-item-code {
      font-size: 10.5px;
      font-weight: 900;
      color: #22d3ee;
      letter-spacing: 0.5px;
    }
    .fp-gnb-item-title {
      font-size: 13px;
      font-weight: 700;
    }
    .fp-gnb-item-key {
      font-family: Consolas, monospace;
      font-size: 11px;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.08);
      padding: 2px 6px;
      border-radius: 5px;
    }
    @media (max-width: 1420px) {
      /* 좁은 화면에서 상단 탭 버튼과 겹치지 않도록 우측 하단 플로팅으로 자동 전환 */
      .fp-mini-gnb {
        top: auto;
        bottom: 18px;
        left: 20px;
      }
      .fp-gnb-menu {
        top: auto;
        bottom: calc(100% + 10px);
      }
    }
  `;
  document.head.appendChild(style);

  const nav = document.createElement('nav');
  nav.id = 'fpGlobalMiniNav';
  nav.className = 'fp-mini-gnb';
  nav.setAttribute('aria-label', '프레젠테이션 글로벌 네비게이션');

  const prevHref = prevPart ? prevPart.subPath : '../index.html';
  const prevTitle = prevPart ? `이전: ${prevPart.code} (${prevPart.shortTitle})` : '메인 허브로 이동';
  const nextHref = nextPart ? nextPart.subPath : '../index.html';
  const nextTitle = nextPart ? `다음: ${nextPart.code} (${nextPart.shortTitle})` : '발표 완료 — 메인 허브로 이동';

  nav.innerHTML = `
    <a href="../index.html" class="fp-gnb-btn home-btn" title="메인 프레젠테이션 허브로 이동 (Alt+H)">
      <span>🏠</span> <span>홈</span>
    </a>
    <a href="${prevHref}" class="fp-gnb-btn ${!prevPart ? 'disabled' : ''}" title="${prevTitle}">
      <span>◀</span>
    </a>
    <div class="fp-gnb-dropdown-wrap">
      <button type="button" class="fp-gnb-trigger" id="fpGnbDropdownBtn" title="클릭하여 전체 파트 목록 열기">
        <span>${currentPart.code}</span>
        <span style="opacity:0.85; font-weight:600;">· ${currentPart.shortTitle}</span>
        <span style="font-size:10px; margin-left:2px;">▾</span>
      </button>
      <div class="fp-gnb-menu" id="fpGnbMenu">
        <div class="fp-gnb-menu-header">
          <span>JUMP TO PART</span>
          <span>ALT + 1~4</span>
        </div>
        <a href="../index.html" class="fp-gnb-item">
          <div class="fp-gnb-item-left">
            <span class="fp-gnb-item-code" style="color:#4ade80;">MAIN HUB</span>
            <span class="fp-gnb-item-title">통합 프레젠테이션 대시보드</span>
          </div>
          <span class="fp-gnb-item-key">Alt+H</span>
        </a>
        ${PRESENTATION_PARTS.map(
          (p) => `
          <a href="${p.subPath}" class="fp-gnb-item ${p.num === currentNum ? 'active' : ''}">
            <div class="fp-gnb-item-left">
              <span class="fp-gnb-item-code">${p.code} ${p.num === currentNum ? '● 현재 페이지' : ''}</span>
              <span class="fp-gnb-item-title">${p.title}</span>
            </div>
            <span class="fp-gnb-item-key">Alt+${p.num}</span>
          </a>
        `
        ).join('')}
      </div>
    </div>
    <a href="${nextHref}" class="fp-gnb-btn" title="${nextTitle}">
      <span>${nextPart ? '▶' : '🏁 허브'}</span>
    </a>
  `;

  document.body.appendChild(nav);

  // 드롭다운 토글 이벤트
  const triggerBtn = document.getElementById('fpGnbDropdownBtn');
  const menuEl = document.getElementById('fpGnbMenu');
  if (triggerBtn && menuEl) {
    triggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menuEl.classList.toggle('open');
    });
    document.addEventListener('click', () => {
      menuEl.classList.remove('open');
    });
  }

  // 서브페이지 단축키 지원 (Alt + H: 홈, Alt + 1~4: 각 파트 이동, Alt + 좌/우: 이전/다음 파트)
  window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'h' || e.key === 'H')) {
      e.preventDefault();
      window.location.href = '../index.html';
    } else if (e.altKey && ['1', '2', '3', '4'].includes(e.key)) {
      e.preventDefault();
      const target = PRESENTATION_PARTS[parseInt(e.key, 10) - 1];
      if (target) window.location.href = target.subPath;
    }
  });

  // URL 쿼리 파라미터 딥링크 자동 처리 (Part 1 미션 & Part 3 탭 연동)
  handleSubpageDeepLink(currentNum);
}

function handleSubpageDeepLink(partNum) {
  const params = new URLSearchParams(window.location.search);
  if (partNum === 1) {
    const stage = params.get('stage');
    const missionId = params.get('mission');
    if (stage && typeof window.switchStage === 'function') {
      const stageBtns = document.querySelectorAll('.step-tab-btn');
      const stageMap = { BASIC: 0, ADVANCED: 1, MASTER: 2 };
      const btnIdx = stageMap[stage.toUpperCase()];
      if (btnIdx !== undefined && stageBtns[btnIdx]) {
        window.switchStage(stage.toUpperCase(), stageBtns[btnIdx]);
      }
      if (missionId && typeof window.selectMission === 'function') {
        const missionLocalIndexMap = { '1': 0, '2': 1, '3': 2, '4': 0, '5': 1, '6': 2, '7': 0, '8': 1 };
        const localIdx = missionLocalIndexMap[String(missionId)];
        if (localIdx !== undefined) window.selectMission(localIdx);
      }
    }
  } else if (partNum === 3) {
    const tab = params.get('tab');
    if (tab && typeof window.switchCategory === 'function') {
      const tabBtns = document.querySelectorAll('.nav-tab-btn');
      const tabMap = { MUSIC_WORKFLOW: 0, MUSIC_ARCH: 1, THUMB_WORKFLOW: 2, THUMB_ARCH: 3 };
      const btnIdx = tabMap[tab.toUpperCase()];
      if (btnIdx !== undefined && tabBtns[btnIdx]) {
        window.switchCategory(tab.toUpperCase(), tabBtns[btnIdx]);
      }
    }
  }
}

/* ==========================================================================
   3. 모바일 터치 전용 퀵 컨트롤러 독 & 가상 단축키 키패드 (Virtual Keypad System)
   ========================================================================== */
function initMobileVirtualKeypad() {
  if (document.getElementById('fpMobileQuickDock')) return;

  const currentNum = detectCurrentPartNumber(); // 1~4 or null (hub)
  const isHub = currentNum === null;

  // 1. 서브페이지인 경우 가상 키패드 및 퀵 독 스타일 동적 주입
  if (!isHub) {
    injectKeypadStyles();
  }

  // 2. 하단 모바일 퀵 독 (Bottom Quick Nav Dock) 생성
  const dock = document.createElement('div');
  dock.id = 'fpMobileQuickDock';
  dock.className = 'fp-mobile-dock';
  dock.setAttribute('role', 'toolbar');
  dock.setAttribute('aria-label', '모바일 프레젠테이션 빠른 컨트롤러');

  const homeHref = isHub ? '#overviewSection' : '../index.html';
  const part1Href = isHub ? './part1/Part1.html' : '../part1/Part1.html';
  const part2Href = isHub ? './part2/Part2.html' : '../part2/Part2.html';
  const part3Href = isHub ? './part3/Part3.html' : '../part3/Part3.html';
  const part4Href = isHub ? './part4/Part4.HTML' : '../part4/Part4.HTML';

  dock.innerHTML = `
    <a href="${homeHref}" class="fp-dock-btn ${isHub ? 'active' : ''}" title="메인 허브 (Alt+H)">
      <span>🏠</span>
    </a>
    <a href="${part1Href}" class="fp-dock-btn ${currentNum === 1 ? 'active' : ''}" data-key="1" title="Part 01 바로가기 (단축키 1)">
      <span>1</span>
    </a>
    <a href="${part2Href}" class="fp-dock-btn ${currentNum === 2 ? 'active' : ''}" data-key="2" title="Part 02 바로가기 (단축키 2)">
      <span>2</span>
    </a>
    <a href="${part3Href}" class="fp-dock-btn ${currentNum === 3 ? 'active' : ''}" data-key="3" title="Part 03 바로가기 (단축키 3)">
      <span>3</span>
    </a>
    <a href="${part4Href}" class="fp-dock-btn ${currentNum === 4 ? 'active' : ''}" data-key="4" title="Part 04 바로가기 (단축키 4)">
      <span>4</span>
    </a>
    <div class="fp-dock-divider"></div>
    <button type="button" class="fp-dock-btn accent-key" id="fpDockFsBtn" title="전체화면 모드 (단축키 F)">
      <span>⛶ F</span>
    </button>
    <button type="button" class="fp-dock-btn accent-key" id="fpDockVpadToggle" title="가상 단축키 키패드 열기">
      <span>⌨️</span>
    </button>
  `;

  document.body.appendChild(dock);

  // F 버튼 클릭 이벤트
  const fsBtn = document.getElementById('fpDockFsBtn');
  if (fsBtn) {
    fsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerVirtualKey('f', 'KeyF');
    });
  }

  // 3. 확장 가상 키패드 팝업 모달 생성
  const vpadBackdrop = document.createElement('div');
  vpadBackdrop.id = 'fpVpadBackdrop';
  vpadBackdrop.className = 'fp-vpad-backdrop';
  vpadBackdrop.innerHTML = `
    <div class="fp-vpad-drawer" role="dialog" aria-modal="true" aria-label="프레젠테이션 가상 키패드">
      <div class="fp-vpad-header">
        <div class="fp-vpad-title">
          <span>📱</span>
          <span>프레젠테이션 가상 키패드 (Virtual Shortcuts)</span>
        </div>
        <button type="button" class="fp-vpad-close" id="fpVpadCloseBtn" title="닫기">✕</button>
      </div>

      <div class="fp-vpad-group-label">파트 즉시 이동 키 (Number Keys 1 ~ 4)</div>
      <div class="fp-vpad-grid">
        <button type="button" class="fp-vpad-key" data-key="1" data-code="Digit1">
          <span class="fp-vpad-key-char">1</span>
          <span class="fp-vpad-key-desc">Part 01</span>
        </button>
        <button type="button" class="fp-vpad-key" data-key="2" data-code="Digit2">
          <span class="fp-vpad-key-char">2</span>
          <span class="fp-vpad-key-desc">Part 02</span>
        </button>
        <button type="button" class="fp-vpad-key" data-key="3" data-code="Digit3">
          <span class="fp-vpad-key-char">3</span>
          <span class="fp-vpad-key-desc">Part 03</span>
        </button>
        <button type="button" class="fp-vpad-key" data-key="4" data-code="Digit4">
          <span class="fp-vpad-key-char">4</span>
          <span class="fp-vpad-key-desc">Part 04</span>
        </button>
      </div>

      <div class="fp-vpad-group-label">발표 조작 및 미디어 제어 키 (Control Keys)</div>
      <div class="fp-vpad-grid">
        <button type="button" class="fp-vpad-key" data-key="f" data-code="KeyF">
          <span class="fp-vpad-key-char">F</span>
          <span class="fp-vpad-key-desc">전체화면</span>
        </button>
        <button type="button" class="fp-vpad-key" data-key=" " data-code="Space">
          <span class="fp-vpad-key-char">Space</span>
          <span class="fp-vpad-key-desc">재생/정지</span>
        </button>
        <button type="button" class="fp-vpad-key" data-key="m" data-code="KeyM">
          <span class="fp-vpad-key-char">M</span>
          <span class="fp-vpad-key-desc">음소거</span>
        </button>
        <button type="button" class="fp-vpad-key" data-key="g" data-code="KeyG">
          <span class="fp-vpad-key-char">G</span>
          <span class="fp-vpad-key-desc">GNB가이드</span>
        </button>
      </div>

      <div class="fp-vpad-group-label">탐색 키 (Navigation Keys)</div>
      <div class="fp-vpad-grid" style="grid-template-columns: repeat(3, 1fr);">
        <button type="button" class="fp-vpad-key" data-key="ArrowLeft" data-code="ArrowLeft">
          <span class="fp-vpad-key-char">◀ 이전</span>
          <span class="fp-vpad-key-desc">미션/탭</span>
        </button>
        <button type="button" class="fp-vpad-key" data-key="ArrowRight" data-code="ArrowRight">
          <span class="fp-vpad-key-char">다음 ▶</span>
          <span class="fp-vpad-key-desc">미션/탭</span>
        </button>
        <button type="button" class="fp-vpad-key" data-key="Home" data-code="Home">
          <span class="fp-vpad-key-char">🏠 홈</span>
          <span class="fp-vpad-key-desc">대시보드</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(vpadBackdrop);

  // 가상 키패드 토글 이벤트
  const toggleBtn = document.getElementById('fpDockVpadToggle');
  const closeBtn = document.getElementById('fpVpadCloseBtn');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      vpadBackdrop.classList.toggle('open');
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      vpadBackdrop.classList.remove('open');
    });
  }
  vpadBackdrop.addEventListener('click', (e) => {
    if (e.target === vpadBackdrop) vpadBackdrop.classList.remove('open');
  });

  // 키패드 버튼 클릭 바인딩
  vpadBackdrop.querySelectorAll('.fp-vpad-key').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-key');
      const code = btn.getAttribute('data-code');
      triggerVirtualKey(key, code);
      if (['1', '2', '3', '4', 'Home'].includes(key)) {
        vpadBackdrop.classList.remove('open');
      }
    });
  });
}

function triggerVirtualKey(key, code) {
  // 1. 네이티브 KeyboardEvent 디스패치 (Part1, Part2, Hub 등 기존 리스너 트리거)
  const evt = new KeyboardEvent('keydown', {
    key: key,
    code: code || `Key${key.toUpperCase()}`,
    bubbles: true,
    cancelable: true
  });
  window.dispatchEvent(evt);
  document.dispatchEvent(evt);

  // 2. 키 종류별 직관적인 동작 보장
  if (['1', '2', '3', '4'].includes(key)) {
    const idx = parseInt(key, 10) - 1;
    const targetPart = PRESENTATION_PARTS[idx];
    if (targetPart) {
      const isHub = detectCurrentPartNumber() === null;
      const targetUrl = isHub ? targetPart.hubPath : targetPart.subPath;
      showToastFeedback(`Key [${key}] : ${targetPart.code} 이동 중...`);
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 150);
    }
  } else if (key.toLowerCase() === 'f') {
    toggleDocumentFullscreen();
    showToastFeedback('전체화면 모드 전환');
  } else if (key.toLowerCase() === 'g') {
    if (typeof toggleGnbModal === 'function') toggleGnbModal();
    else if (typeof openGnbModal === 'function') openGnbModal();
  } else if (key === 'Home') {
    const isHub = detectCurrentPartNumber() === null;
    if (!isHub) window.location.href = '../index.html';
  } else if (key === ' ') {
    // Part 2 비디오 제어
    const video = document.getElementById('intro-video');
    if (video) {
      video.paused ? video.play() : video.pause();
      showToastFeedback(video.paused ? '⏸ 영상 일시정지' : '▶ 영상 재생');
    }
  } else if (key.toLowerCase() === 'm') {
    const video = document.getElementById('intro-video');
    if (video) {
      video.muted = !video.muted;
      showToastFeedback(video.muted ? '🔇 음소거' : '🔊 음소거 해제');
    }
  } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
    // Part 1 미션 이전/다음 제어
    if (typeof window.selectMission === 'function' && typeof window.currentLocalIndex === 'number') {
      const list = window.filteredList || [];
      const delta = key === 'ArrowLeft' ? -1 : 1;
      const nextIdx = window.currentLocalIndex + delta;
      if (nextIdx >= 0 && nextIdx < list.length) {
        window.selectMission(nextIdx);
        showToastFeedback(`미션 ${nextIdx + 1}/${list.length}`);
      }
    }
  }
}

function showToastFeedback(msg) {
  let toast = document.getElementById('shortcutToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'shortcutToast';
    toast.className = 'shortcut-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 1600);
}

function injectKeypadStyles() {
  if (document.getElementById('fpKeypadInjectedStyles')) return;
  const style = document.createElement('style');
  style.id = 'fpKeypadInjectedStyles';
  style.textContent = `
    .shortcut-toast {
      position: fixed;
      bottom: 74px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: rgba(13, 22, 42, 0.94);
      border: 1px solid #22d3ee;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(34, 211, 238, 0.4);
      color: #f8fafc;
      padding: 10px 20px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      z-index: 10002;
      opacity: 0;
      pointer-events: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      white-space: nowrap;
      font-family: 'Pretendard', -apple-system, sans-serif;
    }
    .shortcut-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    .fp-mobile-dock {
      position: fixed;
      bottom: 14px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      background: rgba(8, 14, 28, 0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(34, 211, 238, 0.45);
      border-radius: 999px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(34, 211, 238, 0.25);
      user-select: none;
      max-width: calc(100vw - 20px);
      box-sizing: border-box;
    }
    .fp-dock-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 36px;
      min-width: 36px;
      padding: 0 10px;
      border-radius: 999px;
      font-family: 'Pretendard', -apple-system, sans-serif;
      font-size: 12.5px;
      font-weight: 800;
      color: #e2e8f0;
      background: rgba(30, 41, 59, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.12);
      text-decoration: none;
      cursor: pointer;
      outline: none;
      transition: all 0.2s ease;
      -webkit-tap-highlight-color: transparent;
    }
    .fp-dock-btn:active {
      transform: scale(0.92);
      background: rgba(34, 211, 238, 0.3);
    }
    .fp-dock-btn.active {
      background: linear-gradient(135deg, rgba(14, 116, 144, 0.9), rgba(16, 185, 129, 0.9));
      border-color: #22d3ee;
      color: #ffffff;
      box-shadow: 0 0 14px rgba(34, 211, 238, 0.45);
    }
    .fp-dock-btn.accent-key {
      background: rgba(14, 165, 233, 0.25);
      border-color: rgba(56, 189, 248, 0.4);
      color: #38bdf8;
    }
    .fp-dock-divider {
      width: 1px;
      height: 20px;
      background: rgba(255, 255, 255, 0.15);
      margin: 0 2px;
    }
    .fp-vpad-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(3, 7, 18, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 10001;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: all 0.25s ease;
    }
    .fp-vpad-backdrop.open {
      opacity: 1;
      visibility: visible;
    }
    .fp-vpad-drawer {
      width: 100%;
      max-width: 560px;
      background: rgba(13, 22, 42, 0.96);
      border: 1px solid rgba(34, 211, 238, 0.4);
      border-radius: 24px 24px 0 0;
      box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.85);
      padding: 18px 20px 28px;
      box-sizing: border-box;
      transform: translateY(100%);
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .fp-vpad-backdrop.open .fp-vpad-drawer {
      transform: translateY(0);
    }
    .fp-vpad-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 12px;
      margin-bottom: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .fp-vpad-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.95rem;
      font-weight: 800;
      color: #38bdf8;
      font-family: 'Pretendard', sans-serif;
    }
    .fp-vpad-close {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #94a3b8;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 14px;
    }
    .fp-vpad-group-label {
      font-size: 0.74rem;
      font-weight: 800;
      color: #94a3b8;
      letter-spacing: 0.5px;
      margin: 10px 0 6px;
      font-family: 'Pretendard', sans-serif;
    }
    .fp-vpad-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }
    .fp-vpad-key {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      padding: 10px 4px;
      background: rgba(30, 41, 59, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      color: #f8fafc;
      cursor: pointer;
      user-select: none;
      outline: none;
      -webkit-tap-highlight-color: transparent;
      font-family: 'Pretendard', sans-serif;
    }
    .fp-vpad-key:active {
      transform: scale(0.94);
      background: rgba(34, 211, 238, 0.25);
      border-color: #22d3ee;
    }
    .fp-vpad-key-char {
      font-family: Consolas, monospace;
      font-size: 1.15rem;
      font-weight: 900;
      color: #38bdf8;
    }
    .fp-vpad-key-desc {
      font-size: 0.68rem;
      font-weight: 600;
      color: #94a3b8;
    }
  `;
  document.head.appendChild(style);
}

function injectMobileResponsiveStyles() {
  if (document.getElementById('fpMobileGlobalResponsiveStyles')) return;
  const currentNum = detectCurrentPartNumber();
  if (!currentNum) return; // 메인 허브는 16:9 정중앙 뷰포트 레이아웃을 유지하므로 서브페이지 전용 반응형 스타일 주입 제외
  const style = document.createElement('style');
  style.id = 'fpMobileGlobalResponsiveStyles';
  style.textContent = `
    @media (max-width: 860px) {
      /* Part 1 모바일 최적화 */
      html, body {
        height: auto !important;
        min-height: 100vh !important;
        overflow-y: auto !important;
      }
      body {
        padding: 12px 14px 80px !important;
      }
      .showcase-layout {
        grid-template-columns: 1fr !important;
        gap: 14px !important;
      }
      .list-card {
        height: auto !important;
        max-height: 220px !important;
      }
      .media-16-9-box {
        max-height: none !important;
        width: 100% !important;
        aspect-ratio: 16 / 9 !important;
      }
      .step-tabs {
        gap: 6px !important;
      }
      .step-tab-btn {
        padding: 6px 14px !important;
        font-size: 0.8rem !important;
      }

      /* Part 2 모바일 최적화 */
      .viewport {
        padding: 14px 14px 80px !important;
        height: auto !important;
        min-height: 100vh !important;
      }
      .intro-header {
        margin-bottom: 14px !important;
      }
      .intro-title {
        font-size: 1.45rem !important;
      }
      .intro-desc {
        font-size: 0.85rem !important;
      }
      .hud-dock {
        flex-wrap: wrap !important;
        padding: 8px 14px !important;
        gap: 8px !important;
      }

      /* Part 3 모바일 최적화 */
      .nav-tabs {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 6px !important;
      }
      .nav-tab-btn {
        padding: 8px 10px !important;
        font-size: 0.78rem !important;
        justify-content: center !important;
      }
      .content-frame {
        min-height: 60vh !important;
      }

      /* 모바일에서는 하단 퀵 독이 메인이므로 서브페이지 미니 GNB는 숨겨 겹침 방지 */
      #fpGlobalMiniNav {
        display: none !important;
      }

      /* Part 4 모바일 최적화 */
      .viewport {
        padding: 16px 14px 84px !important;
        height: auto !important;
        min-height: 100vh !important;
        overflow-y: auto !important;
        box-sizing: border-box !important;
      }
      .qr-card-container {
        padding: 24px 16px 20px !important;
        max-width: min(92vw, 380px) !important;
        width: 100% !important;
        box-sizing: border-box !important;
        margin: auto !important;
        border-radius: 24px !important;
      }
      .badge {
        font-size: 11.5px !important;
        padding: 5px 14px !important;
        margin-bottom: 16px !important;
      }
      .qr-link-wrap {
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        width: 100% !important;
        margin: 0 auto !important;
      }
      .qr-frame {
        width: min(200px, 58vw) !important;
        height: min(200px, 58vw) !important;
        padding: 10px !important;
        border-radius: 18px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-sizing: border-box !important;
      }
      .qr-img {
        width: 100% !important;
        height: 100% !important;
        max-width: 100% !important;
        max-height: 100% !important;
        object-fit: contain !important;
        display: block !important;
        border-radius: 10px !important;
      }
      .title-group {
        margin-top: 18px !important;
      }
      .main-text {
        font-size: 14.5px !important;
        line-height: 1.55 !important;
      }
      .sub-caption {
        font-size: 12px !important;
        margin-top: 10px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

window.addEventListener('DOMContentLoaded', () => {
  initHubPage();
  initSubpageGNB();
  injectMobileResponsiveStyles();
  initMobileVirtualKeypad();
});
window.addEventListener('load', () => {
  // Part1.html 등이 window.onload에서 초기화하므로 load 이후 딥링크 한 번 더 체크
  const currentNum = detectCurrentPartNumber();
  if (currentNum) handleSubpageDeepLink(currentNum);
});

