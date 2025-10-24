import type { Request, Response, NextFunction } from "express";
import { addQuiz, DeleteQuizById, getQuizById, getQuizInfoById, getQuizWithQuestions } from '../services/quiz.service.js'
import type { AuthRequest } from '../middlewares/islogin.middlewares.js'

export const creatQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    if (!name) {
      return res.status(400).json({ message: "Le nom du quiz est requis" });
    }

    const rep = await addQuiz(req.user.id, name, description || '')
    return res.status(201).json({ message: "Quiz created", quiz: rep })

  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: "Erreur lors de la création du quiz" })
  }
}

export const getQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const rep = await getQuizById(req.user.id);
    return res.status(200).json(rep)

  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: "Erreur lors de la récupération des quiz" })
  }
}

export const DeleteQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "L'id du quiz est requis" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const quizId = Number(id);
    if (Number.isNaN(quizId)) {
      return res.status(400).json({ message: "L'id du quiz doit être un nombre valide" });
    }

    const rep = await DeleteQuizById(quizId);
    return res.status(200).json(rep)

  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: "Erreur lors de la récupération des quiz" })
  }
}

export const getQuizInfo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "L'id du quiz est requis" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const quizId = Number(id);
    if (Number.isNaN(quizId)) {
      return res.status(400).json({ message: "L'id du quiz doit être un nombre valide" });
    }

    const rep = await getQuizInfoById(quizId);

    if (!rep) {
      return res.status(404).json({ message: "Quiz non trouvé" });
    }

    return res.status(200).json(rep);

  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: "Erreur lors de la récupération du quiz" })
  }
}

export const getQuizQuestions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "L'id du quiz est requis" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const quizId = Number(id);
    if (Number.isNaN(quizId)) {
      return res.status(400).json({ message: "L'id du quiz doit être un nombre valide" });
    }

    const rep = await getQuizWithQuestions(quizId);

    if (!rep) {
      return res.status(404).json({ message: "Quiz non trouvé" });
    }

    return res.status(200).json(rep);

  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: "Erreur lors de la récupération du quiz" })
  }
}