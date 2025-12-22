const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const adminExists = await User.findOne({ isAdmin: true });

        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        const user = await User.create({
            name: 'Admin User',
            email: 'admin@walkerfarms.com',
            password: 'password123', // Ensure your User model hashes this password in a pre-save hook
            isAdmin: true,
            role: 'admin',
            phone: '555-555-5555'
        });

        console.log('Admin user created successfully');
        console.log('Email: admin@walkerfarms.com');
        console.log('Password: password123');
        
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();