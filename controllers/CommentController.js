import Comment from "../models/Comment.js";
import user from "../models/user.js";
import Post from "../models/Post.js";

export const create = async (req,res) => {
  try {
    const doc = new Comment({
      postId: req.params.id,
      user: req.userId,
      text: req.body.text,
      imageUrl: req.body.imageUrl
    })
    const comment = await doc.save();
    const allComments = await Comment.find({ postId: req.params.id });
    await Post.findByIdAndUpdate({ _id: req.params.id }, { $set: { commentsAmount: allComments.length } });

    res.json(comment);
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: error+'Cant create comment'
    })
  }
}

export const getAll = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.id }).populate("user").exec();

    res.json(comments);
  } catch (error) {
    console.log(error);
    res.statust(500).json({
      message: error+"Cant find comments",
    });
  }
};


export const likeOne = async (req, res) => {
  try {
    const commentId = req.params.id;

    const userLiked = await user.findById(req.userId);
    const add = { $push: { userLikes: userLiked } };
    const remove = { $pull: { userLikes: userLiked } };
    const operation = req.query.like > 0 ? add : remove;

    Comment.findOneAndUpdate({ _id: commentId }, { ...operation }, { returnDocument: "after" }, (err, doc) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          message: " Не удалось вернуть like",
        });
      }
      if (!doc) {
        return res.status(404).json({
          message: " like нету(",
        });
      }
      res.json(doc);
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error + " Не удалось получить lukas",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;
    const parentId = req.body.id
    
    const posts = await Comment.find({ postId: parentId });
    const post = posts.find((e) => e._id.valueOf() === postId);

    if (post.user.valueOf() !== req.userId) {
      return res.status(403).json({
        message: "Restricted acces",
      });
    }
    const deleted = await Comment.findOneAndRemove({ _id: postId })
    await Post.findOneAndUpdate({ _id: parentId }, { $set: { commentsAmount: posts.length - 1 } });
    res.json(deleted);
    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error + " Не удалось получить посты",
    });
  }
};

export const update = async (req, res) => {
  try {
    const commentId = req.params.id;
    await Comment.updateOne(
      { _id: commentId },
      {
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: req.userId,
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error + " Не удалось получить посты",
    });
  }
};
