import './style.css';

const root = document.querySelector('#root');
const MODEL = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';
let engine = null;
let enginePromise = null;
let active = 'chat';
let busy = false;
let credits = 120;
let messages = loadMessages();

function loadMessages() {
  try {
    const saved = JSON.parse(localStorage.getItem('origin-ai-messages') || '[]');
    return Array.isArray(saved) && saved.length ? saved : [{ role: 'assistant', text: "Hello! I'm ORIGIN AI. What would you like to create today?" }];
  } catch {
    return [{ role: 'assistant', text: "Hello! I'm ORIGIN AI. What would you like to create today?" }];
  }
}
function saveMessages() {
  localStorage.setItem('origin-ai-messages', JSON.stringify(messages.slice(-80)));
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function navItem(id, label, icon) {
  return `<button class="nav-item ${active === id ? 'active' : ''}" data-page="${id}"><span>${icon}</span><b>${label}</b></button>`;
}
function pageTitle() {
  return ({ chat:'AI Chat', image:'AI Image', video:'AI Video', code:'AI Code', history:'History', settings:'Settings' })[active];
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
          <div class="credits"><div class="credit-top"><span>Local AI model</span><b>Free</b></div><div class="progress"><i style="width:100%"></i></div><small>Runs in your browser. No API key.</small></div>
          <div class="profile"><div class="avatar">U</div><div><b>My workspace</b><small>Local mode</small></div><span class="dots">•••</span></div>
        </div>
      </aside>
      <main class="main">
        <header class="topbar"><button class="mobile-menu" id="mobileMenu">☰</button><div class="crumb"><b>${pageTitle()}</b><span class="model-pill">⌄ ORIGIN Free</span></div><div class="top-actions"><span class="status"><i></i> Browser AI mode</span><div class="avatar small">O</div></div></header>
        <section class="content" id="content">${pageContent()}</section>
      </main>
    </div>`;
  bind();
  const messageList = document.querySelector('#messages');
  if (messageList) messageList.scrollTop = messageList.scrollHeight;
}
function pageContent() {
  if (active === 'chat') {
    const hasConversation = messages.some(message => message.role === 'user');
    return `
    ${hasConversation ? '' : '<div class="welcome"><div class="welcome-orbit"><div class="welcome-mark">✦</div></div><div class="welcome-kicker"><i></i> YOUR CREATIVE AI WORKSPACE</div><h1>Make something<br><span>extraordinary.</span></h1><p>Ideas, answers, code and creativity — all starting with one message.</p></div>'}
    <div class="chat-wrap ${hasConversation ? 'has-conversation' : ''}"><div class="model-status" id="modelStatus">Free on-device AI · Loads when you send your first message.</div>
      <div class="messages" id="messages">${messages.map(messageHtml).join('')}</div>
      <form id="chatForm" class="prompt"><textarea id="promptInput" rows="2" placeholder="Type your message..." ${busy?'disabled':''}></textarea><div class="prompt-bottom"><span>✦ Your messages stay in this browser.</span><button class="send" type="submit" ${busy?'disabled':''}>➤</button></div></form>
      ${hasConversation ? '' : '<div class="suggestions"><button data-suggest="Give me 5 original ideas for a creative project"><span class="suggestion-icon idea">✧</span><span><b>Explore ideas</b><small>Find inspiration for your next project</small></span><i>↗</i></button><button data-suggest="Explain a difficult topic in simple words, with an example"><span class="suggestion-icon learn">⌁</span><span><b>Learn something</b><small>Make complex topics feel simple</small></span><i>↗</i></button><button data-suggest="Help me build a modern responsive website using HTML, CSS and JavaScript"><span class="suggestion-icon code">⌘</span><span><b>Build with code</b><small>Turn your idea into a real project</small></span><i>↗</i></button></div>'}
    </div>`;
  }
  if (active === 'image') return toolPage('AI Image','Turn a text prompt into a unique image.','Describe the image you want to create...','Generate image','▧','Image generation is not connected yet. This free build does not use a paid image API.');
  if (active === 'video') return toolPage('AI Video','Create short videos from your ideas.','Describe the video you want to create...','Generate video · 5 sec','▷','5-second video generation needs a separate video model. It is not enabled in this free browser build.');
  if (active === 'code') return toolPage('AI Code','Create, explain, and improve code with the local AI model.','Describe the code you need...','Generate code','⌘','Uses the same free on-device AI model as AI Chat.');
  if (active === 'history') return `<div class="page-heading"><div class="eyebrow">LIBRARY</div><h1>History</h1><p>Your recent conversation is saved in this browser.</p></div><div class="empty"><span>◷</span><b>${messages.length > 1 ? 'Recent conversation saved' : 'Nothing here yet'}</b><small>${messages.length > 1 ? 'Open AI Chat to continue your conversation.' : 'Start a new chat to see it here.'}</small><button class="primary history-open" id="openChat">Open AI Chat</button></div>`;
  return `<div class="page-heading"><div class="eyebrow">PERSONALIZATION</div><h1>Settings</h1><p>Manage your ORIGIN AI experience.</p></div><div class="settings-card"><div><b>AI mode</b><small>Runs locally in your browser</small></div><span>Free · No API key</span></div><div class="settings-card"><div><b>Interface language</b><small>App language</small></div><span>English</span></div><div class="settings-card"><div><b>Theme</b><small>Appearance</small></div><span>Dark</span></div><div class="settings-card"><div><b>Conversation data</b><small>Stored only in this browser</small></div><button class="text-button" id="clearHistory">Clear history</button></div><div class="notice">The first AI message downloads a language model to your device. This can take a few minutes and uses device storage.</div>`;
}
function messageHtml(message) {
  return `<div class="message ${message.role}"><div class="message-avatar">${message.role === 'assistant' ? '✦' : 'U'}</div><div class="message-body"><small>${message.role === 'assistant' ? 'ORIGIN AI' : 'YOU'}</small><p>${escapeHtml(message.text)}</p></div></div>`;
}
function toolPage(title, desc, placeholder, button, icon, note) {
  return `<div class="page-heading"><div class="eyebrow">✦ CREATIVE STUDIO</div><h1>${title}</h1><p>${desc}</p></div><div class="tool-card"><div class="tool-icon">${icon}</div><label>YOUR PROMPT</label><textarea id="toolPrompt" rows="4" placeholder="${placeholder}"></textarea><div class="tool-options"><span>Mode <b>${active === 'video' ? '5 seconds · 16:9' : 'Free browser mode'}</b></span></div><button class="primary" id="generate">${button} <span>→</span></button><small class="tool-note">${note}</small><div id="toolResult"></div></div>`;
}
async function getEngine(statusElement) {
  if (engine) return engine;
  if (enginePromise) return enginePromise;
  enginePromise = (async () => {
    if (!('gpu' in navigator)) throw new Error('This browser or device does not support WebGPU. Try the latest Chrome or Edge on a compatible device.');
    statusElement.textContent = 'Loading the free AI model… The first download may be large. Please keep this tab open.';
    const { CreateMLCEngine } = await import('https://esm.run/@mlc-ai/web-llm');
    engine = await CreateMLCEngine(MODEL, {
      initProgressCallback: progress => {
        if (statusElement && statusElement.isConnected) statusElement.textContent = progress.text || 'Preparing AI model…';
      }
    });
    if (statusElement && statusElement.isConnected) statusElement.textContent = 'AI model ready · Running on your device';
    return engine;
  })();
  try { return await enginePromise; }
  catch (error) { enginePromise = null; throw error; }
}
function bind() {
  document.querySelectorAll('[data-page]').forEach(button => button.onclick = () => { active = button.dataset.page; document.querySelector('.sidebar')?.classList.remove('show'); shell(); });
  document.querySelector('#newChat')?.addEventListener('click', () => {
    messages = [];
    saveMessages(); active = 'chat'; shell();
  });
  document.querySelector('#mobileMenu')?.addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('show'));
  document.querySelector('#promptInput')?.addEventListener('input', event => {
    event.target.style.height = 'auto';
    event.target.style.height = Math.min(event.target.scrollHeight, 180) + 'px';
  });
  document.querySelector('#promptInput')?.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      document.querySelector('#chatForm')?.requestSubmit();
    }
  });
  document.querySelectorAll('[data-suggest]').forEach(button => button.onclick = () => {
    const input = document.querySelector('#promptInput');
    if (input) { input.value = button.dataset.suggest; input.focus(); }
  });
  document.querySelector('#openChat')?.addEventListener('click', () => { active = 'chat'; shell(); });
  document.querySelector('#clearHistory')?.addEventListener('click', () => {
    messages = [];
    saveMessages(); shell();
  });
  document.querySelector('#chatForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const input = document.querySelector('#promptInput');
    const prompt = input.value.trim();
    if (!prompt || busy) return;
    busy = true;
    messages.push({ role:'user', text:prompt }, { role:'assistant', text:'Preparing the local AI model…' });
    saveMessages(); shell();
    const status = document.querySelector('#modelStatus');
    try {
      const ai = await getEngine(status);
      const response = await ai.chat.completions.create({
        messages: [
          { role:'system', content:'You are ORIGIN AI, a helpful, friendly assistant. Answer clearly and safely. Use the same language as the user.' },
          ...messages.slice(-13, -1).map(message => ({ role:message.role, content:message.text }))
        ],
        temperature:0.7,
        max_tokens:700
      });
      messages[messages.length - 1].text = response.choices?.[0]?.message?.content?.trim() || 'I could not create a response. Please try again.';
    } catch (error) {
      messages[messages.length - 1].text = error.message || 'The local AI model could not start. Please try again.';
    } finally {
      busy = false; saveMessages(); shell();
    }
  });
  document.querySelector('#generate')?.addEventListener('click', async () => {
    const prompt = document.querySelector('#toolPrompt').value.trim();
    const result = document.querySelector('#toolResult');
    if (!prompt) { result.innerHTML = '<p class="warn">Please enter a prompt first.</p>'; return; }
    if (active !== 'code') {
      result.innerHTML = '<div class="notice">This feature is not available in the free browser build yet. No payment or API key has been requested.</div>';
      return;
    }
    const button = document.querySelector('#generate');
    button.disabled = true; button.textContent = 'Generating…';
    result.textContent = 'Loading the local AI model…';
    try {
      const ai = await getEngine(result);
      const response = await ai.chat.completions.create({
        messages:[
          { role:'system', content:'You are ORIGIN AI Code, an expert programming assistant. Provide correct code and explain briefly. Use Markdown code fences.' },
          { role:'user', content:prompt }
        ],
        temperature:0.3,
        max_tokens:900
      });
      result.innerHTML = '<pre class="code-output"></pre>';
      result.querySelector('pre').textContent = response.choices?.[0]?.message?.content || 'No code was returned.';
    } catch (error) {
      result.textContent = error.message || 'Could not start the local AI model.';
    } finally {
      button.disabled = false; button.innerHTML = 'Generate code <span>→</span>';
    }
  });
}
shell();
