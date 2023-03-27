import express, { json } from "express";

import router from "./router.js";
import cors from "cors";
import mongoose from "mongoose";



const app = express()

mongoose
  .connect(`mongodb+srv://admin:admin@cluster0.9rln6g1.mongodb.net/blog?retryWrites=true&w=majority`)
  .then(() => console.log("OK DB"))
  .catch(() => console.log("FAIL DB"));

app.use('/', router)
app.use(express.json())
app.use(cors());

app.listen(4444, (err) => {
        if (err) {
          return console.log(err);
        }
        console.log("OKKK");
});


