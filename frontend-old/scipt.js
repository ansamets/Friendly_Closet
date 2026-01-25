// --- STATE MANAGEMENT ---
const DB_KEY = 'wardrobe_app_modern';
let appData = { users: {} };
let currentUser = null;

// --- INITIALIZATION ---
function init() {
    loadData();
    // Events
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('add-item-form').addEventListener('submit', handleAddItem);
    document.getElementById('add-friend-form').addEventListener('submit', handleAddFriend);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

// --- TAB NAVIGATION SYSTEM ---
function switchTab(tabId, navBtn) {
    // 1. Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });

    // 2. Remove active state from all nav buttons
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
    });

    // 3. Show selected page
    document.getElementById(tabId).classList.remove('hidden');

    // 4. Highlight nav button
    if(navBtn) navBtn.classList.add('active');

    // 5. Trigger data refresh for specific tabs
    if(tabId === 'tab-ranking') renderStats();
    if(tabId === 'tab-add-friends') renderFollowing();
}

// --- AUTH ---
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username-input').value.trim().toLowerCase();
    if (!username) return;

    if (!appData.users[username]) {
        appData.users[username] = { items: [], friends: [], elo: {} };
        saveData();
    }
    currentUser = username;

    // Transition UI
    document.getElementById('auth-view').classList.add('hidden');
    document.getElementById('app-view').classList.remove('hidden');

    // Reset to first tab
    switchTab('tab-add-photo', document.querySelector('.nav-item'));
}

function handleLogout() {
    currentUser = null;
    document.getElementById('app-view').classList.add('hidden');
    document.getElementById('auth-view').classList.remove('hidden');
    document.getElementById('username-input').value = '';
}

// --- ACTIONS ---
function handleAddItem(e) {
  e.preventDefault();
  const desc = document.getElementById('item-desc').value.trim();
  const notes = document.getElementById('item-notes').value.trim();
  const file = document.getElementById('file-input').files[0];

  if (!desc) return;

  appData.users[currentUser].items.push({
    desc,
    notes,
    filename: file ? file.name : null,
    date: new Date().toISOString()
  });

  saveData();
  document.getElementById('add-item-form').reset();
  alert('Item added to wardrobe!');
}


function handleAddFriend(e) {
    e.preventDefault();
    const friendName = document.getElementById('friend-username').value.trim().toLowerCase();
    const msg = document.getElementById('friend-msg');

    if (friendName === currentUser) {
        msg.textContent = "Cannot follow yourself";
        msg.style.color = "red";
        return;
    }
    if (!appData.users[friendName]) {
        msg.textContent = "User not found";
        msg.style.color = "red";
        return;
    }
    if (appData.users[currentUser].friends.includes(friendName)) {
        msg.textContent = "Already following";
        msg.style.color = "orange";
        return;
    }

    appData.users[currentUser].friends.push(friendName);
    saveData();
    msg.textContent = `Following ${friendName}`;
    msg.style.color = "green";
    renderFollowing();
}

// --- RENDERERS ---
function renderStats() {
    const user = appData.users[currentUser];
    document.getElementById('total-items-count').textContent = user.items.length;

    const list = document.getElementById('rank-list-ul');
    list.innerHTML = '';

    // Mock ranking (in a real app, calculate Elo here)
    if(user.items.length === 0) {
        list.innerHTML = '<li style="text-align:center; padding:1rem; color:#999;">Add items to see stats</li>';
        return;
    }

    // Just displaying items as a list for now
    user.items.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'rank-item';
        li.innerHTML = `
            <span>${item.desc}</span>
            <span class="rank-score">#${index + 1}</span>
        `;
        list.appendChild(li);
    });
}

function renderFollowing() {
    const list = document.getElementById('following-list');
    list.innerHTML = '';
    const friends = appData.users[currentUser].friends;

    friends.forEach(f => {
        const div = document.createElement('div');
        div.className = 'friend-chip';
        div.innerHTML = `
            <div class="avatar-circle">${f[0].toUpperCase()}</div>
            <div style="font-weight:600;">${f}</div>
        `;
        list.appendChild(div);
    });
}

// --- STORAGE ---
function loadData() {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) appData = JSON.parse(raw);
}

function saveData() {
    localStorage.setItem(DB_KEY, JSON.stringify(appData));
}
function switchTab(tabId, navBtn) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

  document.getElementById(tabId).classList.remove('hidden');
  if (navBtn) navBtn.classList.add('active');

  if (tabId === 'tab-ranking') renderStats();
  if (tabId === 'tab-add-friends') renderFollowing();
  if (tabId === 'tab-friends-feed') renderFeed();
}

function renderFeed() {
  const container = document.getElementById("friends-list-container");
  const friends = appData.users[currentUser].friends;

  if (!friends.length) {
    container.innerHTML = `<div class="card"><p style="text-align:center; color:#999;">No active friends yet.</p></div>`;
    return;
  }

  // Collect friend items
  const items = [];
  friends.forEach(f => {
    (appData.users[f]?.items || []).forEach(it => {
      items.push({ ...it, user: f });
    });
  });

  items.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  if (!items.length) {
    container.innerHTML = `<div class="card"><p style="text-align:center; color:#999;">Your friends haven’t posted yet.</p></div>`;
    return;
  }

  container.innerHTML = items.slice(0, 20).map(it => `
    <div class="card">
      <div style="display:flex; gap:10px; align-items:center;">
        <div class="avatar-circle">${it.user[0].toUpperCase()}</div>
        <div>
          <div style="font-weight:700;">@${it.user}</div>
          <div style="color:#6b7280; font-size:.9rem;">${new Date(it.date).toLocaleString()}</div>
        </div>
      </div>
      <div style="margin-top:12px; font-weight:700;">${it.desc}</div>
      ${it.notes ? `<div style="margin-top:6px; color:#6b7280;">${it.notes}</div>` : ""}
    </div>
  `).join("");
}


init();
