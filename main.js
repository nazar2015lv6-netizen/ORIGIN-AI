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
      <div class="conversation-tools"><span>Private · Saved on this device</span><button type="button" class="text-button" id="exportChat">Export chat</button></div>
      <div class="messages" id="messages">${messages.map(messageHtml).join('')}</div>
      <form id="chatForm" class="prompt"><textarea id="promptInput" rows="2" placeholder="Type your message..." ${busy?'disabled':''}></textarea><div class="prompt-bottom"><span>✦ Your messages stay in this browser.</span><button class="send" type="submit" ${busy?'disabled':''}>➤</button></div></form>
      ${hasConversation ? '' : '<div class="suggestions"><button data-suggest="Give me 5 original ideas for a creative project"><span class="suggestion-icon idea">✧</span><span><b>Explore ideas</b><small>Find inspiration for your next project</small></span><i>↗</i></button><button data-suggest="Explain a difficult topic in simple words, with an example"><span class="suggestion-icon learn">⌁</span><span><b>Learn something</b><small>Make complex topics feel simple</small></span><i>↗</i></button><button data-suggest="Help me build a modern responsive website using HTML, CSS and JavaScript"><span class="suggestion-icon code">⌘</span><span><b>Build with code</b><small>Turn your idea into a real project</small></span><i>↗</i></button></div>'}
    </div>`;
  }
  if (active === 'image') return toolPage('AI Image','Create an image from your words — generated on your own device.','A cinematic landscape with glowing mountains at sunset...','Generate image','▧','Free local generation · WebGPU required · First use downloads the image model (large download).');
  if (active === 'video') return toolPage('AI Video','Create short videos from your ideas.','Describe the video you want to create...','Open free Video Studio','▷','A full video model needs several gigabytes of GPU memory and a large download. We are keeping this section free and will not pretend a still image is a video.');
  if (active === 'code') return toolPage('AI Code','Create, explain, and improve code with the local AI model.','Describe the code you need...','Generate code','⌘','Uses the same free on-device AI model as AI Chat.');
  if (active === 'history') return `<div class="page-heading"><div class="eyebrow">LIBRARY</div><h1>History</h1><p>Your recent conversation is saved in this browser.</p></div><div class="empty"><span>◷</span><b>${messages.length > 1 ? 'Recent conversation saved' : 'Nothing here yet'}</b><small>${messages.length > 1 ? 'Open AI Chat to continue your conversation.' : 'Start a new chat to see it here.'}</small><button class="primary history-open" id="openChat">Open AI Chat</button></div>`;
  return `<div class="page-heading"><div class="eyebrow">PERSONALIZATION</div><h1>Settings</h1><p>Manage your ORIGIN AI experience.</p></div><div class="settings-card"><div><b>AI mode</b><small>Runs locally in your browser</small></div><span>Free · No API key</span></div><div class="settings-card"><div><b>Interface language</b><small>App language</small></div><span>English</span></div><div class="settings-card"><div><b>Theme</b><small>Appearance</small></div><span>Dark</span></div><div class="settings-card"><div><b>Export your data</b><small>Download a backup of your conversations</small></div><button class="text-button" id="exportData">Download backup</button></div><div class="settings-card"><div><b>Conversation data</b><small>Stored only in this browser</small></div><button class="text-button" id="clearHistory">Clear history</button></div><div class="notice">Your chats stay in this browser. The first AI message downloads a language model to your device; this can take several minutes and uses device storage. Image generation may download an additional model of about 2.3 GB. No paid API is used.</div>`;
}
function renderMarkdown(source) {
  const escaped = escapeHtml(source);
  return escaped
    .replace(/```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g, (_, lang, code) => `<pre class="code-output"><code>${code.trim()}</code></pre>`)
    .replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^[-*] (.*)$/gm, '<span class="md-list-item">• $1</span>')
    .replace(/\n/g, '<br>');
}
function messageHtml(message, index) {
  const actions = message.role === 'assistant' && index > 0
    ? `<div class="message-actions"><button type="button" data-copy="${index}" title="Copy response">Copy</button></div>`
    : '';
  return `<div class="message ${message.role}"><div class="message-avatar">${message.role === 'assistant' ? '✦' : 'U'}</div><div class="message-body"><small>${message.role === 'assistant' ? 'ORIGIN AI' : 'YOU'}</small><div class="message-text">${renderMarkdown(message.text)}</div>${actions}</div></div>`;
}
function downloadFile(name, content, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportChat() {
  const body = messages.map(m => `## ${m.role === 'user' ? 'You' : 'ORIGIN AI'}\n\n${m.text}`).join('\n\n---\n\n');
  downloadFile('origin-ai-chat.md', `# ORIGIN AI conversation\n\n${body}`, 'text/markdown');
}
function exportData() {
  downloadFile('origin-ai-backup.json', JSON.stringify({ app: 'ORIGIN AI', version: 1, exportedAt: new Date().toISOString(), messages }, null, 2), 'application/json');
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

  document.querySelector('#exportChat')?.addEventListener('click', exportChat);
  document.querySelector('#exportData')?.addEventListener('click', exportData);
  document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    const item = messages[Number(button.dataset.copy)];
    if (!item) return;
    try {
      await navigator.clipboard.writeText(item.text);
      button.textContent = 'Copied!';
      setTimeout(() => { if (button.isConnected) button.textContent = 'Copy'; }, 1400);
    } catch {
      button.textContent = 'Select text to copy';
    }
  }));

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
    if (active === 'video') {
      result.innerHTML = '<div class="notice">Free video generation is still being prepared. It requires a compatible high-performance GPU and a multi-gigabyte model download. No paid API or hidden charge is used.</div>';
      return;
    }
    if (active === 'image') {
      const button = document.querySelector('#generate');
      button.disabled = true;
      button.textContent = 'Preparing image model…';
      result.innerHTML = '<div class="notice" id="imageStatus">Checking WebGPU support… The first setup downloads the model to this browser. This may take several minutes.</div>';
      try {
        if (!('gpu' in navigator)) throw new Error('WebGPU is not available in this browser/device. Try updated Chrome or Edge with hardware acceleration enabled.');
        if (!window.originImageClient) {
          const { Txt2ImgWorkerClient } = await import('https://esm.sh/web-txt2img@0.3.1');
          window.originImageClient = Txt2ImgWorkerClient.createDefault();
        }
        const client = window.originImageClient;
        const caps = await client.detect();
        if (!caps.webgpu) throw new Error('A compatible WebGPU graphics adapter was not found on this device.');
        const status = document.querySelector('#imageStatus');
        const loaded = await client.load('sd-turbo', { backendPreference: ['webgpu'] }, p => {
          if (status?.isConnected) status.textContent = p.message || 'Downloading image model…';
        });
        if (!loaded?.ok) throw new Error(loaded?.message || 'Could not load the image model.');
        if (status?.isConnected) status.textContent = 'Generating your image…';
        const { promise } = client.generate({ prompt, seed: Math.floor(Math.random() * 1000000) }, e => {
          if (status?.isConnected && e.phase) status.textContent = 'Generating image · ' + e.phase;
        });
        const generated = await promise;
        if (!generated.ok || !generated.blob) throw new Error(generated.message || generated.reason || 'Image generation failed.');
        const url = URL.createObjectURL(generated.blob);
        result.innerHTML = '<div class="generated-image"><img alt="AI generated result"><a class="download-image" download="origin-ai-image.png">Download image</a></div>';
        result.querySelector('img').src = url;
        result.querySelector('a').href = url;
      } catch (error) {
        result.innerHTML = '<div class="notice"></div>';
        result.querySelector('.notice').textContent = error.message || 'Image generation could not start.';
      } finally {
        button.disabled = false;
        button.innerHTML = 'Generate image <span>→</span>';
      }
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
