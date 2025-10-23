import { Router } from "express";
import { enregistrerUneReponseTrueFalse, GetQuestionTrueFalseInfo, UpdateReponseTrueFalse, GetAnswersByQuestionId, SaveMultipleAnswers } from '../controllers/answer.controller'
import isLogin from "../middlewares/islogin.middlewares"
const router = Router();

router.post('/enregistrer', isLogin, enregistrerUneReponseTrueFalse)
router.get('/info/:questionId', isLogin, GetQuestionTrueFalseInfo)
router.put('/update', isLogin, UpdateReponseTrueFalse)
router.get('/question/:questionId', isLogin, GetAnswersByQuestionId)
router.post('/save-multiple', isLogin, SaveMultipleAnswers)

export default router