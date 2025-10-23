import type { Request, Response, NextFunction } from "express";
import { GetAnswerCountByQuestionId, enregistrerUneReponseTrueFalseServices, GetQuestionTrueFalseInfoService, UpdateReponseTrueFalseService, GetAnswersByQuestionIdService, SaveMultipleAnswersService } from '../services/answer.service'
import type { AuthRequest } from '../middlewares/islogin.middlewares'

export const enregistrerUneReponseTrueFalse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { questionId, isCorrect } = req.body;

    const order = await GetAnswerCountByQuestionId(questionId);

    const rep = await enregistrerUneReponseTrueFalseServices(
      questionId,
      isCorrect,
      order + 1
    );

    if (!rep) {
      return res.status(400).json({ message: 'Failed to record answer' });
    }

    res.status(201).json({ message: 'Answer recorded successfully' });
  } catch (error) {
    next(error);
  }
}

// Récupère toutes les infos d'une question TRUE_FALSE
export const GetQuestionTrueFalseInfo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { questionId } = req.params;

    if (!questionId) {
      return res.status(400).json({ message: "L'id de la question est requis" });
    }

    const questionIdNum = Number(questionId);
    if (Number.isNaN(questionIdNum)) {
      return res.status(400).json({ message: "L'id de la question doit être un nombre" });
    }

    const info = await GetQuestionTrueFalseInfoService(questionIdNum);

    if (!info) {
      return res.status(404).json({ message: 'Question non trouvée' });
    }

    return res.status(200).json(info);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des infos de la question' });
  }
}

// Met à jour la réponse TRUE_FALSE
export const UpdateReponseTrueFalse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { questionId, isCorrect } = req.body;

    if (!questionId || typeof isCorrect !== 'boolean') {
      return res.status(400).json({ message: "questionId et isCorrect sont requis" });
    }

    const success = await UpdateReponseTrueFalseService(questionId, isCorrect);

    if (!success) {
      return res.status(400).json({ message: 'Erreur lors de la mise à jour de la réponse' });
    }

    return res.status(200).json({ message: 'Réponse mise à jour avec succès' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de la mise à jour de la réponse' });
  }
}

// Récupère toutes les réponses d'une question
export const GetAnswersByQuestionId = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { questionId } = req.params;

    if (!questionId) {
      return res.status(400).json({ message: "L'id de la question est requis" });
    }

    const questionIdNum = Number(questionId);
    if (Number.isNaN(questionIdNum)) {
      return res.status(400).json({ message: "L'id de la question doit être un nombre" });
    }

    const answers = await GetAnswersByQuestionIdService(questionIdNum);

    if (!answers) {
      return res.status(404).json({ message: 'Réponses non trouvées' });
    }

    return res.status(200).json(answers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des réponses' });
  }
}

// Sauvegarde plusieurs réponses pour une question (MULTIPLE_CHOICE)
export const SaveMultipleAnswers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { questionId, answers } = req.body;

    if (!questionId || !Array.isArray(answers)) {
      return res.status(400).json({ message: "questionId et answers (array) sont requis" });
    }

    const result = await SaveMultipleAnswersService(questionId, answers);

    if (!result) {
      return res.status(400).json({ message: 'Erreur lors de la sauvegarde des réponses' });
    }

    return res.status(200).json({ message: 'Réponses sauvegardées avec succès', result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de la sauvegarde des réponses' });
  }
}

