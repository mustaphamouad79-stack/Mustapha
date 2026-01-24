let isLoginMode = true;
let currentUser = null;
let isDark = localStorage.getItem('theme') === 'dark';

// Initialiser le Thème
if (isDark) document.body.classList.add('dark');

function toggleDarkMode() {
    isDark = !isDark;
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.getElementById('themeIcon').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

function handleAuth() {
    const user = document.getElementById('authUser').value.trim();
    const pass = document.getElementById('authPass').value.trim();
    if (!user || !pass) return alert("Kamal l-7isab!");

    let users = JSON.parse(localStorage.getItem('mm_users')) || {};

    if (isLoginMode) {
        if (users[user] && users[user].password === pass) login(user);
        else alert("Ghalat!");
    } else {
        if (users[user]) return alert("Kayn deja!");
        users[user] = { password: pass, data: [] };
        localStorage.setItem('mm_users', JSON.stringify(users));
        alert("Compte t-sawb!");
        toggleAuthMode();
    }
}

function login(username) {
    currentUser = username;
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('dashboardSection').classList.remove('hidden');
    document.getElementById('welcomeMsg').innerText = username;
    renderTable();
}

function logout() { location.reload(); }

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('authTitle').innerText = isLoginMode ? "Se Connecter" : "Créer Compte";
    document.getElementById('authToggle').innerText = isLoginMode ? "Créer un compte" : "Déjà inscrit ?";
}

function saveData() {
    const client = document.getElementById('client').value;
    const article = document.getElementById('article').value;
    const pAchat = parseFloat(document.getElementById('pAchat').value) || 0;
    const pVente = parseFloat(document.getElementById('pVente').value) || 0;
    const paye = parseFloat(document.getElementById('paye').value) || 0;

    if (!client) return alert("Smiya daroria!");

    let users = JSON.parse(localStorage.getItem('mm_users'));
    users[currentUser].data.push({
        id: Date.now(), client, article, pVente, 
        reste: pVente - paye, profit: pVente - pAchat
    });

    localStorage.setItem('mm_users', JSON.stringify(users));
    renderTable();
    ['client','article','pAchat','pVente','paye'].forEach(id => document.getElementById(id).value = "");
}

function renderTable(filterData = null) {
    let users = JSON.parse(localStorage.getItem('mm_users'));
    let myData = filterData || users[currentUser].data;
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = "";

    let v=0, r=0, k=0;
    myData.forEach(item => {
        v+=item.pVente; r+=item.profit; k+=item.reste;
        tbody.innerHTML += `
            <tr class="hover:bg-indigo-50 dark:hover:bg-gray-800 transition">
                <td class="p-3 font-bold">${item.client}</td>
                <td class="p-3 font-bold ${item.reste > 0 ? 'text-red-500':'text-green-500'}">${item.reste}</td>
                <td class="p-3 text-center">
                    <button onclick="deleteRow(${item.id})" class="text-gray-400 hover:text-red-600"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
    document.getElementById('statVentes').innerText = v.toFixed(0) + " DH";
    document.getElementById('statRebeh').innerText = r.toFixed(0) + " DH";
    document.getElementById('statKrida').innerText = k.toFixed(0) + " DH";
}

function searchData() {
    let users = JSON.parse(localStorage.getItem('mm_users'));
    let term = document.getElementById('searchInput').value.toLowerCase();
    let filtered = users[currentUser].data.filter(i => i.client.toLowerCase().includes(term));
    renderTable(filtered);
}

function deleteRow(id) {
    let users = JSON.parse(localStorage.getItem('mm_users'));
    users[currentUser].data = users[currentUser].data.filter(i => i.id !== id);
    localStorage.setItem('mm_users', JSON.stringify(users));
    renderTable();
}