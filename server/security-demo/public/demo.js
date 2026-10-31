// External file (not inline) so it still runs under Helmet's CSP in secure mode.
const out = document.getElementById('login-result');

async function login(body) {
  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  out.textContent = `HTTP ${res.status}\n` + JSON.stringify(data, null, 2);
  out.className = data.ok ? 'ok' : 'fail';
}

document.getElementById('login').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  login({ email: form.get('email'), password: form.get('password') });
});

document.getElementById('attack').addEventListener('click', () => {
  login({ email: { $ne: null }, password: { $ne: null } });
});
