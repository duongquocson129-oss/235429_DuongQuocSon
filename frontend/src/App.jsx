import { useEffect, useState } from 'react';
import {
  AlertCircle, Check, ChevronRight, CirclePlus, ClipboardList, LoaderCircle,
  Pencil, Search, Trash2, X,
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const STATUSES = ['Đang sử dụng', 'Hư hỏng', 'Đang sửa chữa', 'Ngừng sử dụng'];
const EMPTY_FORM = {
  deviceId: '', name: '', deviceType: '', room: '', brand: '', model: '',
  quantity: 1, status: 'Đang sử dụng', purchaseDate: '', description: '',
};

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'Không thể hoàn tất yêu cầu.');
  return body;
}

function Status({ value }) {
  const kind = value === 'Đang sử dụng' ? 'active' : value === 'Hư hỏng' ? 'broken' : value === 'Đang sửa chữa' ? 'repair' : 'stopped';
  return <span className={`status status-${kind}`}><span />{value}</span>;
}

function DeviceDialog({ device, onClose, onSaved }) {
  const [form, setForm] = useState(() => device ? {
    ...device,
    purchaseDate: device.purchaseDate ? new Date(device.purchaseDate).toISOString().slice(0, 10) : '',
  } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const editing = Boolean(device?._id);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = { ...form, quantity: Number(form.quantity), purchaseDate: form.purchaseDate || null };
    try {
      await request(editing ? `/devices/${device._id}` : '/devices', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      onSaved(editing ? 'Thông tin thiết bị đã được cập nhật.' : 'Thiết bị mới đã được thêm.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    ['deviceId', 'Mã thiết bị'], ['name', 'Tên thiết bị'], ['deviceType', 'Loại thiết bị'],
    ['room', 'Phòng học'], ['brand', 'Hãng sản xuất'], ['model', 'Model'],
  ];

  return (
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <header className="dialog-head">
          <div><span className="eyebrow">HỒ SƠ THIẾT BỊ</span><h2 id="dialog-title">{editing ? 'Cập nhật thiết bị' : 'Thêm thiết bị'}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Đóng"><X size={19} /></button>
        </header>
        <form onSubmit={submit}>
          <div className="form-grid">
            {fields.map(([name, label]) => (
              <label className="field" key={name}><span>{label}</span><input name={name} value={form[name]} onChange={update} required /></label>
            ))}
            <label className="field"><span>Số lượng</span><input name="quantity" type="number" min="1" step="1" value={form.quantity} onChange={update} required /></label>
            <label className="field"><span>Tình trạng</span><select name="status" value={form.status} onChange={update}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
            <label className="field"><span>Ngày tiếp nhận</span><input name="purchaseDate" type="date" value={form.purchaseDate || ''} onChange={update} /></label>
            <label className="field field-wide"><span>Ghi chú</span><textarea name="description" rows="3" value={form.description || ''} onChange={update} /></label>
          </div>
          {error && <p className="form-error"><AlertCircle size={16} />{error}</p>}
          <footer className="dialog-actions">
            <button type="button" className="button button-quiet" onClick={onClose}>Hủy</button>
            <button type="submit" className="button button-dark" disabled={saving}>{saving ? <LoaderCircle className="spin" size={17} /> : <Check size={17} />}{saving ? 'Đang lưu' : 'Lưu thiết bị'}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function DetailDialog({ device, onClose, onEdit }) {
  return (
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog detail-dialog" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <header className="dialog-head">
          <div><span className="eyebrow">{device.deviceId}</span><h2 id="detail-title">{device.name}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Đóng"><X size={19} /></button>
        </header>
        <div className="detail-status"><Status value={device.status} /></div>
        <dl className="detail-grid">
          <div><dt>Loại thiết bị</dt><dd>{device.deviceType}</dd></div><div><dt>Phòng học</dt><dd>{device.room}</dd></div>
          <div><dt>Hãng / Model</dt><dd>{device.brand} · {device.model}</dd></div><div><dt>Số lượng</dt><dd>{device.quantity}</dd></div>
          <div><dt>Ngày tiếp nhận</dt><dd>{device.purchaseDate ? new Date(device.purchaseDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</dd></div>
          <div className="detail-wide"><dt>Ghi chú</dt><dd>{device.description || 'Không có ghi chú.'}</dd></div>
        </dl>
        <footer className="dialog-actions"><button className="button button-quiet" onClick={onClose}>Đóng</button><button className="button button-dark" onClick={() => onEdit(device)}><Pencil size={16} />Chỉnh sửa</button></footer>
      </section>
    </div>
  );
}

export default function App() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dialog, setDialog] = useState(null);
  const [deleting, setDeleting] = useState('');

  async function loadDevices(term = search) {
    setLoading(true);
    setError('');
    try {
      const query = term.trim() ? `?search=${encodeURIComponent(term.trim())}` : '';
      setDevices(await request(`/devices${query}`));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => loadDevices(search), 220);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 3200);
    return () => clearTimeout(timer);
  }, [notice]);

  async function removeDevice(device) {
    if (!window.confirm(`Xóa thiết bị ${device.deviceId} khỏi danh sách?`)) return;
    setDeleting(device._id);
    try {
      await request(`/devices/${device._id}`, { method: 'DELETE' });
      setNotice('Thiết bị đã được xóa.');
      await loadDevices();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting('');
    }
  }

  function saved(message) {
    setDialog(null);
    setNotice(message);
    loadDevices();
  }

  const inUse = devices.filter((device) => device.status === 'Đang sử dụng').length;
  const attention = devices.filter((device) => device.status === 'Hư hỏng' || device.status === 'Đang sửa chữa').length;

  return (
    <main className="app-shell">
      <aside className="rail"><div className="rail-mark">Q<span>.</span></div><div className="rail-rule" /><div className="rail-active" title="Danh sách thiết bị"><ClipboardList size={19} /></div><div className="rail-bottom">235429</div></aside>
      <section className="workspace">
        <header className="topbar"><div className="crumb">QUẢN TRỊ <ChevronRight size={13} /> THIẾT BỊ</div><div className="topbar-right"><span className="online-dot" />HỆ THỐNG QUẢN LÝ<span className="user-mark">DS</span></div></header>
        <div className="content">
          <div className="page-heading"><div><span className="eyebrow">DANH MỤC CƠ SỞ VẬT CHẤT</span><h1>Thiết bị phòng học</h1><p>Theo dõi tài sản và tình trạng thiết bị trong các phòng học.</p></div><button className="button button-dark add-button" onClick={() => setDialog({ type: 'form' })}><CirclePlus size={18} />Thêm thiết bị</button></div>

          <section className="metrics" aria-label="Tổng quan thiết bị">
            <div className="metric"><span>TỔNG THIẾT BỊ</span><strong>{loading ? '—' : devices.length.toString().padStart(2, '0')}</strong><small>trong kết quả hiện tại</small></div>
            <div className="metric metric-green"><span>ĐANG SỬ DỤNG</span><strong>{loading ? '—' : inUse.toString().padStart(2, '0')}</strong><small><i /> tình trạng ổn định</small></div>
            <div className="metric metric-warn"><span>CẦN THEO DÕI</span><strong>{loading ? '—' : attention.toString().padStart(2, '0')}</strong><small>hư hỏng hoặc đang sửa</small></div>
            <div className="metric metric-date"><span>ĐỊNH DANH</span><strong>235429</strong><small>DuongQuocSon</small></div>
          </section>

          <section className="inventory">
            <div className="inventory-head"><div><h2>Danh sách thiết bị</h2><p>{loading ? 'Đang đồng bộ dữ liệu…' : `${devices.length} thiết bị được tìm thấy`}</p></div><label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã, tên, loại hoặc phòng..." aria-label="Tìm thiết bị" />{search && <button onClick={() => setSearch('')} aria-label="Xóa nội dung tìm kiếm"><X size={15} /></button>}</label></div>
            {error && <div className="notice notice-error"><AlertCircle size={17} /><span>{error}</span><button onClick={() => loadDevices()} className="button button-quiet">Thử lại</button></div>}
            <div className="table-wrap"><table><thead><tr><th>MÃ THIẾT BỊ</th><th>TÊN THIẾT BỊ</th><th>LOẠI</th><th>PHÒNG</th><th>SL</th><th>TÌNH TRẠNG</th><th><span className="sr-only">Thao tác</span></th></tr></thead><tbody>
              {loading ? <tr><td colSpan="7" className="table-message"><LoaderCircle className="spin" size={20} />Đang tải dữ liệu thiết bị</td></tr>
                : devices.length === 0 ? <tr><td colSpan="7" className="table-message">{error ? 'Không thể tải dữ liệu.' : search ? 'Không có thiết bị phù hợp với từ khóa.' : 'Chưa có thiết bị. Hãy thêm thiết bị đầu tiên.'}</td></tr>
                  : devices.map((device, index) => <tr key={device._id} style={{ '--row': index }}><td><button className="device-code" onClick={() => setDialog({ type: 'detail', device })}>{device.deviceId}</button></td><td><button className="device-name" onClick={() => setDialog({ type: 'detail', device })}>{device.name}</button><small className="device-sub">{device.brand} · {device.model}</small></td><td>{device.deviceType}</td><td>{device.room}</td><td className="quantity">{device.quantity}</td><td><Status value={device.status} /></td><td><div className="row-actions"><button className="icon-button" onClick={() => setDialog({ type: 'form', device })} aria-label={`Sửa ${device.deviceId}`} title="Chỉnh sửa"><Pencil size={16} /></button><button className="icon-button danger-icon" onClick={() => removeDevice(device)} disabled={deleting === device._id} aria-label={`Xóa ${device.deviceId}`} title="Xóa">{deleting === device._id ? <LoaderCircle className="spin" size={16} /> : <Trash2 size={16} />}</button></div></td></tr>)}
            </tbody></table></div>
            <footer className="table-footer"><span><i className="footer-dot" />Kết nối dữ liệu trực tiếp</span><span>MongoDB Atlas <b>·</b> collection devices</span></footer>
          </section>
          <footer className="page-footer"><span>QUẢN LÝ THIẾT BỊ PHÒNG HỌC</span><span>235429_DuongQuocSon</span></footer>
        </div>
      </section>
      {notice && <div className="toast"><Check size={17} />{notice}<button onClick={() => setNotice('')} aria-label="Đóng thông báo"><X size={15} /></button></div>}
      {dialog?.type === 'form' && <DeviceDialog device={dialog.device} onClose={() => setDialog(null)} onSaved={saved} />}
      {dialog?.type === 'detail' && <DetailDialog device={dialog.device} onClose={() => setDialog(null)} onEdit={(device) => setDialog({ type: 'form', device })} />}
    </main>
  );
}