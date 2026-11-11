import mongoose from "mongoose";
import { Product } from "../models/Product.js";

const editableFields = ["name", "category", "price", "stock", "description", "image", "images", "sizes", "colors", "styles", "madeToMeasure", "isFabric", "status"];
const requiredFields = ["name", "category", "price", "stock", "description", "image", "status"];

const isCloudinaryImageUrl = (image) => {
    if (typeof image !== "string" || !image.trim()) return false;
    try {
        const url = new URL(image.trim());
        return url.protocol === "https:" &&
            url.hostname === "res.cloudinary.com" &&
            /^\/[^/]+\/image\/upload\//.test(url.pathname);
    } catch {
        return false;
    }
};

const productPayload = (body, partial = false, existingImage = null) => {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return { error: "Product data must be a JSON object." };
    }
    const payload = Object.fromEntries(
        Object.entries(body).filter(([key]) => editableFields.includes(key))
    );
    if (
        payload.image === undefined &&
        Array.isArray(payload.images) &&
        payload.images.length > 0
    ) {
        payload.image = payload.images[0];
    }
    if (!Object.keys(payload).length) {
        return { error: "Provide at least one valid product field." };
    }
    if (!partial && requiredFields.some((field) => payload[field] === undefined)) {
        return { error: "Name, category, price, stock, description, image, and status are required." };
    }
    if (payload.name !== undefined && (typeof payload.name !== "string" || !payload.name.trim())) {
        return { error: "Product name is required." };
    }
    if (payload.name !== undefined && payload.name.trim().length > 120) {
        return { error: "Product name must be 120 characters or fewer." };
    }
    if (payload.category !== undefined && (typeof payload.category !== "string" || !payload.category.trim())) {
        return { error: "Product category is required." };
    }
    if (payload.category !== undefined && payload.category.trim().length > 80) {
        return { error: "Product category must be 80 characters or fewer." };
    }
    if (payload.description !== undefined && typeof payload.description !== "string") {
        return { error: "Product description must be text." };
    }
    if (payload.description !== undefined && payload.description.length > 5000) {
        return { error: "Product description must be 5000 characters or fewer." };
    }
    if (payload.image !== undefined &&
        !isCloudinaryImageUrl(payload.image) &&
        payload.image !== existingImage) {
        return { error: "Product images must be uploaded to Cloudinary before saving." };
    }
    if (payload.image !== undefined && payload.image.length > 2048) {
        return { error: "Product image URL must be 2048 characters or fewer." };
    }
    if (payload.status !== undefined && !["Active", "Inactive"].includes(payload.status)) {
        return { error: "Product status must be Active or Inactive." };
    }
    for (const field of ["madeToMeasure", "isFabric"]) {
        if (payload[field] !== undefined && typeof payload[field] !== "boolean") {
            return { error: `${field} must be true or false.` };
        }
    }
    if (payload.images !== undefined) {
        if (!Array.isArray(payload.images) || payload.images.length < 1 || payload.images.length > 5) {
            return { error: "Products must have between 1 and 5 images." };
        }
        if (!payload.images.every(isCloudinaryImageUrl)) {
            return { error: "Product images must be uploaded to Cloudinary before saving." };
        }
        payload.image = payload.images[0];
    } else if (payload.image !== undefined) {
        payload.images = [payload.image];
    }
    if (payload.sizes !== undefined) {
        if (!Array.isArray(payload.sizes) || payload.sizes.length > 20) {
            return { error: "A product can have up to 20 size options." };
        }
        const sizes = payload.sizes.map((size) =>
            typeof size === "string" ? size.trim() : "",
        );
        if (sizes.some((size) => !size || size.length > 30)) {
            return { error: "Each size must contain between 1 and 30 characters." };
        }
        if (new Set(sizes.map((size) => size.toLowerCase())).size !== sizes.length) {
            return { error: "Product size options must be unique." };
        }
        payload.sizes = sizes;
    }
    for (const field of ["colors", "styles"]) {
        if (payload[field] === undefined) continue;
        if (!Array.isArray(payload[field]) || payload[field].length > 20) {
            return { error: `A product can have up to 20 ${field} options.` };
        }
        const options = payload[field].map((option) =>
            typeof option === "string" ? option.trim() : "",
        );
        if (options.some((option) => !option || option.length > 30)) {
            return { error: `Each ${field.slice(0, -1)} must contain between 1 and 30 characters.` };
        }
        if (new Set(options.map((option) => option.toLowerCase())).size !== options.length) {
            return { error: `Product ${field} options must be unique.` };
        }
        payload[field] = options;
    }
    for (const field of ["price", "stock"]) {
        if (payload[field] !== undefined && (!Number.isFinite(Number(payload[field])) || Number(payload[field]) < 0)) {
            return { error: `Product ${field} must be a valid non-negative number.` };
        }
        if (payload[field] !== undefined) payload[field] = Number(payload[field]);
    }
    if (payload.stock !== undefined && !Number.isInteger(payload.stock)) {
        return { error: "Product stock must be a whole number." };
    }
    if (partial && payload.image === existingImage && !isCloudinaryImageUrl(payload.image)) {
        delete payload.image;
    }
    return { payload };
};

const sendProductValidationError = (res, result) =>
    res.status(400).json({ status: "failed", message: result.error });

const sendModelValidationError = (res, error) => {
    if (error?.name !== "ValidationError") return false;
    const message = Object.values(error.errors)
        .map((validationError) => validationError.message)
        .join(". ");
    res.status(400).json({ status: "failed", message });
    return true;
};

const presentProduct = (product) => ({
    ...product,
    id: product._id.toString(),
});

export const getAllProducts = async (req, res) => {
    const query = req.admin ? {} : { status: "Active" };
    if (typeof req.query.category === "string" && req.query.category.length <= 80) {
        query.category = req.query.category.trim();
    }
    if (typeof req.query.search === "string" && req.query.search.length <= 100) {
        const search = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        query.name = { $regex: search, $options: "i" };
    }
    const products = await Product.find(query).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ status: "success", data: products.map(presentProduct) });
};

export const addProducts = async (req, res) => {
    const result = productPayload(req.body);
    if (result.error) return sendProductValidationError(res, result);
    try {
        const product = await Product.create(result.payload);
        return res.status(201).json({ status: "success", data: presentProduct(product.toObject()) });
    } catch (error) {
        if (sendModelValidationError(res, error)) return;
        throw error;
    }
};

export const getProductById = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ status: "failed", message: "Invalid product id" });
    }
    const product = await Product.findById(req.params.id).lean();
    if (!product || (!req.admin && product.status !== "Active")) {
        return res.status(404).json({ status: "failed", message: "Product not found" });
    }
    return res.status(200).json({ status: "success", data: presentProduct(product) });
};

export const updateProduct = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ status: "failed", message: "Invalid product id" });
    }
    const existingProduct = await Product.findById(req.params.id).lean();
    if (!existingProduct) {
        return res.status(404).json({ status: "failed", message: "Product not found" });
    }
    const result = productPayload(req.body, true, existingProduct.image);
    if (result.error) return sendProductValidationError(res, result);
    let product;
    try {
        product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: result.payload },
            { returnDocument: 'after', runValidators: true }
        );
    } catch (error) {
        if (sendModelValidationError(res, error)) return;
        throw error;
    }
    if (!product) return res.status(404).json({ status: "failed", message: "Product not found" });
    return res.status(200).json({ status: "success", data: presentProduct(product.toObject()) });
};

export const deleteProduct = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ status: "failed", message: "Invalid product id" });
    }
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ status: "failed", message: "Product not found" });
    return res.status(200).json({ status: "success", message: "Product deleted" });
};
