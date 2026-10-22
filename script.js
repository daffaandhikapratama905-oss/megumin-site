(function () {
  var rm = matchMedia("(prefers-reduced-motion: reduce)").matches,
    layer = document.getElementById("burst"),
    main = document.getElementById("main");
  var cols = ["#F7E4D2", "#F6B73C", "#C34D57", "#E8693F"],
    words = ["Explosion!", "Kaboom!", "Ba-boom!", "✕"],
    wi = 0;
  function burst(x, y, pw, label) {
    if (rm) return;
    var n = Math.round(12 + pw * 55);
    for (var i = 0; i < n; i++) {
      var k = document.createElement("i"),
        s = 8 + Math.random() * (10 + pw * 14),
        a = Math.random() * 6.283,
        d = (50 + Math.random() * 130) * (0.6 + pw),
        dx = Math.cos(a) * d,
        dy = Math.sin(a) * d;
      k.className = "k";
      k.style.cssText =
        "left:" +
        x +
        "px;top:" +
        y +
        "px;width:" +
        s +
        "px;height:" +
        s +
        "px;background:" +
        cols[i % 4];
      layer.appendChild(k);
      k.animate(
        [
          { transform: "translate(-50%,-50%) scale(.3)", opacity: 1 },
          {
            transform:
              "translate(calc(-50% + " +
              dx +
              "px),calc(-50% + " +
              (dy - 60) +
              "px)) rotate(" +
              Math.random() * 360 +
              "deg)",
            opacity: 1,
            offset: 0.55,
          },
          {
            transform:
              "translate(calc(-50% + " +
              dx +
              "px),calc(-50% + " +
              (dy + 110) +
              "px)) scale(.8)",
            opacity: 0,
          },
        ],
        {
          duration: 900 + Math.random() * 500,
          easing: "cubic-bezier(.2,.8,.3,1)",
        },
      ).onfinish = (function (el) {
        return function () {
          el.remove();
        };
      })(k);
    }
    var w = document.createElement("div");
    w.className = "pw";
    w.textContent = label || words[wi++ % 4];
    w.style.cssText =
      "left:" +
      (x - 60) +
      "px;top:" +
      (y - 24) +
      "px;font-size:" +
      (1.5 + pw * 2.5) +
      "rem";
    layer.appendChild(w);
    w.animate(
      [
        { transform: "scale(.2) rotate(-12deg)", opacity: 0 },
        { transform: "scale(1.2) rotate(-6deg)", opacity: 1, offset: 0.3 },
        { transform: "translateY(-70px) scale(1) rotate(-6deg)", opacity: 0 },
      ],
      { duration: 1000, easing: "ease-out" },
    ).onfinish = function () {
      w.remove();
    };
  }
  document.querySelectorAll("[data-pop]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      var r = el.getBoundingClientRect();
      burst(
        e.detail ? e.clientX : r.left + r.width / 2,
        e.detail ? e.clientY : r.top + r.height / 2,
        0.35,
      );
    });
  });

  var L = document.getElementById("letters");
  L.innerHTML = L.textContent
    .split("")
    .map(function (c) {
      return '<span class="l">' + c + "</span>";
    })
    .join("");
  L.addEventListener("pointerdown", function (e) {
    var s = e.target.closest(".l");
    if (!s) return;
    s.classList.remove("hop");
    void s.offsetWidth;
    s.classList.add("hop");
  });
  document.getElementById("theme").addEventListener("click", function () {
    var r = document.documentElement;
    r.setAttribute(
      "data-theme",
      r.getAttribute("data-theme") === "dark" ? "light" : "dark",
    );
  });

  var io = new IntersectionObserver(
    function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  document.querySelectorAll(".rv").forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 90 + "ms";
    io.observe(el);
  });

  /* explosion charge-and-release */
  var stage = document.getElementById("stage"),
    ctrl = document.getElementById("ctrl"),
    btn = document.getElementById("hold"),
    fill = document.getElementById("fill"),
    pct = document.getElementById("pct"),
    msg = document.getElementById("cmsg"),
    flash = document.getElementById("flash"),
    bar = ctrl.querySelector(".meter"),
    charging = false,
    p = 0,
    t0 = 0,
    casts = 0;
  function setP(v) {
    fill.style.setProperty("--p", v * 100 + "%");
    pct.textContent = Math.round(v * 100) + "%";
    bar.setAttribute("aria-valuenow", Math.round(v * 100));
  }
  function loop() {
    if (!charging) return;
    p = Math.min(1, (performance.now() - t0) / 2200);
    setP(p);
    if (p < 1) requestAnimationFrame(loop);
  }
  function start() {
    if (charging) return;
    charging = true;
    p = 0;
    t0 = performance.now();
    stage.classList.remove("spent", "boom", "back");
    ctrl.classList.add("charging");
    msg.textContent = "Charging… feel the mana!";
    loop();
  }
  function release() {
    if (!charging) return;
    charging = false;
    ctrl.classList.remove("charging");
    if (p < 0.15) {
      setP(0);
      msg.textContent = "Too weak! Hold a little longer.";
      return;
    }
    var power = p,
      r = stage.getBoundingClientRect();
    casts++;
    stage.classList.add("boom");
    msg.textContent = "EXPLOSION! Casts so far: " + casts;
    burst(r.left + r.width / 2, r.top + r.height * 0.6, power, "EXPLOSION!");
    if (!rm) {
      flash.animate([{ opacity: 0.85 * power }, { opacity: 0 }], {
        duration: 600,
      });
      var f = [];
      for (var i = 0; i < 10; i++)
        f.push({
          transform:
            "translate(" +
            (Math.random() - 0.5) * 28 * power +
            "px," +
            (Math.random() - 0.5) * 28 * power +
            "px)",
        });
      f.push({ transform: "none" });
      main.animate(f, { duration: 500 });
    }
    setTimeout(function () {
      stage.classList.add("spent");
      msg.textContent += " — and Megumin is out of mana, as usual.";
    }, 800);
    setTimeout(function () {
      stage.classList.remove("boom");
      stage.classList.add("back");
      setP(0);
    }, 2600);
  }
  btn.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    start();
  });
  addEventListener("pointerup", release);
  addEventListener("pointercancel", release);
  btn.addEventListener("keydown", function (e) {
    if ((e.key === " " || e.key === "Enter") && !e.repeat) {
      e.preventDefault();
      start();
    }
  });
  btn.addEventListener("keyup", function (e) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      release();
    }
  });
  btn.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });
})();
