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
