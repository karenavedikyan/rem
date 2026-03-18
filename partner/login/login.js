(() => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active'); tabRegister.classList.remove('active');
    loginForm.hidden = false; registerForm.hidden = true;
  });
  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active'); tabLogin.classList.remove('active');
    registerForm.hidden = false; loginForm.hidden = true;
  });

  function showResult(formId, type, title, text) {
    const el = document.getElementById(formId + '-result');
    if (!el) return;
    el.hidden = false;
    el.classList.toggle('is-error', type === 'error');
    const t = el.querySelector('.form-result-title');
    const d = el.querySelector('.form-result-text');
    if (t) t.textContent = title;
    if (d) d.textContent = text;
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;
    if (!email || !password) { showResult('login', 'error', 'Ошибка', 'Заполните email и пароль'); return; }
    const btn = loginForm.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Вход...';
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { showResult('login', 'error', 'Ошибка', data.error || 'Неверный email или пароль'); return; }
      window.location.href = '/partner/cabinet/';
    } catch { showResult('login', 'error', 'Ошибка', 'Не удалось выполнить вход'); }
    finally { btn.disabled = false; btn.textContent = 'Войти'; }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = registerForm.email.value.trim();
    const password = registerForm.password.value;
    const name = registerForm.name.value.trim();
    const phone = registerForm.phone.value.trim();
    const type = registerForm.type.value;
    const city = registerForm.city.value.trim();
    if (!email || !password || !name) { showResult('register', 'error', 'Ошибка', 'Заполните все обязательные поля'); return; }
    if (password.length < 6) { showResult('register', 'error', 'Ошибка', 'Пароль — минимум 6 символов'); return; }
    const btn = registerForm.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Создание...';
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name, phone, type, city }) });
      const data = await res.json();
      if (!res.ok) { showResult('register', 'error', 'Ошибка', data.error || 'Не удалось создать аккаунт'); return; }
      window.location.href = '/partner/cabinet/';
    } catch { showResult('register', 'error', 'Ошибка', 'Не удалось создать аккаунт'); }
    finally { btn.disabled = false; btn.textContent = 'Создать аккаунт'; }
  });

  // Уже авторизован → сразу в кабинет
  (async () => {
    try { const r = await fetch('/api/auth/me'); const d = await r.json(); if (d.authenticated) window.location.href = '/partner/cabinet/'; } catch {}
  })();
})();
