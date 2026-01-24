let isLoginMode = true;
let currentUser = null;
let isDark = localStorage.getItem('theme') === 'dark';

if (isDark) document.body.classList.add('dark');

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.log("SW Error:", err));
}

function toggleDarkMode() {
    isDark = !isDark;
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.getElementById('themeIcon').className = isDark ? 'fas fa-sun text-yellow-400' : 'fas fa-moon text-indigo-400';
}

function handleAuth() {
    const user = document.getElementById('authUser').value.trim();
    const pass = document.getElementById('authPass').value.trim();
    if (!user || !pass) return alert("الرجاء ملء جميع الخانات / Remplir les champs!");

    let users = JSON.parse(localStorage.getItem('mm_users')) || {};

    if (isLoginMode) {
        if (users[user] && users[user].password === pass) {
            vibrate(50);
            login(user);
        } else {
            alert("خطأ في المعلومات / Infos incorrectes!");
        }
    } else {
        if (users[user]) return alert("المستخدم موجود بالفعل / Utilisateur existe!");
        users[user] = { password: pass, data: [] };
        localStorage.setItem('mm_users', JSON.stringify(users));
        alert("تم إنشاء الحساب / Compte créé!");
        toggleAuthMode();
    }
}

function login(username) {
    currentUser = username;
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('dashboardSection').classList.remove('hidden');
    document.getElementById('welcomeMsg').innerText = "👤 " + username;
    renderTable();
}

function logout() { location.reload(); }

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('authTitle').innerText = isLoginMode ? "Se Connecter / دخول" : "Inscription / تسجيل";
    document.getElementById('authToggle').innerText = isLoginMode ? "Créer un compte / إنشاء حساب" : "Déjà inscrit ? / عندي حساب";
}

function saveData() {
    const client = document.getElementById('client').value.trim();
    const article = document.getElementById('article').value.trim();
    const pAchat = parseFloat(document.getElementById('pAchat').value) || 0;
    const pVente = parseFloat(document.getElementById('pVente').value) || 0;
    const paye = parseFloat(document.getElementById('paye').value) || 0;

    if (!client || pVente <= 0) return alert("بيانات غير كافية / Données insuffisantes!");

    let users = JSON.parse(localStorage.getItem('mm_users'));
    const entry = {
        id: Date.now(),
        client,
        article,
        pVente,
        reste: pVente - paye,
        profit: pVente - pAchat,
        date: new Date().toLocaleDateString()
    };

    users[currentUser].data.push(entry);
    localStorage.setItem('mm_users', JSON.stringify(users));
    vibrate(100);
    renderTable();
    showQR(entry);
    ['client','article','pAchat','pVente','paye'].forEach(id => document.getElementById(id).value = "");
}

function renderTable(filterData = null) {
    let users = JSON.parse(localStorage.getItem('mm_users'));
    let myData = filterData || users[currentUser].data;
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = "";

    let v=0, r=0, k=0;
    myData.reverse().forEach(item => {
        v+=item.pVente; r+=item.profit; k+=item.reste;
        tbody.innerHTML += `
            <tr class="hover:bg-indigo-50 dark:hover:bg-slate-800 transition">
                <td class="p-4">
                    <p class="font-black text-indigo-900 dark:text-white uppercase">${item.client}</p>
                    <p class="text-[10px] text-gray-400 font-bold">${item.article} | ${item.date}</p>
                </td>
                <td class="p-4">
                    <span class="px-3 py-1 rounded-full text-[10px] font-black ${item.reste > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}">
                        ${item.reste.toFixed(2)} DH
                    </span>
                </td>
                <td class="p-4 text-center">
                    <button onclick="showQRById(${item.id})" class="text-indigo-500 hover:scale-125 transition"><i class="fas fa-qrcode text-lg"></i></button>
                </td>
                <td class="p-4 text-center">
                    <button onclick="deleteRow(${item.id})" class="text-gray-300 hover:text-red-500 transition"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
    document.getElementById('statVentes').innerText = v.toFixed(2) + " DH";
    document.getElementById('statRebeh').innerText = r.toFixed(2) + " DH";
    document.getElementById('statKrida').innerText = k.toFixed(2) + " DH";
}

function showQR(item) {
    const qrContainer = document.getElementById("qrcode");
    qrContainer.innerHTML = "";
    const txt = `M.M COMPTABLE\nCLIENT: ${item.client}\nRESTE: ${item.reste} DH\nDATE: ${item.date}`;
    new QRCode(qrContainer, { text: txt, width: 180, height: 180, colorDark: "#1e1b4b" });
    document.getElementById('qrInfo').innerText = `${item.client} | ${item.pVente} DH`;
    document.getElementById('qrModal').classList.remove('hidden');
}

function showQRById(id) {
    let users = JSON.parse(localStorage.getItem('mm_users'));
    let item = users[currentUser].data.find(i => i.id === id);
    showQR(item);
}

function closeQR() { document.getElementById('qrModal').classList.add('hidden'); }

function searchData() {
    let users = JSON.parse(localStorage.getItem('mm_users'));
    let term = document.getElementById('searchInput').value.toLowerCase();
    let filtered = users[currentUser].data.filter(i => i.client.toLowerCase().includes(term) || i.article.toLowerCase().includes(term));
    renderTable(filtered);
}

function deleteRow(id) {
    if(!confirm("Supprimer? / هل تريد الحذف؟")) return;
    let users = JSON.parse(localStorage.getItem('mm_users'));
    users[currentUser].data = users[currentUser].data.filter(i => i.id !== id);
    localStorage.setItem('mm_users', JSON.stringify(users));
    renderTable();
}

function vibrate(ms) { if (navigator.vibrate) navigator.vibrate(ms); }