'use client';

import { useEffect, useMemo, useState } from 'react';

const OFFERS_CONFIG = [
  {
    matchName: 'لاتيه',
    subtitle: 'قهوة مختصة مميزة',
    gradient: 'linear-gradient(135deg, #ff9a56, #d94f04)',
    image: 'https://i.imgur.com/jgz5VaR.jpeg',
    emoji: '☕',
  },
  {
    matchName: 'آيس لاتيه',
    subtitle: 'انتعش مع مراية',
    gradient: 'linear-gradient(135deg, #4facfe, #00c6ae)',
    emoji: '🧊',
  },
{
    matchName: 'آيس لاتيه',
    subtitle: 'انتعش مع مرايا',
    gradient: 'linear-gradient(135deg, #4facfe, #00c6ae)',
    image: 'https://i.imgur.com/xI1dlvM.png',
    emoji: '🧊',
  },
];

const DRINK_CATEGORY_NAMES = ['مشروبات ساخنة', 'مشروبات باردة'];

function isRiyadhWeekend() {
  return true; // تجربة مؤقتة - رجّعها زي ما كانت بعد الاختبار
}

export default function Home() {
  const [menu, setMenu] = useState({ categories: [], products: [] });
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(null);

  const [customer, setCustomer] = useState(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTable, setFormTable] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const [currentOffer, setCurrentOffer] = useState(0);

  // وضع عرض "اشترِ مشروب واحصل على الآخر مجانًا"
  const [offerMode, setOfferMode] = useState(false);
  const [offerSelection, setOfferSelection] = useState([]); // array of product ids

  const weekendOfferActive = isRiyadhWeekend();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOffer((prev) => (prev + 1) % OFFERS_CONFIG.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('maraya_customer');
    if (saved) {
      const parsed = JSON.parse(saved);
      const oneHour = 60 * 60 * 1000;
      const isExpired = !parsed.savedAt || Date.now() - parsed.savedAt > oneHour;
      if (isExpired) {
        localStorage.removeItem('maraya_customer');
      } else {
        setCustomer(parsed);
      }
    }

    fetch('https://maraya-backend.onrender.com/api/menu')
      .then((res) => res.json())
      .then((data) => {
        setMenu(data);
        setActiveCategory(data.categories?.[0]?.id ?? null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching menu:', err);
        setLoading(false);
      });
  }, []);

  function handleRegister(e) {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;
    const info = {
      name: formName.trim(),
      phone: formPhone.trim(),
      table: formTable.trim(),
      savedAt: Date.now(),
    };
    localStorage.setItem('maraya_customer', JSON.stringify(info));
    setCustomer(info);
  }

  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const rawCartTotal = cartItems.reduce(
    (sum, item) => sum + item.qty * Number(item.product.base_price),
    0
  );

  const offerDiscount = useMemo(() => {
    if (offerSelection.length !== 2) return 0;
    const [idA, idB] = offerSelection;
    const prodA = menu.products.find((p) => p.id === idA);
    const prodB = menu.products.find((p) => p.id === idB);
    if (!prodA || !prodB) return 0;
    return Math.min(Number(prodA.base_price), Number(prodB.base_price));
  }, [offerSelection, menu.products]);

  const cartTotal = rawCartTotal - offerDiscount;

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev[product.id];
      return {
        ...prev,
        [product.id]: { product, qty: existing ? existing.qty + 1 : 1 },
      };
    });
    setJustAdded(product.id);
    setTimeout(() => setJustAdded(null), 600);
  }

  function changeQty(productId, delta) {
    setCart((prev) => {
      const existing = prev[productId];
      if (!existing) return prev;
      const newQty = existing.qty + delta;
      if (newQty <= 0) {
        const rest = { ...prev };
        delete rest[productId];
        return rest;
      }
      return { ...prev, [productId]: { ...existing, qty: newQty } };
    });
  }

  function startOfferMode() {
    const firstDrinkCat = menu.categories.find((c) => DRINK_CATEGORY_NAMES.includes(c.name));
    if (firstDrinkCat) setActiveCategory(firstDrinkCat.id);
    setOfferMode(true);
    setOfferSelection([]);
  }

  function cancelOfferMode() {
    setOfferMode(false);
    setOfferSelection((prev) => {
      prev.forEach((id) => {
        const product = menu.products.find((p) => p.id === id);
        if (product) {
          setCart((c) => {
            const rest = { ...c };
            delete rest[id];
            return rest;
          });
        }
      });
      return [];
    });
  }

  function toggleOfferProduct(product) {
    setOfferSelection((prev) => {
      if (prev.includes(product.id)) {
        const next = prev.filter((id) => id !== product.id);
        setCart((c) => {
          const rest = { ...c };
          delete rest[product.id];
          return rest;
        });
        return next;
      }
      if (prev.length >= 2) return prev;
      const next = [...prev, product.id];
      setCart((c) => ({ ...c, [product.id]: { product, qty: 1 } }));
      if (next.length === 2) setOfferMode(false);
      return next;
    });
  }

  async function submitOrder() {
    setSubmitting(true);
    try {
      const res = await fetch('https://maraya-backend.onrender.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customer.name,
          customer_phone: customer.phone,
          table_number: customer.table || null,
          items: cartItems.map((item) => ({
            product_id: item.product.id,
            quantity: item.qty,
          })),
          offer_pair_ids: offerSelection.length === 2 ? offerSelection : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'حصل خطأ');

      const payRes = await fetch(
        `https://maraya-backend.onrender.com/api/orders/${data.order_id}/create-payment`,
        { method: 'POST' }
      );
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error || 'فشل إنشاء رابط الدفع');

      window.location.href = payData.url;
    } catch (err) {
      alert('حصل خطأ: ' + err.message);
      setSubmitting(false);
    }
  }

  const visibleProducts = useMemo(
    () => menu.products.filter((p) => p.category_id === activeCategory),
    [menu.products, activeCategory]
  );

  const offers = useMemo(
    () =>
      OFFERS_CONFIG.map((cfg) => {
        const product = menu.products.find((p) => p.name === cfg.matchName);
        return { ...cfg, product };
      }),
    [menu.products]
  );

  if (!customer) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)] px-5">
        <form
          onSubmit={handleRegister}
          className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4"
        >
          <div className="text-center mb-2">
            <h1 className="text-3xl font-extrabold text-[var(--accent-soft)]">مراية</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">قهوة مختصة — الرياض</p>
          </div>

          <div>
            <label className="text-sm text-[var(--text-muted)] mb-1 block">الاسم</label>
            <input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2 outline-none focus:border-[var(--accent)]"
              placeholder="اسمك"
              required
            />
          </div>

          <div>
            <label className="text-sm text-[var(--text-muted)] mb-1 block">رقم الجوال</label>
            <input
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2 outline-none focus:border-[var(--accent)]"
              placeholder="05xxxxxxxx"
              required
            />
          </div>

          <div>
            <label className="text-sm text-[var(--text-muted)] mb-1 block">
              رقم الطاولة (اختياري)
            </label>
            <input
              value={formTable}
              onChange={(e) => setFormTable(e.target.value)}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2 outline-none focus:border-[var(--accent)]"
              placeholder="مثال: T1"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[var(--accent)] text-[#1c1815] font-bold mt-2"
          >
            متابعة إلى المنيو
          </button>
        </form>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
        <p className="font-display text-lg">جاري تحميل المنيو...</p>
      </main>
    );
  }

  const activeOfferData = offers[currentOffer];

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] pb-32">
      <header className="sticky top-0 z-20 bg-[var(--bg)] border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-5 pt-6 pb-4 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--accent-soft)]">
            مراية
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            أهلاً {customer.name} {customer.table ? `— طاولة ${customer.table}` : ''}
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-5 pb-4">
          <div
            className="relative w-full h-52 rounded-2xl overflow-hidden transition-all duration-700"
            style={
              activeOfferData.image
                ? {
                    backgroundImage: `url(${activeOfferData.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : { background: activeOfferData.gradient }
            }
          >
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {offers.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentOffer(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === currentOffer ? 'bg-white w-4' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {weekendOfferActive && !offerMode && offerSelection.length < 2 && (
          <div className="max-w-3xl mx-auto px-5 pb-4">
            <button
              onClick={startOfferMode}
              className="w-full rounded-2xl px-5 py-3 flex items-center justify-between text-right"
              style={{ background: 'linear-gradient(135deg, #ffd166, #ef476f)' }}
            >
              <div>
                <p className="text-white font-extrabold text-sm">
                  عرض نهاية الأسبوع 🎉 اشترِ مشروب واحصل على الآخر مجانًا
                </p>
                <p className="text-white/80 text-xs mt-0.5">اضغط هنا لاختيار مشروبَيك</p>
              </div>
              <span className="text-2xl">🥤</span>
            </button>
          </div>
        )}

        {offerMode && (
          <div className="max-w-3xl mx-auto px-5 pb-4">
            <div className="rounded-2xl px-5 py-3 flex items-center justify-between bg-[var(--surface-2)] border border-[var(--accent)]">
              <p className="text-sm font-medium">
                اختر مشروبين ({offerSelection.length}/2) — هتدفع سعر الأعلى بس
              </p>
              <button
                onClick={cancelOfferMode}
                className="text-xs text-[var(--text-muted)] underline"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {offerSelection.length === 2 && (
          <div className="max-w-3xl mx-auto px-5 pb-4">
            <div className="rounded-2xl px-5 py-3 flex items-center justify-between bg-[var(--surface-2)] border border-[var(--accent)]">
              <p className="text-sm font-medium text-[var(--accent-soft)]">
                🎉 تم اختيار مشروبَي العرض — خصم {offerDiscount} ريال مطبّق
              </p>
              <button
                onClick={cancelOfferMode}
                className="text-xs text-[var(--text-muted)] underline"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-5 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
          {menu.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                activeCategory === cat.id
                  ? 'bg-[var(--accent)] border-[var(--accent)] text-[#1c1815]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent-soft)]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-5 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibleProducts.map((product) => {
          const inCart = cart[product.id];
          const isDrinkCategory = DRINK_CATEGORY_NAMES.includes(
            menu.categories.find((c) => c.id === activeCategory)?.name
          );
          const showOfferPicker = offerMode && isDrinkCategory;
          const isSelectedForOffer = offerSelection.includes(product.id);

          return (
            <div
              key={product.id}
              className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col gap-3 transition-transform ${
                justAdded === product.id ? 'scale-[1.02] border-[var(--accent)]' : ''
              } ${isSelectedForOffer ? 'border-[var(--accent)]' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display font-bold text-base">{product.name}</h3>
                  {product.description && (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {product.description}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-[var(--accent-soft)] font-semibold text-sm">
                  {product.base_price} ريال
                </span>
              </div>

              {showOfferPicker ? (
                <button
                  onClick={() => toggleOfferProduct(product)}
                  disabled={!isSelectedForOffer && offerSelection.length >= 2}
                  className={`w-full py-2 rounded-full text-sm font-medium transition-colors ${
                    isSelectedForOffer
                      ? 'bg-[var(--accent)] text-[#1c1815]'
                      : 'border border-[var(--accent)] text-[var(--accent-soft)] hover:bg-[var(--accent)] hover:text-[#1c1815]'
                  } disabled:opacity-40`}
                >
                  {isSelectedForOffer ? '✓ تم الاختيار' : 'اختر للعرض'}
                </button>
              ) : inCart ? (
                <div className="flex items-center justify-between bg-[var(--surface-2)] rounded-full px-2 py-1">
                  <button
                    onClick={() => changeQty(product.id, -1)}
                    className="w-8 h-8 rounded-full bg-[var(--bg)] text-[var(--text)] flex items-center justify-center text-lg"
                  >
                    −
                  </button>
                  <span className="font-semibold">{inCart.qty}</span>
                  <button
                    onClick={() => changeQty(product.id, 1)}
                    className="w-8 h-8 rounded-full bg-[var(--accent)] text-[#1c1815] flex items-center justify-center text-lg"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(product)}
                  className="w-full py-2 rounded-full border border-[var(--accent)] text-[var(--accent-soft)] font-medium text-sm hover:bg-[var(--accent)] hover:text-[#1c1815] transition-colors"
                >
                  إضافة للسلة
                </button>
              )}
            </div>
          );
        })}
      </section>

      {cartCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-[var(--accent)] text-[#1c1815] rounded-full shadow-lg shadow-black/40 px-6 py-3 flex items-center gap-3 font-semibold"
        >
          <span className="bg-[#1c1815] text-[var(--accent-soft)] text-xs w-6 h-6 rounded-full flex items-center justify-center">
            {cartCount}
          </span>
          عرض السلة
          <span>{cartTotal} ريال</span>
        </button>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setCartOpen(false)} />
          <div
            className="relative w-full max-w-sm h-full bg-[var(--surface)] border-l border-[var(--border)] p-5 flex flex-col"
            style={{ animation: 'slideIn 0.25s ease-out' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">سلة الطلب</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="text-[var(--text-muted)] text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-3">
              {cartItems.length === 0 && (
                <p className="text-[var(--text-muted)] text-sm text-center mt-10">السلة فاضية</p>
              )}
              {cartItems.map(({ product, qty }) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-2 bg-[var(--surface-2)] rounded-xl p-3"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {product.name}
                      {offerSelection.includes(product.id) && (
                        <span className="text-[var(--accent-soft)] text-xs mr-1">(عرض)</span>
                      )}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{product.base_price} ريال</p>
                  </div>
                  {offerSelection.includes(product.id) ? (
                    <span className="text-xs text-[var(--text-muted)]">×1</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeQty(product.id, -1)}
                        className="w-7 h-7 rounded-full bg-[var(--bg)] flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="text-sm w-4 text-center">{qty}</span>
                      <button
                        onClick={() => changeQty(product.id, 1)}
                        className="w-7 h-7 rounded-full bg-[var(--accent)] text-[#1c1815] flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {cartItems.length > 0 && (
              <div className="pt-4 border-t border-[var(--border)] mt-4">
                {offerDiscount > 0 && (
                  <div className="flex justify-between mb-1 text-sm text-[var(--accent-soft)]">
                    <span>خصم عرض نهاية الأسبوع</span>
                    <span>− {offerDiscount} ريال</span>
                  </div>
                )}
                <div className="flex justify-between mb-4 font-semibold">
                  <span>الإجمالي</span>
                  <span className="text-[var(--accent-soft)]">{cartTotal} ريال</span>
                </div>
                <button
                  onClick={submitOrder}
                  disabled={submitting}
                  className="w-full py-3 rounded-full bg-[var(--accent)] text-[#1c1815] font-bold disabled:opacity-50"
                >
                  {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}