// Load data from LocalStorage on start
let sales = JSON.parse(localStorage.getItem('mm_sales')) || [];

document.getElementById('currentDate').innerText = new Date().toLocaleDateString('ar-MA');

function addItem() {
    const product = document.getElementById("product").value;
    const price = parseFloat(document.getElementById("price").value);
    const payment = document.getElementById("payment").value;

    if (!product || !price) {
        alert("عمر الخانات أصاحبي!");
        return;
    }

    const transaction = {
        id: Date.now(),
        date: new Date().toLocaleTimeString('ar-MA', {hour: '2-digit', minute:'2-digit'}),
        product,
        price,
        payment
    };

    sales.push(transaction);
    saveAndRender();

    document.getElementById("product").value = "";
    document.getElementById("price").value = "";
}

function deleteItem(id) {
    sales = sales.filter(s => s.id !== id);
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('mm_sales', JSON.stringify(sales));
    renderTable(sales);
    updateStats();
}

function renderTable(data) {
    const list = document.getElementById("list");
    list.innerHTML = "";

    data.forEach(s => {
        const row = document.createElement("tr");
        if(s.payment === 'credit') row.className = 'row-credit';
        
        row.innerHTML = `
            <td>${s.date}</td>
            <td><strong>${s.product}</strong></td>
            <td>${s.price.toFixed(2)} DH</td>
            <td>${s.payment === 'cash' ? '✅ كاش' : '🔴 دين'}</td>
            <td><button class="del-btn" onclick="deleteItem(${s.id})">🗑️</button></td>
        `;
        list.appendChild(row);
    });
}

function updateStats() {
    const cash = sales.filter(s => s.payment === 'cash').reduce((a, b) => a + b.price, 0);
    const credit = sales.filter(s => s.payment === 'credit').reduce((a, b) => a + b.price, 0);

    document.getElementById("cash").innerText = `${cash.toFixed(2)} DH`;
    document.getElementById("credit").innerText = `${credit.toFixed(2)} DH`;
    document.getElementById("total").innerText = `${(cash + credit).toFixed(2)} DH`;
}

function filterItems() {
    const term = document.getElementById("search").value.toLowerCase();
    const filtered = sales.filter(s => s.product.toLowerCase().includes(term));
    renderTable(filtered);
}

function clearAll() {
    if(confirm("واش متأكد بغيتي تمسح كولشي؟")) {
        sales = [];
        saveAndRender();
    }
}

// Initial Run
renderTable(sales);
updateStats();