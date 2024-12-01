const express = require('express');
const socketIo = require('socket.io');


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
app.use('/E-Thalla', MultiUseruserRoutes);
app.use('/Shop', shopRoutes);
app.use('/service-provider-details', serviceProviderRoutes); // Add this line

// Routes with file uploads will be handled in their respective route files
app.use('/Vendors', vendorRoutes);

// Error Handling Middleware (Optional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the Server
const PORT = process.env.PORT || 3000;
const io = socketIo(3001, {
    cors: {
      origin: '*', // Allow all origins for now, you can specify your client domain here
      methods: ['GET', 'POST']
    }
  });

app.set('io', io); // Make Socket.io instance available in routes

  
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
};

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
    //when ceonnect
    console.log("a user connected.",socket.id);
    
    //take userId and socketId from user
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        console.log("a user added.",socket.id);
        console.log("users: ",users);
        io.emit("getUsers", users);
    });

    //send and get message
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        io.to(user.socketId).emit("getMessage", {
            senderId,
            text,
        });
    }); 
    socket.on("sendMessage2", ({ senderId, receiverId, text }) => { // this is for testing purposes
        // const user = getUser(receiverId);
        console.log(`sender ${senderId} , reciever ${receiverId} , text ${text}`);

        io.to(receiverId).emit("getMessage", {
            senderId,
            text,
        });
    });

    //when disconnect
    socket.on("disconnect", () => {
        console.log("a user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers", users);
    });
});
