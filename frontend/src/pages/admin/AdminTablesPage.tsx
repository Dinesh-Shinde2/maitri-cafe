import React, { useEffect, useState } from 'react';
import { Plus, Copy, Check, ExternalLink, X, QrCode } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { tablesApi, ordersApi } from '../../services/api';

export const AdminTablesPage: React.FC = () => {
  const [tables, setTables] = useState<any[]>([]);
  const [serviceReqs, setServiceReqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQrTable, setSelectedQrTable] = useState<any | null>(null);
  const [qrData, setQrData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');
  const [newCapacity, setNewCapacity] = useState(4);
  const [newLocation, setNewLocation] = useState('Indoor');

  const fetchTables = () => {
    tablesApi.getAll().then((res) => {
      setTables(res.data);
      setLoading(false);
    }).catch(console.error);

    ordersApi.getServiceRequests().then((res) => {
      setServiceReqs(res.data);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 4000);
    return () => clearInterval(interval);
  }, []);

  const openQrModal = (table: any) => {
    setSelectedQrTable(table);
    setQrData(null);
    tablesApi.getQrCode(table.table_number).then((res) => setQrData(res.data)).catch(console.error);
  };

  const handleCopyUrl = () => {
    if (!qrData?.order_url) return;
    navigator.clipboard.writeText(qrData.order_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNum) return;
    tablesApi
      .create({
        table_number: newTableNum.toUpperCase(),
        capacity: newCapacity,
        location: newLocation,
        status: 'Available',
      })
      .then(() => {
        setShowAddModal(false);
        setNewTableNum('');
        fetchTables();
      })
      .catch(console.error);
  };

  const handleToggleTableStatus = (tableId: number, currentStatus: string) => {
    const next =
      currentStatus === 'Available' ? 'Occupied' : currentStatus === 'Occupied' ? 'Reserved' : 'Available';
    tablesApi.updateStatus(tableId, next).then(fetchTables).catch(console.error);
  };

  const statusClass = (status: string) => {
    if (status === 'Occupied') return 'bg-copper/15 text-copper';
    if (status === 'Reserved') return 'bg-moss-100 text-moss-700';
    return 'bg-moss-50 text-moss-600';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 border border-paper-line bg-paper-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Tables & QR</h1>
            <p className="mt-1 text-xs text-ink-mute">
              Print each table QR. Guests scan → token validates → order locks to that seat.
            </p>
          </div>
          <button type="button" onClick={() => setShowAddModal(true)} className="btn-primary !py-2.5 !text-xs">
            <Plus className="h-4 w-4" />
            Add table
          </button>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-ink-mute">Loading floor…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tables.map((t) => {
              const calls = serviceReqs.filter((r) => r.table_number === t.table_number);
              return (
                <div key={t.id} className="border border-paper-line bg-paper-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-xl font-bold text-ink">{t.table_number}</p>
                      <p className="text-xs text-ink-mute">{t.location} · {t.capacity} seats</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleTableStatus(t.id, t.status)}
                      className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${statusClass(t.status)}`}
                    >
                      {t.status}
                    </button>
                  </div>

                  {calls.length > 0 && (
                    <p className="text-[11px] font-semibold text-copper">
                      {calls.map((c) => c.request_type).join(', ')} requested
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => openQrModal(t)}
                    className="btn-secondary w-full !py-2 !text-xs"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    View / print QR
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {selectedQrTable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4">
            <div className="w-full max-w-md border border-paper-line bg-paper-card shadow-soft">
              <div className="flex items-center justify-between border-b border-paper-line px-5 py-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">
                    Table {selectedQrTable.table_number}
                  </h3>
                  <p className="text-xs text-ink-mute">Guest scan opens verified ordering session</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedQrTable(null); setQrData(null); }}
                  className="p-1 text-ink-mute hover:text-ink"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 p-5">
                {qrData ? (
                  <>
                    <div className="mx-auto w-52 border border-paper-line bg-white p-3">
                      <img src={qrData.qr_image_base64} alt={`QR ${selectedQrTable.table_number}`} className="w-full" />
                    </div>
                    <p className="break-all bg-paper px-2 py-2 text-[10px] text-ink-mute">{qrData.order_url}</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={handleCopyUrl} className="btn-secondary !py-2 !text-xs flex-1">
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? 'Copied' : 'Copy link'}
                      </button>
                      <a
                        href={qrData.order_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary !py-2 !text-xs flex-1"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open
                      </a>
                      <a
                        href={qrData.qr_image_base64}
                        download={`maitri-table-${selectedQrTable.table_number}.png`}
                        className="btn-primary !py-2 !text-xs flex-1"
                      >
                        Download PNG
                      </a>
                    </div>
                    <p className="text-[11px] leading-relaxed text-ink-mute">
                      Token in this URL is checked on every order. Reprint if you rotate table codes on the backend.
                    </p>
                  </>
                ) : (
                  <p className="py-10 text-center text-sm text-ink-mute">Generating QR…</p>
                )}
              </div>
            </div>
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4">
            <form onSubmit={handleCreateTable} className="w-full max-w-sm border border-paper-line bg-paper-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">New table</h3>
                <button type="button" onClick={() => setShowAddModal(false)} className="text-ink-mute">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <label className="block text-xs font-medium text-ink-mute">
                Table number
                <input className="field mt-1" required placeholder="T12" value={newTableNum} onChange={(e) => setNewTableNum(e.target.value)} />
              </label>
              <label className="block text-xs font-medium text-ink-mute">
                Capacity
                <input className="field mt-1" type="number" min={1} value={newCapacity} onChange={(e) => setNewCapacity(parseInt(e.target.value) || 2)} />
              </label>
              <label className="block text-xs font-medium text-ink-mute">
                Location
                <select className="field mt-1" value={newLocation} onChange={(e) => setNewLocation(e.target.value)}>
                  <option value="Indoor">Indoor</option>
                  <option value="Rooftop">Rooftop</option>
                  <option value="Garden">Garden</option>
                </select>
              </label>
              <button type="submit" className="btn-primary w-full">Create & issue QR token</button>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
