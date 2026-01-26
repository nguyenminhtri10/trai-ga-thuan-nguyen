const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load models
const User = require('./models/userModel');
const Product = require('./models/productModel');
const Order = require('./models/orderModel');
const Livestream = require('./models/livestreamModel');
const Chat = require('./models/chatModel');
const AuditLog = require('./models/auditLogModel');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/traigathuannguyen';
const ATLAS_URI = 'mongodb+srv://trik19tpm3_db_user:MFfEL1ttPU8I9gwr@cluster0.esyfcxc.mongodb.net/traigathuannguyen?retryWrites=true&w=majority&appName=Cluster0';

const syncData = async () => {
    try {
        console.log('🔄 Bắt đầu đồng bộ dữ liệu...');

        // 2. Read Products from backup JSON
        const fs = require('fs');
        let products = [];
        try {
            const raw = fs.readFileSync('backup_data.json', 'utf8');
            const data = JSON.parse(raw);
            products = data.products || [];
            console.log(`📦 Đã đọc ${products.length} sản phẩm từ file backup.`);
        } catch (e) {
            console.log('⚠️ Không thể đọc file backup_data.json');
        }

        // 3. Connect Atlas & Push Data (Products Only)
        console.log('3️⃣  Kết nối Atlas DB (Online)...');
        try {
            await mongoose.connect(ATLAS_URI, { serverSelectionTimeoutMS: 5000 });
            console.log('✅ Đã kết nối Atlas.');

            if (products.length > 0) {
                // IMPORTANT: Delete old products first to key ID consistency or just update?
                // For "Sync", usually we overwrite.
                console.log('🧹 Đang xóa dữ liệu Products cũ trên Atlas...');
                await Product.deleteMany({});

                console.log(`🚀 Đang đẩy ${products.length} sản phẩm lên Atlas...`);
                await Product.insertMany(products);
                console.log('✅ Đã cập nhật xong bảng Products!');
            } else {
                console.log('⚠️ Không có sản phẩm nào để đồng bộ.');
            }

            console.log('🎉 XONG!');
        } catch (err) {
            console.error('⚠️ LỖI KẾT NỐI ATLAS:', err.message);
        }

        process.exit();

    } catch (error) {
        console.error('❌ Lỗi đồng bộ:', error);
        process.exit(1);
    }
};

syncData();
