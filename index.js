const express = require('express')
const cors = require('cors');
const app = express()
const port = 4000;


app.use(express.json());
app.use(cors());


const mongoose = require('mongoose');

// Replace the MongoDB connection URL with your own
const uri = 'mongodb://localhost:27017/login';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('Error connecting to MongoDB:', error);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});


// Define a schema for your data


const userSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  email: String,
  password: String,
  imageUrl : String
});

const User = mongoose.model('User', userSchema);




app.get('/getUsers', async (req, res) => {
  try {
    // Use await to wait for the database query to complete
    const users = await User.find();
    
    // Respond with the retrieved users as JSON
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'An error occurred while fetching users' });
  }
});




app.post('/createUsers', async (req, res) => {
  try {
    console.log('req',req);
    const { fname, lname, email, password  } = req.body;
    console.log('fname',fname);
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Get the path to the uploaded image
    const imageUrl = req.file.path;

    console.log('imageUrl',imageUrl);

    // Create a new user document using the Mongoose model
    const newUser = new User({ fname, lname, email, password, imageUrl });

    // Save the user document to the database
    await newUser.save();

   
    res.status(201).json({
      message: 'User created successfully',
      user: newUser.toObject(), // Convert the Mongoose document to a plain JavaScript object
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'An error occurred while creating the user' });
  }
});

// ... (previous code)

// Define an endpoint for updating a user by ID
app.put('/updateUser/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { fname, lname, email, password } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user fields if provided
    if (fname) user.fname = fname;
    if (lname) user.lname = lname;
    if (email) user.email = email;
    if (password) user.password = password;

    // Save the updated user document
    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'An error occurred while updating the user' });
  }
});

// Define an endpoint for deleting a user by ID
app.delete('/deleteUser/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by ID and delete it
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully', user });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'An error occurred while deleting the user' });
  }
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})