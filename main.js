import './style.css';

const root = document.querySelector('#root');
const icons = {
  chat:'✧', image:'▧', video:'▷', code:'⌘', history:'◷', settings:'⚙',
  send:'➤', plus:'+', spark:'✦', user:'◉', menu:'☰'
};
let active = 'chat';
let messages = [{role:'assistant', text:'Hello! I'm ORIGIN AI. How can I help you today?'}];
let credits = 120;
let sending = false;

function navItem(id, label, icon) {
  return `<button class="nav-item ${active===id?'active':''}" data-page="${id}"><span>${icon}</span><b>${label}</b></button>`;
}
function shell() {
  root.innerHTML = `
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand"><div class="brand-mark">O</div><div><strong>ORIGIN<span> AI</span></strong><small>Your Intelligence. Your Possibilities.</small></div></div>
      <button class="new-chat" id="newChat"><span>＋</span> New chat</button>
      <div class="nav-label">WORKSPACE</div>
      ${navItem('chat','AI Chat','✧')}
      ${navItem('image','AI Image','▧')}
      ${navItem('video','AI Video','▷')}
      ${navItem('code','AI Code','⌘')}
      <div class="nav-label second">LIBRARY</div>
      ${navItem('history','History','◷')}
      ${navItem('settings','Settings','⚙')}
      <div class="sidebar-bottom">
        <div class="credits"><div class="credit-top"><span>Your credits</span><b>${credits} / 200</b></div><div class="progress"><i style="width:${credits/2}%"></i></div><small>Credits for AI tools</small></div>
        <div class="profile"><div class="avatar">U</div><div><b>My account</b><small>Free plan</small></div><span class="dots">•••</span></div>
      </div>
    </aside>
    <main class="main">
      <header class="topbar"><button class="mobile-menu" id="mobileMenu">☰</button><div class="crumb">ORIGIN AI <span>/</span> <b>${pageTitle()}</b></div><div class="top-actions"><span class="status"><i></i> System online</span><button class="upgrade">✦ Upgrade plan</button><div class="avatar small">U</div></div></header>
      <section class="content" id="content">${pageContent()}</section>
    </main>
  </div>`;
  bind();
}
function pageTitle(){return ({chat:'AI Chat',image:'AI Image',video:'AI Video',code:'AI Code',history:'History',settings:'Settings'})[active]}
function pageContent(){
 if(active==='chat') return `<div class="welcome"><div class="eyebrow"><span>✦</span> YOUR CREATIVE AI COMPANION</div><h1>Your idea.<br><em>Our intelligence.</em></h1><p>Ask, create, and explore. ORIGIN AI helps turn<br class="desktop"> your thoughts into something amazing.</p></div>
 <div class="chat-wrap"><div class="messages" id="messages">${messages.map(m=>`<div class="message ${m.role}"><div class="message-avatar">${m.role==='assistant'?'✦':'U'}</div><div class="message-body"><small>${m.role==='assistant'?'ORIGIN AI':'YOU'}</small><p>${escapeHtml(m.text)}</p></div></div>`).join('')}</div><form id="chatForm" class="prompt"><textarea id="promptInput" rows="1" placeholder="Type your message..."></textarea><div class="prompt-bottom"><span>✦ ORIGIN AI can make mistakes. Check important information.</span><button class="send" type="submit">➤</button></div></form><div class="suggestions"><button data-suggest="Help me come up with a project idea">✦ Get an idea</button><button data-suggest="Explain a difficult topic simply">⌁ Explain a topic</button><button data-suggest="Write a plan for my project">▤ Create a plan</button></div></div>`;
 if(active==='image') return toolPage('AI Image','Turn a text prompt into a unique image.','Describe the image you want to create...','Generate image','▧','Image generation requires a connected AI service.');
 if(active==='video') return toolPage('AI Video','Create short videos from your ideas.','Describe the video you want to create...','Generate video · 5 sec','▷','Video generation requires a compatible video service.');
 if(active==='code') return toolPage('AI Code','Create, explain, and improve code with AI.','What would you like to code?','Generate code','⌘','AI coding requires a connected AI service.');
 if(active==='history') return `<div class="page-heading"><div class="eyebrow">LIBRARY</div><h1>History</h1><p>Your previous chats and creations will appear here.</p></div><div class="empty"><span>◷</span><b>Nothing here yet</b><small>Start a new chat to see it here.</small></div>`;
 return `<div class="page-heading"><div class="eyebrow">PERSONALIZATION</div><h1>Settings</h1><p>Manage your ORIGIN AI experience.</p></div><div class="settings-card"><div><b>Profile</b><small>Settings акаунта</small></div><span>Not signed in</span></div><div class="settings-card"><div><b>Interface language</b><small>App language</small></div><select><option>English</option><option>English</option></select></div><div class="settings-card"><div><b>Theme</b><small>Appearance</small></div><span>Dark</span></div><div class="notice">Sign-up, account sync, and payments can be added separately.</div>`;
}
function toolPage(title,desc,placeholder,button,icon,note){
 return `<div class="page-heading"><div class="eyebrow">✦ CREATIVE STUDIO</div><h1>${title}</h1><p>${desc}</p></div><div class="tool-card"><div class="tool-icon">${icon}</div><label>YOUR PROMPT</label><textarea id="toolPrompt" rows="4" placeholder="${placeholder}"></textarea><div class="tool-options">${active==='video'?'<span>Duration <b>5 seconds</b></span><span>Format <b>16:9</b></span>':'<span>Model <b>ORIGIN default</b></span>'}</div><button class="primary" id="generate">${button} <span>→</span></button><small class="tool-note">${note}</small><div id="toolResult"></div></div>`;
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function bind(){
 document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{active=b.dataset.page;shell()});
 document.querySelector('#newChat')?.addEventListener('click',()=>{messages=[{role:'assistant',text:'A new chat has started. How can I help?'}];active='chat';shell()});
 document.querySelector('#mobileMenu')?.addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('show'));
 document.querySelectorAll('[data-suggest]').forEach(b=>b.onclick=()=>{document.querySelector('#promptInput').value=b.dataset.suggest;document.querySelector('#promptInput').focus()});
 document.querySelector('#chatForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const input=document.querySelector('#promptInput');
  const t=input.value.trim();
  if(!t || sending) return;
  sending=true;
  messages.push({role:'user',text:t},{role:'assistant',text:'Thinking…'});
  shell();
  try {
    const response=await fetch('/api/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({messages:messages.slice(-12,-1).map(m=>({role:m.role,content:m.text}))})
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error || 'Could not get a response from AI.');
    messages[messages.length-1].text=data.reply || 'The AI returned no text response.';
  } catch(err) {
    messages[messages.length-1].text=err.message || 'Something went wrong. Please try again later.';
  } finally {
    sending=false;
    shell();
  }
 });
 document.querySelector('#generate')?.addEventListener('click',()=>{const p=document.querySelector('#toolPrompt').value.trim();if(!p){document.querySelector('#toolResult').innerHTML='<p class="warn">Please enter a prompt first.</p>';return;}document.querySelector('#toolResult').innerHTML='<div class="notice">The interface is ready. Real generation requires a connected service. Never put secret API keys in frontend code.</div>';});
}
shell();
