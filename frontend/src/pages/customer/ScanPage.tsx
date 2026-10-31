import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, CameraOff, CheckCircle2, QrCode, ShieldCheck, Smartphone } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { tablesApi } from '../../services/api';
import { useCart } from '../../context/CartContext';

type ScanState = 'idle' | 'starting' | 'scanning' | 'validating' | 'success' | 'error';

function parseTableQr(raw: string): { tableNumber: string; token: string } | null {
  const text = raw.trim();

  // Full URL from printed QR: https://host/order/T01?token=...
  try {
    const asUrl = new URL(text);
    const match = asUrl.pathname.match(/\/order\/([^/?#]+)/i);
    const token = asUrl.searchParams.get('token');
    if (match?.[1] && token) {
      return { tableNumber: decodeURIComponent(match[1]), token };
    }
  } catch {
    // not a full URL — try relative / query forms below
  }

  const pathMatch = text.match(/\/order\/([^/?#\s]+)/i);
  const tokenMatch = text.match(/[?&]token=([^&\s]+)/i);
  if (pathMatch?.[1] && tokenMatch?.[1]) {
    return {
      tableNumber: decodeURIComponent(pathMatch[1]),
      token: decodeURIComponent(tokenMatch[1]),
    };
  }

  // Compact payload: TABLE:T01|TOKEN:xxxx
  const compact = text.match(/TABLE:([^|]+)\|TOKEN:(.+)/i);
  if (compact) {
    return { tableNumber: compact[1].trim(), token: compact[2].trim() };
  }

  return null;
}

export const ScanPage: React.FC = () => {
  const navigate = useNavigate();
  const { setTableSession, tableNumber: activeTable } = useCart();

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [manualTable, setManualTable] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const handlingRef = useRef(false);
  const readerId = 'maitri-qr-reader';

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      scanner.clear();
    } catch {
      // camera already stopped
    }
    scannerRef.current = null;
  }, []);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        const mapped = devices.map((d) => ({ id: d.id, label: d.label || 'Camera' }));
        setCameras(mapped);
        const back = mapped.find((c) => /back|rear|environment/i.test(c.label));
        setCameraId(back?.id || mapped[0]?.id || null);
      })
      .catch(() => {
        setCameras([]);
      });

    return () => {
      void stopScanner();
    };
  }, [stopScanner]);

  const activateSession = async (tableNumber: string, token: string) => {
    setScanState('validating');
    setErrorMsg('');
    try {
      const res = await tablesApi.validateQr(tableNumber, token);
      setTableSession(res.data.table_number, token);
      setScanState('success');
      await stopScanner();
      setTimeout(() => {
        navigate(`/order/${res.data.table_number}?token=${encodeURIComponent(token)}`, { replace: true });
      }, 700);
    } catch (err: any) {
      setScanState('error');
      setErrorMsg(err?.response?.data?.detail || 'QR invalid or expired. Ask staff for table code.');
      handlingRef.current = false;
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    if (handlingRef.current) return;
    handlingRef.current = true;

    const parsed = parseTableQr(decodedText);
    if (!parsed) {
      setScanState('error');
      setErrorMsg('Not a Maitri table QR. Point camera at the code on your table.');
      handlingRef.current = false;
      return;
    }

    await activateSession(parsed.tableNumber, parsed.token);
  };

  const startScanner = async () => {
    setErrorMsg('');
    setScanState('starting');
    await stopScanner();

    try {
      const scanner = new Html5Qrcode(readerId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = scanner;

      const config = {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1,
      };

      if (cameraId) {
        await scanner.start(cameraId, config, onScanSuccess, () => undefined);
      } else {
        await scanner.start({ facingMode: 'environment' }, config, onScanSuccess, () => undefined);
      }

      setScanState('scanning');
      handlingRef.current = false;
    } catch (err: any) {
      setScanState('error');
      setErrorMsg(
        err?.message?.includes('Permission') || err?.name === 'NotAllowedError'
          ? 'Camera permission blocked. Allow camera, or enter table code below.'
          : 'Camera unavailable. Use manual table code, or open link from printed QR.'
      );
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTable.trim() || !manualToken.trim()) {
      setErrorMsg('Enter both table number and token from staff / QR link.');
      setScanState('error');
      return;
    }
    handlingRef.current = true;
    await activateSession(manualTable.trim().toUpperCase(), manualToken.trim());
  };

  return (
    <div className="pb-16">
      <section className="relative overflow-hidden bg-ink text-paper">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(91,138,110,0.35), transparent 40%), radial-gradient(circle at 80% 0%, rgba(168,107,60,0.2), transparent 35%)',
          }}
        />
        <div className="page-shell relative py-14 sm:py-20">
          <p className="section-label text-moss-300 animate-fade-up">Table ordering</p>
          <h1 className="mt-3 max-w-xl font-display text-4xl font-bold tracking-tight sm:text-5xl animate-fade-up" style={{ animationDelay: '60ms' }}>
            Scan. Sit. Order.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-paper/70 sm:text-base animate-fade-up" style={{ animationDelay: '120ms' }}>
            Point your phone at the QR on your table. We verify the session, open the menu for that seat, and send orders straight to the kitchen.
          </p>

          {activeTable && (
            <div className="mt-6 inline-flex items-center gap-2 border border-moss-400/40 bg-moss-800/50 px-3 py-2 text-xs text-moss-100 animate-fade-up" style={{ animationDelay: '160ms' }}>
              <ShieldCheck className="h-4 w-4" />
              Active session: Table {activeTable}
              <Link to={`/order/${activeTable}`} className="ml-2 underline underline-offset-2">
                Continue ordering
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="page-shell -mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Scanner panel */}
        <div className="border border-paper-line bg-paper-card p-4 shadow-soft sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Camera scan</h2>
              <p className="text-xs text-ink-mute">Uses rear camera when available</p>
            </div>
            {scanState === 'scanning' ? (
              <button type="button" onClick={() => { void stopScanner(); setScanState('idle'); }} className="btn-secondary !py-2 !text-xs">
                <CameraOff className="h-3.5 w-3.5" />
                Stop
              </button>
            ) : (
              <button type="button" onClick={() => void startScanner()} className="btn-primary !py-2 !text-xs" disabled={scanState === 'starting' || scanState === 'validating'}>
                <Camera className="h-3.5 w-3.5" />
                {scanState === 'starting' ? 'Opening…' : 'Start camera'}
              </button>
            )}
          </div>

          <div className="relative aspect-square overflow-hidden bg-ink">
            <div id={readerId} className="h-full w-full [&_video]:h-full [&_video]:w-full" />

            {scanState !== 'scanning' && scanState !== 'starting' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/90 p-6 text-center">
                <QrCode className="h-12 w-12 text-moss-300" />
                <p className="max-w-xs text-sm text-paper/80">
                  {scanState === 'success'
                    ? 'Table verified. Opening menu…'
                    : 'Start camera and align the table QR inside the frame.'}
                </p>
              </div>
            )}

            {scanState === 'scanning' && (
              <>
                <div className="pointer-events-none absolute inset-[12%] border border-moss-300/80">
                  <span className="absolute -left-px -top-px h-5 w-5 border-l-2 border-t-2 border-moss-300" />
                  <span className="absolute -right-px -top-px h-5 w-5 border-r-2 border-t-2 border-moss-300" />
                  <span className="absolute -bottom-px -left-px h-5 w-5 border-b-2 border-l-2 border-moss-300" />
                  <span className="absolute -bottom-px -right-px h-5 w-5 border-b-2 border-r-2 border-moss-300" />
                  <span className="absolute left-[8%] right-[8%] h-0.5 bg-moss-300/90 shadow-[0_0_12px_rgba(91,138,110,0.8)] animate-scan-line" />
                </div>
                <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[11px] font-medium uppercase tracking-wider text-paper/70">
                  Scanning…
                </p>
              </>
            )}

            {scanState === 'validating' && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/70 text-sm text-paper">
                Verifying table session…
              </div>
            )}

            {scanState === 'success' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-moss-800/90 text-paper">
                <CheckCircle2 className="h-10 w-10" />
                <p className="font-display text-lg font-semibold">Session ready</p>
              </div>
            )}
          </div>

          {cameras.length > 1 && (
            <label className="mt-4 block text-xs font-medium text-ink-mute">
              Camera
              <select
                className="field mt-1"
                value={cameraId || ''}
                onChange={(e) => setCameraId(e.target.value)}
                disabled={scanState === 'scanning' || scanState === 'starting'}
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </label>
          )}

          {errorMsg && (
            <div className="mt-4 border border-copper/40 bg-copper/10 px-3 py-2.5 text-xs text-ink-soft">
              {errorMsg}
            </div>
          )}
        </div>

        {/* How it works + manual */}
        <div className="space-y-6">
          <div className="border border-paper-line bg-paper-card p-6">
            <h2 className="font-display text-xl font-semibold text-ink">How scanning works</h2>
            <ol className="mt-5 space-y-4">
              {[
                { icon: QrCode, title: 'Find the code on your table', body: 'Each seat has a unique QR tied to that table number.' },
                { icon: Camera, title: 'Scan with this page', body: 'We read the link, check the secure token, then lock your session.' },
                { icon: Smartphone, title: 'Order from your phone', body: 'Add dishes, call waiter, request bill — kitchen gets live updates.' },
              ].map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-moss-200 bg-moss-50 text-moss-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-mute">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <form onSubmit={handleManualSubmit} className="border border-paper-line bg-paper-card p-6 space-y-3">
            <h2 className="font-display text-lg font-semibold text-ink">Manual entry</h2>
            <p className="text-xs text-ink-mute">
              Camera blocked? Staff can share table number + token from the printed QR link.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-ink-mute">
                Table number
                <input
                  className="field mt-1"
                  placeholder="T01"
                  value={manualTable}
                  onChange={(e) => setManualTable(e.target.value)}
                />
              </label>
              <label className="text-xs font-medium text-ink-mute">
                Session token
                <input
                  className="field mt-1"
                  placeholder="TOKEN_…"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                />
              </label>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={scanState === 'validating'}>
              Verify & open menu
            </button>
          </form>

          <p className="text-center text-xs text-ink-mute">
            Just browsing?{' '}
            <Link to="/menu" className="font-semibold text-moss-600 underline-offset-2 hover:underline">
              View full menu
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
