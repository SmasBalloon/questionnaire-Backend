import { Router } from "express";
import { DeleteQuestion, CreateQuestion, GetQuestionByQuizId, GetOneQuestionById, ModifTitleQuestion, ModifTempsEtPointsQuestion, ModifShortAnswer } from '../controllers/question.controller.js'
import isLogin from "../middlewares/islogin.middlewares.js"
const router = Router();

router.post("/create", isLogin, CreateQuestion)
router.get("/:id", isLogin, GetQuestionByQuizId)
router.delete("/:id", isLogin, DeleteQuestion)
router.get("/title/:id", isLogin, GetOneQuestionById)
router.put("/modif/title/:id", isLogin, ModifTitleQuestion)
router.put("/modif/temps-points/:id", isLogin, ModifTempsEtPointsQuestion)
router.put("/modif/short-answer/:id", isLogin, ModifShortAnswer)

export default router