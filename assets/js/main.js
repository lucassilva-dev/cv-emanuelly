(() => {
  const THEME_DARK = "dark";
  const THEME_LIGHT = "light";
  const EVENT_CLICK = "click";
  const EVENT_MOUSE_ENTER = "mouseenter";
  const EVENT_MOUSE_LEAVE = "mouseleave";
  const EVENT_FOCUS_IN = "focusin";
  const EVENT_FOCUS_OUT = "focusout";
  const VISIBLE_CLASS = "is-visible";
  const SUN_ICON_ID = "#i-sun";
  const MOON_ICON_ID = "#i-moon";
  const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";
  const ACCENT_H = "--accent-h";
  const ACCENT_S = "--accent-s";
  const ACCENT_L = "--accent-l";
  const TOAST_TIMEOUT_MS = 1400;
  const AUTOPLAY_INTERVAL_MS = 4500;

  const storageKeys = {
    theme: "emanuelly:theme",
    accent: "emanuelly:accent"
  };

  const root = document.documentElement;
  const body = document.body;
  const toast = document.querySelector("[data-toast]");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeIcon = document.querySelector("[data-theme-icon]");
  const swatches = Array.from(document.querySelectorAll("[data-accent]"));
  const printTriggers = Array.from(document.querySelectorAll("[data-print-trigger]"));
  const copyEmailButton = document.querySelector("[data-copy-email]");
  const emailLink = document.querySelector("[data-email-link]");
  const testimonialTrack = document.querySelector("[data-testimonial-track]");

  let toastTimer;

  function showToast(message) {
    if (!toast) {
      return;
    }

    globalThis.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add(VISIBLE_CLASS);

    toastTimer = globalThis.setTimeout(() => {
      toast.classList.remove(VISIBLE_CLASS);
    }, TOAST_TIMEOUT_MS);
  }

  function updateThemeIcon(theme) {
    if (!themeIcon) {
      return;
    }

    themeIcon.setAttribute("href", theme === THEME_DARK ? SUN_ICON_ID : MOON_ICON_ID);
  }

  function applyTheme(theme) {
    body.dataset.theme = theme;
    updateThemeIcon(theme);
    localStorage.setItem(storageKeys.theme, theme);
  }

  function getInitialTheme() {
    const storedTheme = localStorage.getItem(storageKeys.theme);

    if (storedTheme) {
      return storedTheme;
    }

    return globalThis.matchMedia(DARK_SCHEME_QUERY).matches ? THEME_DARK : THEME_LIGHT;
  }

  function syncActiveSwatch(currentValue) {
    swatches.forEach((swatch) => {
      swatch.classList.toggle("is-active", swatch.dataset.accent === currentValue);
    });
  }

  function applyAccent(accent) {
    root.style.setProperty(ACCENT_H, accent.h);
    root.style.setProperty(ACCENT_S, accent.s);
    root.style.setProperty(ACCENT_L, accent.l);

    localStorage.setItem(storageKeys.accent, JSON.stringify(accent));
    syncActiveSwatch(`${accent.h},${accent.s},${accent.l}`);
  }

  function parseAccent(value) {
    const [h, s, l] = value.split(",").map((item) => item.trim());
    return { h, s, l };
  }

  function isClipboardApiAvailable() {
    return Boolean(navigator.clipboard?.writeText) && globalThis.isSecureContext;
  }

  async function copyText(text) {
    if (!isClipboardApiAvailable()) {
      throw new Error("Clipboard API unavailable");
    }

    await navigator.clipboard.writeText(text);
  }

  function selectText(element) {
    const selection = globalThis.getSelection();

    if (!selection) {
      return;
    }

    const range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function initTheme() {
    applyTheme(getInitialTheme());

    if (!themeToggle) {
      return;
    }

    themeToggle.addEventListener(EVENT_CLICK, () => {
      const nextTheme = body.dataset.theme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
      applyTheme(nextTheme);
    });
  }

  function initAccent() {
    const storedAccent = localStorage.getItem(storageKeys.accent);

    if (storedAccent) {
      try {
        applyAccent(JSON.parse(storedAccent));
      } catch {
        localStorage.removeItem(storageKeys.accent);
      }
    } else if (swatches[0]) {
      syncActiveSwatch(swatches[0].dataset.accent);
    }

    swatches.forEach((swatch) => {
      swatch.addEventListener(EVENT_CLICK, () => {
        applyAccent(parseAccent(swatch.dataset.accent));
      });
    });
  }

  function initPrint() {
    printTriggers.forEach((trigger) => {
      trigger.addEventListener(EVENT_CLICK, () => globalThis.print());
    });
  }

  function initCopyEmail() {
    if (!copyEmailButton || !emailLink) {
      return;
    }

    copyEmailButton.addEventListener(EVENT_CLICK, async () => {
      const emailText = emailLink.textContent?.trim();

      if (!emailText) {
        showToast("E-mail indisponível.");
        return;
      }

      try {
        await copyText(emailText);
        showToast("E-mail copiado!");
      } catch {
        selectText(emailLink);
        showToast("Copie o e-mail selecionado.");
      }
    });
  }

  function initTestimonials() {
    if (!testimonialTrack) {
      return;
    }

    const slides = Array.from(testimonialTrack.children);

    if (slides.length < 2) {
      return;
    }

    let currentIndex = 0;
    let autoplayId;

    const stopAutoplay = () => {
      globalThis.clearInterval(autoplayId);
    };

    const nextSlide = () => {
      currentIndex = (currentIndex + 1) % slides.length;
      testimonialTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
    };

    const startAutoplay = () => {
      stopAutoplay();
      autoplayId = globalThis.setInterval(nextSlide, AUTOPLAY_INTERVAL_MS);
    };

    startAutoplay();
    testimonialTrack.addEventListener(EVENT_MOUSE_ENTER, stopAutoplay);
    testimonialTrack.addEventListener(EVENT_MOUSE_LEAVE, startAutoplay);
    testimonialTrack.addEventListener(EVENT_FOCUS_IN, stopAutoplay);
    testimonialTrack.addEventListener(EVENT_FOCUS_OUT, startAutoplay);
  }

  function init() {
    initTheme();
    initAccent();
    initPrint();
    initCopyEmail();
    initTestimonials();
  }

  init();
})();
