let transactions = [];

function addItem() {
    const productEl = document.getElementById("product");
    const priceEl = document.getElementById("price");
    const paymentEl = document.getElementById("payment");

    const product = productEl.value;
    const price = parseFloat(priceEl.value);
    const payment = paymentEl.value;

    if (!product || isNaN(price) || price <= 0) {
        alert("المرجو إدخال معلومات صحيحة");
        return;
    }

    const item = {
        id: Date.now(),
        product,
        price,
        payment
    };

    transactions.push(item);
    renderTable();
    updateTotals();

    // Clear inputs
    productEl.value = "";
    priceEl.value = "";
}

function deleteItem(id) {
    transactions = transactions.filter(t => t.id !== id);
    renderTable();
    updateTotals();
}

function renderTable() {
    const list = document.getElementById("list");
    list.innerHTML = "";

    transactions.forEach(t => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${t.product}</td>
            <td>${t.price.toFixed(2)} DH</td>
            <td><span class="badge">${t.payment === 'cash' ? 'نقدا' : 'دين'}</span></td>
            <td><button class="delete-btn" onclick="deleteItem(${t.id})">حذف</button></td>
        `;
        list.appendChild(row);
    });
}

function updateTotals() {
    const cash = transactions
        .filter(t => t.payment === "cash")
        .reduce((sum, t) => sum + t.price, 0);

    const credit = transactions
        .filter(t => t.payment === "credit")
        .reduce((sum, t) => sum + t.price, 0);

    document.getElementById("cash").innerText = `${cash.toFixed(2)} DH`;
    document.getElementById("credit").innerText = `${credit.toFixed(2)} DH`;
    document.getElementById("total").innerText = `${(cash + credit).toFixed(2)} DH`;
}