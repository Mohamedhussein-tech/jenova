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
