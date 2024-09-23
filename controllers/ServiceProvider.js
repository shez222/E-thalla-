// const { ServiceProviderDetail, User } = require('../models');
const db = require('../models');
const ServiceProviderDetail = db.ServiceProviderDetail
const User =db.User

// Create a new ServiceProviderDetail
const createServiceProviderDetail = async (req, res) => {
  try {
    const {
        experience,
        specialization,
        availability,
        userId
    } = req.body;

    // Validate required fields
    if (!experience || !specialization || !availability || !userId) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Process uploaded images
    let previousWorkImages = [];
    let certificateImages = [];

    if (req.files['previousWorkImages']) {
        previousWorkImages = req.files['previousWorkImages'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
    }

    if (req.files['certificateImages']) {
        certificateImages = req.files['certificateImages'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
    }

    // Create ServiceProviderDetail
    const newServiceProviderDetail = await ServiceProviderDetail.create({
        experience,
        specialization,
        availability: JSON.parse(availability),
        previousWorkImages,
        certificateImages,
        userId
    });

    res.status(201).json({ message: 'ServiceProviderDetail created successfully.', data: newServiceProviderDetail });
} catch (error) {
    console.error('Error creating ServiceProviderDetail:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
}
};

// Get all ServiceProviderDetails
const getAllServiceProviderDetails = async (req, res) => {
    try {
        const serviceProviderDetails = await ServiceProviderDetail.findAll(        {
          include: {
              model: User,
              as: 'user',
              attributes: ['username', 'email']  // Add any other fields you'd like to display from the User model
          }
      });
        res.status(200).json({
            success: true,
            data: serviceProviderDetails
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching service provider details',
            error: error.message
        });
    }
};

// Get a single ServiceProviderDetail by ID
const getServiceProviderDetailById = async (req, res) => {
    try {
        const { id } = req.params;

        const serviceProviderDetail = await ServiceProviderDetail.findByPk(id, {
            include: {
                model: User,
                as: 'user',
                attributes: ['username', 'email']
            }
        });

        if (!serviceProviderDetail) {
            return res.status(404).json({
                success: false,
                message: 'Service provider detail not found'
            });
        }

        res.status(200).json({
            success: true,
            data: serviceProviderDetail
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching service provider detail',
            error: error.message
        });
    }
};

// Update a ServiceProviderDetail
const updateServiceProviderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the ServiceProviderDetail
    const serviceProviderDetail = await ServiceProviderDetail.findByPk(id);
    if (!serviceProviderDetail) {
        return res.status(404).json({ message: 'ServiceProviderDetail not found.' });
    }

    // Process uploaded images
    if (req.files['previousWorkImages']) {
        const newPreviousWorkImages = req.files['previousWorkImages'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
        updateData.previousWorkImages = serviceProviderDetail.previousWorkImages.concat(newPreviousWorkImages);
    }

    if (req.files['certificateImages']) {
        const newCertificateImages = req.files['certificateImages'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
        updateData.certificateImages = serviceProviderDetail.certificateImages.concat(newCertificateImages);
    }

    // Parse JSON fields if they are strings
    if (updateData.availability) {
        updateData.availability = JSON.parse(updateData.availability);
    }

    // Update ServiceProviderDetail
    await serviceProviderDetail.update(updateData);

    res.status(200).json({ message: 'ServiceProviderDetail updated successfully.', data: serviceProviderDetail });
} catch (error) {
    console.error('Error updating ServiceProviderDetail:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
}
};

// Delete a ServiceProviderDetail
const deleteServiceProviderDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const serviceProviderDetail = await ServiceProviderDetail.findByPk(id);

        if (!serviceProviderDetail) {
            return res.status(404).json({
                success: false,
                message: 'Service provider detail not found'
            });
        }

        // Delete the record
        await serviceProviderDetail.destroy();

        res.status(200).json({
            success: true,
            message: 'Service provider detail deleted successfully!'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting service provider detail',
            error: error.message
        });
    }
};

module.exports = { deleteServiceProviderDetail, createServiceProviderDetail, updateServiceProviderDetail, getAllServiceProviderDetails, getServiceProviderDetailById}
