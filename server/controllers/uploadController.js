import File from "../models/File.js";

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a file",
      });
    }

    const file = await File.create({
      name: req.file.originalname,
      url: req.file.path,
      publicId: req.file.filename,
      resourceType: req.file.resource_type,
    });

    res.status(201).json({
      status: "success",
      message: "File uploaded successfully",
      file,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message || "File upload failed",
    });
  }
};
