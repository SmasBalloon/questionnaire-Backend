import { Router } from "express";
import { creatQuiz, getQuiz, DeleteQuiz } from '../controllers/quiz.controller'
import isLogin from "../middlewares/islogin.middlewares"
const router = Router();

router.post("/create", isLogin, creatQuiz)
router.get("/", isLogin, getQuiz)
router.delete("/:id", isLogin, DeleteQuiz)

export default router