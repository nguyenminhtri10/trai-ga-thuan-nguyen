async function fetchDashboardStats() {
    try {
        // Fetch products count
        const productRes = await fetch('/api/products');
        const products = await productRes.json();
        document.getElementById('total-products').textContent = products.length;

        // Fetch users count
        const userRes = await fetch('/api/users');
        const users = await userRes.json();
        document.getElementById('total-users').textContent = users.length;

        // Fetch orders count
        const orderRes = await fetch('/api/orders');
        const orders = await orderRes.json();
        document.getElementById('total-orders').textContent = orders.length;

        // Fetch livestreams count
        const liveRes = await fetch('/api/livestreams');
        const livestreams = await liveRes.json();
        document.getElementById('total-livestreams').textContent = livestreams.length;

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        document.getElementById('total-products').textContent = 'Error';
        document.getElementById('total-users').textContent = 'Error';
    }
}

// Check if user is logged in and is admin (optional, but good for security)
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if (!user || !user.isAdmin) {
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // checkAuth(); // Uncomment if you want to enforce admin login
    // Check auth if needed
    fetchDashboardStats();
    fetchActivityLogs();
});

async function fetchActivityLogs() {
    try {
        const res = await fetch('/api/logs');
        const logs = await res.json();

        const list = document.getElementById('activity-list');
        list.innerHTML = '';

        if (logs.length === 0) {
            list.innerHTML = '<li>Chưa có hoạt động nào.</li>';
            return;
        }

        logs.forEach(log => {
            const date = new Date(log.timestamp).toLocaleString('vi-VN');
            let iconClass = 'fa-circle-info';
            let color = 'gray';

            // Simple icon mapping based on Action text
            if (log.action.includes('Thêm')) { iconClass = 'fa-plus-circle'; color = 'green'; }
            else if (log.action.includes('Cập Nhật')) { iconClass = 'fa-pen-to-square'; color = 'orange'; }
            else if (log.action.includes('Xóa')) { iconClass = 'fa-trash-can'; color = 'red'; }
            else if (log.action.includes('Đặt Hàng')) { iconClass = 'fa-cart-plus'; color = 'blue'; }

            const li = document.createElement('li');
            li.style.padding = '10px 0';
            li.style.borderBottom = '1px solid #eee';
            li.innerHTML = `
                <i class="fa-solid ${iconClass}" style="color: ${color}; margin-right: 10px;"></i>
                <strong>${log.user}:</strong> ${log.details}
                <span style="float: right; color: #999; font-size: 0.8rem;">${date}</span>
            `;
            list.appendChild(li);
        });

    } catch (error) {
        console.error('Error fetching logs:', error);
    }
}
