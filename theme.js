// Run before styles to restore the theme without a light flash.
(() => {
  "use strict";
  const key = "demo-commercial-theme";
  const root = document.documentElement;
  const system = window.matchMedia("(prefers-color-scheme: dark)");
  let preference = null;
  try {
    const saved = localStorage.getItem(key);
    if (saved === "light" || saved === "dark") preference = saved;
  } catch {
    /* Storage can be unavailable for local files or private sessions. */
  }
  function apply(theme) {
    root.dataset.theme = theme;
    document
      .getElementById("theme-toggle")
      ?.setAttribute("aria-pressed", String(theme === "dark"));
  }
  apply(preference || (system.matches ? "dark" : "light"));
  system.addEventListener("change", (event) => {
    if (!preference) apply(event.matches ? "dark" : "light");
  });
  document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("theme-toggle");
    apply(root.dataset.theme);
    toggle.addEventListener("click", () => {
      preference = root.dataset.theme === "dark" ? "light" : "dark";
      apply(preference);
      try {
        localStorage.setItem(key, preference);
      } catch {
        /* Keep session theme. */
      }
    });
  });
})();
