import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: String,
    userLikes: {
      type: Array,
      default: [],
      required: true
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model("Comment", CommentSchema);
