let cart = [];

function toggleCart() {
    document.getElementById('cart-side').classList.toggle('active');
}

function addToCart(name, price, id) {
    const size = document.getElementById(`size-${id}`).value;
    cart.push({ name, price, size });
    updateCartUI();
    toggleCart();
}

function updateCartUI() {
    const cartCont = document.getElementById('cart-content');
    const count = document.getElementById('cart-count');
    const total = document.getElementById('total-val');
    
    cartCont.innerHTML = '';
    let totalDH = 0;
    
    cart.forEach((item, index) => {
        totalDH += item.price;
        cartCont.innerHTML += `
            <div style="display:flex; justify-content:space-between; margin-bottom:20px; padding-bottom:10px; border-bottom:1px solid #222;">
                <div><h4>${item.name}</h4><small>المقاس: ${item.size}</small></div>
                <p>${item.price} DH</p>
                <i class="fas fa-trash" onclick="cart.splice(${index},1); updateCartUI();" style="color:red; cursor:pointer"></i>
            </div>
        `;
    });
    
    count.innerText = cart.length;
    total.innerText = totalDH;
}

function sendToWA() {
    if(cart.length === 0) return alert("السلة خاوية!");
    let msg = "مرحباً M.M SHOP، أريد تقديم الطلب التالي:%0a";
    cart.forEach((item, i) => msg += `${i+1}. ${item.name} | المقاس: ${item.size}%0a`);
    msg += `%0aالمجموع الإجمالي: ${document.getElementById('total-val').innerText} درهم`;
    window.open(`https://wa.me/212710211532?text=${msg}`, '_blank');
}