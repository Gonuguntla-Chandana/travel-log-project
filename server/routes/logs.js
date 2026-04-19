const router = require("express").Router();
const Log = require("../models/Log");
const verifyToken = require("../middleware/verifyToken");
const { upload, cloudinary } = require("../utils/cloudinary");
 
// POST: Create a log with optional image (protected)
router.post("/", verifyToken, (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      console.log("Multer error:", err);
      return res.status(500).json({ message: "Image upload failed.", error: err.message });
    }
 
    try {
      const { title, description, rating, type, latitude, longitude } = req.body;
 
      if (!title || !description || !latitude || !longitude) {
        return res.status(400).json({ message: "Missing required fields." });
      }
 
      const newLog = new Log({
        userId:      req.user.id,
        title,
        description,
        rating:      Number(rating),
        type:        type || "visited",
        latitude:    Number(latitude),
        longitude:   Number(longitude),
        image:       req.file ? req.file.path : "",
      });
 
      const savedLog = await newLog.save();
      console.log("Log saved:", savedLog.title);
      res.status(200).json(savedLog);
    } catch (error) {
      console.log("Save error:", error);
      res.status(500).json({ message: "Failed to save log.", error: error.message });
    }
  });
});
 
// GET: Only fetch logs belonging to logged-in user (protected)
router.get("/", verifyToken, async (req, res) => {
  try {
    const logs = await Log.find({ userId: req.user.id });
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json(err);
  }
});
 
// DELETE: Only allow owner to delete (protected)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    if (!log) return res.status(404).json({ message: "Log not found." });
 
    if (log.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own logs." });
    }
 
    if (log.image) {
      const publicId = log.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`travel-log/${publicId}`);
    }
 
    await Log.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Log deleted successfully." });
  } catch (err) {
    res.status(500).json(err);
  }
});
 
module.exports = router;