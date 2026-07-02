const User = require("../models/User");

exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email, password, role });

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // ✅ DATA FOUND IN DB
    return res.json({
      success: true,
      message: "Login successful"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
