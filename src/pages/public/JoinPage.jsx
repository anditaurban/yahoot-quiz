import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Gamepad2, ArrowLeft, ArrowRight, User, Camera, QrCode, X, Upload } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { getGame, joinGame } from '../../services/api/games';

export const JoinPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPin = searchParams.get('pin') || '';

  const [pin, setPin] = useState(initialPin);
  const [nickname, setNickname] = useState('');
  const [step, setStep] = useState(initialPin.length === 5 ? 'nickname' : 'pin'); // 'pin' | 'nickname'
  const [gameInfo, setGameInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // QR Scanner States
  const [showScanner, setShowScanner] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef(null);

  // If initial PIN was passed in URL, verify it immediately
  useEffect(() => {
    if (initialPin.length === 5) {
      verifyPin(initialPin);
    }
  }, [initialPin]);

  // Handle Camera QR Scanner
  useEffect(() => {
    if (!showScanner) return;
    let scannerInstance = null;

    const startScanner = async () => {
      try {
        setCameraError('');
        const html5QrCode = new Html5Qrcode('qr-reader-scanner');
        scannerInstance = html5QrCode;
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
          },
          (decodedText) => {
            let extractedPin = decodedText;
            try {
              const url = new URL(decodedText);
              const param = url.searchParams.get('pin');
              if (param) extractedPin = param;
            } catch {
              const match = decodedText.match(/\b\d{5}\b/);
              if (match) extractedPin = match[0];
            }

            extractedPin = (extractedPin || '').replace(/\D/g, '').slice(0, 5);
            if (extractedPin.length === 5) {
              html5QrCode
                .stop()
                .then(() => {
                  scannerRef.current = null;
                  setShowScanner(false);
                  setPin(extractedPin);
                  verifyPin(extractedPin);
                })
                .catch(() => {
                  setShowScanner(false);
                  setPin(extractedPin);
                  verifyPin(extractedPin);
                });
            }
          },
          () => {}
        );
      } catch (err) {
        setCameraError(
          'Tidak dapat mengakses kamera. Pastikan izin kamera aktif pada browser Anda atau masukkan 5 digit PIN secara manual.'
        );
      }
    };

    const timer = setTimeout(startScanner, 150);

    return () => {
      clearTimeout(timer);
      if (scannerInstance) {
        try {
          scannerInstance.stop().then(() => scannerInstance.clear()).catch(() => {});
        } catch {}
      }
    };
  }, [showScanner]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCameraError('');
      const html5QrCode = new Html5Qrcode('qr-reader-scanner');
      const decodedText = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();

      let extractedPin = decodedText;
      try {
        const url = new URL(decodedText);
        const param = url.searchParams.get('pin');
        if (param) extractedPin = param;
      } catch {
        const match = decodedText.match(/\b\d{5}\b/);
        if (match) extractedPin = match[0];
      }

      extractedPin = (extractedPin || '').replace(/\D/g, '').slice(0, 5);
      if (extractedPin.length === 5) {
        setShowScanner(false);
        setPin(extractedPin);
        verifyPin(extractedPin);
      } else {
        setCameraError('QR Code tidak mengandung kode PIN 5-digit yang valid.');
      }
    } catch {
      setCameraError('Gagal memindai gambar QR Code. Coba gunakan foto lain atau ketik PIN manual.');
    }
  };

  const closeScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.stop().then(() => scannerRef.current.clear()).catch(() => {});
      } catch {}
      scannerRef.current = null;
    }
    setShowScanner(false);
  };

  const verifyPin = async (codeToVerify) => {
    setLoading(true);
    setError('');
    try {
      const game = await getGame(codeToVerify);
      setGameInfo(game);
      setStep('nickname');
    } catch (err) {
      setError(err.message || 'Kode game tidak ditemukan. Coba periksa kembali.');
      setStep('pin');
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    const cleanPin = pin.trim();
    if (cleanPin.length < 5) {
      setError('PIN Game harus terdiri dari 5 digit.');
      return;
    }
    verifyPin(cleanPin);
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    const cleanNick = nickname.trim();
    if (!cleanNick) {
      setError('Masukkan nama panggilan Anda.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await joinGame(pin, { nickname: cleanNick });
      // Store student session in sessionStorage
      sessionStorage.setItem('yahoot_player', JSON.stringify({
        playerId: result.playerId,
        nickname: result.nickname,
        gameCode: result.gameCode,
        gameId: result.gameId || gameInfo?.id
      }));

      navigate(`/game/${result.gameCode}`);
    } catch (err) {
      setError(err.message || 'Gagal bergabung ke sesi kuis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 game-grid-pattern">
      <Card className="w-full max-w-md bg-white border-3 shadow-block-xl">
        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-amber-400 border-2 border-slate-900 rounded-block shadow-block-sm text-slate-950 mb-3">
            <Gamepad2 className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-950">
            {step === 'pin' ? 'Gabung Game' : 'Pilih Nickname'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {step === 'pin'
              ? 'Masukkan 5 digit kode PIN dari layar kuis guru'
              : `Kuis: ${gameInfo?.quizTitle || 'Sesi Yahoot!'}`}
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-100 border-2 border-red-500 rounded-block text-red-800 text-xs sm:text-sm font-bold animate-in fade-in">
            {error}
          </div>
        )}

        {/* STEP 1: PIN ENTRY */}
        {step === 'pin' && (
          <form onSubmit={handlePinSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="game-pin-input"
                className="block text-xs uppercase tracking-wider font-display font-black text-slate-700 text-center mb-2"
              >
                Kode PIN Kuis
              </label>
              <input
                id="game-pin-input"
                type="text"
                pattern="[0-9]*"
                maxLength={5}
                autoFocus
                placeholder="00000"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                className="w-full min-h-[64px] text-center font-display font-black text-3xl sm:text-4xl tracking-widest bg-slate-50 border-3 border-slate-900 rounded-block focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-400"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={pin.length < 5}
            >
              <span>Lanjutkan</span>
              <ArrowRight className="w-5 h-5 ml-1.5 stroke-[3]" />
            </Button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t-2 border-slate-200 w-full" />
              <span className="bg-white px-3 text-xs font-bold uppercase text-slate-400">Atau</span>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => setShowScanner(true)}
              className="flex items-center justify-center gap-2 border-2 border-slate-900 bg-amber-100 hover:bg-amber-200 text-slate-950 font-display font-bold text-sm shadow-block-sm"
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
              <span>Scan QR Code dari Layar Guru</span>
            </Button>

            <div className="text-center pt-2">
              <Link to="/" className="text-xs font-bold text-slate-500 hover:text-slate-800 hover:underline">
                &larr; Kembali ke Beranda
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: NICKNAME ENTRY */}
        {step === 'nickname' && (
          <form onSubmit={handleJoinSubmit} className="space-y-5">
            {/* Active Game Info Pill */}
            <div className="p-3 bg-amber-50 border-2 border-slate-900 rounded-block flex items-center justify-between text-xs font-bold text-slate-800">
              <span>PIN: {pin}</span>
              <button
                type="button"
                onClick={() => {
                  setStep('pin');
                  setError('');
                }}
                className="text-indigo-600 hover:underline"
              >
                Ganti PIN
              </button>
            </div>

            <div>
              <Input
                label="Nama Panggilan / Nickname"
                placeholder="Contoh: Rian, Budi, Siti"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setError('');
                }}
                maxLength={15}
                autoFocus
                required
              />
            </div>

            <Button
              type="submit"
              variant="success"
              size="lg"
              fullWidth
              loading={loading}
              disabled={!nickname.trim()}
            >
              <span>Mulai Bermain</span>
              <ArrowRight className="w-5 h-5 ml-1.5 stroke-[3]" />
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep('pin')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 hover:underline"
              >
                &larr; Ganti PIN Game
              </button>
            </div>
          </form>
        )}
      </Card>

      {/* Camera QR Scanner Modal */}
      {showScanner && (
        <Modal
          isOpen={showScanner}
          onClose={closeScanner}
          title="Scan QR Code Kuis"
        >
          <div className="p-4 space-y-4">
            <p className="text-xs sm:text-sm text-slate-700 font-semibold text-center">
              Arahkan kamera ke QR Code di layar guru untuk masuk otomatis.
            </p>

            {cameraError && (
              <div className="p-3 bg-red-50 border-2 border-red-500 rounded-block text-xs text-red-800 font-bold">
                {cameraError}
              </div>
            )}

            {/* Video container for html5-qrcode */}
            <div className="relative w-full max-w-xs mx-auto border-3 border-slate-900 rounded-block overflow-hidden shadow-block bg-black min-h-[240px]">
              <div id="qr-reader-scanner" className="w-full h-full" />
            </div>

            {/* Alternative: Upload screenshot of QR */}
            <div className="pt-2 border-t-2 border-slate-100 flex flex-col gap-2">
              <label className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 rounded-block font-display font-bold text-xs text-slate-800 cursor-pointer transition-colors shadow-block-xs">
                <Upload className="w-4 h-4" />
                <span>Pilih Foto / Screenshot QR dari Galeri</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={closeScanner}
              >
                Batal & Ketik PIN Manual
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
