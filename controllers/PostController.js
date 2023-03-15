import PostModel from "../models/Post.js"
import user from "../models/user.js";
import Comment from "../models/Comment.js";

export const create = async (req, res) => {
  
  try {
      const doc = new PostModel({
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags?.split(","),
        user: req.userId,
      });

      const post = await doc.save();

      res.status(200).json(post);
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Не удалось создать статью",
      });
    }
};


export const getAll = async (req, res) => {
    try {
      const userFilter = req.query.id // when profile posts
      const sort = req.query.sort
      const userId = req.query.userId // follow users posts
      const search = req.query.search.toLowerCase();
      const page = req.query.page ?? 0;

      let filterParams = {};
      if (userFilter) filterParams.user = userFilter;
      if (userId) {
        const me = await user.findById(userId);
        filterParams.user = { $in: [...me.follow,me._id] };
      }
      if (search) {
        filterParams.$or = [
          { title: { $regex: search, $options: "i" } },
          { text: { $regex: search, $options: "i" } },
        ];
      }

      let sortType = { createdAt: -1 };
      if (sort === 'views') sortType = { viewsCount: -1 };
      if (sort === "likes") sortType = { likesAmount: -1 };
      console.log(page);
     
      let posts = await PostModel.find(filterParams).sort(sortType).limit(10).skip(page*10).populate("user").exec();
      // posts.sort((a, b) => {
      //   if (sort === 'time') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      //   if (sort === 'views') return b.viewsCount - a.viewsCount
      //   if (sort === 'likes') return b.userLikes.length - a.userLikes.length
      // })
       console.log(posts.length);
      res.json(posts)
    } catch (error) {
        console.log(error);
        res.status(500).json({
          message: error + " Не удалось получить посты",
        });
    }
}

export const getOne = async (req, res) => {
  
    try {
      const postId = req.params.id;
      const post = await PostModel.findById(postId).populate("user").exec();
      
      PostModel.findOneAndUpdate({ _id: postId }, { $inc: { viewsCount: 1 } }, { returnDocument: "after" }, (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: " Не удалось вернуть пост",
          });
        }
        if (!doc) {
          return res.status(404).json({
            message: " поста нету(",
          });
        }

        doc.user = post.user;
       
        res.json(doc)
      });
    } catch (error) {
        console.log(error);
        res.status(500).json({
          message: error + " Не удалось получить посты",
        });
    }
}

export const remove = async (req, res) => {
    try {
      const postId = req.params.id;
      await Comment.deleteMany({ postId});
        PostModel.findOneAndRemove(
            { _id: postId },
            (err, doc) => {
                if (err) {
                     console.log(err);
                     return res.status(500).json({
                       message:  " Не удалось вернуть пост",
                     });
                }
                if (!doc) {
                    return res.status(404).json({
                      message: " поста нету(",
                    });
                }
                res.json(doc)
            }
        ) 
    } catch (error) {
        console.log(error);
        res.status(500).json({
          message: error + " Не удалось получить посты",
        });
    }
}

export const update = async (req, res) => {
  try {
    const postId = req.params.id;
    const newTags = req.body.tags ? req.body.tags.split(",") : null

     await PostModel.updateOne(
       { _id: postId },
       {
         title: req.body.title,
         text: req.body.text,
         imageUrl: req.body.imageUrl,
         user: req.userId,
         tags: newTags,
       }

       // (err, doc) => {
       //   if (err) {
       //     console.log(err);
       //     return res.status(500).json({
       //       message: " Не удалось вернуть пост",
       //     });
       //   }
       //   if (!doc) {
       //     return res.status(404).json({
       //       message: " поста нету(",
       //     });
       //   }
       // res.json(doc);
       // }
     );
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error + " Не удалось получить посты",
    });
  }
};

export const likeOne = async (req, res) => {
  try {
    const postId = req.params.id;

    const whoLiked = await user.findById(req.userId);
    // console.log(whoLiked);
    // const add = { $push: { userLikes: whoLiked } };
    // const remove = { $pull: { userLikes: whoLiked } };
    // const operation = req.query.like > 0 ? add : remove

    const likedPost = await PostModel.findOne({ _id: postId });
    const filteredLikesList = likedPost.userLikes.filter(e => e._id.valueOf() !== whoLiked._id.valueOf());
    const addedList = [...likedPost.userLikes, whoLiked];
    const newList = req.query.like > 0 ? addedList : filteredLikesList;
     PostModel.findOneAndUpdate({ _id: postId }, { userLikes: newList, likesAmount: newList.length }, { returnDocument: "after" }, (err, doc) => {
       if (err) {
         console.log(err);
         return res.status(500).json({
           message: " Не удалось вернуть пост",
         });
       }
       if (!doc) {
         return res.status(404).json({
           message: " поста нету(",
         });
       }
        console.log(doc);
       res.json(doc);
     });

    // PostModel.findOneAndUpdate({ _id: postId }, {...operation }, { returnDocument: "after" }, (err, doc) => {
    //   if (err) {
    //     console.log(err);
    //     return res.status(500).json({
    //       message: " Не удалось вернуть пост",
    //     });
    //   }
    //   if (!doc) {
    //     return res.status(404).json({
    //       message: " поста нету(",
    //     });
    //   }
    //   res.json(doc);
    // });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error + " Не удалось получить посты",
    });
  }
};