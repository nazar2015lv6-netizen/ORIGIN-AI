import './style.css';

const root = document.querySelector('#root');
const icons = {
  chat:'✧', image:'▧', video:'▷', code:'⌘', history:'◷', settings:'⚙',
  send:'➤', plus:'+', spark:'✦', user:'◉', menu:'☰'
};
let active = 'chat';
let messages = [{role:'assistant', text:'Привіт! Я ORIGIN AI. Чим можу допомогти сьогодні?'}];
let credits = 120;

function navItem(id, label, icon) {
  return `<button class="nav-item ${active===id?'active':''}" data-page="${id}"><span>${icon}</span><b>${label}</b></button>`;
}
function shell() {
  root.innerHTML = `
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand"><div class="brand-mark">O</div><div><strong>ORIGIN<span> AI</span></strong><small>Your Intelligence. Your Possibilities.</small></div></div>
      <button class="new-chat" id="newChat"><span>＋</span> Нова розмова</button>
      <div class="nav-label">WORKSPACE</div>
      ${navItem('chat','AI Чат','✧')}
      ${navItem('image','AI Зображення','▧')}
      ${navItem('video','AI Відео','▷')}
      ${navItem('code','AI Код','⌘')}
      <div class="nav-label second">LIBRARY</div>
      ${navItem('history','Історія','◷')}
      ${navItem('settings','Налаштування','⚙')}
      <div class="sidebar-bottom">
        <div class="credits"><div class="credit-top"><span>Ваші кредити</span><b>${credits} / 200</b></div><div class="progress"><i style="width:${credits/2}%"></i></div><small>Кредити для AI-інструментів</small></div>
        <div class="profile"><div class="avatar">U</div><div><b>Мій акаунт</b><small>Безкоштовний план</small></div><span class="dots">•••</span></div>
      </div>
    </aside>
    <main class="main">
      <header class="topbar"><button class="mobile-menu" id="mobileMenu">☰</button><div class="crumb">ORIGIN AI <span>/</span> <b>${pageTitle()}</b></div><div class="top-actions"><span class="status"><i></i> Система активна</span><button class="upgrade">✦ Покращити план</button><div class="avatar small">U</div></div></header>
      <section class="content" id="content">${pageContent()}</section>
    </main>
  </div>`;
  bind();
}
function pageTitle(){return ({chat:'AI Чат',image:'AI Зображення',video:'AI Відео',code:'AI Код',history:'Історія',settings:'Налаштування'})[active]}
function pageContent(){
 if(active==='chat') return `<div class="welcome"><div class="eyebrow"><span>✦</span> YOUR CREATIVE AI COMPANION</div><h1>Твоя ідея.<br><em>Наш інтелект.</em></h1><p>Запитуй, створюй, досліджуй. ORIGIN AI допоможе перетворити<br class="desktop"> твої думки на щось неймовірне.</p></div>
 <div class="chat-wrap"><div class="messages" id="messages">${messages.map(m=>`<div class="message ${m.role}"><div class="message-avatar">${m.role==='assistant'?'✦':'U'}</div><div class="message-body"><small>${m.role==='assistant'?'ORIGIN AI':'ВИ'}</small><p>${escapeHtml(m.text)}</p></div></div>`).join('')}</div><form id="chatForm" class="prompt"><textarea id="promptInput" rows="1" placeholder="Напиши своє повідомлення..."></textarea><div class="prompt-bottom"><span>✦ ORIGIN AI може помилятися. Перевіряй важливу інформацію.</span><button class="send" type="submit">➤</button></div></form><div class="suggestions"><button data-suggest="Допоможи придумати ідею для проєкту">✦ Придумай ідею</button><button data-suggest="Поясни складну тему просто">⌁ Поясни тему</button><button data-suggest="Напиши план для мого проєкту">▤ Створи план</button></div></div>`;
 if(active==='image') return toolPage('AI Зображення','Перетвори текстовий опис на унікальне зображення.','Опиши зображення, яке хочеш створити...','Створити зображення','▧','Генерація зображень потребує підключення AI API.');
 if(active==='video') return toolPage('AI Відео','Створюй короткі відео зі своїх ідей.','Опиши відео, яке хочеш створити...','Створити відео · 5 сек','▷','Генерація відео потребує підключення сумісного відео API.');
 if(active==='code') return toolPage('AI Код','Створюй, пояснюй та вдосконалюй код разом з AI.','Що потрібно запрограмувати?','Згенерувати код','⌘','AI-кодування потребує підключення AI API.');
 if(active==='history') return `<div class="page-heading"><div class="eyebrow">LIBRARY</div><h1>Історія</h1><p>Твої попередні розмови та створення з'являтимуться тут.</p></div><div class="empty"><span>◷</span><b>Поки що порожньо</b><small>Почни нову розмову, щоб побачити її тут.</small></div>`;
 return `<div class="page-heading"><div class="eyebrow">PERSONALIZATION</div><h1>Налаштування</h1><p>Керуй своїм досвідом ORIGIN AI.</p></div><div class="settings-card"><div><b>Профіль</b><small>Налаштування акаунта</small></div><span>Без входу</span></div><div class="settings-card"><div><b>Мова інтерфейсу</b><small>Мова застосунку</small></div><select><option>Українська</option><option>English</option></select></div><div class="settings-card"><div><b>Тема</b><small>Зовнішній вигляд</small></div><span>Темна</span></div><div class="notice">Реєстрація, синхронізація акаунта та платіжна система підключаються окремо.</div>`;
}
function toolPage(title,desc,placeholder,button,icon,note){
 return `<div class="page-heading"><div class="eyebrow">✦ CREATIVE STUDIO</div><h1>${title}</h1><p>${desc}</p></div><div class="tool-card"><div class="tool-icon">${icon}</div><label>ТВІЙ ЗАПИТ</label><textarea id="toolPrompt" rows="4" placeholder="${placeholder}"></textarea><div class="tool-options">${active==='video'?'<span>Тривалість <b>5 секунд</b></span><span>Формат <b>16:9</b></span>':'<span>Модель <b>ORIGIN default</b></span>'}</div><button class="primary" id="generate">${button} <span>→</span></button><small class="tool-note">${note}</small><div id="toolResult"></div></div>`;
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function bind(){
 document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{active=b.dataset.page;shell()});
 document.querySelector('#newChat')?.addEventListener('click',()=>{messages=[{role:'assistant',text:'Нова розмова розпочалася. Чим можу допомогти?'}];active='chat';shell()});
 document.querySelector('#mobileMenu')?.addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('show'));
 document.querySelectorAll('[data-suggest]').forEach(b=>b.onclick=()=>{document.querySelector('#promptInput').value=b.dataset.suggest;document.querySelector('#promptInput').focus()});
 document.querySelector('#chatForm')?.addEventListener('submit',e=>{e.preventDefault();const input=document.querySelector('#promptInput');const t=input.value.trim();if(!t)return;messages.push({role:'user',text:t},{role:'assistant',text:'Демо-режим: інтерфейс готовий, але AI-модель ще не підключена. Щоб отримувати справжні відповіді, потрібно налаштувати серверний API-ключ.'});credits=Math.max(0,credits-1);shell()});
 document.querySelector('#generate')?.addEventListener('click',()=>{const p=document.querySelector('#toolPrompt').value.trim();if(!p){document.querySelector('#toolResult').innerHTML='<p class="warn">Спочатку напиши опис.</p>';return;}document.querySelector('#toolResult').innerHTML='<div class="notice">Інтерфейс готовий. Для справжньої генерації потрібно підключити API відповідного сервісу. Не вставляй секретні API-ключі у фронтенд.</div>';});
}
shell();
