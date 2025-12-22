📦 E-commerce Backend - Complete Setup & Usage Guide
🚀 Quick Start
1. Download & Setup
bash
# Save this entire file as setup.sh
# Make it executable
chmod +x setup.sh

# Run it
./setup.sh
2. What Happens Automatically:
✅ Creates folder structure
✅ Installs all dependencies
✅ Sets up database models
✅ Creates all API endpoints
✅ Configures middleware
✅ Sets up file upload system
✅ Creates real-time socket system
✅ Sets up email notifications

3. After Setup:
bash
cd ecommerce-backend
npm run dev
Server runs at: http://localhost:5000

📁 PROJECT STRUCTURE
text
ecommerce-backend/
├── server.js                 # Main application file
├── package.json             # Dependencies
├── .env                     # Environment variables
├── .env.example            # Example env file
├── models/                  # Database models
│   ├── User.js            # User accounts
│   ├── Product.js         # Products
│   ├── Category.js        # Categories
│   ├── Order.js           # Orders
│   ├── Payment.js         # Payments
│   ├── Ticket.js          # Support tickets
│   ├── Rating.js          # Reviews
│   └── Notification.js    # Notifications
├── controllers/            # Business logic
│   ├── authController.js
│   ├── adminController.js
│   ├── userController.js
│   ├── productController.js
│   └── orderController.js
├── routes/                 # API endpoints
│   ├── auth.js
│   ├── admin.js
│   ├── users.js
│   ├── products.js
│   ├── orders.js
│   ├── categories.js
│   ├── payments.js
│   ├── notifications.js
│   └── tickets.js
├── middleware/             # Middleware
│   ├── auth.js           # Authentication
│   └── upload.js         # File uploads
├── utils/                  # Utilities
│   ├── email.js          # Email sending
│   └── generateToken.js  # JWT generation
├── uploads/                # Uploaded files
│   ├── products/         # Product images
│   ├── users/           # User avatars
│   └── payments/        # Payment proofs
└── README.md              # This documentation
🔐 ENVIRONMENT SETUP
Create .env file:
env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce_db
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@yourstore.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# File Upload
UPLOAD_LIMIT=10MB
Start MongoDB:
bash
# macOS with Homebrew:
brew services start mongodb-community

# Ubuntu/Debian:
sudo systemctl start mongod

# Windows:
net start MongoDB
📊 DATABASE MODELS EXPLAINED
1. User Model (models/User.js)
javascript
{
  name: "John Doe",          // User's name
  email: "john@email.com",   // Unique email
  password: "hashed",        // Hashed password
  role: "customer",          // "customer" or "admin"
  phone: "+1234567890",      // Phone number
  avatar: "/uploads/users/avatar.jpg",  // Profile picture
  address: {                 // Shipping address
    street: "123 Main St",
    city: "New York",
    state: "NY",
    country: "USA",
    zipCode: "10001"
  },
  isActive: true             // Account status
}
2. Product Model (models/Product.js)
javascript
{
  name: "iPhone 15 Pro",      // Product name
  description: "Latest iPhone", // Description
  price: 999.99,              // Current price
  oldPrice: 1099.99,          // Old price (for discounts)
  images: [                   // Multiple images
    {url: "/uploads/products/iphone1.jpg", isMain: true},
    {url: "/uploads/products/iphone2.jpg", isMain: false}
  ],
  category: "ObjectId",       // Category reference
  stock: 50,                  // Available quantity
  inStock: true,              // Auto-calculated
  featured: true,             // Featured product
  colors: ["Black", "White"], // Available colors
  sizes: ["128GB", "256GB"],  // Available sizes
  status: "active"            // "draft", "active", "archived"
}
3. Order Model (models/Order.js)
javascript
{
  orderId: "ORD-123456",      // Auto-generated ID
  user: "ObjectId",           // Who ordered
  items: [                    // Ordered items
    {
      product: "ObjectId",
      name: "iPhone 15 Pro",
      price: 999.99,
      quantity: 1,
      image: "/uploads/products/iphone.jpg"
    }
  ],
  shippingAddress: {          // Where to ship
    name: "John Doe",
    street: "123 Main St",
    city: "New York"
  },
  paymentMethod: "credit_card", // "credit_card", "paypal", "bank_transfer", "cash_on_delivery"
  paymentStatus: "pending",   // "pending", "paid", "failed", "refunded"
  orderStatus: "pending",     // "pending", "processing", "shipped", "delivered", "cancelled"
  subtotal: 999.99,
  shippingFee: 5.99,
  tax: 80.00,
  total: 1085.98,
  paymentProof: "/uploads/payments/proof.jpg", // For manual verification
  trackingNumber: "TRK123456789", // Shipping tracking
  shippedAt: "2024-01-15T10:30:00Z", // When shipped
  deliveredAt: "2024-01-20T14:00:00Z" // When delivered
}
4. Ticket Model (models/Ticket.js)
javascript
{
  ticketId: "TKT-123456",     // Auto-generated ID
  user: "ObjectId",           // Who created ticket
  subject: "Order not delivered",
  message: "My order hasn't arrived...",
  type: "delivery",           // "general", "order", "payment", "product", "delivery"
  priority: "high",           // "low", "medium", "high", "urgent"
  status: "open",             // "open", "in_progress", "resolved", "closed"
  replies: [                  // Conversation
    {
      user: "ObjectId",
      message: "Admin response here...",
      isAdminReply: true,
      createdAt: "2024-01-15T10:30:00Z"
    }
  ],
  assignedTo: "ObjectId"      // Which admin is handling
}
🔌 API ENDPOINTS REFERENCE
🔐 AUTHENTICATION
Method	Endpoint	Description	Auth Required
POST	/api/auth/register	Register new user	No
POST	/api/auth/login	Login user	No
GET	/api/auth/me	Get current user	Yes
PUT	/api/auth/update-profile	Update profile	Yes
POST	/api/auth/forgot-password	Request password reset	No
👤 USER FEATURES
Method	Endpoint	Description	Auth Required
GET	/api/users/orders	Get my orders	Yes
GET	/api/users/orders/:id	Get order details	Yes
POST	/api/users/tickets	Create support ticket	Yes
GET	/api/users/tickets	Get my tickets	Yes
POST	/api/users/tickets/:id/reply	Reply to ticket	Yes
POST	/api/users/ratings	Rate a product	Yes
GET	/api/users/notifications	Get my notifications	Yes
PUT	/api/users/notifications/:id/read	Mark as read	Yes
PUT	/api/users/address	Update address	Yes
🛍️ PRODUCTS
Method	Endpoint	Description	Auth Required
GET	/api/products	Get all products	No
GET	/api/products/:id	Get single product	No
GET	/api/products/featured	Get featured products	No
GET	/api/products/new	Get new arrivals	No
GET	/api/products/category/:id	Get by category	No
GET	/api/products/:id/related	Get related products	No
📦 ORDERS
Method	Endpoint	Description	Auth Required
POST	/api/orders	Create new order	Yes
GET	/api/orders/:id	Get order details	Yes
PUT	/api/orders/:id/cancel	Cancel order	Yes
POST	/api/orders/:id/payment-proof	Upload payment proof	Yes
👑 ADMIN ENDPOINTS (Admin only)
Method	Endpoint	Description
GET	/api/admin/dashboard	Get dashboard stats
GET	/api/admin/users	Get all users
PUT	/api/admin/users/:id	Update user
DELETE	/api/admin/users/:id	Delete user
POST	/api/admin/products	Create product
PUT	/api/admin/products/:id	Update product
DELETE	/api/admin/products/:id	Delete product
GET	/api/admin/orders	Get all orders
PUT	/api/admin/orders/:id/status	Update order status
PUT	/api/admin/payments/:id/verify	Verify payment
GET	/api/admin/tickets	Get all tickets
POST	/api/admin/tickets/:id/reply	Reply to ticket
POST	/api/admin/notifications/broadcast	Send to all users
📋 OTHER ENDPOINTS
Method	Endpoint	Description	Auth Required
GET	/api/categories	Get all categories	No
GET	/api/categories/:id	Get category details	No
GET	/api/payments/:id	Get payment details	Yes
GET	/api/health	Health check	No
🎯 HOW TO USE EACH FEATURE
1. User Registration
javascript
// Request
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "phone": "+1234567890"
}

// Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65a1b2c3d4e5f67890123456",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
2. User Login
javascript
// Request
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "secure123"
}

// Response - Same as registration
3. Create Admin User (First Time)
Run this in MongoDB shell:

javascript
use ecommerce_db

db.users.insertOne({
  name: "Admin User",
  email: "admin@yourstore.com",
  password: "$2a$10$YourHashedPasswordHere", // Hash "admin123" using bcrypt
  role: "admin",
  phone: "+1234567890",
  isActive: true,
  createdAt: new Date()
})
Or use this Node.js script:

javascript
const bcrypt = require('bcryptjs');
const password = "admin123";
const hashed = bcrypt.hashSync(password, 10);
console.log("Hashed password:", hashed);
4. Browse Products
javascript
// Get all products with filters
GET /api/products?category=65a1b2c3&minPrice=100&maxPrice=1000&featured=true

// Get single product
GET /api/products/65a1b2c3d4e5f67890123456

// Search products
GET /api/products?search=iphone

// Sort options:
// ?sort=price_asc (low to high)
// ?sort=price_desc (high to low)
// ?sort=newest (newest first)
// ?sort=popular (most sold first)
5. Create Order
javascript
POST /api/orders
Authorization: Bearer YOUR_JWT_TOKEN
{
  "items": [
    {
      "product": "65a1b2c3d4e5f67890123456",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "phone": "+1234567890",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  },
  "paymentMethod": "bank_transfer",
  "notes": "Please deliver before 5 PM"
}

// Response includes order and payment details
6. Upload Payment Proof
javascript
POST /api/orders/65a1b2c3d4e5f67890123456/payment-proof
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

// Form Data:
// paymentProof: (file) - Screenshot of payment
7. Rate a Product
javascript
POST /api/users/ratings
Authorization: Bearer YOUR_JWT_TOKEN
{
  "productId": "65a1b2c3d4e5f67890123456",
  "rating": 5,
  "review": "Excellent product!",
  "orderId": "ORD-123456" // Optional: proves purchase
}
8. Create Support Ticket
javascript
POST /api/users/tickets
Authorization: Bearer YOUR_JWT_TOKEN
{
  "subject": "Order not delivered",
  "message": "My order #ORD-123456 hasn't arrived yet",
  "type": "delivery",
  "orderId": "65a1b2c3d4e5f67890123456" // Optional
}
👑 ADMIN DASHBOARD GUIDE
1. Dashboard Statistics
javascript
GET /api/admin/dashboard
Authorization: Bearer ADMIN_JWT_TOKEN

// Response
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "totalProducts": 89,
    "totalOrders": 342,
    "totalRevenue": 45890.50,
    "pendingOrders": 12,
    "pendingPayments": 8,
    "openTickets": 5
  }
}
2. Manage Products
javascript
// Create product (with images)
POST /api/admin/products
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: multipart/form-data

// Form Data:
// name: iPhone 15 Pro
// description: Latest iPhone model
// price: 999.99
// oldPrice: 1099.99
// category: 65a1b2c3d4e5f67890123456
// stock: 50
// featured: true
// colors[]: Black
// colors[]: White
// sizes[]: 128GB
// sizes[]: 256GB
// productImages: (file) - Can upload multiple

// Update product
PUT /api/admin/products/65a1b2c3d4e5f67890123456
// Same as create, can add more images

// Delete product
DELETE /api/admin/products/65a1b2c3d4e5f67890123456
3. Manage Orders
javascript
// Get all orders
GET /api/admin/orders

// Update order status
PUT /api/admin/orders/65a1b2c3d4e5f67890123456/status
{
  "status": "shipped",
  "trackingNumber": "TRK123456789"
}

// Status flow:
// pending → processing → shipped → delivered
// Can also be cancelled at any point
4. Manual Payment Verification
javascript
// 1. User uploads payment proof
// 2. Admin checks uploaded file at: /uploads/payments/filename.jpg
// 3. Verify payment
PUT /api/admin/payments/65a1b2c3d4e5f67890123456/verify
Authorization: Bearer ADMIN_JWT_TOKEN
// Empty body

// This automatically:
// - Updates payment status to "completed"
// - Updates order payment status to "paid"
// - Sends email to user
5. Manage Support Tickets
javascript
// Get all tickets
GET /api/admin/tickets
// Filter by status: /api/admin/tickets?status=open

// Reply to ticket
POST /api/admin/tickets/65a1b2c3d4e5f67890123456/reply
{
  "message": "We've shipped your order. Tracking: TRK123456789"
}

// Ticket automatically:
// - Gets assigned to you
// - Status changes to "in_progress"
// - User gets real-time notification
6. Send Notifications to Users
javascript
// Send to single user (automatically via tickets/orders)

// Broadcast to ALL users
POST /api/admin/notifications/broadcast
{
  "title": "Site Maintenance",
  "message": "Store will be down Sunday 2-4 AM for maintenance.",
  "type": "system"
}

// This:
// 1. Creates notification for every user
// 2. Sends real-time notification to connected users
// 3. Appears in user's notification center
7. Manage Users
javascript
// Get all users
GET /api/admin/users

// Update user
PUT /api/admin/users/65a1b2c3d4e5f67890123456
{
  "role": "admin",  // Make someone admin
  "isActive": false // Deactivate account
}

// Delete user
DELETE /api/admin/users/65a1b2c3d4e5f67890123456
// Cannot delete admin users
📁 FILE UPLOAD SYSTEM
Supported File Types:
Images: .jpg, .jpeg, .png, .gif

Documents: .pdf (for payment proofs)

File Size Limit: 10MB per file
Upload Locations:
Product Images: /uploads/products/

User Avatars: /uploads/users/

Payment Proofs: /uploads/payments/

Access Uploaded Files:
text
http://localhost:5000/uploads/products/filename.jpg
http://localhost:5000/uploads/payments/receipt.pdf
Upload Example (Frontend):
javascript
// Using FormData for product images
const formData = new FormData();
formData.append('name', 'Product Name');
formData.append('price', '99.99');
formData.append('productImages', fileInput.files[0]);
formData.append('productImages', fileInput.files[1]);

fetch('/api/admin/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
🔔 REAL-TIME NOTIFICATIONS
Socket.io Events:
For Users:
javascript
// Connect to socket
const socket = io('http://localhost:5000');

// Join user room (after login)
socket.emit('user-join', userId);

// Listen for notifications
socket.on('order-update', (data) => {
  console.log(`Order ${data.orderId} status: ${data.status}`);
});

socket.on('ticket-reply', (data) => {
  console.log(`Ticket ${data.ticketId}: ${data.message}`);
});

socket.on('broadcast-notification', (data) => {
  console.log(`Broadcast: ${data.title} - ${data.message}`);
});
For Admins:
javascript
// Join admin room
socket.emit('admin-join');

// Listen for admin notifications
socket.on('new-order', (data) => {
  console.log(`New order: ${data.orderId}`);
});

socket.on('new-ticket', (data) => {
  console.log(`New ticket: ${data.ticketId}`);
});

socket.on('payment-proof-uploaded', (data) => {
  console.log(`Payment proof for order ${data.orderId}`);
});
Automatic Notifications:
Order Status Changes: User notified immediately

Ticket Replies: Both user and admin notified

New Orders/Tickets: Admin notified

Payment Verification: User notified when payment verified

Broadcast Messages: All users notified

📧 EMAIL SYSTEM
Configure Email (Gmail Example):
Go to Google Account → Security

Enable 2-Factor Authentication

Generate App Password

Use that password in .env

Emails Sent Automatically:
Order Confirmation - When order is placed

Payment Verified - When admin verifies payment

Order Shipped - When order status changes to shipped

Order Delivered - When order status changes to delivered

Password Reset - When user requests reset

Test Email Setup:
javascript
// Create a test route in server.js
app.get('/test-email', async (req, res) => {
  const sendEmail = require('./utils/email');
  const success = await sendEmail({
    email: 'test@example.com',
    subject: 'Test Email',
    message: 'This is a test email from your e-commerce backend'
  });
  
  res.json({ success });
});
🛡️ SECURITY FEATURES
1. JWT Authentication
Tokens expire in 7 days (configurable in .env)

Stored in Authorization header: Bearer token_here

Automatic token validation on protected routes

2. Password Security
BCrypt hashing with salt rounds

Passwords never stored in plain text

Password reset tokens expire in 1 hour

3. Rate Limiting
100 requests per 15 minutes per IP

Prevents brute force attacks

Configurable in server.js

4. CORS Protection
Only allows requests from FRONTEND_URL in .env

Prevents unauthorized domain access

5. Helmet.js
Sets security HTTP headers

Prevents common web vulnerabilities

6. Input Validation
Mongoose schema validation

Required field checks

Data type validation

Protected Routes Example:
javascript
// User only routes
router.get('/orders', protect, getMyOrders);

// Admin only routes
router.get('/dashboard', protect, admin, getDashboardStats);

// Public routes
router.get('/products', getProducts);
⚡ QUICK COMMANDS REFERENCE
Start Development:
bash
npm run dev
# Server: http://localhost:5000
# Health check: http://localhost:5000/api/health
Start Production:
bash
npm start
Check MongoDB Connection:
bash
mongosh
> use ecommerce_db
> db.users.find().count()
Reset Database (Careful!):
bash
mongosh
> use ecommerce_db
> db.dropDatabase()
View Logs:
bash
# Check server logs
tail -f server.log

# Check error logs
tail -f error.log
Backup Database:
bash
mongodump --db ecommerce_db --out ./backup/$(date +%Y-%m-%d)
Restore Database:
bash
mongorestore --db ecommerce_db ./backup/2024-01-01/ecommerce_db
🔧 TROUBLESHOOTING
1. Server Won't Start
text
❌ Error: "Port 5000 already in use"
✅ Fix: Change PORT in .env or kill process:
      lsof -ti:5000 | xargs kill -9
2. MongoDB Connection Failed
text
❌ Error: "MongoDB connection error"
✅ Fix 1: Check if MongoDB is running:
      brew services list (macOS)
      sudo systemctl status mongod (Linux)
      
✅ Fix 2: Update MONGODB_URI in .env:
      mongodb://localhost:27017/ecommerce_db
3. File Uploads Not Working
text
❌ Error: "File upload failed"
✅ Fix 1: Check uploads directory permissions:
      chmod -R 755 uploads/
      
✅ Fix 2: Check file size limit (10MB max)
      
✅ Fix 3: Check file type (.jpg, .png, .gif, .pdf only)
4. Email Not Sending
text
❌ Error: "Email failed to send"
✅ Fix 1: Check Gmail App Password setup
      
✅ Fix 2: Check .env SMTP settings:
      SMTP_USER=your_email@gmail.com
      SMTP_PASS=your_16_digit_app_password
      
✅ Fix 3: Allow less secure apps (if not using app password)
5. JWT Token Not Working
text
❌ Error: "Invalid token" or "Not authorized"
✅ Fix 1: Check if token is in header:
      Authorization: Bearer your_token_here
      
✅ Fix 2: Token might be expired (7 days default)
      Login again to get new token
      
✅ Fix 3: Check JWT_SECRET in .env matches
6. Admin Access Denied
text
❌ Error: "Access denied. Admin only."
✅ Fix 1: Check user role in database:
      db.users.find({email: "admin@email.com"})
      
✅ Fix 2: Update user role to "admin":
      db.users.updateOne(
        {email: "user@email.com"},
        {$set: {role: "admin"}}
      )
7. Real-time Notifications Not Working
text
❌ Error: Socket.io not connecting
✅ Fix 1: Check Socket.io server is running
      
✅ Fix 2: Frontend must connect to correct URL:
      const socket = io('http://localhost:5000');
      
✅ Fix 3: Check CORS settings in .env:
      FRONTEND_URL=http://localhost:3000
📈 MONITORING & MAINTENANCE
Daily Tasks:
✅ Check /api/admin/dashboard for stats

✅ Review pending payments

✅ Check open support tickets

✅ Monitor server logs

Weekly Tasks:
✅ Backup database

✅ Review product stock levels

✅ Check for low stock products

✅ Review user registrations

Monthly Tasks:
✅ Update dependencies: npm update

✅ Clean up old uploaded files

✅ Review server performance

✅ Check error logs for patterns

Performance Monitoring:
javascript
// Add to server.js for basic monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
});
🚀 DEPLOYMENT GUIDE
1. Prepare for Production
bash
# 1. Update .env for production
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecommerce_db
PORT=3000
JWT_SECRET=very_strong_secret_here
FRONTEND_URL=https://yourdomain.com

# 2. Install only production dependencies
npm install --production

# 3. Set up process manager (PM2 recommended)
npm install -g pm2
2. PM2 Setup
bash
# Start application
pm2 start server.js --name "ecommerce-backend"

# Monitor
pm2 monit

# Save process list
pm2 save

# Startup script
pm2 startup

# Common commands
pm2 logs ecommerce-backend    # View logs
pm2 restart ecommerce-backend # Restart
pm2 stop ecommerce-backend    # Stop
pm2 delete ecommerce-backend  # Remove
3. NGINX Reverse Proxy
nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Increase file upload size
    client_max_body_size 10M;
}
4. SSL Certificate (HTTPS)
bash
# Using Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
📚 ADDITIONAL FEATURES TO ADD
1. Wishlist System
javascript
// In User model
wishlist: [{
  product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
  addedAt: {type: Date, default: Date.now}
}]

// Endpoints
POST /api/users/wishlist/:productId    # Add to wishlist
DELETE /api/users/wishlist/:productId  # Remove from wishlist
GET /api/users/wishlist                # Get wishlist
2. Coupon/Discount System
javascript
// New model: Coupon.js
{
  code: "SAVE20",
  discountType: "percentage", // or "fixed"
  discountValue: 20,
  minPurchase: 50,
  maxUses: 100,
  usedCount: 0,
  validFrom: Date,
  validUntil: Date,
  isActive: true
}
3. Inventory Management
javascript
// Low stock alerts
app.get('/api/admin/low-stock', async (req, res) => {
  const lowStockProducts = await Product.find({
    stock: {$lt: 10},
    inStock: true
  });
  res.json({products: lowStockProducts});
});
4. Analytics Endpoints
javascript
// Sales by date
app.get('/api/admin/analytics/sales', async (req, res) => {
  const sales = await Order.aggregate([
    {$match: {paymentStatus: 'paid'}},
    {$group: {
      _id: {$dateToString: {format: "%Y-%m-%d", date: "$createdAt"}},
      total: {$sum: "$total"},
      count: {$sum: 1}
    }},
    {$sort: {_id: 1}}
  ]);
  res.json({sales});
});
5. Bulk Operations
javascript
// Bulk update product prices
app.put('/api/admin/products/bulk/update-prices', async (req, res) => {
  const {percentage, categoryId} = req.body;
  await Product.updateMany(
    {category: categoryId},
    {$mul: {price: 1 + (percentage/100)}}
  );
  res.json({success: true});
});
🆘 SUPPORT & CONTACT
Quick Debug Endpoints:
bash
# Health check
curl http://localhost:5000/api/health

# Database connection test
curl http://localhost:5000/api/test-db

# Email test
curl http://localhost:5000/test-email
Common Issues & Solutions:
Issue: "Cannot GET /api/..."
Solution: Check if routes are properly mounted in server.js

Issue: "Validation failed"
Solution: Check request body matches model schema

Issue: "Socket.io connection failed"
Solution: Check CORS settings and frontend connection URL

Issue: "File not found after upload"
Solution: Check uploads directory permissions and path

🎉 CONGRATULATIONS!
Your e-commerce backend is now fully set up with:

✅ User Management - Registration, login, profiles
✅ Product Management - CRUD with multiple images
✅ Order System - Complete checkout flow
✅ Payment Processing - Manual verification system
✅ Support Tickets - Customer support system
✅ Real-time Notifications - Socket.io integration
✅ Admin Dashboard - Complete admin controls
✅ Security - JWT, rate limiting, CORS
✅ File Uploads - Images and documents
✅ Email System - Automated notifications
# walkerfarmsbackend
