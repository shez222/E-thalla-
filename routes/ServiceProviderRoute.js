const express = require('express');
const router = express.Router();
const serviceProviderDetailController = require('../controllers/ServiceProvider');


// CRUD routes for ServiceProviderDetail

// Create a new ServiceProviderDetail
router.post('/serviceProviderDetails', serviceProviderDetailController.createServiceProviderDetail);

// Get all ServiceProviderDetails
router.get('/serviceProviderDetails', serviceProviderDetailController.getAllServiceProviderDetails);

// Get a specific ServiceProviderDetail by ID
router.get('/serviceProviderDetails/:id', serviceProviderDetailController.getServiceProviderDetailById);

// Update a ServiceProviderDetail by ID
router.put('/serviceProviderDetails/:id', serviceProviderDetailController.updateServiceProviderDetail);

// Delete a ServiceProviderDetail by ID
router.delete('/serviceProviderDetails/:id', serviceProviderDetailController.deleteServiceProviderDetail);

module.exports = router;











// const express = require('express');
// const router = express.Router();
// const serviceProviderDetailController = require('../controllers/ServiceProvider');

// // Multer configuration specific to ServiceProviderDetailRoute
// const multer = require('multer');
// const { v4: uuidv4 } = require('uuid');
// const path = require('path');

// // Multer storage configuration
// const fileStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'images'); // Ensure this directory exists
//     },
//     filename: function (req, file, cb) {
//         const uniqueFilename = `${uuidv4()}.${file.originalname.split('.').pop()}`;
//         cb(null, uniqueFilename);
//     }
// });

// // Multer file filter
// const fileFilter = (req, file, cb) => {
//     if (
//         file.mimetype === 'image/png' ||
//         file.mimetype === 'image/jpg' ||
//         file.mimetype === 'image/jpeg'
//     ) {
//         cb(null, true);
//     } else {
//         cb(null, false);
//     }
// };

// // Initialize Multer with the above configurations
// const upload = multer({ storage: fileStorage, fileFilter: fileFilter });

// // CRUD routes for ServiceProviderDetail

// // Create a new ServiceProviderDetail with multiple images
// router.post(
//     '/serviceProviderDetails',
//     upload.fields([
//         { name: 'previousWorkImages', maxCount: 10 },
//         { name: 'certificateImages', maxCount: 5 }
//     ]),
//     serviceProviderDetailController.createServiceProviderDetail
// );

// // Get all ServiceProviderDetails
// router.get('/serviceProviderDetails', serviceProviderDetailController.getAllServiceProviderDetails);

// // Get a specific ServiceProviderDetail by ID
// router.get('/serviceProviderDetails/:id', serviceProviderDetailController.getServiceProviderDetailById);

// // Update a ServiceProviderDetail by ID with multiple images
// router.put(
//     '/serviceProviderDetails/:id',
//     upload.fields([
//         { name: 'previousWorkImages', maxCount: 10 },
//         { name: 'certificateImages', maxCount: 5 }
//     ]),
//     serviceProviderDetailController.updateServiceProviderDetail
// );

// // Delete a ServiceProviderDetail by ID
// router.delete('/serviceProviderDetails/:id', upload.none(), serviceProviderDetailController.deleteServiceProviderDetail);

// module.exports = router;
