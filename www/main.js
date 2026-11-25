import './style.css';

const app = document.querySelector('#app');

app.innerHTML = `
  <div class="app">
    <aside class="sidebar">
      <h2>✦ ORIGIN AI</h2>
      <nav>
        <button data-page="chat">💬 AI Chat</button>
        <button data-page="image">🎨 AI Image</button>
        <button data-page="video">🎬 AI Video</button>
        <button data-page="code">💻 AI Code</button>
        <button data-page="history">🕘 History</button>
        <button data-page="settings">⚙️ Settings</button>
      </nav>
    </aside>

    <main class="main">
      <header><span>ORIGIN AI</span><span>AI Workspace</span></header>
      <section id="content">
        <h1>Welcome to ORIGIN AI</h1>
        <p>Your creative AI workspace.</p>
        <textarea id="prompt" placeholder="Ask ORIGIN AI anything..."></textarea>
        <button id="send">Send message</button>
        <p id="answer"></p>
      </section>
    </main>
  </div>
`;

document.querySelectorAll('[data-page]').forEach(button => {
  button.addEventListener('click', () => {
    const page = button.dataset.page;
    document.querySelector('#content').innerHTML = `
      <h1>${page.toUpperCase()}</h1>
      <p>Welcome to ORIGIN AI ${page}.</p>
      <textarea id="prompt" placeholder="Enter your prompt..."></textarea>
      <button id="send">Generate</button>
      <p id="answer"></p>
    `;
    connectButton();
  });
});

function connectButton() {
  document.querySelector('#send').addEventListener('click', () => {
    const prompt = document.querySelector('#prompt').value.trim();
    document.querySelector('#answer').textContent =
      prompt ? 'ORIGIN AI demo: AI connection will be added next.' : 'Enter a prompt first.';
  });
}

connectButton();
