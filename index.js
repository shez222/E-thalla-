const express = require('express');

// Import routes
const MultiUseruserRoutes = require('./routes/multiUserRoutes');
const vendorRoutes = require('./routes/VendorRoute');
const shopRoutes = require('./routes/ShopRoutes');
const serviceProviderRoutes = require('./routes/ServiceProviderRoute'); // Add this line
const db = require('./models');
const User = db.User;

// Initialize Express app
const app = express();

// Middleware to parse JSON and URL-encoded data
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Middleware to attach user to request
// app.use(async (req, res, next) => {
//     try {
//         const user = await User.findByPk(1);
//         req.user = user;
//         next();
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// Root route for testing
app.get('/', (req, res, next) => {
    res.json("Server is running!");
    next();
});

// Routes without file uploads
app.use('/E-Thalla', MultiUseruserRoutes);
app.use('/Shop', shopRoutes);
app.use('/service-provider-details', serviceProviderRoutes);

// Routes with file uploads
app.use('/Vendors', vendorRoutes);

// Error Handling Middleware (Optional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Export the app for serverless functions
module.exports = app;
