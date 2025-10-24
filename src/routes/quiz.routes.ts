import { Router } from "express";
import { creatQuiz, getQuiz, DeleteQuiz, getQuizInfo, getQuizQuestions } from '../controllers/quiz.controller.js'
import isLogin from "../middlewares/islogin.middlewares.js"
const router = Router();

router.post("/create", isLogin, creatQuiz)
router.get("/", isLogin, getQuiz)
router.get("/:id", isLogin, getQuizInfo)
router.get("/:id/questions", isLogin, getQuizQuestions)
router.delete("/:id", isLogin, DeleteQuiz)

export default router