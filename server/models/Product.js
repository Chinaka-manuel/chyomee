import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
        category: { type: String, required: true, trim: true, maxlength: 80 },
        price: { type: Number, required: true, min: 0 },
        stock: { type: Number, required: true, min: 0, validate: Number.isInteger },
        description: { type: String, required: true, trim: true, maxlength: 5000 },
        image: {
            type: String,
            required: true,
            maxlength: 2048,
            validate(value) {
                if (!value) return false;
                try {
                    const url = new URL(value);
                    return url.protocol === "https:" &&
                        url.hostname === "res.cloudinary.com" &&
                        /^\/[^/]+\/image\/upload\//.test(url.pathname);
                } catch {
                    return false;
                }
            },
        },
        images: {
            type: [{ type: String, maxlength: 2048 }],
            default: [],
            validate: {
                validator(value) {
                    return value.length <= 5 && value.every((image) => {
                        try {
                            const url = new URL(image);
                            return url.protocol === "https:" &&
                                url.hostname === "res.cloudinary.com" &&
                                /^\/[^/]+\/image\/upload\//.test(url.pathname);
                        } catch {
                            return false;
                        }
                    });
                },
                message: "Products can have up to 5 valid Cloudinary images.",
            },
        },
        sizes: {
            type: [{ type: String, trim: true, maxlength: 30 }],
            default: [],
            validate: {
                validator(value) {
                    const normalized = value.map((size) => size.toLowerCase());
                    return value.length <= 20 && new Set(normalized).size === value.length;
                },
                message: "Product sizes must be unique and contain no more than 20 options.",
            },
        },
        colors: {
            type: [{ type: String, trim: true, maxlength: 30 }],
            default: [],
            validate: {
                validator(value) {
                    const normalized = value.map((color) => color.toLowerCase());
                    return value.length <= 20 && new Set(normalized).size === value.length;
                },
                message: "Product colors must be unique and contain no more than 20 options.",
            },
        },
        styles: {
            type: [{ type: String, trim: true, maxlength: 30 }],
            default: [],
            validate: {
                validator(value) {
                    const normalized = value.map((style) => style.toLowerCase());
                    return value.length <= 20 && new Set(normalized).size === value.length;
                },
                message: "Product styles must be unique and contain no more than 20 options.",
            },
        },
        madeToMeasure: { type: Boolean, default: false },
        isFabric: { type: Boolean, default: false },
        status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    },
    { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
