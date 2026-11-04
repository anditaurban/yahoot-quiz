/**
 * Yahoot! Anti-Cheat & Lock Inspect Utility (Silent Mode)
 * Mengunci akses inspect element, devtools shortcuts, klik kanan, dan view-source
 * secara senyap tanpa menampilkan popup notifikasi.
 */

let isLockInspectActive = false;

export function initLockInspect() {
  if (isLockInspectActive || typeof window === 'undefined') return;
  isLockInspectActive = true;

  // 1. Blokir Menu Klik Kanan secara senyap
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  }, { capture: true });

  // 2. Blokir Keyboard Shortcuts DevTools & Inspect secara senyap
  window.addEventListener('keydown', (e) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const key = e.key ? e.key.toLowerCase() : '';
    const keyCode = e.keyCode || e.which;

    // F12
    if (e.key === 'F12' || keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl + Shift + I (Inspect Element)
    // Ctrl + Shift + J (DevTools Console)
    // Ctrl + Shift + C (Element Picker)
    // Ctrl + Shift + K (Firefox Web Console)
    if (isCtrlOrCmd && isShift && (key === 'i' || key === 'j' || key === 'c' || key === 'k')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl + U (View Page Source)
    if (isCtrlOrCmd && key === 'u') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl + S (Save Page)
    if (isCtrlOrCmd && key === 's') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 3. Peringatan Konsol
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
