// Página inicial: marca, contato, o Eco (mascote) e o convite para instalar o app.

import { BRAND } from './brand.js';
import { $, APP_VERSION } from './util.js';

// ---------- Página inicial ----------

for (const el of document.querySelectorAll('[data-brand]')) el.textContent = BRAND[el.dataset.brand] ?? '';
document.title = BRAND.product;
document.querySelectorAll('.brand-logo').forEach((img) => {
  img.src = BRAND.logo;
  img.alt = BRAND.company;
});
$('#year').textContent = new Date().getFullYear();
$('#app-version').textContent = APP_VERSION;
// texto, sem link: o app da criança não abre páginas de fora
const contact = [BRAND.site && BRAND.site.replace(/^https?:\/\//, ''), BRAND.support]
  .filter(Boolean).join(' · ');
$('#brand-contact').textContent = contact;

// O Eco desenhado dentro da página (não como imagem): assim ele pisca e acena (app/css/app.css)
fetch(new URL('../brand/eco.svg', import.meta.url))
  .then((r) => (r.ok ? r.text() : null))
  .then((svg) => {
    const img = $('.hero-img.eco');
    if (!svg || !img) return;
    const box = document.createElement('div');
    box.className = 'hero-img eco';
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', 'Eco, o mascote');
    box.innerHTML = svg;
    img.replaceWith(box);
  })
  .catch(() => {});

// Instalar o app (Chrome no Android e no computador): convite na página inicial ao abrir, e o botão no topo.
// "Agora não" esconde o convite por 7 dias (o botão do topo continua). Instalado (ou aberto como app), não aparece.
const ADIA = 'instalar.adiado';
let installPrompt = null;
const adiado = () => {
  try {
    return Date.now() - Number(localStorage.getItem(ADIA) || 0) < 7 * 864e5;
  } catch {
    return false;
  }
};
const escondeInstalar = () => {
  $('#btn-install').classList.add('hidden');
  $('#instalar').classList.add('hidden');
};
addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installPrompt = e;
  $('#btn-install').classList.remove('hidden');
  $('#instalar').classList.toggle('hidden', adiado());
});
addEventListener('appinstalled', escondeInstalar);
async function instala() {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  escondeInstalar();
}
$('#btn-install').addEventListener('click', instala);
$('#instalar-sim').addEventListener('click', instala);
$('#instalar-nao').addEventListener('click', () => {
  $('#instalar').classList.add('hidden');
  try {
    localStorage.setItem(ADIA, String(Date.now()));
  } catch {
    // sem armazenamento: volta a perguntar na próxima vez
  }
});
