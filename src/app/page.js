'use client';

import { useEffect, useMemo, useState } from 'react';

const TRANSLATIONS = {
  ar: {
    dir: 'rtl',
    brand: 'مراية',
    tagline: 'قهوة مختصة — الرياض',
    nameLabel: 'الاسم',
    namePlaceholder: 'اسمك',
    phoneLabel: 'رقم الجوال',
    phonePlaceholder: '05xxxxxxxx',
    tableLabel: 'رقم الطاولة (اختياري)',
    tablePlaceholder: 'مثال: T1',
    carLabel: 'رقم السيارة / اللوحة (اختياري)',
    carPlaceholder: 'مثال: أ ب ج 1234',
    continueBtn: 'متابعة إلى المنيو',
    loadingMenu: 'جاري تحميل المنيو...',
    welcome: 'أهلاً',
    table: 'طاولة',
    car: 'سيارة',
    visit: 'زيارتك',
    of5: 'من 5',
    locationChecking: '📍 جاري التحقق من موقعك...',
    locationDenied: '📍 محتاجين إذن موقعك عشان تقدر تأكد الطلب. تصفح براحتك، وفعّل إذن الموقع لما تكون جاهز تطلب.',
    locationOutOfRange: '🚫 أنت خارج نطاق مراية كافيه حاليًا. تقدر تتصفح المنيو، لكن لازم تكون قريب من الكافيه عشان تأكد الطلب.',
    weekendOfferTitle: 'عرض نهاية الأسبوع 🎉 اشترِ مشروب واحصل على الآخر مجانًا',
    weekendOfferSubtitle: 'اضغط هنا لاختيار مشروبَيك',
    offerModeText: (n) => `اختر مشروبين (${n}/2) — هتدفع سعر الأعلى بس`,
    cancel: 'إلغاء',
    offerSelectedText: (d) => `🎉 تم اختيار مشروبَي العرض — خصم ${d} ريال مطبّق`,
    riyal: 'ريال',
    chooseForOffer: 'اختر للعرض',
    selected: '✓ تم الاختيار',
    addToCart: 'إضافة للسلة',
    viewCart: 'عرض السلة',
    cartTitle: 'سلة الطلب',
    emptyCart: 'السلة فاضية',
    offerLabel: '(عرض)',
    weekendDiscount: 'خصم عرض نهاية الأسبوع',
    total: 'الإجمالي',
    rewardCodePlaceholder: 'كود الخصم (إن وجد)',
    locationRequired: '🚫 لازم تكون قريب من مراية كافيه عشان تقدر تأكد الطلب',
    confirmOrder: 'تأكيد الطلب',
    sending: 'جاري الإرسال...',
    visitPopupTitle: 'أهلاً بك في مراية!',
    visitPopupVisit: (n) => `هذه زيارتك رقم ${n}`,
    visitPopupRemaining: (n) => `باقي لك ${n} ${n === 1 ? 'زيارة' : 'زيارات'} وتحصل على طلب مجاني! 🎉`,
    visitPopupWon: '🎉 مبروك! استحققت طلب مجاني — تفقد رسالة التهنئة بعد الدفع',
    continueToMenu: 'متابعة إلى المنيو',
    errorGeneric: 'حصل خطأ: ',
  },
  en: {
    dir: 'ltr',
    brand: 'Maraya',
    tagline: 'Specialty Coffee — Riyadh',
    nameLabel: 'Name',
    namePlaceholder: 'Your name',
    phoneLabel: 'Phone number',
    phonePlaceholder: '05xxxxxxxx',
    tableLabel: 'Table number (optional)',
    tablePlaceholder: 'e.g. T1',
    carLabel: 'Car / plate number (optional)',
    carPlaceholder: 'e.g. ABC 1234',
    continueBtn: 'Continue to menu',
    loadingMenu: 'Loading menu...',
    welcome: 'Welcome',
    table: 'Table',
    car: 'Car',
    visit: 'Visit',
    of5: 'of 5',
    locationChecking: '📍 Checking your location...',
    locationDenied: "📍 We need your location to confirm orders. Feel free to browse, and enable location when you're ready to order.",
    locationOutOfRange: "🚫 You're currently outside Maraya Cafe's range. You can browse the menu, but you must be near the cafe to confirm an order.",
    weekendOfferTitle: 'Weekend Offer 🎉 Buy one drink, get another free',
    weekendOfferSubtitle: 'Tap here to pick your two drinks',
    offerModeText: (n) => `Pick two drinks (${n}/2) — you'll only pay for the pricier one`,
    cancel: 'Cancel',
    offerSelectedText: (d) => `🎉 Offer drinks selected — SAR ${d} discount applied`,
    riyal: 'SAR',
    chooseForOffer: 'Select for offer',
    selected: '✓ Selected',
    addToCart: 'Add to cart',
    viewCart: 'View cart',
    cartTitle: 'Your order',
    emptyCart: 'Your cart is empty',
    offerLabel: '(offer)',
    weekendDiscount: 'Weekend offer discount',
    total: 'Total',
    rewardCodePlaceholder: 'Discount code (if any)',
    locationRequired: '🚫 You must be near Maraya Cafe to confirm your order',
    confirmOrder: 'Confirm order',
    sending: 'Sending...',
    visitPopupTitle: 'Welcome to Maraya!',
    visitPopupVisit: (n) => `This is your visit #${n}`,
    visitPopupRemaining: (n) => `${n} more visit${n === 1 ? '' : 's'} until you get a free order! 🎉`,
    visitPopupWon: "🎉 Congrats! You've earned a free order — check your confirmation after payment",
    continueToMenu: 'Continue to menu',
    errorGeneric: 'Something went wrong: ',
  },
};

const OFFERS_CONFIG = [
  {
    matchName: 'لاتيه',
    subtitle: { ar: 'قهوة مختصة مميزة', en: 'A signature specialty coffee' },
    gradient: 'linear-gradient(135deg, #ff9a56, #d94f04)',
    image: 'https://i.imgur.com/jgz5VaR.jpeg',
    emoji: '☕',
  },
  {
    matchName: 'كيكة مراية',
    subtitle: { ar: 'حلاوة تستاهل تجربها', en: 'A sweetness worth trying' },
    gradient: 'linear-gradient(135deg, #f857a6, #ff5858)',
    image: 'https://i.imgur.com/ZF4TVwI.png',
    emoji: '🍰',
  },
  {
    matchName: 'آيس لاتيه',
    subtitle: { ar: 'انتعش مع مرايا', en: 'Refresh with Maraya' },
    gradient: 'linear-gradient(135deg, #4facfe, #00c6ae)',
    image: 'https://i.imgur.com/xI1dlvM.png',
    emoji: '🧊',
  },
];

const DRINK_CATEGORY_NAMES = ['مشروبات ساخنة', 'مشروبات باردة'];
const CAFE_LOCATION = { lat: 24.879475236237877, lng: 46.618220124176055 };
const MAX_DISTANCE_METERS = 500;

function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isRiyadhWeekend() {
  const riyadhNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
  const day = riyadhNow.getDay();
  return [4, 5, 6].includes(day);
}

export default function Home() {
  const [lang, setLang] = useState('ar');
  const t = TRANSLATIONS[lang];

  const [menu, setMenu] = useState({ categories: [], products: [] });
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(null);

  const [customer, setCustomer] = useState(null);
  const [locationStatus, setLocationStatus] = useState('checking');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTable, setFormTable] = useState('');
  const [formCar, setFormCar] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [rewardCodeInput, setRewardCodeInput] = useState('');
  const [visitPopup, setVisitPopup] = useState(null);
  const [visitCount, setVisitCount] = useState(null);

  const [currentOffer, setCurrentOffer] = useState(0);

  const [offerMode, setOfferMode] = useState(false);
  const [offerSelection, setOfferSelection] = useState([]);

  const weekendOfferActive = isRiyadhWeekend();

  useEffect(() => {
    const savedLang = localStorage.getItem('maraya_lang');
    if (savedLang === 'ar' || savedLang === 'en') setLang(savedLang);
  }, []);

  function switchLang(newLang) {
    setLang(newLang);
    localStorage.setItem('maraya_lang', newLang);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOffer((prev) => (prev + 1) % OFFERS_CONFIG.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const distance = getDistanceMeters(
          position.coords.latitude,
          position.coords.longitude,
          CAFE_LOCATION.lat,
          CAFE_LOCATION.lng
        );
        setLocationStatus(distance <= MAX_DISTANCE_METERS ? 'allowed' : 'out_of_range');
      },
      () => setLocationStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
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
        fetch(`https://maraya-backend.onrender.com/api/customers/visits?phone=${encodeURIComponent(parsed.phone)}`)
          .then((res) => res.json())
          .then((data) => {
            const visits = data.visits || 0;
            const remainder = visits % 5;
            setVisitCount(remainder === 0 && visits > 0 ? 5 : remainder);
          })
          .catch(() => {});
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
      car: formCar.trim(),
      savedAt: Date.now(),
    };
    localStorage.setItem('maraya_customer', JSON.stringify(info));
    setCustomer(info);

    fetch(`https://maraya-backend.onrender.com/api/customers/visits?phone=${encodeURIComponent(info.phone)}`)
      .then((res) => res.json())
      .then((data) => {
        const nextVisit = (data.visits || 0) + 1;
        const remainder = nextVisit % 5;
        const remaining = remainder === 0 ? 0 : 5 - remainder;
        setVisitPopup({ visitNumber: nextVisit, remaining });
        setVisitCount(remainder === 0 ? 5 : remainder);
      })
      .catch(() => {});
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
          vehicle_number: customer.car || null,
          items: cartItems.map((item) => ({
            product_id: item.product.id,
            quantity: item.qty,
          })),
          offer_pair_ids: offerSelection.length === 2 ? offerSelection : null,
          reward_code: rewardCodeInput.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');

      const payRes = await fetch(
        `https://maraya-backend.onrender.com/api/orders/${data.order_id}/create-payment`,
        { method: 'POST' }
      );
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error || 'Payment link failed');

      window.location.href = payData.url;
    } catch (err) {
      alert(t.errorGeneric + err.message);
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

  const LangSwitcher = (
    <div className="flex justify-center gap-2 pt-4">
      <button
        onClick={() => switchLang('ar')}
        className={`px-3 py-1 rounded-full text-xs font-bold ${
          lang === 'ar' ? 'bg-[var(--accent)] text-[#1c1815]' : 'border border-[var(--border)] text-[var(--text-muted)]'
        }`}
      >
        العربية
      </button>
      <button
        onClick={() => switchLang('en')}
        className={`px-3 py-1 rounded-full text-xs font-bold ${
          lang === 'en' ? 'bg-[var(--accent)] text-[#1c1815]' : 'border border-[var(--border)] text-[var(--text-muted)]'
        }`}
      >
        English
      </button>
    </div>
  );

  if (!customer) {
    return (
      <main dir={t.dir} className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--text)] px-5">
        {LangSwitcher}
        <form
          onSubmit={handleRegister}
          className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4 mt-4"
        >
          <div className="text-center mb-2">
            <h1 className="text-3xl font-extrabold text-[var(--accent-soft)]">{t.brand}</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">{t.tagline}</p>
          </div>

          <div>
            <label className="text-sm text-[var(--text-muted)] mb-1 block">{t.nameLabel}</label>
            <input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2 outline-none focus:border-[var(--accent)]"
              placeholder={t.namePlaceholder}
              required
            />
          </div>

          <div>
            <label className="text-sm text-[var(--text-muted)] mb-1 block">{t.phoneLabel}</label>
            <input
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2 outline-none focus:border-[var(--accent)]"
              placeholder={t.phonePlaceholder}
              required
            />
          </div>

          <div>
            <label className="text-sm text-[var(--text-muted)] mb-1 block">{t.tableLabel}</label>
            <input
              value={formTable}
              onChange={(e) => setFormTable(e.target.value)}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2 outline-none focus:border-[var(--accent)]"
              placeholder={t.tablePlaceholder}
            />
          </div>

          <div>
            <label className="text-sm text-[var(--text-muted)] mb-1 block">{t.carLabel}</label>
            <input
              value={formCar}
              onChange={(e) => setFormCar(e.target.value)}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2 outline-none focus:border-[var(--accent)]"
              placeholder={t.carPlaceholder}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[var(--accent)] text-[#1c1815] font-bold mt-2"
          >
            {t.continueBtn}
          </button>
        </form>
      </main>
    );
  }

  if (loading) {
    return (
      <main dir={t.dir} className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
        <p className="font-display text-lg">{t.loadingMenu}</p>
      </main>
    );
  }

  const activeOfferData = offers[currentOffer];

  return (
    <main dir={t.dir} className="min-h-screen bg-[var(--bg)] text-[var(--text)] pb-32">
      <header className="sticky top-0 z-20 bg-[var(--bg)] border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-5 pt-4 pb-2 flex justify-center gap-2">
          <button
            onClick={() => switchLang('ar')}
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              lang === 'ar' ? 'bg-[var(--accent)] text-[#1c1815]' : 'border border-[var(--border)] text-[var(--text-muted)]'
            }`}
          >
            العربية
          </button>
          <button
            onClick={() => switchLang('en')}
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              lang === 'en' ? 'bg-[var(--accent)] text-[#1c1815]' : 'border border-[var(--border)] text-[var(--text-muted)]'
            }`}
          >
            English
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-5 pt-2 pb-4 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--accent-soft)]">{t.brand}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {t.welcome} {customer.name}
            {customer.table ? ` — ${t.table} ${customer.table}` : ''}
            {customer.car ? ` — ${t.car} ${customer.car}` : ''}
            {visitCount !== null && (
              <span className="text-[var(--accent-soft)] font-medium"> — {t.visit} {visitCount} {t.of5}</span>
            )}
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-5 pb-4">
          <div
            className="relative w-full h-64 rounded-2xl overflow-hidden transition-all duration-700"
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

        {locationStatus !== 'allowed' && (
          <div className="max-w-3xl mx-auto px-5 pb-4">
            <div className="rounded-2xl px-5 py-3 bg-red-500/10 border border-red-500/40">
              <p className="text-sm font-medium text-red-500">
                {locationStatus === 'checking'
                  ? t.locationChecking
                  : locationStatus === 'denied'
                  ? t.locationDenied
                  : t.locationOutOfRange}
              </p>
            </div>
          </div>
        )}

        {weekendOfferActive && !offerMode && offerSelection.length < 2 && (
          <div className="max-w-3xl mx-auto px-5 pb-4">
            <button
              onClick={startOfferMode}
              className="w-full rounded-2xl px-5 py-3 flex items-center justify-between text-right"
              style={{ background: 'linear-gradient(135deg, #ffd166, #ef476f)' }}
            >
              <div>
                <p className="text-white font-extrabold text-sm">{t.weekendOfferTitle}</p>
                <p className="text-white/80 text-xs mt-0.5">{t.weekendOfferSubtitle}</p>
              </div>
              <span className="text-2xl">🥤</span>
            </button>
          </div>
        )}

        {offerMode && (
          <div className="max-w-3xl mx-auto px-5 pb-4">
            <div className="rounded-2xl px-5 py-3 flex items-center justify-between bg-[var(--surface-2)] border border-[var(--accent)]">
              <p className="text-sm font-medium">{t.offerModeText(offerSelection.length)}</p>
              <button onClick={cancelOfferMode} className="text-xs text-[var(--text-muted)] underline">
                {t.cancel}
              </button>
            </div>
          </div>
        )}

        {offerSelection.length === 2 && (
          <div className="max-w-3xl mx-auto px-5 pb-4">
            <div className="rounded-2xl px-5 py-3 flex items-center justify-between bg-[var(--surface-2)] border border-[var(--accent)]">
              <p className="text-sm font-medium text-[var(--accent-soft)]">{t.offerSelectedText(offerDiscount)}</p>
              <button onClick={cancelOfferMode} className="text-xs text-[var(--text-muted)] underline">
                {t.cancel}
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
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{product.description}</p>
                  )}
                </div>
                <span className="shrink-0 text-[var(--accent-soft)] font-semibold text-sm">
                  {product.base_price} {t.riyal}
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
                  {isSelectedForOffer ? t.selected : t.chooseForOffer}
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
                  {t.addToCart}
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
          {t.viewCart}
          <span>{cartTotal} {t.riyal}</span>
        </button>
      )}

      {visitPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/60">
          <div className="w-full max-w-sm bg-[var(--surface)] border border-[var(--accent)] rounded-2xl p-6 text-center flex flex-col gap-3">
            <div className="text-5xl">☕</div>
            <h2 className="text-lg font-bold">{t.visitPopupTitle}</h2>
            <p className="text-[var(--accent-soft)] font-semibold">{t.visitPopupVisit(visitPopup.visitNumber)}</p>
            {visitPopup.remaining > 0 ? (
              <p className="text-[var(--text-muted)] text-sm">{t.visitPopupRemaining(visitPopup.remaining)}</p>
            ) : (
              <p className="text-[var(--accent-soft)] text-sm font-medium">{t.visitPopupWon}</p>
            )}
            <button
              onClick={() => setVisitPopup(null)}
              className="w-full py-3 rounded-full bg-[var(--accent)] text-[#1c1815] font-bold mt-2"
            >
              {t.continueToMenu}
            </button>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setCartOpen(false)} />
          <div
            className="relative w-full max-w-sm h-full bg-[var(--surface)] border-l border-[var(--border)] p-5 flex flex-col"
            style={{ animation: 'slideIn 0.25s ease-out' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">{t.cartTitle}</h2>
              <button onClick={() => setCartOpen(false)} className="text-[var(--text-muted)] text-2xl leading-none">
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-3">
              {cartItems.length === 0 && (
                <p className="text-[var(--text-muted)] text-sm text-center mt-10">{t.emptyCart}</p>
              )}
              {cartItems.map(({ product, qty }) => (
                <div key={product.id} className="flex items-center justify-between gap-2 bg-[var(--surface-2)] rounded-xl p-3">
                  <div>
                    <p className="font-medium text-sm">
                      {product.name}
                      {offerSelection.includes(product.id) && (
                        <span className="text-[var(--accent-soft)] text-xs mr-1">{t.offerLabel}</span>
                      )}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{product.base_price} {t.riyal}</p>
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
                    <span>{t.weekendDiscount}</span>
                    <span>− {offerDiscount} {t.riyal}</span>
                  </div>
                )}
                <div className="flex justify-between mb-4 font-semibold">
                  <span>{t.total}</span>
                  <span className="text-[var(--accent-soft)]">{cartTotal} {t.riyal}</span>
                </div>
                <input
                  value={rewardCodeInput}
                  onChange={(e) => setRewardCodeInput(e.target.value)}
                  placeholder={t.rewardCodePlaceholder}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2 outline-none focus:border-[var(--accent)] text-sm mb-3"
                />
                {locationStatus !== 'allowed' && (
                  <p className="text-xs text-red-500 text-center mb-2">{t.locationRequired}</p>
                )}
                <button
                  onClick={submitOrder}
                  disabled={submitting || locationStatus !== 'allowed'}
                  className="w-full py-3 rounded-full bg-[var(--accent)] text-[#1c1815] font-bold disabled:opacity-50"
                >
                  {submitting ? t.sending : t.confirmOrder}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}