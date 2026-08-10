'use client';

import { useEffect, useState } from 'react';

export default function PaymentResult() {
  const [status, setStatus] = useState('checking');
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const order_id = params.get('order_id');
    const payment_id = params.get('id');
    setOrderId(order_id);

    if (!order_id || !payment_id) {
      setStatus('error');
      return;
    }

    fetch(`https://maraya-backend.onrender.com/api/orders/${order_id}/confirm-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id }),
    })
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.success ? 'paid' : 'failed');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)] px-5">
      <div className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 text-center flex flex-col gap-4">
        {status === 'checking' && (
          <div>
            <div className="text-5xl">⏳</div>
            <h2 className="text-xl font-bold">جاري التحقق من الدفع...</h2>
          </div>
        )}
        {status === 'paid' && (
          <div>
            <div className="text-5xl">✅</div>
            <h2 className="text-xl font-bold">تم الدفع بنجاح!</h2>
            <p className="text-[var(--text-muted)] text-sm">
              رقم الطلب: #{orderId}
            </p>
          </div>
        )}
        {(status === 'failed' || status === 'error') && (
          <div>
            <div className="text-5xl">❌</div>
            <h2 className="text-xl font-bold">لم يتم الدفع</h2>
            <p className="text-[var(--text-muted)] text-sm">حاول مرة أخرى أو تواصل معنا</p>
          </div>
        )}
        <a href="/" className="w-full py-3 rounded-full bg-[var(--accent)] text-[#1c1815] font-bold mt-2 inline-block">
          العودة للمنيو
        </a>
      </div>
    </main>
  );
}