const mongoose = require("mongoose");

const LoginLogSchema = new mongoose.Schema({
    email: String,
    success: Boolean, 
    time: { type: Date, default: Date.now } // true if login successful, false if failed
});

module.exports = mongoose.model("LoginLog", LoginLogSchema);
