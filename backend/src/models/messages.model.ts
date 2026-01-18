import { CONST } from "#lib/constants.js";
import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String },
    image: { type: String },
    status: {
      type: String,
      enum: [CONST.SENT, CONST.DELIVERED, CONST.READ],
      default: CONST.SENT,
    },
    deliveredAt: { type: Date },
    readAt: { type: Date },
    reactions: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        emoji: { type: String, required: true },
      },
    ],
  },
  { timestamps: true },
);

const Message = model("Message", messageSchema);
export default Message;
