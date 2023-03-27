import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.js";

import nodemailer from "nodemailer";
import directTransport from "nodemailer-direct-transport";

export const register = async (req, res) => {
  try {

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new User({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user.id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );

    const { passwordHash, ...userData } = user._doc;


      
    const fromHost = `gmail.com`;
    const from = "MinchonokBlog" + "@" + fromHost; //придумываете свою почту(может быть несуществующая)
    const to = "anton.minchonak@itspro.by";
    const transport = nodemailer.createTransport(
      directTransport({
        name: fromHost,
      })
    );
    transport.sendMail(
      {
        from,
        to,
        subject: "Подтверждение почты",
        html: `
             <h1>Вы успешно зарегестрировались</h1>
             <a>А мне было лень делать подтверждение регистрации. Проходите мимо.</a>
            `,
      },
      (err, data) => {
        if (err) {
          console.error("Ошибка при отправке:", err);
        } else {
          console.log("Письмо отправлено");
        }
      }
    );
    
    
        res.json({ ...userData, token });
      } catch (err) {
        console.log(err);
        res.status(500).json({
          message: err + " Не удалось создать пользователя",
        });
      }
};

export const login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "UNF: USER NOT FOUND" });

    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
    if (!isValidPass) return res.status(400).json({ message: "WPE: WRONG EMAIL OR PASSWORD" });

    const token = jwt.sign(
      {
        _id: user.id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({ ...userData, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err + " Не удалось авторизоваться",
    });
  }
};

export const check = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "No user",
      });
    }
    res.json(user);
  } catch (err) {}
};

export const getAll = async (req,res) => {
  try {
    const search = req.query.search === "null" ? JSON.parse(req.query.search) : req.query.search.toLowerCase();
    let users = await User.find();
    users = users.map(e => ({ fullName: e.fullName, avatarUrl: e.avatarUrl, _id:e._id, createdAt:e.createdAt}))
    if (search) users = users.filter(e => e.fullName.toLowerCase().includes(search));
    if (!users) {
      return res.status(404).json({
        message: "No user",
      });
    }
    res.json(users);
  } catch (err) {
    console.log(err);
    res.json({
      error: err
    })
  }
};

export const getOne = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: "No user",
      });
    }
    res.json(user);
  } catch (err) {
    console.log(err)
    res.json({
      error: err,
    });
  }
};

export const update = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      {
        fullName: req.body.fullName,
        avatarUrl: req.body.avatarUrl,
      }
    );
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
};


export const subscribe = async (req, res) => {
  try {
    const userId = req.userId;
    const followTo = req.params.id
    const isAdd = JSON.parse(req.query.add)
    const operation = isAdd ? { $push: { follow: followTo } } : { $pull: { follow: followTo } };  
    const updated = await User.findOneAndUpdate(
      { _id: userId },
      {...operation }
    );
    res.json(updated);
  } catch (error) {
       console.log(error);
       res.status(500).json({
         message: error + " Не удалось получить посты",
       });
  }
} 