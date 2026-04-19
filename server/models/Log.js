const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title:       { type: String, required: true },
  description: { type: String, required: true },
  rating:      { type: Number, min: 1, max: 5, default: 3 },
  type: {
    type: String,
    enum: ["visited", "wishlist"],
    default: "visited",
  },
  image:     { type: String, default: "" },  // NEW: Cloudinary image URL
  latitude:  { type: Number, required: true },
  longitude: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Log", LogSchema);
