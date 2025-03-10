const db = require('../models');
const ServiceProviderDetail = db.ServiceProviderDetail;
const User = db.User;

// Helper function to validate email
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Helper function to validate URL
const isValidURL = (url) => {
  const regex = /^(http|https):\/\/[^ "]+$/;
  return regex.test(url);
};
const checkServiceProviderByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Check if a ServiceProviderDetail exists for the given userId
    const serviceProvider = await ServiceProviderDetail.findOne({ where: { userId } });

    if (!serviceProvider) {
      return res.status(404).json({
        success: false,
        message: "No service provider found for this user ID."
      });
    }

    res.status(200).json({
      success: true,
      message: "Service provider found.",
      data: serviceProvider
    });
  } catch (error) {
    console.error("Error checking service provider by user ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message
    });
  }
};
// Create a new ServiceProviderDetail
const createServiceProviderDetail = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      profilePicture,
      location,
      specialization,
      availability,
      previousWorkImages,
      certificateImages,
      hourlyRate,
      languagesSpoken,
      bio,
      socialLinks,
      serviceArea,
      paymentTerms,
      tools,
      certifications,
      emergencyServices,
      warranty,
      reviews,
      status,
      yearsInBusiness,
      preferredContactMethod,
      pastProjects,
      userId
    } = req.body;

    // Validate required fields
    if (!userId || !specialization || !availability || !name || !email || !phone) {
      return res.status(400).json({
        message: 'Missing required fields: userId, name, email, phone, specialization, or availability.'
      });
    }

    // Check if a ServiceProviderDetail already exists for the given userId
    const existingServiceProvider = await ServiceProviderDetail.findOne({ where: { userId } });
    if (existingServiceProvider) {
      return res.status(201).json({
        message: 'A service provider detail already exists for this user.',
        existingServiceProvider // Return the existing service provider detail
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Validate profilePicture URL if provided
    if (profilePicture && !isValidURL(profilePicture)) {
      return res.status(400).json({ message: 'Invalid profilePicture URL.' });
    }

    // Validate location object if provided
    if (location) {
      const { lat, lng } = location;
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return res.status(400).json({ message: 'Location must contain valid lat and lng as numbers.' });
      }
    }

    // Optional: Validate URLs in previousWorkImages and certificateImages
    const validateImageURLs = (images, fieldName) => {
      if (images && Array.isArray(images)) {
        for (const url of images) {
          if (!isValidURL(url)) {
            throw new Error(`Invalid URL in ${fieldName}: ${url}`);
          }
        }
      }
    };

    validateImageURLs(previousWorkImages, 'previousWorkImages');
    validateImageURLs(certificateImages, 'certificateImages');

    // Create ServiceProviderDetail
    const newServiceProviderDetail = await ServiceProviderDetail.create({
      name,
      email,
      phone,
      profilePicture,
      location,
      specialization,
      availability,
      previousWorkImages: previousWorkImages || [],
      certificateImages: certificateImages || [],
      hourlyRate,
      languagesSpoken: languagesSpoken || [],
      bio,
      socialLinks: socialLinks || {},
      serviceArea: serviceArea || [],
      paymentTerms,
      tools: tools || [],
      certifications: certifications || [],
      emergencyServices: emergencyServices || false,
      warranty,
      reviews: reviews || [],
      status: status || 'Active',
      yearsInBusiness,
      preferredContactMethod,
      pastProjects: pastProjects || [],
      userId
    });

    res.status(201).json({
      message: 'ServiceProviderDetail created successfully.',
      data: newServiceProviderDetail
    });
  } catch (error) {
    console.error('Error creating ServiceProviderDetail:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

// const createServiceProviderDetail = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       phone,
//       profilePicture,
//       location,
//       specialization,
//       availability,
//       previousWorkImages,
//       certificateImages,
//       hourlyRate,
//       languagesSpoken,
//       bio,
//       socialLinks,
//       serviceArea,
//       paymentTerms,
//       tools,
//       certifications,
//       emergencyServices,
//       warranty,
//       reviews,
//       status,
//       yearsInBusiness,
//       preferredContactMethod,
//       pastProjects,
//       userId
//     } = req.body;

//     // Validate required fields
//     if (!userId || !specialization || !availability || !name || !email || !phone) {
//       return res.status(400).json({
//         message: 'Missing required fields: userId, name, email, phone, specialization, or availability.'
//       });
//     }

//     // Validate email format
//     if (!isValidEmail(email)) {
//       return res.status(400).json({ message: 'Invalid email format.' });
//     }

//     // Validate profilePicture URL if provided
//     if (profilePicture && !isValidURL(profilePicture)) {
//       return res.status(400).json({ message: 'Invalid profilePicture URL.' });
//     }

//     // Validate location object if provided
//     if (location) {
//       const { lat, lng } = location;
//       if (typeof lat !== 'number' || typeof lng !== 'number') {
//         return res.status(400).json({ message: 'Location must contain valid lat and lng as numbers.' });
//       }
//     }

//     // Optional: Validate URLs in previousWorkImages and certificateImages
//     const validateImageURLs = (images, fieldName) => {
//       if (images && Array.isArray(images)) {
//         for (const url of images) {
//           if (!isValidURL(url)) {
//             throw new Error(`Invalid URL in ${fieldName}: ${url}`);
//           }
//         }
//       }
//     };

//     validateImageURLs(previousWorkImages, 'previousWorkImages');
//     validateImageURLs(certificateImages, 'certificateImages');

//     // Create ServiceProviderDetail
//     const newServiceProviderDetail = await ServiceProviderDetail.create({
//       name,
//       email,
//       phone,
//       profilePicture,
//       location,
//       specialization,
//       availability,
//       previousWorkImages: previousWorkImages || [],
//       certificateImages: certificateImages || [],
//       hourlyRate,
//       languagesSpoken: languagesSpoken || [],
//       bio,
//       socialLinks: socialLinks || {},
//       serviceArea: serviceArea || [],
//       paymentTerms,
//       tools: tools || [],
//       certifications: certifications || [],
//       emergencyServices: emergencyServices || false,
//       warranty,
//       reviews: reviews || [],
//       status: status || 'Active',
//       yearsInBusiness,
//       preferredContactMethod,
//       pastProjects: pastProjects || [],
//       userId
//     });

//     res.status(201).json({
//       message: 'ServiceProviderDetail created successfully.',
//       data: newServiceProviderDetail
//     });
//   } catch (error) {
//     console.error('Error creating ServiceProviderDetail:', error);
//     res.status(500).json({ message: 'Internal server error.', error: error.message });
//   }
// };

// Get all ServiceProviderDetails
const getAllServiceProviderDetails = async (req, res) => {
  try {
    const serviceProviderDetails = await ServiceProviderDetail.findAll({
      include: {
        model: User,
        as: 'user',
        attributes: ['userName', 'email', 'profilePicture'] // Adjust based on User model
      }
    });
    res.status(200).json({
      success: true,
      data: serviceProviderDetails
    });
  } catch (error) {
    console.error('Error fetching service provider details:', error);
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
        attributes: ['userName', 'email', 'profilePicture'] // Adjust based on User model
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
    console.error('Error fetching service provider detail:', error);
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

    // Validate email if it's being updated
    if (updateData.email && !isValidEmail(updateData.email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Validate profilePicture URL if provided
    if (updateData.profilePicture && !isValidURL(updateData.profilePicture)) {
      return res.status(400).json({ message: 'Invalid profilePicture URL.' });
    }

    // Validate location object if provided
    if (updateData.location) {
      const { lat, lng } = updateData.location;
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return res.status(400).json({ message: 'Location must contain valid lat and lng as numbers.' });
      }
    }

    // Optional: Validate URLs in previousWorkImages and certificateImages
    const validateImageURLs = (images, fieldName) => {
      if (images && Array.isArray(images)) {
        for (const url of images) {
          if (!isValidURL(url)) {
            throw new Error(`Invalid URL in ${fieldName}: ${url}`);
          }
        }
      }
    };

    if (updateData.previousWorkImages) {
      validateImageURLs(updateData.previousWorkImages, 'previousWorkImages');
    }

    if (updateData.certificateImages) {
      validateImageURLs(updateData.certificateImages, 'certificateImages');
    }

    // Handle nested fields if necessary (e.g., specialization)
    // Assuming specialization is a JSON object; adjust as needed
    if (updateData.specialization && typeof updateData.specialization === 'object') {
      // Example: Merge existing specialization with new data
      updateData.specialization = {
        ...serviceProviderDetail.specialization,
        ...updateData.specialization
      };
    }

    // Update ServiceProviderDetail
    await serviceProviderDetail.update(updateData);

    res.status(200).json({
      message: 'ServiceProviderDetail updated successfully.',
      data: serviceProviderDetail
    });
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
    console.error('Error deleting ServiceProviderDetail:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting service provider detail',
      error: error.message
    });
  }
};

module.exports = {
  deleteServiceProviderDetail,
  createServiceProviderDetail,
  updateServiceProviderDetail,
  getAllServiceProviderDetails,
  getServiceProviderDetailById,
  checkServiceProviderByUserId
};












// // controllers/serviceProviderController.js

// const db = require('../models');
// const ServiceProviderDetail = db.ServiceProviderDetail;
// const User = db.User;

// // Create a new ServiceProviderDetail
// const createServiceProviderDetail = async (req, res) => {
//   try {
//     const {
//       personalDetails,
//       specialization,
//       availability,
//       licenseAndCertificates,
//       pastProjects,
//       hourlyRate,
//       languagesSpoken,
//       bio,
//       socialLinks,
//       serviceArea,
//       paymentTerms,
//       tools,
//       certifications,
//       emergencyServices,
//       warranty,
//       reviews,
//       status,
//       yearsInBusiness,
//       preferredContactMethod,
//       experience
//     } = req.body;

//     const { userId } = req.body; // Ensure userId is provided

// console.log("dsa",specialization);


//     // Validate required fields
//     if (!userId || !specialization || !availability) {
//       return res.status(400).json({ message: 'Missing required fields: userId, specialization, or availability.' });
//     }

//     // Process uploaded images
//     let previousWorkImages = [];
//     let certificateImages = [];

//     if (req.files['previousWorkImages']) {
//       previousWorkImages = req.files['previousWorkImages'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
//     }

//     if (req.files['certificateImages']) {
//       certificateImages = req.files['certificateImages'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
//     }

//     // Create ServiceProviderDetail
//     const newServiceProviderDetail = await ServiceProviderDetail.create({
//       // experience: specialization.experience,
//       // specialization: specialization.field,
//       availability: availability, // Assuming availability is already in JSON format
//       previousWorkImages,
//       certificateImages,
//       hourlyRate,
//       languagesSpoken,
//       bio,
//       socialLinks,
//       serviceArea,
//       paymentTerms,
//       tools,
//       certifications,
//       emergencyServices,
//       warranty,
//       reviews,
//       status,
//       yearsInBusiness,
//       preferredContactMethod,
//       pastProjects,
//       specialization,
//       userId
//     });

//     res.status(201).json({ message: 'ServiceProviderDetail created successfully.', data: newServiceProviderDetail });
//   } catch (error) {
//     console.error('Error creating ServiceProviderDetail:', error);
//     res.status(500).json({ message: 'Internal server error.', error: error.message });
//   }
// };

// // Get all ServiceProviderDetails
// const getAllServiceProviderDetails = async (req, res) => {
//   try {
//     const serviceProviderDetails = await ServiceProviderDetail.findAll({
//       include: {
//         model: User,
//         as: 'user',
//         attributes: ['userName', 'email', 'profilePicture'] // Adjust based on User model
//       }
//     });
//     res.status(200).json({
//       success: true,
//       data: serviceProviderDetails
//     });
//   } catch (error) {
//     console.error('Error fetching service provider details:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching service provider details',
//       error: error.message
//     });
//   }
// };

// // Get a single ServiceProviderDetail by ID
// const getServiceProviderDetailById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const serviceProviderDetail = await ServiceProviderDetail.findByPk(id, {
//       include: {
//         model: User,
//         as: 'user',
//         attributes: ['username', 'email',  'profilePicture'] // Adjust based on User model
//       }
//     });

//     if (!serviceProviderDetail) {
//       return res.status(404).json({
//         success: false,
//         message: 'Service provider detail not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: serviceProviderDetail
//     });
//   } catch (error) {
//     console.error('Error fetching service provider detail:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching service provider detail',
//       error: error.message
//     });
//   }
// };

// // Update a ServiceProviderDetail
// const updateServiceProviderDetail = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     // Find the ServiceProviderDetail
//     const serviceProviderDetail = await ServiceProviderDetail.findByPk(id);
//     if (!serviceProviderDetail) {
//       return res.status(404).json({ message: 'ServiceProviderDetail not found.' });
//     }

//     // Process uploaded images
//     if (req.files['previousWorkImages']) {
//       const newPreviousWorkImages = req.files['previousWorkImages'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
//       updateData.previousWorkImages = serviceProviderDetail.previousWorkImages.concat(newPreviousWorkImages);
//     }

//     if (req.files['certificateImages']) {
//       const newCertificateImages = req.files['certificateImages'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
//       updateData.certificateImages = serviceProviderDetail.certificateImages.concat(newCertificateImages);
//     }

//     // Handle nested fields
//     if (updateData.specialization) {
//       updateData.experience = updateData.specialization.experience || serviceProviderDetail.experience;
//       updateData.specialization = updateData.specialization.field || serviceProviderDetail.specialization;
//     }

//     // Update ServiceProviderDetail
//     await serviceProviderDetail.update(updateData);

//     res.status(200).json({ message: 'ServiceProviderDetail updated successfully.', data: serviceProviderDetail });
//   } catch (error) {
//     console.error('Error updating ServiceProviderDetail:', error);
//     res.status(500).json({ message: 'Internal server error.', error: error.message });
//   }
// };

// // Delete a ServiceProviderDetail
// const deleteServiceProviderDetail = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const serviceProviderDetail = await ServiceProviderDetail.findByPk(id);

//     if (!serviceProviderDetail) {
//       return res.status(404).json({
//         success: false,
//         message: 'Service provider detail not found'
//       });
//     }

//     // Delete the record
//     await serviceProviderDetail.destroy();

//     res.status(200).json({
//       success: true,
//       message: 'Service provider detail deleted successfully!'
//     });
//   } catch (error) {
//     console.error('Error deleting ServiceProviderDetail:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error deleting service provider detail',
//       error: error.message
//     });
//   }
// };

// module.exports = { 
//   deleteServiceProviderDetail, 
//   createServiceProviderDetail, 
//   updateServiceProviderDetail, 
//   getAllServiceProviderDetails, 
//   getServiceProviderDetailById 
// };



















// // const { ServiceProviderDetail, User } = require('../models');
// const db = require('../models');
// const ServiceProviderDetail = db.ServiceProviderDetail
// const User =db.User

// // Create a new ServiceProviderDetail
// const createServiceProviderDetail = async (req, res) => {
//   try {
//     const {
//         experience,
//         specialization,
//         availability,
//         userId
//     } = req.body;

//     // Validate required fields
//     if (!experience || !specialization || !availability || !userId) {
//         return res.status(400).json({ message: 'Missing required fields.' });
//     }

//     // Process uploaded images
//     let previousWorkImages = [];
//     let certificateImages = [];

//     if (req.files['previousWorkImages']) {
//         previousWorkImages = req.files['previousWorkImages'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
//     }

//     if (req.files['certificateImages']) {
//         certificateImages = req.files['certificateImages'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
//     }

//     // Create ServiceProviderDetail
//     const newServiceProviderDetail = await ServiceProviderDetail.create({
//         experience,
//         specialization,
//         availability: JSON.parse(availability),
//         previousWorkImages,
//         certificateImages,
//         userId
//     });

//     res.status(201).json({ message: 'ServiceProviderDetail created successfully.', data: newServiceProviderDetail });
// } catch (error) {
//     console.error('Error creating ServiceProviderDetail:', error);
//     res.status(500).json({ message: 'Internal server error.', error: error.message });
// }
// };

// // Get all ServiceProviderDetails
// const getAllServiceProviderDetails = async (req, res) => {
//     try {
//         const serviceProviderDetails = await ServiceProviderDetail.findAll(        {
//           include: {
//               model: User,
//               as: 'user',
//               attributes: ['username', 'email']  // Add any other fields you'd like to display from the User model
//           }
//       });
//         res.status(200).json({
//             success: true,
//             data: serviceProviderDetails
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching service provider details',
//             error: error.message
//         });
//     }
// };

// // Get a single ServiceProviderDetail by ID
// const getServiceProviderDetailById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const serviceProviderDetail = await ServiceProviderDetail.findByPk(id, {
//             include: {
//                 model: User,
//                 as: 'user',
//                 attributes: ['username', 'email']
//             }
//         });

//         if (!serviceProviderDetail) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Service provider detail not found'
//             });
//         }

//         res.status(200).json({
//             success: true,
//             data: serviceProviderDetail
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching service provider detail',
//             error: error.message
//         });
//     }
// };

// // Update a ServiceProviderDetail
// const updateServiceProviderDetail = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     // Find the ServiceProviderDetail
//     const serviceProviderDetail = await ServiceProviderDetail.findByPk(id);
//     if (!serviceProviderDetail) {
//         return res.status(404).json({ message: 'ServiceProviderDetail not found.' });
//     }

//     // Process uploaded images
//     if (req.files['previousWorkImages']) {
//         const newPreviousWorkImages = req.files['previousWorkImages'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
//         updateData.previousWorkImages = serviceProviderDetail.previousWorkImages.concat(newPreviousWorkImages);
//     }

//     if (req.files['certificateImages']) {
//         const newCertificateImages = req.files['certificateImages'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
//         updateData.certificateImages = serviceProviderDetail.certificateImages.concat(newCertificateImages);
//     }

//     // Parse JSON fields if they are strings
//     if (updateData.availability) {
//         updateData.availability = JSON.parse(updateData.availability);
//     }

//     // Update ServiceProviderDetail
//     await serviceProviderDetail.update(updateData);

//     res.status(200).json({ message: 'ServiceProviderDetail updated successfully.', data: serviceProviderDetail });
// } catch (error) {
//     console.error('Error updating ServiceProviderDetail:', error);
//     res.status(500).json({ message: 'Internal server error.', error: error.message });
// }
// };

// // Delete a ServiceProviderDetail
// const deleteServiceProviderDetail = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const serviceProviderDetail = await ServiceProviderDetail.findByPk(id);

//         if (!serviceProviderDetail) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Service provider detail not found'
//             });
//         }

//         // Delete the record
//         await serviceProviderDetail.destroy();

//         res.status(200).json({
//             success: true,
//             message: 'Service provider detail deleted successfully!'
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error deleting service provider detail',
//             error: error.message
//         });
//     }
// };

// module.exports = { deleteServiceProviderDetail, createServiceProviderDetail, updateServiceProviderDetail, getAllServiceProviderDetails, getServiceProviderDetailById}
