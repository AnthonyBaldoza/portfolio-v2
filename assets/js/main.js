(() => {
  const root = document.documentElement;
  const $ = (s) => document.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Theme toggle ---- */
  const themeBtn = $("#themeBtn");
  const meta = $('meta[name="theme-color"]');
  const applyTheme = (t) => {
    root.dataset.theme = t;
    themeBtn.setAttribute("aria-pressed", String(t === "dark"));
    themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
    meta.content = t === "dark" ? "#0A0A0B" : "#FAFAFA";
  };
  applyTheme(root.dataset.theme);
  themeBtn.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
  // Follow system changes only until the visitor makes their own choice.
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    try { if (localStorage.getItem("theme")) return; } catch (err) {}
    applyTheme(e.matches ? "dark" : "light");
  });

  /* ---- Nav: scrolled state, mobile menu, scrollspy ---- */
  const nav = $("#nav"), menu = $("#menu"), burger = $("#burger");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 12);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const setMenu = (open) => {
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  menu.addEventListener("click", (e) => e.target.tagName === "A" && setMenu(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape") { setMenu(false); burger.focus(); } });

  const links = [...menu.querySelectorAll("a")];
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.hash === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));

  /* ---- Scroll reveal ---- */
  const items = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  }

  /* ---- Hero typewriter (the one orchestrated moment) ---- */
  const code = $("#code");
  const parts = [
    ["k", "public class "], ["t", "Developer"], ["", " {\n\n  "],
    ["t", "String"], ["", " "], ["p", "name"], ["", "  = "], ["s", '"Anthony Baldoza"'], ["", ";\n  "],
    ["t", "String"], ["", " "], ["p", "role"], ["", "  = "], ["s", '"Full Stack Developer"'], ["", ";\n  "],
    ["t", "String[]"], ["", " "], ["p", "stack"], ["", " = {\n    "],
    ["s", '"Java"'], ["", ", "], ["s", '"Spring Boot"'], ["", ",\n    "],
    ["s", '"C#"'], ["", ", "], ["s", '".NET"'], ["", ",\n    "],
    ["s", '"React"'], ["", ", "], ["s", '"PostgreSQL"'], ["", ",\n    "],
    ["s", '"MySQL"'], ["", "\n  };\n  "],
    ["t", "boolean"], ["", " "], ["p", "available"], ["", " = "], ["k", "true"], ["", ";\n\n"],
    ["c", "  // let's build something\n"], ["", "}"],
  ];
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const render = (n) => {
    let html = "", left = n;
    for (const [c, text] of parts) {
      if (left <= 0) break;
      const chunk = esc(text.slice(0, left));
      html += c ? `<span class="${c}">${chunk}</span>` : chunk;
      left -= text.length;
    }
    return html;
  };
  const total = parts.reduce((n, p) => n + p[1].length, 0);
  if (reduce) {
    code.innerHTML = render(total);
  } else {
    let n = 0;
    const step = () => {
      n++;
      code.innerHTML = render(n) + '<span class="caret"></span>';
      if (n < total) setTimeout(step, 10 + Math.random() * 16);
    };
    setTimeout(step, 400);
  }

  /* ---- Contact form: opens the visitor's email app, prefilled ---- */
  const form = $("#form"), note = $("#note");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const body = `${d.get("msg")}\n\nFrom: ${d.get("name")} (${d.get("email")})`;
    location.href = `mailto:baldozaanthony2@gmail.com?subject=${encodeURIComponent("Portfolio message from " + d.get("name"))}&body=${encodeURIComponent(body)}`;
    note.textContent = "Your email app should open with the message ready to send.";
  });

  $("#yr").textContent = new Date().getFullYear();
})();
