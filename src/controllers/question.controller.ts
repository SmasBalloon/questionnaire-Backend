import type { Request, Response, NextFunction } from "express";
import { DeleteQuestionById, NbQuestionDansQuiz, CreateQuestionInQuiz, GetQuestionsByQuizId, GetTitleById, ModifTitleQuestionService, ModifTempsEtPointsQuestionService, ModifShortAnswerService } from '../services/question.service.js'
import type { AuthRequest } from '../middlewares/islogin.middlewares.js'

export const CreateQuestion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { idQuiz, title, type, timeLimit } = req.body;
    if (idQuiz === undefined || idQuiz === null) {
      return res.status(400).json({ message: "L'id du quiz (idQuiz) est requis" });
    }

    const quizIdNum = Number(idQuiz);
    if (Number.isNaN(quizIdNum)) {
      return res.status(400).json({ message: "L'id du quiz (idQuiz) doit être un nombre" });
    }

    let order = await NbQuestionDansQuiz(quizIdNum);
    if (order === undefined) {
      return res.status(500).json({ message: "Erreur lors de la récupération du nombre de questions" });
    }
    order = order + 1;

    const created = await CreateQuestionInQuiz(quizIdNum, title, type, timeLimit, order);

    if (!created) {
      return res.status(500).json({ message: "Erreur lors de la création de la question" });
    }

    return res.status(201).json({ message: "Question créée avec succès", question: created });

  } catch (e) {
    console.error(e);
  }
}

export const DeleteQuestion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "L'id du quiz est requis" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const questionId = Number(id);
    if (Number.isNaN(questionId)) {
      return res.status(400).json({ message: "L'id du quiz doit être un nombre valide" });
    }

    const rep = await DeleteQuestionById(questionId);
    return res.status(200).json(rep)

  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: "Erreur lors de la récupération des quiz" })
  }
}

export const GetQuestionByQuizId = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "L'id du quiz est requis" });
    }

    const questions = await GetQuestionsByQuizId(Number(id));
    return res.status(200).json(questions);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erreur lors de la récupération des questions" });
  }
}

export const GetOneQuestionById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "L'id de la question est requis" });
    }

    const questionId = Number(id);
    if (Number.isNaN(questionId)) {
      return res.status(400).json({ message: "L'id de la question doit être un nombre valide" });
    }

    const question = await GetTitleById(questionId);
    return res.status(200).json(question);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erreur lors de la récupération de la question" });
  }
}

export const ModifTitleQuestion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!id) {
      return res.status(400).json({ message: "L'id de la question est requis" });
    }

    const questionId = Number(id);
    if (Number.isNaN(questionId)) {
      return res.status(400).json({ message: "L'id de la question doit être un nombre valide" });
    }

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: "Le nouveau titre de la question est requis et doit être une chaîne de caractères" });
    }

    // Appel au service pour modifier le titre de la question
    const updatedQuestion = await ModifTitleQuestionService(questionId, title);
    if (!updatedQuestion) {
      return res.status(500).json({ message: "Erreur lors de la modification du titre de la question" });
    }

    return res.status(200).json({ message: "Titre de la question modifié avec succès", question: updatedQuestion });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erreur lors de la modification du titre de la question" });
  }
}

export const ModifTempsEtPointsQuestion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { timeLimit, points } = req.body;

    if (!id) {
      return res.status(400).json({ message: "L'id de la question est requis" });
    }
    const questionId = Number(id);
    if (Number.isNaN(questionId)) {
      return res.status(400).json({ message: "L'id de la question doit être un nombre valide" });
    }
    if (typeof timeLimit !== 'number' || typeof points !== 'number') {
      return res.status(400).json({ message: "Le temps et les points doivent être des nombres" });
    }
    const updatedQuestion = await ModifTempsEtPointsQuestionService(questionId, timeLimit, points);
    if (!updatedQuestion) {
      return res.status(500).json({ message: "Erreur lors de la modification du temps ou des points" });
    }
    return res.status(200).json({ message: "Temps et points modifiés avec succès", question: updatedQuestion });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erreur lors de la modification du temps ou des points" });
  }
}

// Modifie la réponse correcte pour une question SHORT_ANSWER
export const ModifShortAnswer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { correctAnswer } = req.body;

    if (!id) {
      return res.status(400).json({ message: "L'id de la question est requis" });
    }
    const questionId = Number(id);
    if (Number.isNaN(questionId)) {
      return res.status(400).json({ message: "L'id de la question doit être un nombre valide" });
    }
    if (typeof correctAnswer !== 'string') {
      return res.status(400).json({ message: "La réponse correcte doit être une chaîne de caractères" });
    }
    const updatedQuestion = await ModifShortAnswerService(questionId, correctAnswer);
    if (!updatedQuestion) {
      return res.status(500).json({ message: "Erreur lors de la modification de la réponse correcte" });
    }
    return res.status(200).json({ message: "Réponse correcte modifiée avec succès", question: updatedQuestion });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erreur lors de la modification de la réponse correcte" });
  }
}