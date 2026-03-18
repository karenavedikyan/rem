// theme.js — подключать в <head> СИНХРОННО (без defer/async) чтобы избежать мигания
(function() {
  var STORAGE_KEY = 'remcard-theme';
  var saved = localStorage.getItem(STORAGE_KEY) || 'auto';

  function resolveTheme(pref) {
    if (pref === 'light') return 'light';
    if (pref === 'dark') return 'dark';
    // auto: 07:00 — 19:59 = light, else dark
    var hour = new Date().getHours();
    return (hour >= 7 && hour < 20) ? 'light' : 'dark';
  }

  var theme = resolveTheme(saved);
  document.documentElement.setAttribute('data-theme', theme);

  // Экспортируем для использования переключателем
  window.__REMCARD_THEME = {
    current: saved,      // 'auto' | 'light' | 'dark'
    resolved: theme,     // 'light' | 'dark'
    apply: function(pref) {
      localStorage.setItem(STORAGE_KEY, pref);
      this.current = pref;
      this.resolved = resolveTheme(pref);
      document.documentElement.setAttribute('data-theme', this.resolved);
      // Иконка обновляется в script.js через updateUI() (SVG use href)
      var labelEl = document.querySelector('.theme-switch-label');
      if (labelEl) {
        labelEl.textContent = pref === 'auto' ? 'Авто' : (this.resolved === 'light' ? 'День' : 'Ночь');
      }
    }
  };
})();
