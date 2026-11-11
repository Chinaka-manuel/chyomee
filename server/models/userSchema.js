import mongoose from "mongoose"
import validator from "validator"
import bcrypt from "bcrypt"

// create a variable that will hold the schema
const userSchema = new mongoose.Schema({
    image: {
        type: String,
        default: ""
    },
    userName: {
        type: String,
        required: [true, "user name field is required"],
        trim: true,
        minlength: 1,
        maxlength: 100,
       
    },
    email: {
        type: String,
        required: [true, "Email field is required"],
        trim: true,
        lowercase: true,
        unique: true,
        validate: {
            validator: (value) => validator.isEmail(value),
            message: "Please enter a valid email"
        }
    },
    phone: {
        type: String,
        trim: true,
        maxlength: 32,
    },
    addresses: {
        type: [{
            label: { type: String, trim: true, maxlength: 60 },
            address: { type: String, required: true, trim: true, maxlength: 500 },
            city: { type: String, trim: true, maxlength: 100 },
            state: { type: String, trim: true, maxlength: 100 },
            postalCode: { type: String, trim: true, maxlength: 20 },
            country: { type: String, trim: true, maxlength: 100 },
        }],
        default: [],
    },
    cart: {
        type: [{
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, min: 1, max: 1000, validate: Number.isInteger, required: true },
            size: { type: String, trim: true, maxlength: 30, default: "" },
            color: { type: String, trim: true, maxlength: 30, default: "" },
            style: { type: String, trim: true, maxlength: 30, default: "" },
        }],
        default: [],
    },
    loyaltyBalanceKobo: {
        type: Number,
        min: 0,
        validate: Number.isInteger,
        default: 0,
    },
      role:{
        type: String,
        enum: ["admin", "user"],
        default: "user"
       
    },

    password: {
        type: String,
        required: [true, "Password field is required"],
        minLength: [8, "Password must be at least 8 characters long"],
        validate: {
            validator: function(value) {
                if (!value) return false;
                if (value.startsWith("$2")) return true;

                return validator.isStrongPassword(value, {
                    minLength: 8,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 1
                })
            },
            message: "Password must contain at least 8 characters, including uppercase, lowercase, number and symbol"
        }
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

     isVerified: {
        type: Boolean,
        default: false
    },
     isActive: {
         type: Boolean,
         default: true,
     },
    verificationToken: {
        type: String,
        select: false,
    },
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        select: false,
    },

}, 
{
    timestamps: true
}
);

userSchema.pre("save", async function() {
    if (!this.isModified("password")) return;  //do not encrypt the password if the password has not been modified

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// create a model from the schema
// it is a convention to use capital letters for the variable name of the model

export const User = mongoose.model("User", userSchema)