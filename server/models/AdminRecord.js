import mongoose from "mongoose";

const adminRecordSchema = new mongoose.Schema(
    {
        resource: {
            type: String,
            enum: ["category", "order", "review", "promotion", "article", "website-content", "tailoring-request"],
            required: true,
            index: true,
        },
        payload: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true, strict: true }
);

export const AdminRecord = mongoose.model("AdminRecord", adminRecordSchema);
