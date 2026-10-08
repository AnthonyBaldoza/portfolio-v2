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
    themeBtn.setAttribute(
      "aria-label",
      t === "dark" ? "Switch to light mode" : "Switch to dark mode",
    );
    meta.content = t === "dark" ? "#0A0A0B" : "#FAFAFA";
  };

  applyTheme(root.dataset.theme);
    themeBtn.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    const swap = () => {
      applyTheme(next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    };
    if (!document.startViewTransition || reduce) return swap();
    const r = themeBtn.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(swap).ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" }
      );
    });
  });


  // Follow system changes only until the visitor makes their own choice.
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    try {
      if (localStorage.getItem("theme")) return;
    } catch (err) {}
    applyTheme(e.matches ? "dark" : "light");
  });

  /* ---- Nav: scrolled state, mobile menu, scrollspy ---- */
  const nav = $("#nav"),
    menu = $("#menu"),
    burger = $("#burger");
  const bar = $("#progress");
  const onScroll = () => {
    nav.classList.toggle("scrolled", scrollY > 12);
    bar.style.setProperty(
      "--p",
      (scrollY / Math.max(1, root.scrollHeight - innerHeight)).toFixed(3),
    );
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const setMenu = (open) => {
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  burger.addEventListener("click", () =>
    setMenu(!menu.classList.contains("open")),
  );
  menu.addEventListener(
    "click",
    (e) => e.target.tagName === "A" && setMenu(false),
  );
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#palette").open) {
      setMenu(false);
      burger.focus();
    }
  });

  const links = [...menu.querySelectorAll("a")];
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting)
          links.forEach((a) =>
            a.classList.toggle("on", a.hash === "#" + en.target.id),
          );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));

  /* ---- Scroll reveal ---- */
  const items = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    items.forEach((el) => io.observe(el));
  }

  /* ---- Hero typewriter (the one orchestrated moment) ---- */
  const code = $("#code");
  const parts = [
    ["k", "public class "],
    ["t", "Developer"],
    ["", " {\n\n  "],
    ["t", "String"],
    ["", " "],
    ["p", "name"],
    ["", "  = "],
    ["s", '"Anthony Baldoza"'],
    ["", ";\n  "],
    ["t", "String"],
    ["", " "],
    ["p", "role"],
    ["", "  = "],
    ["s", '"Full Stack Developer"'],
    ["", ";\n  "],
    ["t", "String[]"],
    ["", " "],
    ["p", "stack"],
    ["", " = {\n    "],
    ["s", '"Java"'],
    ["", ", "],
    ["s", '"Spring Boot"'],
    ["", ",\n    "],
    ["s", '"C#"'],
    ["", ", "],
    ["s", '".NET"'],
    ["", ",\n    "],
    ["s", '"React"'],
    ["", ", "],
    ["s", '"PostgreSQL"'],
    ["", ",\n    "],
    ["s", '"MySQL"'],
    ["", "\n  };\n  "],
    ["t", "boolean"],
    ["", " "],
    ["p", "available"],
    ["", " = "],
    ["k", "true"],
    ["", ";\n\n"],
    ["c", "  // let's build something\n"],
    ["", "}"],
  ];
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const render = (n) => {
    let html = "",
      left = n;
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

  /* ---- Name decode (hero) ---- */
  const h1 = $("#name"),
    tn = h1.firstChild,
    finalName = tn.textContent;
  if (!reduce) {
    const glyphs = "!<>-_/[]{}=+*^?#";
    let f = 0;
    const tick = () => {
      tn.textContent = [...finalName]
        .map((c, i) =>
          c === " " || i < f / 3
            ? c
            : glyphs[(Math.random() * glyphs.length) | 0],
        )
        .join("");
      if (f++ < finalName.length * 3 + 3) requestAnimationFrame(tick);
      else tn.textContent = finalName;
    };
    tick();
  }

  /* ---- Pointer effects: tilt, spotlight, magnetic buttons ---- */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".editor, .proj").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty(
          "--rx",
          (-((e.clientY - r.top) / r.height - 0.5) * 6).toFixed(2) + "deg",
        );
        el.style.setProperty(
          "--ry",
          (((e.clientX - r.left) / r.width - 0.5) * 8).toFixed(2) + "deg",
        );
      });
      el.addEventListener("pointerleave", () => {
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      });
    });
    document.querySelectorAll(".proj, .card").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", e.clientX - r.left + "px");
        el.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
    document.querySelectorAll(".cta .btn").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty(
          "--tx",
          ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + "px",
        );
        el.style.setProperty(
          "--ty",
          ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + "px",
        );
      });
      el.addEventListener("pointerleave", () => {
        el.style.setProperty("--tx", "0px");
        el.style.setProperty("--ty", "0px");
      });
    });
  }

  /* ---- Command palette (Ctrl/Cmd + K) ---- */
  const pal = $("#palette"),
    pq = $("#pq"),
    pl = $("#plist");
  const jump = (h) => () => {
    location.hash = h;
  };
  const cmds = [
    ["About", "Section", jump("#about")],
    ["Skills", "Section", jump("#skills")],
    ["Projects", "Section", jump("#projects")],
    ["Experience", "Section", jump("#experience")],
    ["Contact", "Section", jump("#contact")],
    ["Toggle theme", "Action", () => themeBtn.click()],
    [
      "Copy email",
      "Action",
      () =>
        navigator.clipboard &&
        navigator.clipboard.writeText("baldozaanthony2@gmail.com"),
    ],
    [
      "Open GitHub",
      "Link",
      () =>
        window.open("https://github.com/AnthonyBaldoza", "_blank", "noopener"),
    ],
    [
      "View certificate",
      "Link",
      () =>
        window.open("assets/docs/zuitt-certificate.pdf", "_blank", "noopener"),
    ],
  ];
  let shown = [],
    sel = 0;
  const draw = () => {
    const q = pq.value.trim().toLowerCase();
    shown = cmds.filter((c) => c[0].toLowerCase().includes(q));
    sel = 0;
    pl.innerHTML =
      shown
        .map(
          (c, i) =>
            `<li role="option" aria-selected="${i === 0}" data-i="${i}">${c[0]}<small>${c[1]}</small></li>`,
        )
        .join("") || "<li>No results</li>";
  };
  const mark = () =>
    [...pl.children].forEach((li, i) =>
      li.setAttribute("aria-selected", i === sel),
    );
  const exec = (i) => {
    const c = shown[i];
    if (c) {
      pal.close();
      c[2]();
    }
  };
  const openPal = () => {
    pq.value = "";
    draw();
    pal.showModal();
    pq.focus();
  };
  $("#cmdBtn").addEventListener("click", openPal);
  addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      pal.open ? pal.close() : openPal();
    }
  });
  pq.addEventListener("input", draw);
  pq.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      sel = Math.min(sel + 1, shown.length - 1);
      mark();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      sel = Math.max(sel - 1, 0);
      mark();
    } else if (e.key === "Enter") {
      e.preventDefault();
      exec(sel);
    }
  });
  pl.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-i]");
    if (li) exec(+li.dataset.i);
  });
  pal.addEventListener("click", (e) => {
    if (e.target === pal) pal.close();
  });

  /* ---- Contact form (Formspree, with mailto fallback until you add your form ID) ---- */
  const form = $("#form"),
    note = $("#note");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = new FormData(form),
      btn = form.querySelector("button");
    if (form.action.includes("YOUR_FORM_ID")) {
      const body = `${d.get("msg")}\n\nFrom: ${d.get("name")} (${d.get("email")})`;
      location.href = `mailto:baldozaanthony2@gmail.com?subject=${encodeURIComponent("Portfolio message from " + d.get("name"))}&body=${encodeURIComponent(body)}`;
      note.textContent =
        "Your email app should open with the message ready to send.";
      return;
    }
    btn.disabled = true;
    note.textContent = "Sending...";
    try {
      const r = await fetch(form.action, {
        method: "POST",
        body: d,
        headers: { Accept: "application/json" },
      });
      if (!r.ok) throw new Error(r.status);
      form.reset();
      note.textContent = "Thanks! Your message was sent. I'll reply soon.";
    } catch (err) {
      note.textContent =
        "Something went wrong. Please email me at baldozaanthony2@gmail.com.";
    }
    btn.disabled = false;
  });

  $("#yr").textContent = new Date().getFullYear();

})();


/* Morph: reveal the second photo only under the cursor */
(() => {
  const morph = document.getElementById("morph");
  if (!morph) return;
  const RADIUS = 40; // <-- change this number to make the circle bigger or smaller
  let rect = null;
  let x = 0;
  let y = 0;
  let ticking = false;

  const draw = () => {
    morph.style.setProperty("--x", x + "px");
    morph.style.setProperty("--y", y + "px");
    ticking = false;
  };
  const move = (e) => {
    if (!rect) rect = morph.getBoundingClientRect();
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
    morph.style.setProperty("--r", RADIUS + "px");
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(draw);
    }
  };
  const hide = () => {
    rect = null;
    morph.style.setProperty("--r", "0px");
  };

  morph.addEventListener("pointerenter", () => {
    rect = morph.getBoundingClientRect();
  });
  morph.addEventListener("pointermove", move);
  morph.addEventListener("pointerleave", hide);
  morph.addEventListener("pointercancel", hide);
})();
