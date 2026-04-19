const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
 
// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
 
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists." });
    }
 
    const newUser = new User({ username, email, password });
    const savedUser = await newUser.save();
 
    const { password: _, ...userInfo } = savedUser._doc;
    res.status(201).json({ message: "User registered successfully!", user: userInfo });
 
  } catch (err) {
    res.status(500).json({ message: "Something went wrong.", error: err.message });
  }
});
 
// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
 
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password." });
 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password." });
 
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
 
    const { password: _, ...userInfo } = user._doc;
    res.status(200).json({ token, user: userInfo });
 
  } catch (err) {
    res.status(500).json({ message: "Something went wrong.", error: err.message });
  }
});
 
module.exports = router;
 