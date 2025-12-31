// script.js
class MMStore {
    constructor() {
        this.products = [
            {
                id: 1,
                name: "قميص رياضي نايك",
                price: 299,
                image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
                category: "sport",
                rating: 4.8
            },
            {
                id: 2,
                name: "بنطلون رياضي أديداس",
                price: 450,
                image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop",
                category: "sport",
                rating: 4.9
            },
            {
                id: 3,
                name: "جاكيت رجالي شتوي",
                price: 599,
                image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop",
                category: "casual",
                rating: 4.7
            },
            {
                id: 4,
                name: "تيشرت قطني أسود",
                price: 199,
                image: "https://images.unsplash.com/photo-1520975954732-74c7f2a5ae4d?w=400&h=500&fit=crop",
                category: "casual",
                rating: 4.6
            },
            {
                id: 5,
                name: "بنطلون جينز slim fit",
                price: 399,
                image: "https://images.unsplash.com/photo-1548036098-581a2a9b692d?w=400&h=500&fit=crop",
                category: "casual",
                rating: 4.8
            },
            {
                id: 6,
                name: "قميص رياضي بولو",
                price: 249,
                image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=500&fit=crop",
                category: "sport",
                rating: 4.9
            }
        ];
        
        this.cart = JSON.parse(localStorage.getItem('mm_cart')) || [];
        this.init();
    }

    init() {
        this.renderProducts();
        this.setupEventListeners();
        this.updateCartCount();
        this.startSlider();
        this.handleSearch();
    }

    renderProducts(products = this.products) {
        const grid = document.getElementById('productsGrid');
        grid.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-rating">
                        ${this.generateStars(product.rating)}
                        <span>(${product.rating})</span>
                    </div>
                    <div class="product-price">${product.price} ريال</div>
                    <button class="add-to-cart" onclick="store.addToCart(${product.id})">
                        أضف للسلة
                    </button>
                </div>
            </div>
        `).join('');
    }

    generateStars(rating) {
        let stars = '';
        for(let i = 1; i <= 5; i++) {
            stars += i <= Math.floor(rating) ? '★' : '☆';
        }
        return stars;
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        const existingItem = this.cart.find(item => item.id === productId);
        
        if(existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({...product, quantity: 1});
        }
        
        this.saveCart();
        this.updateCartCount();
        this.showNotification('تم إضافة المنتج للسلة!');
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
    }

    updateCartQuantity(id, change) {
        const item = this.cart.find(item => item.id === id);
        if(item) {
            item.quantity += change;
            if(item.quantity <= 0) {
                this.removeFromCart(id);
            } else {
                this.saveCart();
                this.updateCartCount();
                this.renderCart();
            }
        }
    }

    saveCart() {
        localStorage.setItem('mm_cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cartCount').textContent = count;
        document.getElementById('cartTotal').textContent = this.getCartTotal() + ' ريال';
    }

    getCartTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    renderCart() {
        const cartItems = document.getElementById('cartItems');
        if(this.cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: var(--text-light);">السلة فارغة</p>';
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.price} ريال</p>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <button onclick="store.updateCartQuantity(${item.id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="store.updateCartQuantity(${item.id}, 1)">+</button>
                        </div>
                    </div>
                    <button class="remove-item" onclick="store.removeFromCart(${item.id})">حذف</button>
                </div>
            `).join('');
        }
    }

    setupEventListeners() {
        // Mobile menu
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Search modal
        document.getElementById('searchBtn').addEventListener('click', () => {
            document.getElementById('searchModal').style.display = 'flex';
        });

        document.getElementById('closeSearch').addEventListener('click', () => {
            document.getElementById('searchModal').style.display = 'none';
        });

        // Cart modal
        document.getElementById('cartIcon').addEventListener('click', () => {
            document.getElementById('cartModal').style.display = 'flex';
            this.renderCart();
        });

        document.getElementById('closeCart').addEventListener('click', () => {
            document.getElementById('cartModal').style.display = 'none';
        });

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if(e.target.classList.contains('search-modal') || e.target.classList.contains('cart-modal')) {
                e.target.style.display = 'none';
            }
        });

        // Contact form
        document.querySelector('.contact-form').addEventListener('submit', (e) => {
            e.preventDefault();
            alert('تم إرسال رسالتك بنجاح! سنرد عليك قريباً.');
            e.target.reset();
        });

        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if(target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Category filter
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                const filtered = category === 'all' ? this.products : 
                               this.products.filter(p => p.category === category);
                this.renderProducts(filtered);
            });
        });
    }

    startSlider() {
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.nav-dot');

        const nextSlide = () => {
            slides[currentSlide].classList.remove('active');
            dots[currentSlide].classList.remove('active');
            
            currentSlide = (currentSlide + 1) % slides.length;
            
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        };

        setInterval(nextSlide, 5000);

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                slides[currentSlide].classList.remove('active');
                dots[currentSlide].classList.remove('active');
                
                currentSlide = index;
                
                slides[currentSlide].classList.add('active');
                dots[currentSlide].classList.add('active');
            });
        });
    }

    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = this.products.filter(product => 
                product.name.toLowerCase().includes(query)
            );

            if(query.length === 0) {
                searchResults.innerHTML = '';
                return;
            }

            searchResults.innerHTML = filtered.slice(0, 5).map(product => `
                <div class="search-result-item" onclick="store.addToCart(${product.id})">
                    <img src="${product.image}" alt="${product.name}">
                    <div>
                        <h4>${product.name}</h4>
                        <p>${product.price} ريال</p>
                    </div>
                </div>
            `).join('');
        });
    }

    showNotification(message) {
        // Simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--success-color);
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize store when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    window.store = new MMStore();
});

// Add CSS for search results and notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    
    .search-result-item {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        cursor: pointer;
        border-bottom: 1px solid #e2e8f0;
        transition: background 0.3s ease;
    }
    
    .search-result-item:hover {
        background: var(--accent-color);
    }
    
    .search-result-item img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 10px;
    }
    
    .search-result-item h4 {
        margin-bottom: 0.2rem;
        font-size: 1rem;
    }
`;
document.head.appendChild(style);