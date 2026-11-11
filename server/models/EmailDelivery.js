import mongoose from "mongoose";

const emailDeliverySchema = new mongoose.Schema(
  {
    resendEmailId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      required: true,
    },
    lastEventType: {
      type: String,
      required: true,
    },
    lastEventAt: {
      type: Date,
      required: true,
      default: () => new Date(0),
    },
  },
  { timestamps: true },
);

const EmailDelivery = mongoose.model("EmailDelivery", emailDeliverySchema);

export default EmailDelivery;
