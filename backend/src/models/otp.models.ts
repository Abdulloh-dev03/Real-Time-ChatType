import { Schema, model } from "mongoose";

const otpSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
    otp: {
        type: String,
        required: true,
    },
    expireAt: {
        type: Date,
        default: Date.now,
        index: { expires: '5m' } // OTP will expire in 5 minutes
    },
});

const otpModel = model("Otp", otpSchema);

// ✅ ES Module export
export default otpModel;
