'use client';
 
import { useEffect, useState } from 'react';
 
const STAGES = [
  { key: 'pending', label: 'تم استلام طلبك' },
  { key: 'preparing', label: 'قيد التحضير' },
  { key: 'ready', label: 'قيد التسليم' },
  { key: 'completed', label: 'تم التسليم' },
];
 
function StageIcon(props) {
  var stageKey = props.stageKey;
  var isDone = props.isDone;
  var isCurrent = props.isCurrent;
  var color = (isDone || isCurrent) ? 'var(--accent-soft)' : 'var(--text-muted)';
 
  if (isDone) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path d="M4 12 L10 18 L20 6" fill="none" stroke={color} strokeWidth="2.4"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
 
  if (stageKey === 'pending') {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <rect x="5" y="3" width="14" height="18" rx="1.5" fill="none" stroke={color} strokeWidth="1.8" />
        <line x1="8" y1="8" x2="16" y2="8" stroke={color} strokeWidth="1.4" />
        <line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth="1.4" />
        <line x1="8" y1="16" x2="13" y2="16" stroke={color} strokeWidth="1.4" />
      </svg>
    );
  }
 
  if (stageKey === 'preparing') {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path d="M5 10h11v5.5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V10Z" fill="none" stroke={color} strokeWidth="1.8" />
        <path d="M16 11.5h1.3a2 2 0 0 1 0 4H16" fill="none" stroke={color} strokeWidth="1.8" />
        {isCurrent && (
          <g>
            <path d="M9 8c0-1.3 1.2-1.3 1.2-2.6S9 3.8 9 2.5" fill="none" stroke={color}
              strokeWidth="1.3" strokeLinecap="round" className="steam-1" />
            <path d="M12.5 8c0-1.3 1.2-1.3 1.2-2.6S12.5 3.8 12.5 2.5" fill="none" stroke={color}
              strokeWidth="1.3" strokeLinecap="round" className="steam-2" />
          </g>
        )}
      </svg>
    );
  }
 
  if (stageKey === 'ready') {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <circle cx="9" cy="5" r="2" fill="none" stroke={color} strokeWidth="1.6" />
        <path d="M9 7v5l-3 3M9 12l3 2.5M12 14.5l2.5 2M6 15l-2 4" fill="none" stroke={color}
          strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
 
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="1.8" />
      <path d="M8 12.5 L11 15.5 L16 9" fill="none" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
 
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
 
    fetch('https://maraya-backend.onrender.com/api/orders/' + order_id + '/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id }),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        setPayStatus(data.success ? 'paid' : 'failed');
      })
      .catch(function () { setPayStatus('error'); });
  }, []);
 
  useEffect(() => {
    if (payStatus !== 'paid' || !orderId) return;
 
    function fetchStatus() {
      fetch('https://maraya-backend.onrender.com/api/orders/' + orderId)
        .then(function (res) { return res.json(); })
        .then(function (data) { setOrderStatus(data.order ? data.order.status : null); })
        .catch(function () {});
    }
 
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return function () { clearInterval(interval); };
  }, [payStatus, orderId]);
 
  const currentStageIndex = STAGES.findIndex(function (s) { return s.key === orderStatus; });
  const progressPercent = currentStageIndex > 0
    ? (currentStageIndex / (STAGES.length - 1)) * 100
    : 0;
 
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)] px-5">
      <style jsx>{`
        @keyframes steamRise1 {
          0% { transform: translateY(0); opacity: 0.9; }
          100% { transform: translateY(-3px); opacity: 0; }
        }
        @keyframes steamRise2 {
          0% { transform: translateY(0); opacity: 0.7; }
          100% { transform: translateY(-3px); opacity: 0; }
        }
        .steam-1 { animation: steamRise1 1.4s ease-in-out infinite; transform-origin: bottom; }
        .steam-2 { animation: steamRise2 1.4s ease-in-out infinite 0.4s; transform-origin: bottom; }
      `}</style>
 
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
 
            <div className="relative flex flex-col gap-3 mt-2">
              <div className="absolute top-0 bottom-0 right-[19px] w-0.5 bg-[var(--border)]" />
              <div
                className="absolute top-0 right-[19px] w-0.5 transition-all duration-700 ease-out"
                style={{ height: progressPercent + '%', background: 'var(--accent)' }}
              />
 
              {STAGES.map(function (stage, i) {
                const isDone = currentStageIndex >= 0 && i < currentStageIndex;
                const isCurrent = i === currentStageIndex;
                const boxClass = isCurrent
                  ? 'border-[var(--accent)] bg-[var(--surface-2)]'
                  : isDone
                  ? 'border-[var(--border)] bg-[var(--surface-2)] opacity-70'
                  : 'border-[var(--border)] opacity-40';
                const textClass = isCurrent ? 'text-[var(--accent-soft)]' : '';
                const circleClass = isCurrent
                  ? 'bg-[var(--surface)] ring-2 ring-[var(--accent)] animate-pulse'
                  : 'bg-[var(--surface)]';
 
                return (
                  <div key={stage.key} className={'relative z-10 flex items-center gap-3 p-3 rounded-xl border transition-all ' + boxClass}>
                    <span className={'flex items-center justify-center w-9 h-9 rounded-full shrink-0 ' + circleClass}>
                      <StageIcon stageKey={stage.key} isDone={isDone} isCurrent={isCurrent} />
                    </span>
                    <span className={'text-sm font-medium ' + textClass}>{stage.label}</span>
                    {isCurrent && <span className="mr-auto w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
 
        <a href="/" className="w-full py-3 rounded-full bg-[var(--accent)] text-[#1c1815] font-bold mt-2 inline-block">العودة للمنيو</a>
 
      </div>
    </main>
  );
}