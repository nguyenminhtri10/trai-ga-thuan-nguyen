const mongoose = require('mongoose');
const User = require('./models/userModel');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const users = await User.find({});
        console.log(`Found ${users.length} users in database '${process.env.MONGO_URI.split('/').pop()}':`);

        if (users.length === 0) {
            console.log("No users found yet. Try registering on the website!");
        }

        users.forEach(user => {
            console.log('------------------------------------------------');
            console.log(`ID:       ${user._id}`);
            console.log(`Name:     ${user.name}`);
            console.log(`Email:    ${user.email}`);
            console.log(`PassHash: ${user.password.substring(0, 20)}...`);
            console.log(`Created:  ${user.createdAt}`);
        });
        console.log('------------------------------------------------');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUsers();
