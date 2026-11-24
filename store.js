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
    [["الطلبات", "dashboard.html#orders"], ["الزوار", "dashboard.html#stats"], ["الموديلات", "dashboard.html#models"]].forEach(([t, h]) => bar.append(el("a", { href: h }, t)));
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
