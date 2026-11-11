import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "File name is required"],
    },

    url: {
      type: String,
      required: [true, "File URL is required"],
    },

    publicId: {
      type: String,
      required: [true, "Public ID is required"],
    },

    resourceType: {
      type: String,
      required: [true, "Resource type is required"],
    },
  },
  {
    timestamps: true,
  }
);

const File = mongoose.model("File", fileSchema);

export default File;