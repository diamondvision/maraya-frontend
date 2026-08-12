'use client';

import { useEffect, useState, useRef } from 'react';

const STATUS_LABELS = {
  pending: 'جديد',
  preparing: 'قيد التحضير',
  ready: 'قيد التسليم',
};

const NEXT_STATUS = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'completed',
};

const NEXT_LABEL = {
  pending: 'بدء التحضير',
  preparing: 'قيد التسليم',
  ready: 'تم التسليم',
};

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const prevPendingCount = useRef(null);
  const audioCtxRef = useRef(null);

  function enableSound() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    setSoundEnabled(true);
  }

  function playNotificationSound() {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const playBeep = (delay) => {
      setTimeout(() => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
      }, delay);
    };
    playBeep(0);
    playBeep(350);
  }

  async function loadOrders() {
    try {
      const res = await fetch('https://maraya-backend.onrender.com/api/dashboard/orders');
      const data = await res.json();
      const newOrders = data.orders || [];
      const pendingCount = newOrders.filter((o) => o.status === 'pending').length;

      if (prevPendingCount.current !== null && pendingCount > prevPendingCount.current) {
        playNotificationSound();
      }
      prevPendingCount.current = pendingCount;
      setOrders(newOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  async function updateStatus(orderId, newStatus) {
    setOrders((prev) => prev.filter((o) => (newStatus === 'completed' ? o.id !== orderId : true)));
    try {
      await fetch(`https://maraya-backend.onrender.com/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      loadOrders();
    } catch (err) {
      console.error(err);
    }
  }

  const columns = ['pending', 'preparing', 'ready'];

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
        <p>جاري تحميل الطلبات...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6">
      {!soundEnabled && (
        <div className="max-w-6xl mx-auto mb-4">
          <button
            onClick={enableSound}
            className="w-full py-3 rounded-full bg-[var(--accent)] text-[#1c1815] font-bold"
          >
            🔔 تفعيل التنبيهات الصوتية
          </button>
        </div>
      )}
      <h1 className="text-2xl font-extrabold text-[var(--accent-soft)] mb-6 text-center">
        لوحة تحكم مرايا
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {columns.map((col) => (
          <div key={col}>
            <h2 className="text-lg font-bold mb-3 text-[var(--accent-soft)]">
              {STATUS_LABELS[col]} ({orders.filter((o) => o.status === col).length})
            </h2>
            <div className="flex flex-col gap-3">
              {orders
                .filter((o) => o.status === col)
                .map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold">طلب #{order.id}</span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {order.table_id ? `طاولة ${order.tables?.table_number}` : 'كاونتر'}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">
                      {order.customers?.name} — {order.customers?.phone}
                    </p>
                    <div className="border-t border-[var(--border)] pt-2 mt-1 flex flex-col gap-1">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.products?.name}</span>
                          <span className="text-[var(--text-muted)]">× {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-[var(--surface-2)]">
                        {order.payment_status === 'paid' ? '✅ مدفوع' : '⏳ غير مدفوع'}
                      </span>
                      <span className="text-[var(--accent-soft)] font-semibold text-sm">
                        {order.total_price} ريال
                      </span>
                    </div>
                    <button
                      onClick={() => updateStatus(order.id, NEXT_STATUS[col])}
                      className="w-full py-2 mt-2 rounded-full bg-[var(--accent)] text-[#1c1815] font-bold text-sm"
                    >
                      {NEXT_LABEL[col]}
                    </button>
                  </div>
                ))}
              {orders.filter((o) => o.status === col).length === 0 && (
                <p className="text-[var(--text-muted)] text-sm text-center py-6">لا توجد طلبات</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}