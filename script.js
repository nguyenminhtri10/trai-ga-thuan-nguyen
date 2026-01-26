document.addEventListener('DOMContentLoaded', async () => {

    // Load Header & Footer Components
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (headerPlaceholder) {
        try {
            const res = await fetch('components/header.html');
            if (res.ok) {
                headerPlaceholder.outerHTML = await res.text();
                // Re-highlight active link logic
                const currentPath = window.location.pathname;
                const navLinks = document.querySelectorAll('.nav-link');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === currentPath || (currentPath === '/' && link.getAttribute('href').includes('index.html'))) {
                        link.classList.add('active');
                    } else {
                        // Handle hash links roughly
                        // link.classList.remove('active'); 
                        // Keep strict matching or custom logic
                    }
                });
            }
        } catch (e) { console.error('Error loading header:', e); }
    }

    if (footerPlaceholder) {
        try {
            const res = await fetch('components/footer.html');
            if (res.ok) footerPlaceholder.outerHTML = await res.text();
        } catch (e) { console.error('Error loading footer:', e); }
    }

    // Sticky Header
    let socket; // Global socket for this scope

    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Check Login Status & Update Header
    const userStr = localStorage.getItem('user');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginBtn = document.getElementById('loginBtn');

    if (userStr) {
        const user = JSON.parse(userStr);
        if (userInfo && userName && loginBtn) {
            userInfo.style.display = 'flex';
            userName.textContent = `Hi, ${user.name}`; // Or just user.name
            loginBtn.style.display = 'none';
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.reload(); // Reload to update UI
        });
    }

    // Mobile Menu
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');
    const links = document.querySelectorAll('.nav-link');

    if (menuBtn && navList) {
        menuBtn.addEventListener('click', () => {
            navList.classList.toggle('active');
            const icon = menuBtn.querySelector('i');

            if (navList.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                icon.style.color = '#333';
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');

                // Revert color check based on scroll
                if (window.scrollY > 50) {
                    icon.style.color = '#333';
                } else {
                    icon.style.color = '#fff';
                }
            }
        });

        // Close menu when clicking a link
        links.forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('active');
                const icon = menuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // Live Stream Chat
    // Live Stream Chat
    // Logic moved to initChat() called after livestream config load
    // ...


    // Load Live Stream
    // Load Live Stream
    // Load Live Stream
    const liveStreamIframe = document.getElementById('liveStreamIframe');
    let currentLivestreamId = null; // Track current ID

    if (liveStreamIframe) {
        // We use the latest entry in history as the current stream
        fetch('/api/livestreams')
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    const currentStream = data[0];
                    liveStreamIframe.src = currentStream.url;
                    currentLivestreamId = currentStream._id; // Save ID

                    // Now that we have the ID, init chat for this room
                    initChat(currentLivestreamId);
                } else {
                    // No stream, maybe just init chat globally or do nothing
                    // allow initChat(null) if we want global fallback
                    initChat(null);
                }
            })
            .catch(err => console.error('Failed to load livestream config', err));
    }

    // Refactored Chat Init
    function initChat(livestreamId) {
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        const chatMessages = document.getElementById('chatMessages');

        if (!chatMessages) return;

        // Reuse socket or define outer if needed. For now let's rely on global socket variable in this scope
        // Wait, socket var is defined in previous scope? 
        // Let's define it at top of DOMContentLoaded

        if (typeof io !== 'undefined') {
            if (!socket) {
                socket = io();
                // Listen for messages once to avoid duplicates
                socket.on('receive_message', (data) => {
                    renderMessage(data);
                });
            }

            // Join Room if ID exists
            if (livestreamId) {
                socket.emit('join_room', livestreamId);
            }

            // Fetch recent messages for this room
            const fetchUrl = livestreamId ? `/api/chat?livestreamId=${livestreamId}` : '/api/chat';
            fetch(fetchUrl)
                .then(res => res.json())
                .then(messages => {
                    // Clear existing
                    chatMessages.innerHTML = '';

                    messages.forEach(msg => {
                        renderMessage(msg);
                    });
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                })
                .catch(err => console.error('Error fetching chat history:', err));
        }

        // Setup Send
        if (sendBtn && chatInput) {
            // Clean up old listeners (simple way is to clone node or just use onclick)
            // For now we assume initChat is called once. 

            const sendHandler = () => {
                if (!socket) return;
                const text = chatInput.value.trim();
                if (!text) return;

                const userStr = localStorage.getItem('user');
                let userName = 'Khách';
                if (userStr) {
                    const user = JSON.parse(userStr);
                    userName = user.name;
                }

                const messageData = {
                    user: userName,
                    text: text,
                    livestreamId: livestreamId, // Send ID
                    time: new Date().toISOString()
                };

                socket.emit('send_message', messageData);
                chatInput.value = '';
            };

            sendBtn.onclick = sendHandler; // Override previous
            chatInput.onkeypress = (e) => {
                if (e.key === 'Enter') sendHandler();
            };
        }
    }

    function renderMessage(data) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'yt-message');

        // Random color for username like YouTube
        const colors = ['#e53935', '#d81b60', '#8e24aa', '#5e35b1', '#3949ab', '#1e88e5', '#039be5', '#00acc1', '#00897b', '#43a047', '#7cb342', '#c0ca33', '#fdd835', '#ffb300', '#fb8c00', '#f4511e'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        // Avatar (Letter avatar)
        const firstLetter = (data.user || 'K').charAt(0).toUpperCase();

        messageDiv.innerHTML = `
            <div class="yt-avatar" style="background-color: ${randomColor}">${firstLetter}</div>
            <div class="yt-content">
                <span class="yt-user" style="color: #606060">${data.user || 'Khách'}</span>
                <span class="yt-text">${data.text}</span>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Load Live Stream History
    const historyList = document.querySelector('.history-list');
    if (historyList) {
        fetch('/api/livestreams')
            .then(res => res.json())
            .then(data => {
                historyList.innerHTML = ''; // Clear default/placeholder history

                if (data.length === 0) {
                    historyList.innerHTML = '<li class="history-item">Chưa có lịch sử.</li>';
                }

                data.forEach((item, index) => {
                    const date = new Date(item.date).toLocaleDateString('vi-VN');
                    const li = document.createElement('li');
                    li.classList.add('history-item');
                    if (index === 0) li.classList.add('active'); // Highlight the latest one

                    li.innerHTML = `
                        <span class="date">${date}</span>
                        <span class="title">${item.title}</span>
                    `;

                    // Allow clicking to replay (optional logic, setting src)
                    li.addEventListener('click', () => {
                        // Remove active from others
                        document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
                        li.classList.add('active');
                        // Change video
                        if (liveStreamIframe) {
                            liveStreamIframe.src = item.url;
                        }
                        // Change Chat Room
                        initChat(item._id);
                    });

                    historyList.appendChild(li);
                });
            })
            .catch(err => console.error(err));
    }

    // Auth Page Logic (Tabs)
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');

    if (authTabs.length > 0) {
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active from all tabs
                authTabs.forEach(t => t.classList.remove('active'));
                // Add active to clicked tab
                tab.classList.add('active');

                // Hide all forms
                authForms.forEach(form => form.classList.remove('active'));

                // Show target form
                const targetId = tab.getAttribute('data-target');
                const targetForm = document.getElementById(targetId);
                if (targetForm) {
                    targetForm.classList.add('active');
                }
            });
        });
    }

    // Handle Register Form Submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const phone = document.getElementById('regPhone').value;
            const password = document.getElementById('regPassword').value;

            try {
                const res = await fetch('/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, phone, password })
                });

                const data = await res.json();

                if (res.ok) {
                    alert('Đăng ký thành công!');
                    localStorage.setItem('user', JSON.stringify(data)); // Auto-login: Save user info
                    window.location.href = 'index.html'; // Redirect to home
                } else {
                    alert(data.message || 'Đăng ký thất bại');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Có lỗi xảy ra, vui lòng thử lại.');
            }
        });
    }

    // Handle Login Form Submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const phone = document.getElementById('loginPhone').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const res = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ phone, password })
                });

                const data = await res.json();

                if (res.ok) {
                    alert('Đăng nhập thành công!');
                    localStorage.setItem('user', JSON.stringify(data)); // Save user info

                    // Check if Admin
                    if (data.name === 'Admin' || data.name === 'admin' || data.isAdmin) {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                } else {
                    alert(data.message || 'Sai thông tin đăng nhập');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Có lỗi xảy ra, vui lòng thử lại.');
            }
        });

        // Handle Admin Button Click (Trigger normal submit but maybe we could set a flag if needed, 
        // effectively it just submits the same form)
        const adminBtn = document.getElementById('adminLoginBtn');
        if (adminBtn) {
            adminBtn.addEventListener('click', () => {
                // Trigger the form submit programmatically
                const event = new Event('submit');
                loginForm.dispatchEvent(event);
            });
        }
    }

    // Load Products for Homepage
    const homeProductGrid = document.getElementById('homeProductGrid');
    if (homeProductGrid) {
        fetchProductsForHome();
    }

    async function fetchProductsForHome() {
        try {
            const res = await fetch('/api/products');
            const products = await res.json();

            // Take only first 6 products for home page
            const productsToShow = products.slice(0, 6);

            if (productsToShow.length > 0) {
                homeProductGrid.innerHTML = ''; // Clear static content

                productsToShow.forEach(prod => {
                    const priceDisplay = prod.price ? Number(prod.price).toLocaleString('vi-VN') + 'đ' : 'Liên hệ';
                    const badgeHtml = prod.isHot ? '<span class="badge hot">Hot</span>' : '<span class="badge">Mới</span>';

                    const productHTML = `
                        <div class="product-card">
                            <div class="product-image">
                                <img src="${prod.image}" alt="${prod.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null;this.src='https://via.placeholder.com/300?text=No+Image';">
                            </div>
                            <div class="product-info">
                                ${badgeHtml}
                                <h3>${prod.name}</h3>
                                <p class="price">${priceDisplay}</p>
                                <a href="detail.html?id=${prod._id}" class="btn-link">Chi tiết <i class="fa-solid fa-arrow-right"></i></a>
                            </div>
                        </div>
                    `;
                    homeProductGrid.insertAdjacentHTML('beforeend', productHTML);
                });
            }
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    }

    // Load Product Detail
    const detailTitle = document.getElementById('prodTitle');
    if (detailTitle) {
        // Get ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (productId) {
            fetchProductDetail(productId);
        } else {
            document.querySelector('.product-detail-container').innerHTML = '<p class="text-center">Không tìm thấy sản phẩm. <a href="index.html">Quay lại trang chủ</a></p>';
        }
    }

    async function fetchProductDetail(id) {
        try {
            const res = await fetch(`/api/products/${id}`);
            if (!res.ok) throw new Error('Product not found');

            const prod = await res.json();

            // Populate Data
            document.getElementById('prodTitle').textContent = prod.name;
            document.getElementById('prodCode').textContent = prod.code || 'N/A';

            // Format Date
            const date = new Date(prod.updatedAt || prod.createdAt);
            document.getElementById('prodUpdated').textContent = date.toLocaleDateString('vi-VN');

            document.getElementById('prodPrice').textContent = prod.price ? Number(prod.price).toLocaleString('vi-VN') + 'đ' : 'Liên Hệ';
            document.getElementById('prodDesc').innerHTML = `<p>${prod.description}</p>`;

            // Specs
            document.getElementById('specCategory').textContent = prod.category;
            document.getElementById('specWeight').textContent = prod.weight || 'Đang cập nhật';
            document.getElementById('specAge').textContent = prod.age || 'Đang cập nhật';
            document.getElementById('specAchievements').textContent = prod.achievements || 'Đang cập nhật';

            // Image
            if (prod.image) {
                const img = document.getElementById('mainImage');
                const icon = document.getElementById('placeholderIcon');

                img.src = prod.image;
                img.style.display = 'block';
                icon.style.display = 'none';
            }

            // Render Gallery Thumbs
            // Clear previous gallery
            const existingGallery = document.querySelector('.gallery-thumbs');
            if (existingGallery) existingGallery.remove();

            let imagesToDisplay = [];
            // If we have an array, use it
            if (prod.images && Array.isArray(prod.images) && prod.images.length > 0) {
                imagesToDisplay = prod.images;
            } else if (prod.image) {
                // Fallback to just main image
                imagesToDisplay = [prod.image];
            }

            // Ensure main image is in the list if not present (optional)
            if (prod.image && !imagesToDisplay.includes(prod.image)) {
                imagesToDisplay.unshift(prod.image);
            }

            if (imagesToDisplay.length > 0) {
                const galleryContainer = document.createElement('div');
                galleryContainer.className = 'gallery-thumbs';
                galleryContainer.style.display = 'flex';
                galleryContainer.style.gap = '10px';
                galleryContainer.style.marginTop = '15px';
                galleryContainer.style.flexWrap = 'wrap';

                imagesToDisplay.forEach((src, index) => {
                    const thumb = document.createElement('img');
                    thumb.src = src;
                    thumb.className = 'thumb';
                    // Add inline styles to ensure visibility just in case CSS fails
                    thumb.style.width = '80px';
                    thumb.style.height = '80px';
                    thumb.style.objectFit = 'cover';
                    thumb.style.cursor = 'pointer';
                    thumb.style.border = '2px solid transparent';
                    thumb.style.borderRadius = '5px';

                    if (index === 0) thumb.style.borderColor = '#8B0000'; // Highlight first

                    thumb.onclick = () => {
                        document.getElementById('mainImage').src = src;
                        // Update active border
                        Array.from(galleryContainer.children).forEach(t => t.style.borderColor = 'transparent');
                        thumb.style.borderColor = '#8B0000';
                    };
                    galleryContainer.appendChild(thumb);
                });

                // Append to gallery section
                const mainImgContainer = document.querySelector('.product-gallery');
                if (mainImgContainer) mainImgContainer.appendChild(galleryContainer);
            }

            // Update Page Title
            document.title = `${prod.name} | Trại Gà Thuận Nguyễn`;

            // Order Logic Init
            setupOrderLogic(prod);

        } catch (error) {
            console.error(error);
            document.querySelector('.product-detail-container').innerHTML = '<p class="text-center">Lỗi khi tải dữ liệu. <a href="index.html">Quay lại trang chủ</a></p>';
        }
    }

    function setupOrderLogic(product) {
        const buyNowBtn = document.getElementById('buyNowBtn');
        if (!buyNowBtn) return;

        buyNowBtn.addEventListener('click', () => {
            // Redirect to order page with product ID
            window.location.href = `order.html?id=${product._id}`;
        });
    }

    // Order Page Logic
    const orderPageForm = document.getElementById('orderPageForm');
    if (orderPageForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (productId) {
            setupOrderPage(productId);
        } else {
            alert('Không tìm thấy sản phẩm!');
            window.location.href = 'index.html';
        }
    }

    // Load Products for List Page (Pagination)
    const listProductGrid = document.getElementById('listProductGrid');
    if (listProductGrid) {
        fetchProductsForList(1);
    }

    async function fetchProductsForList(page) {
        try {
            // Fetch with pagination
            const res = await fetch(`/api/products?pageNumber=${page}&pageSize=8`);
            const data = await res.json();

            // Backend returns { products, page, pages } OR array if no query
            // Since we passed query, it should match our new logic
            // But checking structure to be safe

            let products = [];
            let totalPages = 1;
            let currentPage = 1;

            if (Array.isArray(data)) {
                // Fallback if backend not updated or logic differs
                products = data;
                // Client side paging if needed, but we expect new format
            } else {
                products = data.products;
                currentPage = data.page;
                totalPages = data.pages;
            }

            // Render Grid
            const listProductGrid = document.getElementById('listProductGrid');
            listProductGrid.innerHTML = '';

            if (products.length === 0) {
                listProductGrid.innerHTML = '<p class="text-center" style="width:100%">Không tìm thấy sản phẩm nào.</p>';
            } else {
                products.forEach(prod => {
                    const priceDisplay = prod.price ? Number(prod.price).toLocaleString('vi-VN') + 'đ' : 'Liên hệ';
                    const badgeHtml = prod.isHot ? '<span class="badge hot">Hot</span>' : (prod.category === 'VIP' ? '<span class="badge" style="background:gold;color:black">VIP</span>' : '<span class="badge">Mới</span>');

                    const productHTML = `
                        <div class="product-card">
                            <div class="product-image">
                                <img src="${prod.image}" alt="${prod.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null;this.src='https://via.placeholder.com/300?text=No+Image';">
                            </div>
                            <div class="product-info">
                                ${badgeHtml}
                                <h3>${prod.name}</h3>
                                <p class="price">${priceDisplay}</p>
                                <a href="detail.html?id=${prod._id}" class="btn-link">Chi tiết <i class="fa-solid fa-arrow-right"></i></a>
                            </div>
                        </div>
                    `;
                    listProductGrid.insertAdjacentHTML('beforeend', productHTML);
                });
            }

            // Render Pagination
            const paginationContainer = document.getElementById('listPagination');
            if (paginationContainer && totalPages > 1) {
                paginationContainer.innerHTML = '';

                // Prev
                /*
                if (currentPage > 1) {
                    const prevBtn = document.createElement('a');
                    prevBtn.href = '#';
                    prevBtn.className = 'btn btn-outline-dark';
                    prevBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
                    prevBtn.onclick = (e) => { e.preventDefault(); fetchProductsForList(currentPage - 1); };
                    paginationContainer.appendChild(prevBtn);
                }
                */

                for (let i = 1; i <= totalPages; i++) {
                    const btn = document.createElement('a');
                    btn.href = '#';
                    btn.className = 'btn btn-outline-dark';
                    if (i === currentPage) {
                        btn.style.background = 'var(--dark)';
                        btn.style.color = 'white';
                        btn.classList.add('active');
                    }
                    btn.textContent = i;
                    btn.onclick = (e) => { e.preventDefault(); fetchProductsForList(i); };
                    paginationContainer.appendChild(btn);
                }

                // Next
                /*
                if (currentPage < totalPages) {
                    const nextBtn = document.createElement('a');
                    nextBtn.href = '#';
                    nextBtn.className = 'btn btn-outline-dark';
                    nextBtn.innerHTML = '<i class="fa-solid fa-arrow-right"></i>';
                    nextBtn.onclick = (e) => { e.preventDefault(); fetchProductsForList(currentPage + 1); };
                    paginationContainer.appendChild(nextBtn);
                }
                */
            } else if (paginationContainer) {
                paginationContainer.innerHTML = ''; // Hide if 1 page
            }

        } catch (error) {
            console.error('Failed to load list products:', error);
        }
    }

    async function setupOrderPage(productId) {
        try {
            // Get product info
            document.getElementById('productLoading').style.display = 'block';
            document.getElementById('productPreview').style.display = 'none';

            const res = await fetch(`/api/products/${productId}`);
            if (!res.ok) throw new Error('Product not found');
            const product = await res.json();

            // Populate preview
            document.getElementById('productLoading').style.display = 'none';
            document.getElementById('productPreview').style.display = 'block';

            document.getElementById('summaryImage').src = product.image;
            document.getElementById('summaryName').textContent = product.name;
            const price = product.price ? Number(product.price).toLocaleString('vi-VN') + 'đ' : '0đ';
            document.getElementById('summaryPrice').textContent = price;

            document.getElementById('subTotal').textContent = price;
            document.getElementById('totalPrice').textContent = price;

            // Pre-fill user info if logged in
            const userStr = localStorage.getItem('user');
            let userId = null;
            if (userStr) {
                const user = JSON.parse(userStr);
                document.getElementById('orderName').value = user.name || '';
                document.getElementById('orderPhone').value = user.phone || '';
                userId = user._id;
            }

            // Handle Submit
            document.getElementById('orderPageForm').addEventListener('submit', async (e) => {
                e.preventDefault();

                const orderData = {
                    guestName: document.getElementById('orderName').value,
                    guestPhone: document.getElementById('orderPhone').value,
                    shippingAddress: {
                        address: document.getElementById('orderAddress').value,
                        city: ''
                    },
                    orderItems: [{
                        name: product.name,
                        qty: 1,
                        image: product.image,
                        price: product.price || 0,
                        product: product._id
                    }],
                    totalPrice: product.price || 0,
                    note: document.getElementById('orderNote').value,
                    userId: userId
                };

                try {
                    const resOrder = await fetch('/api/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(orderData)
                    });

                    if (resOrder.ok) {
                        alert('Đặt hàng thành công! Chúng tôi sẽ liên hệ sớm.');
                        window.location.href = 'index.html';
                    } else {
                        const err = await resOrder.json();
                        alert('Lỗi: ' + err.message);
                    }
                } catch (error) {
                    console.error(error);
                    alert('Có lỗi xảy ra khi đặt hàng');
                }
            });

        } catch (error) {
            console.error(error);
            alert('Lỗi tải thông tin sản phẩm');
            window.location.href = 'index.html';
        }
    }

});
