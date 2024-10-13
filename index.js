const express = require('express');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Import routes
const MultiUseruserRoutes = require('./routes/multiUserRoutes');
const vendorRoutes = require('./routes/VendorRoute');
const shopRoutes = require('./routes/ShopRoutes');
const serviceProviderRoutes = require('./routes/ServiceProviderRoute'); // Add this line
const db = require('./models');
const User = db.User;

// Initialize Express app
const app = express();

// // Middleware to parse JSON and URL-encoded data
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// const storage = multer.memoryStorage(); // Using memory storage since we're not handling files
// app.use(multer({ storage: storage }).any())

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
app.get('/', (req,res,next)=>{
    res.json("sgahdhgda")
    next()
});

// Routes without file uploads
// app.use('/E-Thalla', MultiUseruserRoutes);
// app.use('/Shop', shopRoutes);
// app.use('/service-provider-details', serviceProviderRoutes); // Add this line

// // Routes with file uploads will be handled in their respective route files
// app.use('/Vendors', vendorRoutes);

// Error Handling Middleware (Optional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
