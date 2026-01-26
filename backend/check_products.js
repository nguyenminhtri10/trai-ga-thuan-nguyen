const mongoose = require('mongoose');
const Product = require('./models/productModel');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const checkProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const products = await Product.find({});
        console.log(`Found ${products.length} products in database '${process.env.MONGO_URI.split('/').pop()}' (Collection: products):`);

        if (products.length === 0) {
            console.log("No products found yet. Try adding one via Admin Dashboard!");
        }

        products.forEach(p => {
            console.log('------------------------------------------------');
            console.log(`ID:       ${p._id}`);
            console.log(`Code:     ${p.code}`);
            console.log(`Name:     ${p.name}`);
            console.log(`Category: ${p.category}`);
            console.log(`Price:    ${p.price}`);
            console.log(`Image:    ${p.image}`);
        });
        console.log('------------------------------------------------');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkProducts();
