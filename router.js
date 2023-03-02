import Router from 'express'
import handleValidationsErrors from './utils/handleValidationsErrors.js';
import checkAuth from './utils/checkAuth.js';
import { registerValidation, loginValidation, postCreateValidation, commentCreateValidation } from "./validations.js";
import * as UserController from "./controllers/UserController.js";
import * as PostController from "./controllers/PostController.js";
import * as CommentController from "./controllers/CommentController.js";
import cors from "cors";
import express from "express";
import multer from "multer";

const router = Router()
router.use(cors());
router.use(express.json());

router.post("/auth/register", registerValidation, handleValidationsErrors, UserController.register);
router.post("/auth/login", loginValidation, handleValidationsErrors, UserController.login);
router.get("/auth/me", checkAuth, UserController.check);

router.get("/users", UserController.getAll);
router.get("/users/:id", UserController.getOne);
router.patch("/users/:id", checkAuth, UserController.update);
router.patch("/subscribe/:id", checkAuth, UserController.subscribe);

router.get("/posts", PostController.getAll);
router.get("/posts/:id", PostController.getOne);
router.post("/posts", checkAuth, postCreateValidation, handleValidationsErrors, PostController.create);
router.delete("/posts/:id", checkAuth, PostController.remove);
router.patch("/posts/:id", checkAuth, postCreateValidation, handleValidationsErrors, PostController.update);
router.get("/posts/like/:id", checkAuth, PostController.likeOne);

router.post("/comments/:id", checkAuth, commentCreateValidation, CommentController.create);
router.get("/comments/:id", CommentController.getAll);
router.get("/comments/like/:id", checkAuth, CommentController.likeOne);
router.delete("/comments/:id", checkAuth, CommentController.remove);
router.patch("/comments/:id", checkAuth, commentCreateValidation, handleValidationsErrors, CommentController.update);

router.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads");
  },
  filename: (_, file, cb) => {
    cb(null, _.body.fileName);
  },
});

const upload = multer({ storage });

router.post("/upload", checkAuth, upload.single("image", "fileName"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

export default router