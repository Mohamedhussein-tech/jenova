// السلة. استخدمها من صفحة الرف: Jenova.add({id:'balloon', name:'Balloon Fit', price:800, size:'32'})
(function () {
  const KEY = "jenova_cart";
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const write = (c) => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {} document.dispatchEvent(new Event("jenova:cart")); };
  window.Jenova = {
    cart: read,
    count: () => read().reduce((n, i) => n + i.qty, 0),
    total: () => read().reduce((n, i) => n + i.qty * i.price, 0),
    add(item) {
      const c = read(), k = c.find((i) => i.id === item.id && i.size === item.size);
      if (k) k.qty = Math.min(10, k.qty + 1); else c.push({ ...item, qty: 1 });
      write(c);
    },
    setQty(id, size, qty) {
      write(read().map((i) => (i.id === id && i.size === size ? { ...i, qty } : i)).filter((i) => i.qty > 0));
    },
    clear: () => write([]),
  };
})();

/* دخول الأدمن من الموقع نفسه */
(function () {
  const C = window.JENOVA; if (!C || !C.SUPABASE_URL) return;
  let sb, bar;
  const hasSession = () => { try { return Object.keys(localStorage).some((k) => /^sb-.+-auth-token$/.test(k)); } catch { return false; } };
  const client = () => new Promise((res, rej) => {
    const make = () => { sb = sb || window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY); res(sb); };
    if (window.supabase) return make();
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";
    s.onload = make; s.onerror = rej; document.head.append(s);
  });
  const el = (t, a = {}, x) => { const e = document.createElement(t); Object.assign(e, a); if (x != null) e.textContent = x; return e; };
  const st = el("style", {}, "#admDlg{border:2px dashed #e8b631;background:#eef0ee;padding:20px;max-width:92vw;width:380px;color:#121820;font-family:Cairo,sans-serif}#admDlg::backdrop{background:rgba(10,18,32,.72)}#admBar{position:fixed;left:0;right:0;bottom:0;z-index:50;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;background:#121820;padding:10px 10px calc(10px + env(safe-area-inset-bottom,0px))}#admBar a,#admBar button{background:#fff;color:#121820;border:0;padding:9px 14px;font:700 14px Cairo,sans-serif;text-decoration:none;border-radius:2px;cursor:pointer}");
  document.head.append(st);

  const dlg = el("dialog", { id: "admDlg" });
  const form = el("form");
  const em = el("input", { type: "email", id: "admEm", autocomplete: "username" });
  const pw = el("input", { type: "password", id: "admPw", autocomplete: "current-password" });
  const err = el("div", { role: "alert" }); err.style.cssText = "color:#e0262d;font-weight:700;min-height:1.4em;margin-top:8px";
  const go = el("button", { type: "submit", className: "btn alt" }, "دخول");
  const cancel = el("button", { type: "button", className: "btn sm" }, "إلغاء"); cancel.style.marginTop = "10px";
  const l1 = el("label", { htmlFor: "admEm" }, "الإيميل"), l2 = el("label", { htmlFor: "admPw" }, "الباسورد");
  form.append(el("h2", {}, "دخول الأدمن"), l1, em, l2, pw, err, go, cancel);
  dlg.append(form); document.body.append(dlg);
  cancel.onclick = () => dlg.close();

  function showBar() {
    if (bar) return;
    bar = el("div", { id: "admBar" });
    [["الطلبات", "dashboard.html#orders"], ["الزوار", "dashboard.html#stats"], ["الموديلات", "dashboard.html#models"], ["العروض", "dashboard.html#coupons"]].forEach(([t, h]) => bar.append(el("a", { href: h }, t)));
    const out = el("button", { type: "button" }, "خروج");
    out.onclick = async () => { try { await (await client()).auth.signOut(); } catch {} bar.remove(); bar = null; document.body.style.paddingBottom = ""; };
    bar.append(out); document.body.append(bar); document.body.style.paddingBottom = "70px";
  }
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); err.textContent = ""; go.disabled = true;
    try {
      const c = await client();
      const { error } = await c.auth.signInWithPassword({ email: em.value, password: pw.value });
      if (error) { err.textContent = "الإيميل أو الباسورد غلط"; return; }
      const { data: ok } = await c.rpc("is_admin");
      if (!ok) { await c.auth.signOut(); err.textContent = "الحساب ده مش أدمن"; return; }
      pw.value = ""; dlg.close(); showBar();
    } catch { err.textContent = "حصلت مشكلة، جرب تاني"; } finally { go.disabled = false; }
  });

  async function init() {
    const f = document.querySelector("footer");
    if (f) {
      const a = el("button", { type: "button" }, "دخول الأدمن");
      a.style.cssText = "background:none;border:0;color:#9fb0c4;text-decoration:underline;cursor:pointer;font:inherit;display:block;margin:8px auto 0";
      a.onclick = () => dlg.showModal(); f.append(a);
    }
    if (hasSession()) {
      try {
        const c = await client(), { data } = await c.auth.getSession();
        if (data.session) { const { data: ok } = await c.rpc("is_admin"); if (ok) showBar(); }
      } catch {}
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();

/* انترو الافتتاح: سوستة جينز بتتفتح */
(function () {
  if (!document.getElementById("racks")) return;
  const force = /[?&]intro/.test(location.search);
  let seen = false;
  try { seen = !!sessionStorage.getItem("jenova_intro"); sessionStorage.setItem("jenova_intro", "1"); } catch {}
  if ((seen && !force) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const css = document.createElement("style");
  css.textContent = `
#intro{position:fixed;inset:0;z-index:100;overflow:hidden;display:grid;place-items:center;cursor:pointer}
#intro .h{position:absolute;top:0;bottom:0;width:50%;background:#1f2f4a repeating-linear-gradient(45deg,rgba(255,255,255,.05) 0 2px,transparent 2px 6px);transition:transform .9s cubic-bezier(.7,0,.3,1)}
#intro .l{left:0}#intro .r{right:0}
#intro.open .l{transform:translateX(-101%)}#intro.open .r{transform:translateX(101%)}
#intro .tx{position:relative;text-align:center;transition:opacity .25s;animation:ishake .3s 1.05s}
#intro.open .tx{opacity:0}
#intro .w{font:400 clamp(64px,22vw,150px)/1 "Permanent Marker",cursive;color:#fff;display:flex;justify-content:center;direction:ltr}
#intro .w span{display:inline-block;opacity:0;transform:translateY(-40px) rotate(-8deg);animation:idrop .5s cubic-bezier(.2,1.4,.4,1) forwards;animation-delay:calc(var(--i) * .09s)}
#intro .st{display:inline-block;margin-top:14px;background:#fff;color:#e0262d;font:400 clamp(22px,7vw,44px) "Permanent Marker",cursive;padding:2px 14px;opacity:0;transform:rotate(-3deg) scale(1.8);animation:islap .35s ease-out 1s forwards;direction:ltr}
#intro .zip{position:absolute;top:0;bottom:0;left:50%;width:10px;margin-left:-5px;background:repeating-linear-gradient(#cfd6de 0 6px,#5b6673 6px 12px);transition:opacity .3s .5s}
#intro.open .zip{opacity:0}
#intro .tab{position:absolute;top:0;left:50%;width:26px;height:46px;margin-left:-13px;background:#e8b631;border-radius:6px 6px 14px 14px;box-shadow:0 3px 0 rgba(0,0,0,.3);transition:transform .9s cubic-bezier(.7,0,.3,1)}
#intro.open .tab{transform:translateY(100vh)}
#intro .sk{position:absolute;bottom:calc(18px + env(safe-area-inset-bottom,0px));left:0;right:0;text-align:center;color:#9fb0c4;font:600 13px Cairo,sans-serif}
@keyframes idrop{to{opacity:1;transform:none}}
@keyframes islap{to{opacity:1;transform:rotate(-3deg) scale(1)}}
@keyframes ishake{25%{transform:translate(-5px,3px)}50%{transform:translate(5px,-3px)}75%{transform:translate(-2px,2px)}}`;
  document.head.append(css);

  const el = document.createElement("div");
  el.id = "intro"; el.setAttribute("aria-hidden", "true");
  el.innerHTML = '<div class="h l"></div><div class="h r"></div><div class="zip"></div><div class="tab"></div><div class="tx"><div class="w">' +
    "JENOVA".split("").map((c, i) => `<span style="--i:${i}">${c}</span>`).join("") +
    '</div><div class="st">DON\'T CALL ME</div></div><div class="sk">اضغط للتخطي</div>';
  document.body.append(el);
  const prev = document.body.style.overflow; document.body.style.overflow = "hidden";

  let opened = false, done = false;
  const open = () => { if (opened) return; opened = true; el.classList.add("open"); setTimeout(finish, 1000); };
  const finish = () => { if (done) return; done = true; el.remove(); css.remove(); document.body.style.overflow = prev; };
  el.addEventListener("click", open);
  addEventListener("keydown", (e) => { if (e.key === "Escape") open(); });
  setTimeout(open, 2100);
  setTimeout(finish, 4000);
})();

/* زرار واتساب عائم للعملاء */
(function () {
  const C = window.JENOVA || {};
  let num = String(C.WHATSAPP || C.PAY_NUMBER || "").replace(/\D/g, "");
  if (!num) return;
  if (num.startsWith("0")) num = "20" + num.slice(1);
  const msg = document.getElementById("racks") ? "أهلاً Jenova 👋 عايز أسأل عن موديل" : "أهلاً Jenova 👋 محتاج مساعدة في طلبي";
  const css = document.createElement("style");
  css.textContent = ".wab{position:fixed;left:14px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:40;display:flex;align-items:center;gap:8px;background:#25d366;color:#121820;font:700 14px Cairo,sans-serif;text-decoration:none;padding:11px 16px;border-radius:99px;box-shadow:0 6px 16px rgba(0,0,0,.35)}body:has(#admBar) .wab{bottom:calc(86px + env(safe-area-inset-bottom,0px))}.wab svg{width:22px;height:22px}@media (prefers-reduced-motion:no-preference){.wab{animation:wabp 2.6s ease-in-out infinite}@keyframes wabp{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}}";
  document.head.append(css);
  const a = document.createElement("a");
  a.className = "wab"; a.target = "_blank"; a.rel = "noopener";
  a.href = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  a.setAttribute("aria-label", "كلمنا على واتساب");
  a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.6.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2.1-.1 0-.3 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.900 11.900 0 0 0 4.600 4c1.700.7 2.400.8 3.200.7a2.700 2.700 0 0 0 1.800-1.300 2.200 2.200 0 0 0 .2-1.300c-.1-.1-.3-.2-.6-.3z"/></svg><span>كلمنا واتساب</span>';
  document.body.append(a);
})();

/* بانر عرض الشحن المجاني + العداد */
(function () {
  const C = window.JENOVA, anchor = document.getElementById("racks");
  if (!C || !anchor) return;
  const css = document.createElement("style");
  css.textContent = ".promo{max-width:1100px;margin:18px 16px 0;padding:10px 14px;background:#fff;color:#121820;border:2px dashed #e0262d;font-weight:700;text-align:center;border-radius:3px}@media (min-width:1132px){.promo{margin-inline:auto}}.promo b{color:#e0262d;font:400 28px 'Permanent Marker',cursive;margin:0 8px;vertical-align:middle}";
  document.head.append(css);
  fetch(`${C.SUPABASE_URL}/rest/v1/settings?select=*&id=eq.1`, { headers: { apikey: C.SUPABASE_ANON_KEY } })
    .then((r) => r.json()).then(([s]) => {
      if (!s) return;
      const p = document.createElement("div"); p.className = "promo";
      if (s.free_ship_left > 0) { p.append("🚚 شحن مجاني — باقي "); const b = document.createElement("b"); b.textContent = s.free_ship_left; p.append(b, "أوردر بس!"); }
      else p.textContent = `🚚 الشحن لكل المحافظات ${s.shipping_fee} جنيه`;
      anchor.before(p);
    }).catch(() => {});
})();
/* بانر الشحن الترندي (بيخفي البانر القديم) */
(function () {
  const C = window.JENOVA, anchor = document.getElementById("racks");
  if (!C || !anchor) return;
  const css = document.createElement("style");
  css.textContent = `
.promo{display:none!important}
.ship{position:relative;max-width:1068px;margin:24px 16px 0;padding:26px 16px 30px;background:#121820;color:#fff;border-radius:6px;overflow:hidden;display:flex;align-items:center;justify-content:space-between;gap:12px;box-shadow:0 10px 0 rgba(0,0,0,.3)}
@media (min-width:1100px){.ship{margin-inline:auto}}
.ship::before,.ship::after{content:"";position:absolute;left:0;right:0;height:10px;background:repeating-linear-gradient(-45deg,#e8b631 0 14px,#121820 14px 28px)}
.ship::before{top:0}.ship::after{bottom:0}
.ship .k{display:block;font:400 clamp(28px,8vw,46px)/1 "Permanent Marker",cursive;color:#e8b631;direction:ltr;text-align:right;transform:rotate(-2deg)}
.ship .s{display:block;margin-top:8px;font-weight:700;font-size:15px;color:#e8eef5}
.ship .st{flex:0 0 auto;width:96px;height:96px;border-radius:50%;background:#e0262d;border:3px dashed #fff;display:grid;place-content:center;text-align:center;transform:rotate(-10deg);box-shadow:0 6px 0 rgba(0,0,0,.35)}
.ship .st b{display:block;font:400 42px/1 "Permanent Marker",cursive}
.ship .st span{display:block;font-weight:700;font-size:12px;margin-top:2px}
.ship .road{position:absolute;left:0;right:0;bottom:12px;height:0;border-top:2px dashed rgba(255,255,255,.25)}
.ship .truck{position:absolute;bottom:14px;right:-40px;font-size:22px}
.ship.off{padding-block:20px 24px}.ship.off .k{color:#fff}
@media (prefers-reduced-motion:no-preference){
.ship::before,.ship::after{background-size:40px 40px;animation:tape 1.1s linear infinite}
.ship .st{animation:pulse 1.8s ease-in-out infinite}
.ship.hot .st{animation:shk .7s ease-in-out infinite;background:#ff1f2d}
.ship .truck{animation:drive 7s linear infinite}
@keyframes tape{to{background-position:40px 0}}
@keyframes pulse{0%,100%{transform:rotate(-10deg) scale(1)}50%{transform:rotate(-6deg) scale(1.08)}}
@keyframes shk{0%,100%{transform:rotate(-10deg)}25%{transform:rotate(-14deg)}75%{transform:rotate(-6deg)}}
@keyframes drive{to{right:calc(100% + 40px)}}}`;
  document.head.append(css);

  fetch(`${C.SUPABASE_URL}/rest/v1/settings?select=*&id=eq.1`, { headers: { apikey: C.SUPABASE_ANON_KEY } })
    .then((r) => r.json()).then(([s]) => {
      if (!s) return;
      const left = s.free_ship_left, on = left > 0;
      const box = document.createElement("div");
      box.className = "ship" + (on ? (left <= 5 ? " hot" : "") : " off");
      box.setAttribute("role", "group");
      box.setAttribute("aria-label", on ? `شحن مجاني، باقي ${left} أوردر` : `الشحن ${s.shipping_fee} جنيه`);
      const tx = document.createElement("div");
      const k = document.createElement("span"); k.className = "k"; k.textContent = on ? "FREE SHIPPING" : "SHIPPING";
      const sub = document.createElement("span"); sub.className = "s";
      sub.textContent = on ? (left <= 5 ? "🔥 آخر أوردرات العرض، الحق قبل ما يخلص!" : "عرض الافتتاح: الشحن علينا 🎁") : `الشحن لكل المحافظات ${s.shipping_fee} جنيه`;
      tx.append(k, sub); box.append(tx);
      if (on) {
        const st = document.createElement("div"); st.className = "st"; st.setAttribute("aria-hidden", "true");
        const n = document.createElement("b"); n.textContent = left;
        const l = document.createElement("span"); l.textContent = "أوردر باقي";
        st.append(n, l); box.append(st);
        if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
          const t0 = performance.now(), dur = 900;
          const tick = (t) => { const p = Math.min(1, (t - t0) / dur); n.textContent = Math.round(left * p); if (p < 1) requestAnimationFrame(tick); else n.textContent = left; };
          n.textContent = 0; requestAnimationFrame(tick);
        }
        const road = document.createElement("div"); road.className = "road"; road.setAttribute("aria-hidden", "true");
        const truck = document.createElement("span"); truck.className = "truck"; truck.setAttribute("aria-hidden", "true"); truck.textContent = "🚚";
        box.append(road, truck);
      }
      anchor.before(box);
    }).catch(() => {});
})();
/* المعرض: عرض شبكة بصور كبيرة بجانب الشماعة */
(function () {
  const C = window.JENOVA, racks = document.getElementById("racks");
  if (!C || !racks) return;
  const css = document.createElement("style");
  css.textContent = `
.vbar{display:flex;justify-content:center;gap:10px;margin:22px 16px 0}
.vbar button{padding:10px 22px;border:2px solid #fff;background:transparent;color:#fff;font:700 15px Cairo,sans-serif;cursor:pointer;border-radius:4px}
.vbar button[aria-pressed=true]{background:#e0262d;border-color:#e0262d;box-shadow:0 4px 0 rgba(0,0,0,.35)}
#gallery{max-width:1100px;margin:26px auto 0;padding:0 16px 56px}
.gh{font:400 clamp(30px,9vw,54px)/1 "Permanent Marker",cursive;color:#fff;margin:0 0 18px;display:flex;align-items:baseline;gap:12px;direction:ltr;justify-content:flex-end}
.gh small{font:700 14px Cairo,sans-serif;color:#9fb0c4}
.gg{display:grid;grid-template-columns:repeat(2,1fr);gap:16px 12px;perspective:900px}
@media (min-width:760px){.gg{grid-template-columns:repeat(3,1fr)}}
@media (min-width:1000px){.gg{grid-template-columns:repeat(4,1fr)}}
.gc{position:relative;display:block;padding:0;border:0;background:none;cursor:pointer;text-align:start;color:#fff;font:inherit;transform:rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform .15s}
.gc:nth-child(even){margin-top:28px}
.gc .ph{display:block;position:relative;aspect-ratio:4/5;background:#dfe5ea;border:3px solid #fff;box-shadow:0 16px 20px rgba(0,0,0,.38);overflow:hidden;border-radius:3px}
.gc .ph img,.gc .ph svg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.gc .ph svg{padding:12px;background:#c9d3de}
.gc .ph .b{opacity:0;transition:opacity .35s}.gc:hover .ph .b{opacity:1}
.gc .no{position:absolute;top:8px;right:8px;z-index:2;background:#121820;color:#e8b631;font:400 14px "Permanent Marker",cursive;padding:2px 8px}
.gc .cap{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:28px 10px 10px;background:linear-gradient(transparent,rgba(10,14,20,.9));display:flex;justify-content:space-between;align-items:flex-end;gap:6px}
.gc .cap b{font:400 18px "Permanent Marker",cursive;direction:ltr}
.gc .cap span{color:#e8b631;font-weight:700;font-size:14px;white-space:nowrap}
.gc .lw{position:absolute;top:8px;left:8px;z-index:2;background:#e8b631;color:#121820;font-weight:700;font-size:12px;padding:2px 8px}
.gc .rb{position:absolute;top:34px;left:-36px;z-index:3;width:140px;text-align:center;transform:rotate(-35deg);background:#e0262d;color:#fff;font:400 14px "Permanent Marker",cursive;padding:3px 0}
.gc.out .ph img,.gc.out .ph svg{filter:grayscale(1) brightness(.7)}
@media (prefers-reduced-motion:no-preference){.gc:not(.in){opacity:0}.gc.in{animation:gin .55s var(--d,0ms) backwards}@keyframes gin{from{opacity:0;transform:translateY(26px)}to{opacity:1}}}`;
  document.head.append(css);

  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const bar = el("div", "vbar"); bar.setAttribute("role", "group"); bar.setAttribute("aria-label", "طريقة العرض");
  const bR = el("button", "", "🧥 الشماعة"), bG = el("button", "", "🖼️ المعرض"); bR.type = bG.type = "button";
  bar.append(bR, bG); racks.before(bar);
  const gal = el("section"); gal.id = "gallery"; gal.hidden = true; gal.setAttribute("aria-label", "المعرض"); racks.after(gal);

  let loaded = false;
  function card(p, i) {
    const b = el("button", "gc"); b.type = "button"; b.style.setProperty("--d", (i % 8) * 70 + "ms"); b.setAttribute("aria-label", p.name + " - افتح التفاصيل");
    const ph = el("span", "ph"), imgs = p.images || [];
    if (imgs[0]) {
      const a = new Image(); a.src = imgs[0]; a.alt = p.name; a.loading = "lazy"; ph.append(a);
      if (imgs[1]) { const c = new Image(); c.src = imgs[1]; c.alt = ""; c.className = "b"; c.loading = "lazy"; ph.append(c); }
    } else if (typeof fallback === "function") { const s = fallback(p.colors && p.colors[0] && p.colors[0].hex); s.removeAttribute("class"); ph.append(s); }
    ph.append(el("span", "no", String(i + 1).padStart(2, "0")));
    const cap = el("span", "cap"); cap.append(el("b", "", p.name), el("span", "", p.price + " جنيه")); ph.append(cap);
    if (p.stock != null && p.stock <= 0) { b.classList.add("out"); ph.append(el("span", "rb", "SOLD OUT")); }
    else if (p.stock != null && p.stock <= 3) ph.append(el("span", "lw", "باقي " + p.stock));
    b.append(ph);
    b.onclick = () => { if (typeof openProduct === "function") openProduct(p); };
    b.addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse") return; const r = b.getBoundingClientRect(); b.style.setProperty("--ry", ((e.clientX - r.left) / r.width - .5) * 16 + "deg"); b.style.setProperty("--rx", (.5 - (e.clientY - r.top) / r.height) * 10 + "deg"); });
    b.addEventListener("pointerleave", () => { b.style.removeProperty("--rx"); b.style.removeProperty("--ry"); });
    return b;
  }
  async function load() {
    loaded = true; gal.append(el("p", "load", "جاري تحميل المعرض..."));
    try {
      const res = await fetch(`${C.SUPABASE_URL}/rest/v1/products?select=*&active=eq.true&order=rack.asc,sort.asc,created_at.asc`, { headers: { apikey: C.SUPABASE_ANON_KEY } });
      if (!res.ok) throw 0;
      const prods = await res.json();
      gal.innerHTML = "";
      const h = el("h3", "gh", "LOOKBOOK"); h.append(el("small", "", String(prods.length).padStart(2, "0") + " PIECES")); gal.append(h);
      const grid = el("div", "gg"); prods.forEach((p, i) => grid.append(card(p, i))); gal.append(grid);
      const cards = [...grid.children];
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
        cards.forEach((c) => io.observe(c));
      } else cards.forEach((c) => c.classList.add("in"));
    } catch { loaded = false; gal.innerHTML = ""; gal.append(el("p", "load", "تعذر تحميل المعرض، جرب تاني.")); }
  }
  function show(mode) {
    const g = mode === "gallery";
    racks.hidden = g; gal.hidden = !g;
    bR.setAttribute("aria-pressed", String(!g)); bG.setAttribute("aria-pressed", String(g));
    try { sessionStorage.setItem("jenova_view", mode); } catch {}
    if (g && !loaded) load();
  }
  bR.onclick = () => show("rack"); bG.onclick = () => show("gallery");
  let saved = "rack"; try { saved = sessionStorage.getItem("jenova_view") || "rack"; } catch {}
  show(saved);
})();
