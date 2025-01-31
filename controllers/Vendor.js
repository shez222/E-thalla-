// controllers/vendorController.js

const db = require('../models');
const { Op } = require('sequelize'); // If needed for advanced queries
const fs = require('fs');
const path = require('path');
const { sequelize } = db;

// Models
const VendorDetail = db.VendorDetail;
const User = db.User;
const Product = db.Product;
const Shop = db.Shop;
const Availability = db.Availability;
const LicenseCertificate = db.LicenseCertificate;
const AvailabilityDay = db.AvailabilityDay;
const ProductImage = db.ProductImage;

/**
 * ===============================
 * VendorDetail Controller Functions
 * ===============================
 */

/**
 * Create a new VendorDetail
 */
const createVendorDetail = async (req, res) => {
    try {
        const {
            name,
            email,
            serviceType,
            phoneNumber,
            description,
            selectedItems,
            images, // Array of image URLs
            certificateImages, // Array of certificate image URLs
            location, // { lat: Number, lng: Number }
            userId
        } = req.body;

        // Validate required fields
        if (!name || !email || !serviceType || !phoneNumber || !description || !selectedItems || !userId) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        // Check if a VendorDetail already exists for the given userId
        const existingVendor = await VendorDetail.findOne({ where: { userId } });
        if (existingVendor) {
            return res.status(201).json({
                message: 'A vendor detail already exists for this user.',
                existingVendor: existingVendor // Return the existing vendor detail
            });
        }

        // Validate location if provided
        let locationData = null;
        if (location) {
            const { lat, lng } = location;
            if (typeof lat !== 'number' || typeof lng !== 'number') {
                return res.status(400).json({ message: 'Invalid location format. "lat" and "lng" must be numbers.' });
            }
            locationData = { lat, lng };
        }

        // Process image URLs from request body
        const imagesArray = Array.isArray(images) ? images : [];
        const certificateImagesArray = Array.isArray(certificateImages) ? certificateImages : [];

        // Parse selectedItems if it's a string
        let selectedItemsParsed;
        try {
            selectedItemsParsed = typeof selectedItems === 'string' ? JSON.parse(selectedItems) : selectedItems;
        } catch (parseError) {
            return res.status(400).json({ message: 'selectedItems must be a valid JSON object.' });
        }

        // Create VendorDetail
        const newVendorDetail = await VendorDetail.create({
            name,
            email,
            serviceType,
            phoneNumber,
            description,
            selectedItems: selectedItemsParsed,
            uploadImages: {
                images: imagesArray,
                certificateImages: certificateImagesArray
            },
            location: locationData,
            userId
        });

        res.status(201).json({ message: 'VendorDetail created successfully.', data: newVendorDetail });
    } catch (error) {
        console.error('Error creating VendorDetail:', error);
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};


// const createVendorDetail = async (req, res) => {
//     try {
//         const {
//             name,
//             email,
//             serviceType,
//             phoneNumber,
//             description,
//             selectedItems,
//             images, // Array of image URLs
//             certificateImages, // Array of certificate image URLs
//             location, // { lat: Number, lng: Number }
//             userId
//         } = req.body;

//         // Validate required fields
//         if (!name || !email || !serviceType || !phoneNumber || !description || !selectedItems || !userId) {
//             return res.status(400).json({ message: 'Missing required fields.' });
//         }

//         // Validate location if provided
//         let locationData = null;
//         if (location) {
//             const { lat, lng } = location;
//             if (typeof lat !== 'number' || typeof lng !== 'number') {
//                 return res.status(400).json({ message: 'Invalid location format. "lat" and "lng" must be numbers.' });
//             }
//             locationData = { lat, lng };
//         }
      

//         // Process image URLs from request body
//         const imagesArray = Array.isArray(images) ? images : [];
//         const certificateImagesArray = Array.isArray(certificateImages) ? certificateImages : [];

//         // Parse selectedItems if it's a string
//         let selectedItemsParsed;
//         try {
//             selectedItemsParsed = typeof selectedItems === 'string' ? JSON.parse(selectedItems) : selectedItems;
//         } catch (parseError) {
//             return res.status(400).json({ message: 'selectedItems must be a valid JSON object.' });
//         }

//         // Create VendorDetail
//         const newVendorDetail = await VendorDetail.create({
//             name,
//             email,
//             serviceType,
//             phoneNumber,
//             description,
//             selectedItems: selectedItemsParsed,
//             uploadImages: {
//                 images: imagesArray,
//                 certificateImages: certificateImagesArray
//             },
//             location: locationData,
//             userId
//         });

//         res.status(201).json({ message: 'VendorDetail created successfully.', data: newVendorDetail });
//     } catch (error) {
//         console.error('Error creating VendorDetail:', error);
//         res.status(500).json({ message: 'Internal server error.', error: error.message });
//     }
// };

/**
 * Get All VendorDetails
 */
const getAllVendorDetails = async (req, res) => {
    try {
        const vendorDetails = await VendorDetail.findAll({
            include: [{
                model: User,
                as: 'user',
                attributes: ['multiUserId', 'username', 'email'] // Adjust attributes as needed
            }]
        });

        return res.status(200).json({ data: vendorDetails });
    } catch (error) {
        console.error('Error fetching VendorDetails:', error);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};

/**
 * Get VendorDetail by ID
 */
const getVendorDetailById = async (req, res) => {
    try {
        const { vendorId } = req.params;

        const vendorDetail = await VendorDetail.findOne({
            where: { vendorId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['multiUserId', 'username', 'email'] // Adjust attributes as needed
            }]
        });

        if (!vendorDetail) {
            return res.status(404).json({ message: 'VendorDetail not found.' });
        }

        return res.status(200).json({ data: vendorDetail });
    } catch (error) {
        console.error('Error fetching VendorDetail:', error);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};

/**
 * Update VendorDetail
 */
const updateVendorDetail = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const updateData = {};

        // Extract fields that are allowed to be updated
        const allowedFields = ['name', 'email', 'serviceType', 'phoneNumber', 'description', 'selectedItems', 'images', 'certificateImages', 'location'];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) { // Allow fields with falsy values like empty strings or zero
                if (field === 'selectedItems') {
                    try {
                        updateData[field] = typeof req.body[field] === 'string' ? JSON.parse(req.body[field]) : req.body[field];
                    } catch (parseError) {
                        throw new Error('selectedItems must be a valid JSON object.');
                    }
                } else if (field === 'images' || field === 'certificateImages') {
                    updateData.uploadImages = updateData.uploadImages || {};
                    updateData.uploadImages[field] = Array.isArray(req.body[field]) ? req.body[field] : [];
                } else if (field === 'location') {
                    const { lat, lng } = req.body[field];
                    if (typeof lat !== 'number' || typeof lng !== 'number') {
                        throw new Error('Invalid location format. "lat" and "lng" must be numbers.');
                    }
                    updateData[field] = { lat, lng };
                } else {
                    updateData[field] = req.body[field];
                }
            }
        });

        // Update VendorDetail
        const [updatedRowsCount, updatedRows] = await VendorDetail.update(updateData, {
            where: { vendorId },
            returning: true
        });

        if (updatedRowsCount === 0) {
            return res.status(404).json({ message: 'VendorDetail not found or no changes made.' });
        }

        res.status(200).json({ message: 'VendorDetail updated successfully.', data: updatedRows[0] });
    } catch (error) {
        console.error('Error updating VendorDetail:', error);
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};

/**
 * Delete VendorDetail
 */
const deleteVendorDetail = async (req, res) => {
    try {
        const { vendorId } = req.params;

        const deletedRowsCount = await VendorDetail.destroy({
            where: { vendorId }
        });

        if (deletedRowsCount === 0) {
            return res.status(404).json({ message: 'VendorDetail not found.' });
        }

        return res.status(200).json({ message: 'VendorDetail deleted successfully.' });
    } catch (error) {
        console.error('Error deleting VendorDetail:', error);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};

/**
 * ===============================
 * Product Controller Functions
 * ===============================
 */

/**
 * Add a New Product
 */
const postAddProducts = async (req, res) => {
    try {
        const { title, description, price, shopId, imageUrls } = req.body; // imageUrls is an array of image URLs

        // Validate required fields
        if (!title || !price || !shopId) {
            return res.status(400).json({ message: 'Missing required fields: title, price, or shopId.' });
        }

        // Create Product
        const newProduct = await Product.create({
            title,
            price,
            imageUrl: Array.isArray(imageUrls) ? imageUrls : [],
            description,
            shopId
        });

        res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add product', error: err.message });
    }
};

/**
 * Get Product for Editing
 */
const getEditProducts = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findOne({
            where: { id: productId },
            include: [{ model: ProductImage, as: 'images' }]
        });

        if (!product) {
            return res.status(404).json({ message: 'No Such Product' });
        }

        res.status(200).json({ message: 'Product retrieved successfully for editing', product: product });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to retrieve product for editing', error: err.message });
    }
};

/**
 * Edit an Existing Product
 */
const postEditProducts = async (req, res) => {
    try {
        const { productId, title, price, description, imageUrls } = req.body; // imageUrls is an array of new image URLs

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required.' });
        }

        const product = await Product.findByPk(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update the product details
        product.title = title || product.title;
        product.price = price || product.price;
        product.description = description || product.description;

        if (imageUrls && Array.isArray(imageUrls)) {
            product.imageUrl = imageUrls;
        }

        await product.save();

        res.status(200).json({ message: 'Product updated successfully', product: product });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update product', error: err.message });
    }
};

/**
 * Delete a Product
 */
const postDeleteProduct = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required.' });
        }

        const product = await Product.findByPk(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.destroy();
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete product', error: err.message });
    }
};

/**
 * Get All Products
 */
const getProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [
                {
                    model: ProductImage,
                    as: 'images'
                }
            ]
        });
        res.status(200).json({ products });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to retrieve products', error: err.message });
    }
};

/**
 * ===============================
 * Shop Controller Functions
 * ===============================
 */

/**
 * Create a New Shop
 */
const createShop = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { shopDetails, items, availability, licensesAndCertificates } = req.body;

        const { shopName, location, phone, email, profilePicture, description, ownerName, vendorId } = shopDetails;

        // Validate location if provided
        let locationData = null;
        if (location) {
            const { lat, lng } = location;
            if (typeof lat !== 'number' || typeof lng !== 'number') {
                throw new Error('Invalid location format. "lat" and "lng" must be numbers.');
            }
            locationData = { lat, lng };
        }
console.log(location);

        // Create the Shop
        const shop = await Shop.create(
            {
                shopName,
                location: locationData, // Updated to handle JSON location
                phone,
                email,
                profilePicture,
                description,
                ownerName,
                vendorId // Assuming vendorId is part of shopDetails
            },
            { transaction }
        );

        // Create Availability and AvailabilityDays
        if (availability && availability.days && Array.isArray(availability.days)) {
            const shopAvailability = await Availability.create(
                {
                    shopId: shop.shopId
                },
                { transaction }
            );

            const availabilityDaysData = availability.days.map(day => ({
                availabilityId: shopAvailability.id,
                day: day.day,
                startTime: day.startTime || null,
                endTime: day.endTime || null,
                isClosed: day.isClosed
            }));

            await AvailabilityDay.bulkCreate(availabilityDaysData, { transaction });
        }

        // Create Licenses and Certificates
        if (licensesAndCertificates && Array.isArray(licensesAndCertificates)) {
            const licensesData = licensesAndCertificates.map(cert => ({
                shopId: shop.shopId,
                certificateId: cert.id,
                url: cert.url
            }));

            await LicenseCertificate.bulkCreate(licensesData, { transaction });
        }

        // Create Products and their Images
        if (items && Array.isArray(items)) {
            for (const item of items) {
                const { itemName, quality, quantity, price, imageUrls } = item; // imageUrls is an array

                // Create Product
                const product = await Product.create(
                    {
                        title: itemName,
                        quality,
                        quantity,
                        price,
                        shopId: shop.shopId
                    },
                    { transaction }
                );

                // Create Product Images
                if (imageUrls && Array.isArray(imageUrls)) {
                    const productImagesData = imageUrls.map(url => ({
                        productId: product.id,
                        url: url
                    }));

                    await ProductImage.bulkCreate(productImagesData, { transaction });
                }
            }
        }

        await transaction.commit();

        // Fetch the newly created shop with associations to return in response
        const createdShop = await Shop.findOne({
            where: { shopId: shop.shopId },
            include: [
                {
                    model: Product,
                    as: 'products',
                    include: [
                        {
                            model: ProductImage,
                            as: 'images'
                        }
                    ]
                },
                {
                    model: Availability,
                    as: 'availability',
                    include: [
                        {
                            model: AvailabilityDay,
                            as: 'days'
                        }
                    ]
                },
                {
                    model: LicenseCertificate,
                    as: 'licensesAndCertificates'
                }
            ]
        });

        res.status(201).json(createdShop);
    } catch (err) {
        await transaction.rollback();
        console.error(err);
        res.status(400).json({ message: err.message });
    }
};

/**
 * Get All Shops with Their Products
 */
const getShops = async (req, res) => {
    try {
        const shops = await Shop.findAll({
            include: [
                {
                    model: Product,
                    as: 'products',
                    include: [
                        {
                            model: ProductImage,
                            as: 'images'
                        }
                    ]
                },
                {
                    model: Availability,
                    as: 'availability',
                    include: [
                        {
                            model: AvailabilityDay,
                            as: 'days'
                        }
                    ]
                },
                {
                    model: LicenseCertificate,
                    as: 'licensesAndCertificates'
                }
            ]
        });
        res.status(200).json(shops);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

/**
 * Get a Single Shop by ID with Products, Availability, and Licenses
 */
const getShopById = async (req, res) => {
    try {
        const shop = await Shop.findByPk(req.params.shopId, {
            include: [
                {
                    model: Product,
                    as: 'products',
                    include: [
                        {
                            model: ProductImage,
                            as: 'images'
                        }
                    ]
                },
                {
                    model: Availability,
                    as: 'availability',
                    include: [
                        {
                            model: AvailabilityDay,
                            as: 'days'
                        }
                    ]
                },
                {
                    model: LicenseCertificate,
                    as: 'licensesAndCertificates'
                }
            ]
        });

        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        res.status(200).json(shop);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Update a Shop
 */
const updateShop = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { shopDetails, items, availability, licensesAndCertificates } = req.body;

        // Fetch the shop by primary key
        const shop = await Shop.findByPk(req.params.shopId, { // assuming ':shopId' is the param
            include: [
                {
                    model: Product,
                    as: 'products',
                    include: [
                        {
                            model: ProductImage,
                            as: 'images'
                        }
                    ]
                },
                {
                    model: Availability,
                    as: 'availability',
                    include: [
                        {
                            model: AvailabilityDay,
                            as: 'days'
                        }
                    ]
                },
                {
                    model: LicenseCertificate,
                    as: 'licensesAndCertificates'
                }
            ],
            transaction
        });

        if (!shop) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Shop not found' });
        }

        // Validate and prepare location data if provided
        let locationData = null;
        if (shopDetails.location) {
            const { lat, lng } = shopDetails.location;
            if (typeof lat !== 'number' || typeof lng !== 'number') {
                throw new Error('Invalid location format. "lat" and "lng" must be numbers.');
            }
            locationData = { lat, lng };
        }

        // Update shop details
        const { shopName, image, vendorId, location, description, ownerName } = shopDetails;
        await shop.update(
            { 
                shopName, 
                image, 
                vendorId, 
                location: locationData || shop.location, // Update location if provided
                description, 
                ownerName 
            },
            { transaction }
        );

        // Update Availability and AvailabilityDays
        if (availability && availability.days && Array.isArray(availability.days)) {
            if (shop.availability) {
                // Update existing AvailabilityDays
                await AvailabilityDay.destroy({ where: { availabilityId: shop.availability.id }, transaction });

                const availabilityDaysData = availability.days.map(day => ({
                    availabilityId: shop.availability.id,
                    day: day.day,
                    startTime: day.startTime || null,
                    endTime: day.endTime || null,
                    isClosed: day.isClosed
                }));

                await AvailabilityDay.bulkCreate(availabilityDaysData, { transaction });
            } else {
                // Create new Availability and AvailabilityDays
                const newAvailability = await Availability.create(
                    { shopId: shop.shopId },
                    { transaction }
                );

                const availabilityDaysData = availability.days.map(day => ({
                    availabilityId: newAvailability.id,
                    day: day.day,
                    startTime: day.startTime || null,
                    endTime: day.endTime || null,
                    isClosed: day.isClosed
                }));

                await AvailabilityDay.bulkCreate(availabilityDaysData, { transaction });
            }
        }

        // Update Licenses and Certificates
        if (licensesAndCertificates && Array.isArray(licensesAndCertificates)) {
            // Option 1: Delete existing and recreate
            await LicenseCertificate.destroy({ where: { shopId: shop.shopId }, transaction });

            const licensesData = licensesAndCertificates.map(cert => ({
                shopId: shop.shopId,
                certificateId: cert.id,
                url: cert.url
            }));

            await LicenseCertificate.bulkCreate(licensesData, { transaction });
        }

        // Update Products and their Images
        if (items && Array.isArray(items)) {
            for (const item of items) {
                const { id, itemName, quality, quantity, price, imageUrls } = item; // imageUrls is an array

                if (id) {
                    // Existing product - update
                    const existingProduct = await Product.findOne({
                        where: { id, shopId: shop.shopId },
                        include: [{ model: ProductImage, as: 'images' }],
                        transaction
                    });

                    if (existingProduct) {
                        await existingProduct.update(
                            { title: itemName, quality, quantity, price },
                            { transaction }
                        );

                        // Update Product Images
                        if (imageUrls && Array.isArray(imageUrls)) {
                            // Option 1: Delete existing images and recreate
                            await ProductImage.destroy({ where: { productId: existingProduct.id }, transaction });

                            const productImagesData = imageUrls.map(url => ({
                                productId: existingProduct.id,
                                url: url
                            }));

                            await ProductImage.bulkCreate(productImagesData, { transaction });
                        }
                    }
                } else {
                    // New product - create
                    const newProduct = await Product.create(
                        {
                            title: itemName,
                            quality,
                            quantity,
                            price,
                            shopId: shop.shopId
                        },
                        { transaction }
                    );

                    if (imageUrls && Array.isArray(imageUrls)) {
                        const productImagesData = imageUrls.map(url => ({
                            productId: newProduct.id,
                            url: url
                        }));

                        await ProductImage.bulkCreate(productImagesData, { transaction });
                    }
                }
            }

            // Optionally, handle deletion of products not present in the update
            // Example:
            // const updatedProductIds = items.filter(item => item.id).map(item => item.id);
            // await Product.destroy({ where: { shopId: shop.shopId, id: { [Op.notIn]: updatedProductIds } }, transaction });
        }

        await transaction.commit();

        // Fetch the updated shop with associations to return in response
        const updatedShop = await Shop.findOne({
            where: { shopId: shop.shopId },
            include: [
                {
                    model: Product,
                    as: 'products',
                    include: [
                        {
                            model: ProductImage,
                            as: 'images'
                        }
                    ]
                },
                {
                    model: Availability,
                    as: 'availability',
                    include: [
                        {
                            model: AvailabilityDay,
                            as: 'days'
                        }
                    ]
                },
                {
                    model: LicenseCertificate,
                    as: 'licensesAndCertificates'
                }
            ]
        });

        res.status(200).json(updatedShop);
    } catch (err) {
        await transaction.rollback();
        console.error(err);
        res.status(400).json({ message: err.message });
    }
};

/**
 * Delete a Shop and its Products
 */
const deleteShop = async (req, res) => {
    try {
        const { shopId } = req.params;

        const shop = await Shop.findByPk(shopId);
        if (!shop) return res.status(404).json({ message: 'Shop not found' });

        // Deleting the shop will also delete associated products due to CASCADE
        await shop.destroy();
        res.status(200).json({ message: 'Shop deleted successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete shop.', error: err.message });
    }
};

/**
 * ===============================
 * Export Controller Functions
 * ===============================
 */

module.exports = {
    // VendorDetail Functions
    createVendorDetail,
    getAllVendorDetails,
    getVendorDetailById,
    updateVendorDetail,
    deleteVendorDetail,

    // Product Functions
    postAddProducts,
    getEditProducts,
    postEditProducts,
    postDeleteProduct,
    getProducts,

    // Shop Functions
    createShop,
    getShops,
    getShopById,
    updateShop,
    deleteShop
};










// // controllers/vendorController.js

// const db = require('../models');
// const { Op } = require('sequelize'); // If needed for advanced queries
// const fs = require('fs');
// const path = require('path');
// const { sequelize } = db;

// // Models
// const VendorDetail = db.VendorDetail;
// const User = db.User;
// const Product = db.Product;
// const Shop = db.Shop;
// const Availability = db.Availability;
// const LicenseCertificate = db.LicenseCertificate;
// const AvailabilityDay = db.AvailabilityDay;
// const ProductImage = db.ProductImage;

// /**
//  * ===============================
//  * VendorDetail Controller Functions
//  * ===============================
//  */

// /**
//  * Create a new VendorDetail
//  */
// const createVendorDetail = async (req, res) => {
//     try {
//         const {
//             name,
//             email,
//             serviceType,
//             phoneNumber,
//             description,
//             selectedItems,
//             images, // Array of image URLs
//             certificateImages, // Array of certificate image URLs
//             userId
//         } = req.body;

//         // Validate required fields
//         if (!name || !email || !serviceType || !phoneNumber || !description || !selectedItems || !userId) {
//             return res.status(400).json({ message: 'Missing required fields.' });
//         }

//         // Process image URLs from request body
//         const imagesArray = Array.isArray(images) ? images : [];
//         const certificateImagesArray = Array.isArray(certificateImages) ? certificateImages : [];

//         // Create VendorDetail
//         const newVendorDetail = await VendorDetail.create({
//             name,
//             email,
//             serviceType,
//             phoneNumber,
//             description,
//             selectedItems: JSON.parse(selectedItems), // Assuming JSON string is sent
//             uploadImages: {
//                 images: imagesArray,
//                 certificateImages: certificateImagesArray
//             },
//             userId
//         });

//         res.status(201).json({ message: 'VendorDetail created successfully.', data: newVendorDetail });
//     } catch (error) {
//         console.error('Error creating VendorDetail:', error);
//         res.status(500).json({ message: 'Internal server error.', error: error.message });
//     }
// };

// /**
//  * Get All VendorDetails
//  */
// const getAllVendorDetails = async (req, res) => {
//     try {
//         const vendorDetails = await VendorDetail.findAll({
//             include: [{
//                 model: User,
//                 as: 'user',
//                 attributes: ['multiUserId', 'username', 'email'] // Adjust attributes as needed
//             }]
//         });

//         return res.status(200).json({ data: vendorDetails });
//     } catch (error) {
//         console.error('Error fetching VendorDetails:', error);
//         return res.status(500).json({ message: 'Internal server error.', error: error.message });
//     }
// };

// /**
//  * Get VendorDetail by ID
//  */
// const getVendorDetailById = async (req, res) => {
//     try {
//         const { vendorId } = req.params;

//         const vendorDetail = await VendorDetail.findOne({
//             where: { vendorId },
//             include: [{
//                 model: User,
//                 as: 'user',
//                 attributes: ['multiUserId', 'username', 'email'] // Adjust attributes as needed
//             }]
//         });

//         if (!vendorDetail) {
//             return res.status(404).json({ message: 'VendorDetail not found.' });
//         }

//         return res.status(200).json({ data: vendorDetail });
//     } catch (error) {
//         console.error('Error fetching VendorDetail:', error);
//         return res.status(500).json({ message: 'Internal server error.', error: error.message });
//     }
// };

// /**
//  * Update VendorDetail
//  */
// const updateVendorDetail = async (req, res) => {
//     try {
//         const { vendorId } = req.params;
//         const updateData = {};

//         // Extract fields that are allowed to be updated
//         const allowedFields = ['name', 'email', 'serviceType', 'phoneNumber', 'description', 'selectedItems', 'images', 'certificateImages'];

//         allowedFields.forEach(field => {
//             if (req.body[field]) {
//                 if (field === 'selectedItems') {
//                     updateData[field] = JSON.parse(req.body[field]);
//                 } else if (field === 'images' || field === 'certificateImages') {
//                     updateData.uploadImages = updateData.uploadImages || {};
//                     updateData.uploadImages[field] = Array.isArray(req.body[field]) ? req.body[field] : [];
//                 } else {
//                     updateData[field] = req.body[field];
//                 }
//             }
//         });

//         // Update VendorDetail
//         const [updatedRowsCount, updatedRows] = await VendorDetail.update(updateData, {
//             where: { vendorId },
//             returning: true
//         });

//         if (updatedRowsCount === 0) {
//             return res.status(404).json({ message: 'VendorDetail not found or no changes made.' });
//         }

//         res.status(200).json({ message: 'VendorDetail updated successfully.', data: updatedRows[0] });
//     } catch (error) {
//         console.error('Error updating VendorDetail:', error);
//         res.status(500).json({ message: 'Internal server error.', error: error.message });
//     }
// };

// /**
//  * Delete VendorDetail
//  */
// const deleteVendorDetail = async (req, res) => {
//     try {
//         const { vendorId } = req.params;

//         const deletedRowsCount = await VendorDetail.destroy({
//             where: { vendorId }
//         });

//         if (deletedRowsCount === 0) {
//             return res.status(404).json({ message: 'VendorDetail not found.' });
//         }

//         return res.status(200).json({ message: 'VendorDetail deleted successfully.' });
//     } catch (error) {
//         console.error('Error deleting VendorDetail:', error);
//         return res.status(500).json({ message: 'Internal server error.', error: error.message });
//     }
// };

// /**
//  * ===============================
//  * Product Controller Functions
//  * ===============================
//  */

// /**
//  * Add a New Product
//  */
// const postAddProducts = async (req, res) => {
//     try {
//         const { title, description, price, shopId, imageUrls } = req.body; // imageUrls is an array of image URLs

//         // Validate required fields
//         if (!title || !price || !shopId) {
//             return res.status(400).json({ message: 'Missing required fields: title, price, or shopId.' });
//         }

//         // Create Product
//         const newProduct = await Product.create({
//             title,
//             price,
//             imageUrl: Array.isArray(imageUrls) ? imageUrls : [],
//             description,
//             shopId
//         });

//         res.status(201).json({ message: 'Product added successfully', product: newProduct });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Failed to add product', error: err.message });
//     }
// };

// /**
//  * Get Product for Editing
//  */
// const getEditProducts = async (req, res) => {
//     try {
//         const { productId } = req.params;

//         const product = await Product.findOne({
//             where: { id: productId },
//             include: [{ model: ProductImage, as: 'images' }]
//         });

//         if (!product) {
//             return res.status(404).json({ message: 'No Such Product' });
//         }

//         res.status(200).json({ message: 'Product retrieved successfully for editing', product: product });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Failed to retrieve product for editing', error: err.message });
//     }
// };

// /**
//  * Edit an Existing Product
//  */
// const postEditProducts = async (req, res) => {
//     try {
//         const { productId, title, price, description, imageUrls } = req.body; // imageUrls is an array of new image URLs

//         if (!productId) {
//             return res.status(400).json({ message: 'Product ID is required.' });
//         }

//         const product = await Product.findByPk(productId);

//         if (!product) {
//             return res.status(404).json({ message: 'Product not found' });
//         }

//         // Update the product details
//         product.title = title || product.title;
//         product.price = price || product.price;
//         product.description = description || product.description;

//         if (imageUrls && Array.isArray(imageUrls)) {
//             product.imageUrl = imageUrls;
//         }

//         await product.save();

//         res.status(200).json({ message: 'Product updated successfully', product: product });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Failed to update product', error: err.message });
//     }
// };

// /**
//  * Delete a Product
//  */
// const postDeleteProduct = async (req, res) => {
//     try {
//         const { productId } = req.body;

//         if (!productId) {
//             return res.status(400).json({ message: 'Product ID is required.' });
//         }

//         const product = await Product.findByPk(productId);

//         if (!product) {
//             return res.status(404).json({ message: 'Product not found' });
//         }

//         await product.destroy();
//         res.status(200).json({ message: 'Product deleted successfully' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Failed to delete product', error: err.message });
//     }
// };

// /**
//  * Get All Products
//  */
// const getProducts = async (req, res) => {
//     try {
//         const products = await Product.findAll({
//             include: [
//                 {
//                     model: ProductImage,
//                     as: 'images'
//                 }
//             ]
//         });
//         res.status(200).json({ products });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Failed to retrieve products', error: err.message });
//     }
// };

// /**
//  * ===============================
//  * Shop Controller Functions
//  * ===============================
//  */

// /**
//  * Create a New Shop
//  */
// const createShop = async (req, res) => {
//     const transaction = await sequelize.transaction();
//     try {
//         const { shopDetails, items, availability, licensesAndCertificates } = req.body;

//         const { shopName, shopLocation, phone, email, profilePicture } = shopDetails;

//         // Create the Shop
//         const shop = await Shop.create(
//             {
//                 shopName,
//                 location: shopLocation, // Assuming 'location' maps to 'shopLocation'
//                 phone,
//                 email,
//                 profilePicture,
//                 vendorId: shopDetails.vendorId // Assuming vendorId is part of shopDetails
//             },
//             { transaction }
//         );

//         // Create Availability and AvailabilityDays
//         if (availability && availability.days && Array.isArray(availability.days)) {
//             const shopAvailability = await Availability.create(
//                 {
//                     shopId: shop.shopId
//                 },
//                 { transaction }
//             );

//             const availabilityDaysData = availability.days.map(day => ({
//                 availabilityId: shopAvailability.id,
//                 day: day.day,
//                 startTime: day.startTime || null,
//                 endTime: day.endTime || null,
//                 isClosed: day.isClosed
//             }));

//             await AvailabilityDay.bulkCreate(availabilityDaysData, { transaction });
//         }

//         // Create Licenses and Certificates
//         if (licensesAndCertificates && Array.isArray(licensesAndCertificates)) {
//             const licensesData = licensesAndCertificates.map(cert => ({
//                 shopId: shop.shopId,
//                 certificateId: cert.id,
//                 url: cert.url
//             }));

//             await LicenseCertificate.bulkCreate(licensesData, { transaction });
//         }

//         // Create Products and their Images
//         if (items && Array.isArray(items)) {
//             for (const item of items) {
//                 const { itemName, quality, quantity, price, imageUrls } = item; // imageUrls is an array

//                 // Create Product
//                 const product = await Product.create(
//                     {
//                         title: itemName,
//                         quality,
//                         quantity,
//                         price,
//                         shopId: shop.shopId
//                     },
//                     { transaction }
//                 );

//                 // Create Product Images
//                 if (imageUrls && Array.isArray(imageUrls)) {
//                     const productImagesData = imageUrls.map(url => ({
//                         productId: product.id,
//                         url: url
//                     }));

//                     await ProductImage.bulkCreate(productImagesData, { transaction });
//                 }
//             }
//         }

//         await transaction.commit();

//         // Fetch the newly created shop with associations to return in response
//         const createdShop = await Shop.findOne({
//             where: { shopId: shop.shopId },
//             include: [
//                 {
//                     model: Product,
//                     as: 'products',
//                     include: [
//                         {
//                             model: ProductImage,
//                             as: 'images'
//                         }
//                     ]
//                 },
//                 {
//                     model: Availability,
//                     as: 'availability',
//                     include: [
//                         {
//                             model: AvailabilityDay,
//                             as: 'days'
//                         }
//                     ]
//                 },
//                 {
//                     model: LicenseCertificate,
//                     as: 'licensesAndCertificates'
//                 }
//             ]
//         });

//         res.status(201).json(createdShop);
//     } catch (err) {
//         await transaction.rollback();
//         console.error(err);
//         res.status(400).json({ message: err.message });
//     }
// };

// /**
//  * Get All Shops with Their Products
//  */
// const getShops = async (req, res) => {
//     try {
//         const shops = await Shop.findAll({
//             include: [
//                 {
//                     model: Product,
//                     as: 'products',
//                     include: [
//                         {
//                             model: ProductImage,
//                             as: 'images'
//                         }
//                     ]
//                 },
//                 {
//                     model: Availability,
//                     as: 'availability',
//                     include: [
//                         {
//                             model: AvailabilityDay,
//                             as: 'days'
//                         }
//                     ]
//                 },
//                 {
//                     model: LicenseCertificate,
//                     as: 'licensesAndCertificates'
//                 }
//             ]
//         });
//         res.status(200).json(shops);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: err.message });
//     }
// };

// /**
//  * Get a Single Shop by ID with Products, Availability, and Licenses
//  */
// const getShopById = async (req, res) => {
//     try {
//         const shop = await Shop.findByPk(req.params.shopId, {
//             include: [
//                 {
//                     model: Product,
//                     as: 'products',
//                     include: [
//                         {
//                             model: ProductImage,
//                             as: 'images'
//                         }
//                     ]
//                 },
//                 {
//                     model: Availability,
//                     as: 'availability',
//                     include: [
//                         {
//                             model: AvailabilityDay,
//                             as: 'days'
//                         }
//                     ]
//                 },
//                 {
//                     model: LicenseCertificate,
//                     as: 'licensesAndCertificates'
//                 }
//             ]
//         });

//         if (!shop) {
//             return res.status(404).json({ message: 'Shop not found' });
//         }

//         res.status(200).json(shop);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

// /**
//  * Update a Shop
//  */
// const updateShop = async (req, res) => {
//     const transaction = await sequelize.transaction();
//     try {
//         const { shopDetails, items, availability, licensesAndCertificates } = req.body;

//         // Fetch the shop by primary key
//         const shop = await Shop.findByPk(req.params.shopId, { // assuming ':shopId' is the param
//             include: [
//                 {
//                     model: Product,
//                     as: 'products',
//                     include: [
//                         {
//                             model: ProductImage,
//                             as: 'images'
//                         }
//                     ]
//                 },
//                 {
//                     model: Availability,
//                     as: 'availability',
//                     include: [
//                         {
//                             model: AvailabilityDay,
//                             as: 'days'
//                         }
//                     ]
//                 },
//                 {
//                     model: LicenseCertificate,
//                     as: 'licensesAndCertificates'
//                 }
//             ],
//             transaction
//         });

//         if (!shop) {
//             await transaction.rollback();
//             return res.status(404).json({ message: 'Shop not found' });
//         }

//         // Update shop details
//         const { shopName, image, vendorId, location, description, ownerName } = shopDetails;
//         await shop.update(
//             { shopName, image, vendorId, location, description, ownerName },
//             { transaction }
//         );

//         // Update Availability and AvailabilityDays
//         if (availability && availability.days && Array.isArray(availability.days)) {
//             if (shop.availability) {
//                 // Update existing AvailabilityDays
//                 await AvailabilityDay.destroy({ where: { availabilityId: shop.availability.id }, transaction });

//                 const availabilityDaysData = availability.days.map(day => ({
//                     availabilityId: shop.availability.id,
//                     day: day.day,
//                     startTime: day.startTime || null,
//                     endTime: day.endTime || null,
//                     isClosed: day.isClosed
//                 }));

//                 await AvailabilityDay.bulkCreate(availabilityDaysData, { transaction });
//             } else {
//                 // Create new Availability and AvailabilityDays
//                 const newAvailability = await Availability.create(
//                     { shopId: shop.shopId },
//                     { transaction }
//                 );

//                 const availabilityDaysData = availability.days.map(day => ({
//                     availabilityId: newAvailability.id,
//                     day: day.day,
//                     startTime: day.startTime || null,
//                     endTime: day.endTime || null,
//                     isClosed: day.isClosed
//                 }));

//                 await AvailabilityDay.bulkCreate(availabilityDaysData, { transaction });
//             }
//         }

//         // Update Licenses and Certificates
//         if (licensesAndCertificates && Array.isArray(licensesAndCertificates)) {
//             // Option 1: Delete existing and recreate
//             await LicenseCertificate.destroy({ where: { shopId: shop.shopId }, transaction });

//             const licensesData = licensesAndCertificates.map(cert => ({
//                 shopId: shop.shopId,
//                 certificateId: cert.id,
//                 url: cert.url
//             }));

//             await LicenseCertificate.bulkCreate(licensesData, { transaction });
//         }

//         // Update Products and their Images
//         if (items && Array.isArray(items)) {
//             for (const item of items) {
//                 const { id, itemName, quality, quantity, price, imageUrls } = item; // imageUrls is an array

//                 if (id) {
//                     // Existing product - update
//                     const existingProduct = await Product.findOne({
//                         where: { id, shopId: shop.shopId },
//                         include: [{ model: ProductImage, as: 'images' }],
//                         transaction
//                     });

//                     if (existingProduct) {
//                         await existingProduct.update(
//                             { title: itemName, quality, quantity, price },
//                             { transaction }
//                         );

//                         // Update Product Images
//                         if (imageUrls && Array.isArray(imageUrls)) {
//                             // Option 1: Delete existing images and recreate
//                             await ProductImage.destroy({ where: { productId: existingProduct.id }, transaction });

//                             const productImagesData = imageUrls.map(url => ({
//                                 productId: existingProduct.id,
//                                 url: url
//                             }));

//                             await ProductImage.bulkCreate(productImagesData, { transaction });
//                         }
//                     }
//                 } else {
//                     // New product - create
//                     const newProduct = await Product.create(
//                         {
//                             title: itemName,
//                             quality,
//                             quantity,
//                             price,
//                             shopId: shop.shopId
//                         },
//                         { transaction }
//                     );

//                     if (imageUrls && Array.isArray(imageUrls)) {
//                         const productImagesData = imageUrls.map(url => ({
//                             productId: newProduct.id,
//                             url: url
//                         }));

//                         await ProductImage.bulkCreate(productImagesData, { transaction });
//                     }
//                 }
//             }

//             // Optionally, handle deletion of products not present in the update
//             // Example:
//             // const updatedProductIds = items.filter(item => item.id).map(item => item.id);
//             // await Product.destroy({ where: { shopId: shop.shopId, id: { [Op.notIn]: updatedProductIds } }, transaction });
//         }

//         await transaction.commit();

//         // Fetch the updated shop with associations to return in response
//         const updatedShop = await Shop.findOne({
//             where: { shopId: shop.shopId },
//             include: [
//                 {
//                     model: Product,
//                     as: 'products',
//                     include: [
//                         {
//                             model: ProductImage,
//                             as: 'images'
//                         }
//                     ]
//                 },
//                 {
//                     model: Availability,
//                     as: 'availability',
//                     include: [
//                         {
//                             model: AvailabilityDay,
//                             as: 'days'
//                         }
//                     ]
//                 },
//                 {
//                     model: LicenseCertificate,
//                     as: 'licensesAndCertificates'
//                 }
//             ]
//         });

//         res.status(200).json(updatedShop);
//     } catch (err) {
//         await transaction.rollback();
//         console.error(err);
//         res.status(400).json({ message: err.message });
//     }
// };

// /**
//  * Delete a Shop and its Products
//  */
// const deleteShop = async (req, res) => {
//     try {
//         const { shopId } = req.params;

//         const shop = await Shop.findByPk(shopId);
//         if (!shop) return res.status(404).json({ message: 'Shop not found' });

//         // Deleting the shop will also delete associated products due to CASCADE
//         await shop.destroy();
//         res.status(200).json({ message: 'Shop deleted successfully.' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Failed to delete shop.', error: err.message });
//     }
// };

// /**
//  * ===============================
//  * Export Controller Functions
//  * ===============================
//  */

// module.exports = {
//     // VendorDetail Functions
//     createVendorDetail,
//     getAllVendorDetails,
//     getVendorDetailById,
//     updateVendorDetail,
//     deleteVendorDetail,

//     // Product Functions
//     postAddProducts,
//     getEditProducts,
//     postEditProducts,
//     postDeleteProduct,
//     getProducts,

//     // Shop Functions
//     createShop,
//     getShops,
//     getShopById,
//     updateShop,
//     deleteShop
// };
















// // controllers/vendorController.js

// const db = require('../models');
// const { Op } = require('sequelize'); // If needed for advanced queries
// const fs = require('fs');
// const path = require('path');
// const { sequelize } = db;

// // Models
// const VendorDetail = db.VendorDetail;
// const User = db.User;
// const Product = db.Product;
// const Shop = db.Shop;
// const Availability = db.Availability;
// const LicenseCertificate = db.LicenseCertificate;
// const AvailabilityDay = db.AvailabilityDay;
// const ProductImage = db.ProductImage;

// /**
//  * ===============================
//  * VendorDetail Controller Functions
//  * ===============================
//  */

// /**
//  * Create a new VendorDetail
//  */
// const createVendorDetail = async (req, res) => {
//     try {
//         const {
//             name,
//             email,
//             serviceType,
//             phoneNumber,
//             description,
//             selectedItems,
//             userId
//         } = req.body;

//         // Validate required fields
//         if (!name || !email || !serviceType || !phoneNumber || !description || !selectedItems || !userId) {
//             return res.status(400).json({ message: 'Missing required fields.' });
//         }

//         // Process uploaded images
//         let images = [];
//         let certificateImages = [];

//         if (req.files['images']) {
//             images = req.files['images'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
//         }

//         if (req.files['certificateImages']) {
//             certificateImages = req.files['certificateImages'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
//         }

//         // Create VendorDetail
//         const newVendorDetail = await VendorDetail.create({
//             name,
//             email,
//             serviceType,
//             phoneNumber,
//             description,
//             selectedItems: JSON.parse(selectedItems), // Assuming JSON string is sent
//             uploadImages: {
//                 images,
//                 certificateImages
//             },
//             userId
//         });

//         res.status(201).json({ message: 'VendorDetail created successfully.', data: newVendorDetail });
//     } catch (error) {
//         console.error('Error creating VendorDetail:', error);
//         res.status(500).json({ message: 'Internal server error.', error: error.message });
//     }
// };

// /**
//  * Get All VendorDetails
//  */
// const getAllVendorDetails = async (req, res) => {
//     try {
//         const vendorDetails = await VendorDetail.findAll({
//             include: [{
//                 model: User,
//                 as: 'user',
//                 attributes: ['multiUserId', 'username', 'email'] // Adjust attributes as needed
//             }]
//         });

//         return res.status(200).json({ data: vendorDetails });
//     } catch (error) {
//         console.error('Error fetching VendorDetails:', error);
//         return res.status(500).json({ message: 'Internal server error.', error: error.message });
//     }
// };

// /**
//  * Get VendorDetail by ID
//  */
// const getVendorDetailById = async (req, res) => {
//     try {
//         const { vendorId } = req.params;

//         const vendorDetail = await VendorDetail.findOne({
//             where: { vendorId },
//             include: [{
//                 model: User,
//                 as: 'user',
//                 attributes: ['multiUserId', 'username', 'email'] // Adjust attributes as needed
//             }]
//         });

//         if (!vendorDetail) {
//             return res.status(404).json({ message: 'VendorDetail not found.' });
//         }

//         return res.status(200).json({ data: vendorDetail });
//     } catch (error) {
//         console.error('Error fetching VendorDetail:', error);
//         return res.status(500).json({ message: 'Internal server error.', error: error.message });
//     }
// };

// /**
//  * Update VendorDetail
//  */
// const updateVendorDetail = async (req, res) => {
//     try {
//         const { vendorId } = req.params;
//         const updateData = {};

//         // Extract fields that are allowed to be updated
//         const allowedFields = ['name', 'email', 'serviceType', 'phoneNumber', 'description', 'selectedItems'];

//         allowedFields.forEach(field => {
//             if (req.body[field]) {
//                 updateData[field] = field === 'selectedItems' ? JSON.parse(req.body[field]) : req.body[field];
//             }
//         });

//         // Process uploaded images
//         if (req.files) {
//             const { images, certificateImages } = req.files;

//             if (images) {
//                 const imageUrls = images.map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
//                 updateData.uploadImages = updateData.uploadImages || {};
//                 updateData.uploadImages.images = imageUrls;
//             }

//             if (certificateImages) {
//                 const certificateImageUrls = certificateImages.map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
//                 updateData.uploadImages = updateData.uploadImages || {};
//                 updateData.uploadImages.certificateImages = certificateImageUrls;
//             }
//         }

//         // Update VendorDetail
//         const [updatedRowsCount, updatedRows] = await VendorDetail.update(updateData, {
//             where: { vendorId },
//             returning: true
//         });

//         if (updatedRowsCount === 0) {
//             return res.status(404).json({ message: 'VendorDetail not found or no changes made.' });
//         }

//         res.status(200).json({ message: 'VendorDetail updated successfully.', data: updatedRows[0] });
//     } catch (error) {
//         console.error('Error updating VendorDetail:', error);
//         res.status(500).json({ message: 'Internal server error.', error: error.message });
//     }
// };

// /**
//  * Delete VendorDetail
//  */
// const deleteVendorDetail = async (req, res) => {
//     try {
//         const { vendorId } = req.params;

//         const deletedRowsCount = await VendorDetail.destroy({
//             where: { vendorId }
//         });

//         if (deletedRowsCount === 0) {
//             return res.status(404).json({ message: 'VendorDetail not found.' });
//         }

//         return res.status(200).json({ message: 'VendorDetail deleted successfully.' });
//     } catch (error) {
//         console.error('Error deleting VendorDetail:', error);
//         return res.status(500).json({ message: 'Internal server error.', error: error.message });
//     }
// };

// /**
//  * ===============================
//  * Product Controller Functions
//  * ===============================
//  */

// /**
//  * Add a New Product
//  */
// const postAddProducts = async (req, res) => {
//     const { title, description, price, shopId } = req.body;

//     // Ensure images are received
//     if (!req.files || !req.files.images) {
//         return res.status(422).json({ msg: "Error uploading images" });
//     }

//     // Map the image paths to the correct format
//     const imageUrls = req.files.images.map(file => file.path.replace(/\\/g, '/'));

//     try {
//         const result = await Product.create({
//             title,
//             price,
//             imageUrl: imageUrls, // Assuming you want to save all image URLs
//             description,
//             shopId
//         });

//         res.json({ message: 'Product added successfully', product: result });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: 'Failed to add product' });
//     }
// };

// /**
//  * Get Product for Editing
//  */
// const getEditProducts = async (req, res) => {
//     const editMode = req.query.edit;
//     if (editMode === "false") {
//         return res.json({ message: 'Unauthorized to edit product' });
//     }

//     const prodId = req.params.productId;

//     try {
//         const product = await Product.findOne({ where: { id: prodId } });

//         if (!product) {
//             return res.json({ message: 'No Such Product' });
//         }
//         res.json({ message: 'Product retrieved successfully for editing', product: product });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: 'Failed to retrieve product for editing' });
//     }
// };

// /**
//  * Edit an Existing Product
//  */
// const postEditProducts = async (req, res) => {
//     const { productId, title, price, description } = req.body;

//     try {
//         const product = await Product.findByPk(productId);

//         if (!product) {
//             return res.status(404).json({ message: 'Product not found' });
//         }

//         // Store old images if they exist
//         const oldImageUrls = product.imageUrl || [];

//         // Ensure images are received
//         if (!req.files || !req.files.images) {
//             return res.status(422).json({ msg: "Error uploading images" });
//         }

//         // Map the new image paths to the correct format
//         const newImageUrls = req.files.images.map(file => file.path.replace(/\\/g, '/'));

//         // Delete old images from the server
//         oldImageUrls.forEach(oldImagePath => {
//             const fullOldImagePath = path.join(__dirname, '..', oldImagePath);
//             fs.unlink(fullOldImagePath, (err) => {
//                 if (err) {
//                     console.log("Failed to delete the old image: ", err);
//                 } else {
//                     console.log("Old image deleted successfully");
//                 }
//             });
//         });

//         // Update the product details
//         product.title = title;
//         product.price = price;
//         product.imageUrl = newImageUrls; // Assuming you're storing all new image URLs
//         product.description = description;

//         await product.save();
//         res.json({ message: 'Product updated successfully', product: product });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: 'Failed to update product' });
//     }
// };

// /**
//  * Delete a Product
//  */
// const postDeleteProduct = async (req, res) => {
//     const prodId = req.body.productId;

//     try {
//         const product = await Product.findByPk(prodId);

//         if (!product) {
//             return res.status(404).json({ message: 'Product not found' });
//         }

//         await product.destroy();
//         res.json({ message: 'Product deleted successfully' });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: 'Failed to delete product' });
//     }
// };

// /**
//  * Get All Products
//  */
// const getProducts = async (req, res) => {
//     try {
//         const products = await Product.findAll({
//             include: [
//                 {
//                     model: ProductImage,
//                     as: 'images'
//                 }
//             ]
//         });
//         res.json({ products });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: 'Failed to retrieve products' });
//     }
// };

// /**
//  * ===============================
//  * Shop Controller Functions
//  * ===============================
//  */

// /**
//  * Create a New Shop
//  */
// const createShop = async (req, res) => {
//     const transaction = await sequelize.transaction();
//     try {
//         const { shopDetails, items, availability, licensesAndCertificates, vendorId } = req.body;

//         const { shopName, shopLocation, phone, email, profilePicture } = shopDetails;

//         // Create the Shop
//         const shop = await Shop.create(
//             {
//                 shopName,
//                 location: shopLocation, // Assuming 'location' maps to 'shopLocation'
//                 phone,
//                 email,
//                 profilePicture,
//                 vendorId
//             },
//             { transaction }
//         );

//         // Create Availability and AvailabilityDays
//         if (availability && availability.days && Array.isArray(availability.days)) {
//             const shopAvailability = await Availability.create(
//                 {
//                     shopId: shop.shopId
//                 },
//                 { transaction }
//             );

//             const availabilityDaysData = availability.days.map(day => ({
//                 availabilityId: shopAvailability.id,
//                 day: day.day,
//                 startTime: day.startTime || null,
//                 endTime: day.endTime || null,
//                 isClosed: day.isClosed
//             }));

//             await AvailabilityDay.bulkCreate(availabilityDaysData, { transaction });
//         }

//         // Create Licenses and Certificates
//         if (licensesAndCertificates && Array.isArray(licensesAndCertificates)) {
//             const licensesData = licensesAndCertificates.map(cert => ({
//                 shopId: shop.shopId,
//                 certificateId: cert.id,
//                 url: cert.url
//             }));

//             await LicenseCertificate.bulkCreate(licensesData, { transaction });
//         }

//         // Create Products and their Images
//         if (items && Array.isArray(items)) {
//             for (const item of items) {
//                 const { itemName, quality, quantity, price, images } = item;

//                 // Create Product
//                 const product = await Product.create(
//                     {
//                         title: itemName,
//                         quality,
//                         quantity,
//                         price,
//                         shopId: shop.shopId
//                     },
//                     { transaction }
//                 );

//                 // Create Product Images
//                 if (images && Array.isArray(images)) {
//                     const productImagesData = images.map(img => ({
//                         productId: product.id,
//                         imageId: img.id,
//                         url: img.url
//                     }));

//                     await ProductImage.bulkCreate(productImagesData, { transaction });
//                 }
//             }
//         }

//         await transaction.commit();

//         // Fetch the newly created shop with associations to return in response
//         const createdShop = await Shop.findOne({
//             where: { shopId: shop.shopId },
//             include: [
//                 {
//                     model: Product,
//                     as: 'products',
//                     include: [
//                         {
//                             model: ProductImage,
//                             as: 'images'
//                         }
//                     ]
//                 },
//                 {
//                     model: Availability,
//                     as: 'availability',
//                     include: [
//                         {
//                             model: AvailabilityDay,
//                             as: 'days'
//                         }
//                     ]
//                 },
//                 {
//                     model: LicenseCertificate,
//                     as: 'licensesAndCertificates'
//                 }
//             ]
//         });

//         res.status(201).json(createdShop);
//     } catch (err) {
//         await transaction.rollback();
//         console.error(err);
//         res.status(400).json({ message: err.message });
//     }
// };

// /**
//  * Get All Shops with Their Products
//  */
// const getShops = async (req, res) => {
//     try {
//         const shops = await Shop.findAll({
//             include: [
//                 {
//                     model: Product,
//                     as: 'products',
//                     include: [
//                         {
//                             model: ProductImage,
//                             as: 'images'
//                         }
//                     ]
//                 },
//                 {
//                     model: Availability,
//                     as: 'availability',
//                     include: [
//                         {
//                             model: AvailabilityDay,
//                             as: 'days'
//                         }
//                     ]
//                 },
//                 {
//                     model: LicenseCertificate,
//                     as: 'licensesAndCertificates'
//                 }
//             ]
//         });
//         res.status(200).json(shops);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: err.message });
//     }
// };

// /**
//  * Get a Single Shop by ID with Products, Availability, and Licenses
//  */
// const getShopById = async (req, res) => {
//     try {
//         const shop = await Shop.findByPk(req.params.shopId, {
//             include: [
//                 {
//                     model: Product,
//                     as: 'products',
//                     include: [
//                         {
//                             model: ProductImage,
//                             as: 'images'
//                         }
//                     ]
//                 },
//                 {
//                     model: Availability,
//                     as: 'availability',
//                     include: [
//                         {
//                             model: AvailabilityDay,
//                             as: 'days'
//                         }
//                     ]
//                 },
//                 {
//                     model: LicenseCertificate,
//                     as: 'licensesAndCertificates'
//                 }
//             ]
//         });

//         if (!shop) {
//             return res.status(404).json({ message: 'Shop not found' });
//         }

//         res.status(200).json(shop);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

// /**
//  * Update a Shop
//  */
// const updateShop = async (req, res) => {
//     const transaction = await sequelize.transaction();
//     try {
//         const { shopDetails, items, availability, licensesAndCertificates } = req.body;

//         // Fetch the shop by primary key
//         const shop = await Shop.findByPk(req.params.id, {
//             include: [
//                 {
//                     model: Product,
//                     as: 'products',
//                     include: [
//                         {
//                             model: ProductImage,
//                             as: 'images'
//                         }
//                     ]
//                 },
//                 {
//                     model: Availability,
//                     as: 'availability',
//                     include: [
//                         {
//                             model: AvailabilityDay,
//                             as: 'days'
//                         }
//                     ]
//                 },
//                 {
//                     model: LicenseCertificate,
//                     as: 'licensesAndCertificates'
//                 }
//             ],
//             transaction
//         });

//         if (!shop) {
//             await transaction.rollback();
//             return res.status(404).json({ message: 'Shop not found' });
//         }

//         // Update shop details
//         const { shopName, image, vendorId, location, description, ownerName } = shopDetails;
//         await shop.update(
//             { shopName, image, vendorId, location, description, ownerName },
//             { transaction }
//         );

//         // Update Availability and AvailabilityDays
//         if (availability && availability.days && Array.isArray(availability.days)) {
//             if (shop.availability) {
//                 // Update existing Availability
//                 // For simplicity, assume there's only one Availability record per Shop
//                 await AvailabilityDay.destroy({ where: { availabilityId: shop.availability.id }, transaction });

//                 const availabilityDaysData = availability.days.map(day => ({
//                     availabilityId: shop.availability.id,
//                     day: day.day,
//                     startTime: day.startTime || null,
//                     endTime: day.endTime || null,
//                     isClosed: day.isClosed
//                 }));

//                 await AvailabilityDay.bulkCreate(availabilityDaysData, { transaction });
//             } else {
//                 // Create new Availability and AvailabilityDays
//                 const newAvailability = await Availability.create(
//                     { shopId: shop.shopId },
//                     { transaction }
//                 );

//                 const availabilityDaysData = availability.days.map(day => ({
//                     availabilityId: newAvailability.id,
//                     day: day.day,
//                     startTime: day.startTime || null,
//                     endTime: day.endTime || null,
//                     isClosed: day.isClosed
//                 }));

//                 await AvailabilityDay.bulkCreate(availabilityDaysData, { transaction });
//             }
//         }

//         // Update Licenses and Certificates
//         if (licensesAndCertificates && Array.isArray(licensesAndCertificates)) {
//             // Option 1: Delete existing and recreate
//             await LicenseCertificate.destroy({ where: { shopId: shop.shopId }, transaction });

//             const licensesData = licensesAndCertificates.map(cert => ({
//                 shopId: shop.shopId,
//                 certificateId: cert.id,
//                 url: cert.url
//             }));

//             await LicenseCertificate.bulkCreate(licensesData, { transaction });

//             // Option 2: Update existing or create new (more complex)
//             // Implement if you need partial updates
//         }

//         // Update Products and their Images
//         if (items && Array.isArray(items)) {
//             for (const item of items) {
//                 const { id, itemName, quality, quantity, price, images } = item; // Assume each product has an 'id' if existing

//                 if (id) {
//                     // Existing product - update
//                     const existingProduct = await Product.findOne({
//                         where: { id, shopId: shop.shopId },
//                         include: [{ model: ProductImage, as: 'images' }],
//                         transaction
//                     });

//                     if (existingProduct) {
//                         await existingProduct.update(
//                             { title: itemName, quality, quantity, price },
//                             { transaction }
//                         );

//                         // Update Product Images
//                         if (images && Array.isArray(images)) {
//                             // Option 1: Delete existing images and recreate
//                             await ProductImage.destroy({ where: { productId: existingProduct.id }, transaction });

//                             const productImagesData = images.map(img => ({
//                                 productId: existingProduct.id,
//                                 imageId: img.id,
//                                 url: img.url
//                             }));

//                             await ProductImage.bulkCreate(productImagesData, { transaction });
//                         }
//                     }
//                 } else {
//                     // New product - create
//                     const newProduct = await Product.create(
//                         {
//                             title: itemName,
//                             quality,
//                             quantity,
//                             price,
//                             shopId: shop.shopId
//                         },
//                         { transaction }
//                     );

//                     if (images && Array.isArray(images)) {
//                         const productImagesData = images.map(img => ({
//                             productId: newProduct.id,
//                             imageId: img.id,
//                             url: img.url
//                         }));

//                         await ProductImage.bulkCreate(productImagesData, { transaction });
//                     }
//                 }
//             }

//             // Optionally, handle deletion of products not present in the update
//             // Example:
//             // const updatedProductIds = items.filter(item => item.id).map(item => item.id);
//             // await Product.destroy({ where: { shopId: shop.shopId, id: { [Op.notIn]: updatedProductIds } }, transaction });
//         }

//         await transaction.commit();

//         // Fetch the updated shop with associations to return in response
//         const updatedShop = await Shop.findOne({
//             where: { shopId: shop.shopId },
//             include: [
//                 {
//                     model: Product,
//                     as: 'products',
//                     include: [
//                         {
//                             model: ProductImage,
//                             as: 'images'
//                         }
//                     ]
//                 },
//                 {
//                     model: Availability,
//                     as: 'availability',
//                     include: [
//                         {
//                             model: AvailabilityDay,
//                             as: 'days'
//                         }
//                     ]
//                 },
//                 {
//                     model: LicenseCertificate,
//                     as: 'licensesAndCertificates'
//                 }
//             ]
//         });

//         res.status(200).json(updatedShop);
//     } catch (err) {
//         await transaction.rollback();
//         console.error(err);
//         res.status(400).json({ message: err.message });
//     }
// };

// /**
//  * Delete a Shop and its Products
//  */
// const deleteShop = async (req, res) => {
//     try {
//         const shop = await Shop.findByPk(req.params.id);
//         if (!shop) return res.status(404).json({ message: 'Shop not found' });

//         // Deleting the shop will also delete associated products due to CASCADE
//         await shop.destroy();
//         res.status(200).json({ message: 'Shop deleted' });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

// /**
//  * ===============================
//  * Export Controller Functions
//  * ===============================
//  */

// module.exports = {
//     // VendorDetail Functions
//     createVendorDetail,
//     getAllVendorDetails,
//     getVendorDetailById,
//     updateVendorDetail,
//     deleteVendorDetail,

//     // Product Functions
//     postAddProducts,
//     getEditProducts,
//     postEditProducts,
//     postDeleteProduct,
//     getProducts,

//     // Shop Functions
//     createShop,
//     getShops,
//     getShopById,
//     updateShop,
//     deleteShop
// };









// const db = require('../models');
// const Product = db.Product;
// // const path = require('path');

// const fs = require('fs');
// const path = require('path');
// const VendorDetail = db.VendorDetail
// const User = db.User
// const Vendor = db.VendorDetail
// const Shop = db.Shop
// const Availability = db.Availability
// const LicenseCertificate = db.LicenseCertificate
// const AvailabilityDay = db.AvailabilityDay
// const ProductImage = db.ProductImage
// const {sequelize} = db





// const createVendorDetail = async (req, res) => {
//     try {
//         const {
//             phoneNumber,
//             description,
//             selectedItems,
//             priceRange,
//             timeSelection,
//             selectedDays,
//             userId
//         } = req.body;

//         // Validate required fields
//         if (!phoneNumber || !description || !selectedItems || !priceRange || !timeSelection || !userId) {
//             return res.status(400).json({ message: 'Missing required fields.' });
//         }

//         // Process uploaded images
//         let images = [];
//         let certificateImages = [];

//         if (req.files['images']) {
//             images = req.files['images'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
//         }

//         if (req.files['certificateImages']) {
//             certificateImages = req.files['certificateImages'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
//         }

//         // Create VendorDetail
//         const newVendorDetail = await VendorDetail.create({
//             phoneNumber,
//             description,
//             selectedItems: JSON.parse(selectedItems), // Assuming JSON string is sent
//             priceRange: JSON.parse(priceRange),
//             timeSelection: JSON.parse(timeSelection),
//             selectedDays: selectedDays ? JSON.parse(selectedDays) : [],
//             uploadImages: {
//                 images,
//                 certificateImages
//             },
//             userId
//         });

//         res.status(201).json({ message: 'VendorDetail created successfully.', data: newVendorDetail });
//     } catch (error) {
//         console.error('Error creating VendorDetail:', error);
//         res.status(500).json({ message: 'Internal server error.', error: error.message });
//     }
// };


// const getAllVendorDetails = async (req, res) => {
//     try {
//         const vendorDetails = await VendorDetail.findAll(
//             {
//             include: [{
//                 model: User,
//                 as: 'user',
//                 attributes: ['multiUserId', 'username', 'email'] // Adjust attributes as needed
//             }]
//         }
//     );

//         return res.status(200).json({ data: vendorDetails });
//     } catch (error) {
//         console.error('Error fetching VendorDetails:', error);
//         return res.status(500).json({ message: 'Internal server error.', error: error.message });
//     }
// };

// const getVendorDetailById = async (req, res) => {
//     try {
//         const { vendorId } = req.params;

//         const vendorDetail = await VendorDetail.findOne({
//             where: { vendorId },
//             include: [{
//                 model: User,
//                 as: 'user',
//                 attributes: ['multiUserId', 'username', 'email'] // Adjust attributes as needed
//             }]
//         });

//         if (!vendorDetail) {
//             return res.status(404).json({ message: 'VendorDetail not found.' });
//         }

//         return res.status(200).json({ data: vendorDetail });
//     } catch (error) {
//         console.error('Error fetching VendorDetail:', error);
//         return res.status(500).json({ message: 'Internal server error.', error: error.message });
//     }
// };

// const updateVendorDetail = async (req, res) => {
//     // try {
//     //     const { vendorId } = req.params;
//     //     const updateData = req.body;

//     //     // Process uploaded images
//     //     let images = [];
//     //     let certificateImages = [];

//     //     if (req.files['images']) {
//     //         images = req.files['images'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
//     //         updateData.uploadImages = updateData.uploadImages || {};
//     //         updateData.uploadImages.images = images;
//     //     }

//     //     if (req.files['certificateImages']) {
//     //         certificateImages = req.files['certificateImages'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
//     //         updateData.uploadImages = updateData.uploadImages || {};
//     //         updateData.uploadImages.certificateImages = certificateImages;
//     //     }

//     //     // Parse JSON fields if they are strings
//     //     if (updateData.selectedItems) {
//     //         updateData.selectedItems = JSON.parse(updateData.selectedItems);
//     //     }

//     //     if (updateData.priceRange) {
//     //         updateData.priceRange = JSON.parse(updateData.priceRange);
//     //     }

//     //     if (updateData.timeSelection) {
//     //         updateData.timeSelection = JSON.parse(updateData.timeSelection);
//     //     }

//     //     if (updateData.selectedDays) {
//     //         updateData.selectedDays = JSON.parse(updateData.selectedDays);
//     //     }

//     //     // Update VendorDetail
//     //     const [updatedRowsCount, updatedRows] = await VendorDetail.update(updateData, {
//     //         where: { vendorId },
//     //         returning: true
//     //     });

//     //     if (updatedRowsCount === 0) {
//     //         return res.status(404).json({ message: 'VendorDetail not found or no changes made.' });
//     //     }

//     //     res.status(200).json({ message: 'VendorDetail updated successfully.', data: updatedRows[0] });
//     // } catch (error) {
//     //     console.error('Error updating VendorDetail:', error);
//     //     res.status(500).json({ message: 'Internal server error.', error: error.message });
//     // }
// };

// const deleteVendorDetail = async (req, res) => {
//     try {
//         const { vendorId } = req.params;

//         const deletedRowsCount = await VendorDetail.destroy({
//             where: { vendorId }
//         });

//         if (deletedRowsCount === 0) {
//             return res.status(404).json({ message: 'VendorDetail not found.' });
//         }

//         return res.status(200).json({ message: 'VendorDetail deleted successfully.' });
//     } catch (error) {
//         console.error('Error deleting VendorDetail:', error);
//         return res.status(500).json({ message: 'Internal server error.', error: error.message });
//     }
// };






// const postAddProducts = async (req, res, next) => {
//     const { title, description, price, shopId } = req.body;
//     console.log('hkjh');
    
//     console.log(req.files); // Should show the uploaded images
//     // Ensure images are received
//     if (!req.files || !req.files.images) {
//         return res.status(422).json({ msg: "Error uploading images" });
//     }

//     // Map the image paths to the correct format
//     const imageUrls = req.files.images.map(file => file.path.replace(/\\/g, '/'));

//     try {
//         const result = await Product.create({
//             title,
//             price,
//             imageUrl: imageUrls, // Assuming you want to save all image URLs
//             description,
//             shopId
//         });
        
//         // const result = await req.user.createProduct({
//         //     title,
//         //     price,
//         //     imageUrl: imageUrls, // Assuming you want to save all image URLs
//         //     description,
//         // });
//         res.json({ message: 'Product added successfully', product: result });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: 'Failed to add product' });
//     }
// };


// const getEditProducts = async (req, res, next) => {
//     const editMode = req.query.edit;
//     if (editMode === "false") {
//        return res.json({ message: 'Unauthorized to edit product'})
//     }
    
//     const prodId = req.params.productId;

//     try {
//         const products = await Product.findOne({ where: { id: prodId } });
//         // const products = await req.user.getProducts({ where: { id: prodId } });
//         // const product = products;

//         if (!products) {
//             return res.json({ message: 'No Such Product'})
//         }
//         res.json({ message: 'Product added successfully', product: products })
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: 'Failed to retrieve product for editing' });
//     }
// };


// const postEditProducts = async (req, res, next) => {
//     const { productId, title, price, description } = req.body;

//     try {
//         const product = await Product.findByPk(productId);
//         console.log("check");
        

//         if (!product) {
//             return res.status(404).json({ message: 'Product not found' });
//         }

//         // Store old images if they exist
//         const oldImageUrls = product.imageUrl || [];

//         // Ensure images are received
//         if (!req.files || !req.files.images) {
//             return res.status(422).json({ msg: "Error uploading images" });
//         }

//         // Map the new image paths to the correct format
//         const newImageUrls = req.files.images.map(file => file.path.replace(/\\/g, '/'));

//         // Delete old images if necessary
//         oldImageUrls.forEach(oldImagePath => {
//             const fullOldImagePath = path.join(__dirname, '..', oldImagePath);
//             fs.unlink(fullOldImagePath, (err) => {
//                 if (err) {
//                     console.log("Failed to delete the old image: ", err);
//                 } else {
//                     console.log("Old image deleted successfully");
//                 }
//             });
//         });

//         // Update the product details
//         product.title = title;
//         product.price = price;
//         product.imageUrl = newImageUrls; // Assuming you're storing all new image URLs
//         product.description = description;

//         await product.save();
//         res.json({ message: 'Product updated successfully', product: product });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: 'Failed to update product' });
//     }
// };


// const postDeleteProduct = async (req, res, next) => {
//     const prodId = req.body.productId;

//     try {
//         const product = await Product.findByPk(prodId);

//         if (!product) {
//             return res.status(404).json({ message: 'Product not found' });
//         }

//         await product.destroy();
//         res.json({ message: 'Product deleted successfully' });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: 'Failed to delete product' });
//     }
// };

// const getProducts = async (req, res, next) => {
//     try {
//         const products = await Product.findAll({
//             include: [
//                 {
//                     model: ProductImage,
//                     as: 'images'
//                 }
//             ]
//         });
//         res.json({ products });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: 'Failed to retrieve products' });
//     }
// };


// // Create a new Shop
// // Create a new Shop
// const createShop = async (req, res) => {
//     const transaction = await sequelize.transaction();
//     try {
//       const { shopDetails, items, availability, licensesAndCertificates, vendorId } = req.body;
  
//       const { shopName, shopLocation, phone, email, profilePicture } = shopDetails;
  
//       // Create the Shop
//       const shop = await Shop.create(
//         {
//           shopName,
//           location: shopLocation, // Assuming 'location' maps to 'shopLocation'
//           phone,
//           email,
//           profilePicture,
//           vendorId
//         },
//         { transaction }
//       );
  
//       // Create Availability and AvailabilityDays
//       if (availability && availability.days && Array.isArray(availability.days)) {
//         const shopAvailability = await Availability.create(
//           {
//             shopId: shop.shopId
//           },
//           { transaction }
//         );
  
//         const availabilityDaysData = availability.days.map(day => ({
//           availabilityId: shopAvailability.id,
//           day: day.day,
//           startTime: day.startTime || null,
//           endTime: day.endTime || null,
//           isClosed: day.isClosed
//         }));
  
//         await AvailabilityDay.bulkCreate(availabilityDaysData, { transaction });
//       }
  
//       // Create Licenses and Certificates
//       if (licensesAndCertificates && Array.isArray(licensesAndCertificates)) {
//         const licensesData = licensesAndCertificates.map(cert => ({
//           shopId: shop.shopId,
//           certificateId: cert.id,
//           url: cert.url
//         }));
  
//         await LicenseCertificate.bulkCreate(licensesData, { transaction });
//       }
  
//       // Create Products and their Images
//       if (items && Array.isArray(items)) {
//         for (const item of items) {
//           const { itemName, quality, quantity, price, images } = item;
  
//           // Create Product
//           const product = await Product.create(
//             {
//               title: itemName,
//               quality,
//               quantity,
//               price,
//               shopId: shop.shopId
//             },
//             { transaction }
//           );
  
//           // Create Product Images
//           if (images && Array.isArray(images)) {
//             const productImagesData = images.map(img => ({
//               productId: product.id,
//               imageId: img.id,
//               url: img.url
//             }));
  
//             await ProductImage.bulkCreate(productImagesData, { transaction });
//           }
//         }
//       }
  
//       await transaction.commit();
  
//       // Fetch the newly created shop with associations to return in response
//       const createdShop = await Shop.findOne({
//         where: { shopId: shop.shopId },
//         include: [
//           {
//             model: Product,
//             as: 'products',
//             include: [
//               {
//                 model: ProductImage,
//                 as: 'images'
//               }
//             ]
//           },
//           {
//             model: Availability,
//             as: 'availability',
//             include: [
//               {
//                 model: AvailabilityDay,
//                 as: 'days'
//               }
//             ]
//           },
//           {
//             model: LicenseCertificate,
//             as: 'licensesAndCertificates'
//           }
//         ]
//       });
  
//       res.status(201).json(createdShop);
//     } catch (err) {
//       await transaction.rollback();
//       console.error(err);
//       res.status(400).json({ message: err.message });
//     }
//   };
// // const createShop = async (req, res) => {
// //     try {
// //         const { shopName, image, vendorId, location, description, ownerName, products } = req.body;
// //         const shop = await Shop.create({ shopName, image, vendorId, location, description, ownerName });

// //         // if (products && products.length > 0) {
// //         //     const productPromises = products.map(product => Product.create({ ...product, shopId: shop.id }));
// //         //     await Promise.all(productPromises);
// //         // }

// //         res.status(201).json(shop);
// //     } catch (err) {
// //         res.status(400).json({ message: err.message });
// //     }
// // };

// // Read all Shops with their Products
// const getShops = async (req, res) => {
//     try {
//         const shops = await Shop.findAll({
//             include: [
//                 {
//                     model: Product,
//                     as: 'products',
//                     include: [
//                         {
//                             model: ProductImage,
//                             as: 'images'
//                         }
//                     ]
//                 },
//                 {
//                     model: Availability,
//                     as: 'availability',
//                     include: [
//                         {
//                             model: AvailabilityDay,
//                             as: 'days'
//                         }
//                     ]
//                 },
//                 {
//                     model: LicenseCertificate,
//                     as: 'licensesAndCertificates'
//                 }
//             ]
//         });
//         res.status(200).json(shops);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: err.message });
//     }
// };

// // const getShops = async (req, res) => {
// //     try {
// //         const shops = await Shop.findAll({
// //             include: [
// //                 {
// //                   model: Product,
// //                   as: 'products',  // Use the alias defined in your association
// //                 },
// //               ]
// //         });
// //         res.status(200).json(shops);
// //     } catch (err) {
// //         res.status(500).json({ message: err.message });
// //     }
// // };

// // Read a single Shop by ID with Products
// // Read a single Shop by ID with Products, Availability, and Licenses
// const getShopById = async (req, res) => {
//     try {
//       const shop = await Shop.findByPk(req.params.shopId, {
//         include: [
//           {
//             model: Product,
//             as: 'products',
//             include: [
//               {
//                 model: ProductImage,
//                 as: 'images'
//               }
//             ]
//           },
//           {
//             model: Availability,
//             as: 'availability',
//             include: [
//               {
//                 model: AvailabilityDay,
//                 as: 'days'
//               }
//             ]
//           },
//           {
//             model: LicenseCertificate,
//             as: 'licensesAndCertificates'
//           }
//         ]
//       });
  
//       if (!shop) {
//         return res.status(404).json({ message: 'Shop not found' });
//       }
  
//       res.status(200).json(shop);
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   };
  
// // const getShopById = async (req, res) => {
// //     try {
// //         console.log(req.params.shopId);
        
// //         const shop = await Shop.findByPk(req.params.shopId, {
// //             include: [
// //                 {
// //                   model: Product,
// //                   as: 'products',  // Use the alias defined in your association
// //                 },
// //               ]
// //         });
// //         if (!shop) return res.status(404).json({ message: 'Shop not found' });
// //         res.status(200).json(shop);
// //     } catch (err) {
// //         res.status(500).json({ message: err.message });
// //     }
// // };

// // Update a Shop
// const updateShop = async (req, res) => {
//     const transaction = await sequelize.transaction();
//     try {
//         const { shopDetails, items, availability, licensesAndCertificates } = req.body;

//         // Fetch the shop by primary key
//         const shop = await Shop.findByPk(req.params.id, {
//             include: [
//                 {
//                     model: Product,
//                     as: 'products',
//                     include: [
//                         {
//                             model: ProductImage,
//                             as: 'images'
//                         }
//                     ]
//                 },
//                 {
//                     model: Availability,
//                     as: 'availability',
//                     include: [
//                         {
//                             model: AvailabilityDay,
//                             as: 'days'
//                         }
//                     ]
//                 },
//                 {
//                     model: LicenseCertificate,
//                     as: 'licensesAndCertificates'
//                 }
//             ],
//             transaction
//         });

//         if (!shop) {
//             await transaction.rollback();
//             return res.status(404).json({ message: 'Shop not found' });
//         }

//         // Update shop details
//         const { shopName, image, vendorId, location, description, ownerName } = shopDetails;
//         await shop.update(
//             { shopName, image, vendorId, location, description, ownerName },
//             { transaction }
//         );

//         // Update Availability and AvailabilityDays
//         if (availability && availability.days && Array.isArray(availability.days)) {
//             if (shop.availability) {
//                 // Update existing Availability
//                 // For simplicity, assume there's only one Availability record per Shop
//                 await AvailabilityDay.destroy({ where: { availabilityId: shop.availability.id }, transaction });

//                 const availabilityDaysData = availability.days.map(day => ({
//                     availabilityId: shop.availability.id,
//                     day: day.day,
//                     startTime: day.startTime || null,
//                     endTime: day.endTime || null,
//                     isClosed: day.isClosed
//                 }));

//                 await AvailabilityDay.bulkCreate(availabilityDaysData, { transaction });
//             } else {
//                 // Create new Availability and AvailabilityDays
//                 const newAvailability = await Availability.create(
//                     { shopId: shop.shopId },
//                     { transaction }
//                 );

//                 const availabilityDaysData = availability.days.map(day => ({
//                     availabilityId: newAvailability.id,
//                     day: day.day,
//                     startTime: day.startTime || null,
//                     endTime: day.endTime || null,
//                     isClosed: day.isClosed
//                 }));

//                 await AvailabilityDay.bulkCreate(availabilityDaysData, { transaction });
//             }
//         }

//         // Update Licenses and Certificates
//         if (licensesAndCertificates && Array.isArray(licensesAndCertificates)) {
//             // Option 1: Delete existing and recreate
//             await LicenseCertificate.destroy({ where: { shopId: shop.shopId }, transaction });

//             const licensesData = licensesAndCertificates.map(cert => ({
//                 shopId: shop.shopId,
//                 certificateId: cert.id,
//                 url: cert.url
//             }));

//             await LicenseCertificate.bulkCreate(licensesData, { transaction });

//             // Option 2: Update existing or create new (more complex)
//             // Implement if you need partial updates
//         }

//         // Update Products and their Images
//         if (items && Array.isArray(items)) {
//             for (const item of items) {
//                 const { id, itemName, quality, quantity, price, images } = item; // Assume each product has an 'id' if existing

//                 if (id) {
//                     // Existing product - update
//                     const existingProduct = await Product.findOne({
//                         where: { id, shopId: shop.shopId },
//                         include: [{ model: ProductImage, as: 'images' }],
//                         transaction
//                     });

//                     if (existingProduct) {
//                         await existingProduct.update(
//                             { title: itemName, quality, quantity, price },
//                             { transaction }
//                         );

//                         // Update Product Images
//                         if (images && Array.isArray(images)) {
//                             // Option 1: Delete existing images and recreate
//                             await ProductImage.destroy({ where: { productId: existingProduct.id }, transaction });

//                             const productImagesData = images.map(img => ({
//                                 productId: existingProduct.id,
//                                 imageId: img.id,
//                                 url: img.url
//                             }));

//                             await ProductImage.bulkCreate(productImagesData, { transaction });
//                         }
//                     }
//                 } else {
//                     // New product - create
//                     const newProduct = await Product.create(
//                         {
//                             title: itemName,
//                             quality,
//                             quantity,
//                             price,
//                             shopId: shop.shopId
//                         },
//                         { transaction }
//                     );

//                     if (images && Array.isArray(images)) {
//                         const productImagesData = images.map(img => ({
//                             productId: newProduct.id,
//                             imageId: img.id,
//                             url: img.url
//                         }));

//                         await ProductImage.bulkCreate(productImagesData, { transaction });
//                     }
//                 }
//             }

//             // Optionally, handle deletion of products not present in the update
//             // Example:
//             // const updatedProductIds = items.filter(item => item.id).map(item => item.id);
//             // await Product.destroy({ where: { shopId: shop.shopId, id: { [Op.notIn]: updatedProductIds } }, transaction });
//         }

//         await transaction.commit();

//         // Fetch the updated shop with associations to return in response
//         const updatedShop = await Shop.findOne({
//             where: { shopId: shop.shopId },
//             include: [
//                 {
//                     model: Product,
//                     as: 'products',
//                     include: [
//                         {
//                             model: ProductImage,
//                             as: 'images'
//                         }
//                     ]
//                 },
//                 {
//                     model: Availability,
//                     as: 'availability',
//                     include: [
//                         {
//                             model: AvailabilityDay,
//                             as: 'days'
//                         }
//                     ]
//                 },
//                 {
//                     model: LicenseCertificate,
//                     as: 'licensesAndCertificates'
//                 }
//             ]
//         });

//         res.status(200).json(updatedShop);
//     } catch (err) {
//         await transaction.rollback();
//         console.error(err);
//         res.status(400).json({ message: err.message });
//     }
// };
// // const updateShop = async (req, res) => {
// //     try {
// //         const { shopName, image, vendorId, location, description, ownerName, products } = req.body;
// //         const shop = await Shop.findByPk(req.params.id);
// //         if (!shop) return res.status(404).json({ message: 'Shop not found' });

// //         // Update the shop details
// //         await shop.update({ shopName, image, vendorId, location, description, ownerName });

// //         // Optionally, update the products associated with the shop
// //         // if (products && products.length > 0) {
// //         //     await Product.destroy({ where: { shopId: shop.id } });
// //         //     const productPromises = products.map(product => Product.create({ ...product, shopId: shop.id }));
// //         //     await Promise.all(productPromises);
// //         // }

// //         res.status(200).json(shop);
// //     } catch (err) {
// //         res.status(400).json({ message: err.message });
// //     }
// // };

// // Delete a Shop and its Products
// const deleteShop = async (req, res) => {
//     try {
//         const shop = await Shop.findByPk(req.params.id);
//         if (!shop) return res.status(404).json({ message: 'Shop not found' });

//         // Deleting the shop will also delete associated products due to CASCADE
//         await shop.destroy();
//         res.status(200).json({ message: 'Shop deleted' });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

// module.exports = { postAddProducts, getEditProducts, postEditProducts, postDeleteProduct, getProducts, deleteVendorDetail, createVendorDetail, getAllVendorDetails, getVendorDetailById, updateVendorDetail, createShop, getShops, getShopById, updateShop, deleteShop  }