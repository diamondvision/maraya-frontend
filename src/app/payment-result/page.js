'use client';

import { useEffect, useState } from 'react';

const STAGES = [
  { key: 'pending', label: 'تم استلام طلبك', emoji: '📝' },
  { key: 'preparing', label: 'قيد التحضير', emoji: '👨‍🍳' },
  { key: 'ready', label: 'قيد التسليم', emoji: '🚶' },
  { key: 'completed', label: 'تم التسليم', emoji: '✅' },
];

export default function PaymentResult() {
  const [payStatus, setPayStatus] = useState('checking');
  const [orderId, setOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const order_id = params.get('order_id');
    const payment_id = params.get('id');
    setOrderId(order_id);

    if (!order_id || !payment_id) {
      setPayStatus('error');
      return;
    }

    fetch(`https://maraya-backend.onrender.com/api/orders/${order_id}/confirm-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id }),
    })
      .then((res) => res.json())
      .then((data) => {
        setPayStatus(data.success ? 'paid' : 'failed');
      })
      .catch(() => setPayStatus('error'));
  }, []);

  useEffect(() => {
    if (payStatus !== 'paid' || !orderId) return;

    function fetchStatus() {
      fetch(`https://maraya-backend.onrender.com/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => setOrderStatus(data.order?.status))
        .catch(() => {});
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [payStatus, orderId]);

  const currentStageIndex = STAGES.findIndex((s) => s.key === orderStatus);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)] px-5">
      <div className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 text-center flex flex-col gap-4">
        {payStatus === 'checking' && (
          <div>
            <div className="text-5xl">⏳</div>
            <h2 className="text-xl font-bold">جاري التحقق من الدفع...</h2>
          </div>
        )}

        {(payStatus === 'failed' || payStatus === 'error') && (
          <div>
            <div className="text-5xl">❌</div>
            <h2 className="text-xl font-bold">لم يتم الدفع</h2>
            <p className="text-[var(--text-muted)] text-sm">حاول مرة أخرى أو تواصل معنا</p>
          </div>
        )}

        {payStatus === 'paid' && (
          <div className="flex flex-col gap-4">
            <div className="text-5xl">✅</div>
            <h2 className="text-xl font-bold">تم الدفع بنجاح!</h2>
            <p className="text-[var(--text-muted)] text-sm">
              رقم الطلب: <span className="text-[var(--accent-soft)] font-semibold">#{orderId}</span>
            </p>

            <div className="flex flex-col gap-3 mt-2">
              {STAGES.map((stage, i) => {
                const isDone = currentStageIndex >= 0 && i <= currentStageIndex;
                const isCurrent = i === currentStageIndex;
                return (
                  <div
                    key={stage.key}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'border-[var(--accent)] bg-[var(--surface-2)]'
                        : isDone
                        ? 'border-[var(--border)] bg-[var(--surface-2)] opacity-60'
                        : 'border-[var(--border)] opacity-30'
                    }`}
                  >
                    <span className="text-2xl">{stage.emoji}</span>
                    <span className={`text-sm font-medium ${isCurrent ? 'text-[var(--accent-soft)]' : ''}`}>
                      {stage.label}
                    </span>
                    {isCurrent && (
                      <span className="mr-auto w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        
          href="/"
          className="w-full py-3 rounded-full bg-[var(--accent)] text-[#1c1815] font-bold mt-2 inline-block"
        >
          العودة للمنيو
        </a>
      </div>
    </main>
  );
}