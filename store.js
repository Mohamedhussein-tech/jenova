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
