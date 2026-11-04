/**
 * Yahoot! Anti-Cheat & Lock Inspect Utility
 * Mengunci akses inspect element, devtools shortcuts, klik kanan, dan view-source
 * untuk mencegah kecurangan murid selama sesi kuis berlangsung.
 */

let isLockInspectActive = false;
let warningTimeout = null;

function showInspectBlockedNotice() {
  // Cek apakah elemen notifikasi sudah ada di DOM
  let noticeEl = document.getElementById('yahoot-inspect-lock-notice');
  if (!noticeEl) {
    noticeEl = document.createElement('div');
    noticeEl.id = 'yahoot-inspect-lock-notice';
    noticeEl.className = 'yahoot-lock-toast';
    noticeEl.innerHTML = `
      <div style="
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999999;
        background-color: #0f172a;
        color: #f8fafc;
        border: 2px solid #f59e0b;
        box-shadow: 4px 4px 0px 0px #000;
        border-radius: 8px;
        padding: 10px 18px;
        font-family: system-ui, -apple-system, sans-serif;
        font-weight: 800;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 8px;
        pointer-events: none;
        transition: opacity 0.2s ease, transform 0.2s ease;
      ">
        <span style="font-size: 16px;">🔒</span>
        <span>Inspeksi elemen & klik kanan dinonaktifkan demi integritas kuis!</span>
      </div>
    `;
    document.body.appendChild(noticeEl);
  }

  // Tampilkan notifikasi
  noticeEl.style.opacity = '1';
  noticeEl.style.display = 'block';

  if (warningTimeout) clearTimeout(warningTimeout);
  warningTimeout = setTimeout(() => {
    if (noticeEl) {
      noticeEl.style.opacity = '0';
      setTimeout(() => {
        if (noticeEl) noticeEl.style.display = 'none';
      }, 200);
    }
  }, 2200);
}

export function initLockInspect() {
  if (isLockInspectActive || typeof window === 'undefined') return;
  isLockInspectActive = true;

  // 1. Blokir Menu Klik Kanan (Context Menu)
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showInspectBlockedNotice();
    return false;
  }, { capture: true });

  // 2. Blokir Keyboard Shortcuts DevTools & Inspect
  window.addEventListener('keydown', (e) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const key = e.key ? e.key.toLowerCase() : '';
    const keyCode = e.keyCode || e.which;

    // F12
    if (e.key === 'F12' || keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      showInspectBlockedNotice();
      return false;
    }

    // Ctrl + Shift + I (Inspect Element)
    // Ctrl + Shift + J (DevTools Console)
    // Ctrl + Shift + C (Element Picker)
    // Ctrl + Shift + K (Firefox Web Console)
    if (isCtrlOrCmd && isShift && (key === 'i' || key === 'j' || key === 'c' || key === 'k')) {
      e.preventDefault();
      e.stopPropagation();
      showInspectBlockedNotice();
      return false;
    }

    // Ctrl + U (View Page Source)
    if (isCtrlOrCmd && key === 'u') {
      e.preventDefault();
      e.stopPropagation();
      showInspectBlockedNotice();
      return false;
    }

    // Ctrl + S (Save Page)
    if (isCtrlOrCmd && key === 's') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 3. Peringatan Konsol Tegas
  const printConsoleWarning = () => {
    try {
      console.clear();
      console.log(
        '%c⚠️ PERINGATAN KEAMANAN YAHOOT! ⚠️',
        'color: #dc2626; font-size: 24px; font-weight: 900; background: #fee2e2; padding: 4px 10px; border: 2px solid #dc2626; border-radius: 4px;'
      );
      console.log(
        '%cInspeksi elemen & modifikasi DOM dinonaktifkan untuk menjaga kejujuran kuis.',
        'font-size: 14px; font-weight: bold; color: #0f172a; margin-top: 6px;'
      );
    } catch {
      // Abaikan jika console dimatikan browser
    }
  };

  printConsoleWarning();

  // Bersihkan log console secara berkala bila murid mencoba membuka console
  setInterval(() => {
    if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
      printConsoleWarning();
    }
  }, 2500);
}
