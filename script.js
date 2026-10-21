(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const burstLayer = document.getElementById('burst');
  const main = document.getElementById('main');
  const colors = ['#F7E4D2', '#F6B73C', '#C34D57', '#E8693F'];
  const words = ['Explosion!', 'Kaboom!', 'Ba-boom!', '✕'];
  let wordIndex = 0;

  function burst(x, y, power, label) {
    if (reducedMotion || !burstLayer) return;

    const total = Math.round(12 + power * 55);

    for (let i = 0; i < total; i += 1) {
      const piece = document.createElement('i');
      const size = 8 + Math.random() * (10 + power * 14);
      const angle = Math.random() * 6.283;
      const distance = (50 + Math.random() * 130) * (0.6 + power);
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      piece.className = 'k';
      piece.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${colors[i % colors.length]};`;
      burstLayer.appendChild(piece);

      piece.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.3)', opacity: 1 },
          {
            transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${(dy - 60)}px)) rotate(${Math.random() * 360}deg)`,
            opacity: 1,
            offset: 0.55,
          },
          {
            transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${(dy + 110)}px)) scale(0.8)`,
            opacity: 0,
          },
        ],
        {
          duration: 900 + Math.random() * 500,
          easing: 'cubic-bezier(.2,.8,.3,1)',
        }
      ).onfinish = () => piece.remove();
    }

    const labelNode = document.createElement('div');
    labelNode.className = 'pw';
    labelNode.textContent = label || words[wordIndex++ % words.length];
    labelNode.style.cssText = `left:${x - 60}px;top:${y - 24}px;font-size:${1.5 + power * 2.5}rem;`;
    burstLayer.appendChild(labelNode);

    labelNode.animate(
      [
        { transform: 'scale(0.2) rotate(-12deg)', opacity: 0 },
        { transform: 'scale(1.2) rotate(-6deg)', opacity: 1, offset: 0.3 },
        { transform: 'translateY(-70px) scale(1) rotate(-6deg)', opacity: 0 },
      ],
      {
        duration: 1000,
        easing: 'ease-out',
      }
    ).onfinish = () => labelNode.remove();
  }

  document.querySelectorAll('[data-pop]').forEach((element) => {
    element.addEventListener('click', (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.detail ? event.clientX : rect.left + rect.width / 2;
      const y = event.detail ? event.clientY : rect.top + rect.height / 2;
      burst(x, y, 0.35);
    });
  });

  const letterNode = document.getElementById('letters');
  if (letterNode) {
    letterNode.innerHTML = [...letterNode.textContent]
      .map((character) => `<span class="l">${character}</span>`)
      .join('');
  }

  const themeButton = document.getElementById('theme');
  if (themeButton) {
    themeButton.addEventListener('click', () => {
      const root = document.documentElement;
      const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', nextTheme);
    });
  }

  const revealItems = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealItems.forEach((element, index) => {
      element.style.transitionDelay = `${(index % 4) * 90}ms`;
      observer.observe(element);
    });
  } else {
    revealItems.forEach((element) => element.classList.add('in'));
  }

  const stage = document.getElementById('stage');
  const ctrl = document.getElementById('ctrl');
  const holdButton = document.getElementById('hold');
  const fill = document.getElementById('fill');
  const percent = document.getElementById('pct');
  const message = document.getElementById('cmsg');
  const flash = document.getElementById('flash');

  if (stage && ctrl && holdButton && fill && percent && message && flash) {
    const meter = ctrl.querySelector('.meter');
    let charging = false;
    let power = 0;
    let startedAt = 0;
    let casts = 0;

    function setPower(value) {
      fill.style.setProperty('--p', `${value * 100}%`);
      const rounded = Math.round(value * 100);
      percent.textContent = `${rounded}%`;
      meter.setAttribute('aria-valuenow', String(rounded));
    }

    function updateCharge() {
      if (!charging) return;

      power = Math.min(1, (performance.now() - startedAt) / 2200);
      setPower(power);

      if (power < 1) {
        requestAnimationFrame(updateCharge);
      }
    }

    function startCharge() {
      if (charging) return;

      charging = true;
      power = 0;
      startedAt = performance.now();

      stage.classList.remove('spent', 'boom', 'back');
      ctrl.classList.add('charging');
      message.textContent = 'Charging… feel the mana!';
      updateCharge();
    }

    function releaseCharge() {
      if (!charging) return;

      charging = false;
      ctrl.classList.remove('charging');

      if (power < 0.15) {
        setPower(0);
        message.textContent = 'Too weak! Hold a little longer.';
        return;
      }

      const rect = stage.getBoundingClientRect();
      casts += 1;

      stage.classList.add('boom');
      message.textContent = `EXPLOSION! Casts so far: ${casts}`;
      burst(rect.left + rect.width / 2, rect.top + rect.height * 0.6, power, 'EXPLOSION!');

      if (!reducedMotion) {
        flash.animate([{ opacity: 0.85 * power }, { opacity: 0 }], { duration: 600 });

        const shakeFrames = [];
        for (let i = 0; i < 10; i += 1) {
          shakeFrames.push({
            transform: `translate(${((Math.random() - 0.5) * 28 * power).toFixed(2)}px, ${((Math.random() - 0.5) * 28 * power).toFixed(2)}px)`,
          });
        }
        shakeFrames.push({ transform: 'none' });

        main.animate(shakeFrames, { duration: 500 });
      }

      setTimeout(() => {
        stage.classList.add('spent');
        message.textContent += ' — and Megumin is out of mana, as usual.';
      }, 800);

      setTimeout(() => {
        stage.classList.remove('boom');
        stage.classList.add('back');
        setPower(0);
      }, 2600);
    }

    holdButton.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      startCharge();
    });

    window.addEventListener('pointerup', releaseCharge);
    window.addEventListener('pointercancel', releaseCharge);

    holdButton.addEventListener('keydown', (event) => {
      if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
        event.preventDefault();
        startCharge();
      }
    });

    holdButton.addEventListener('keyup', (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        releaseCharge();
      }
    });

    holdButton.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });
  }
})();
