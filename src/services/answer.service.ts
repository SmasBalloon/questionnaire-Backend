import { $Enums } from "@prisma/client";
import prisma from "../utils/prisma";

export const GetAnswerCountByQuestionId = async (questionId: number): Promise<number> => {
  const count = await prisma.answer.count({
    where: { questionId: questionId },
  });
  return count;
}

export const enregistrerUneReponseTrueFalseServices = async (
  questionId: number,
  isCorrect: boolean,
  order: number
): Promise<boolean> => {
  const rep = await prisma.answer.create({
    data: {
      questionId: questionId,
      isCorrect: isCorrect,
      order: order,
      answerText: isCorrect ? "True" : "False",
    },
  });

  if (!rep) {
    return false;
  }

  return true;
}

// Récupère toutes les infos d'une question TRUE_FALSE pour le formulaire
export const GetQuestionTrueFalseInfoService = async (questionId: number) => {
  try {
    // Récupère les infos de la question
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        questionText: true,
        points: true,
        timeLimit: true,
        type: true,
      },
    });

    if (!question) {
      return null;
    }

    // Compte le nombre de réponses pour cette question
    const answerCount = await prisma.answer.count({
      where: { questionId: questionId },
    });

    // Récupère la bonne réponse (Answer avec isCorrect = true)
    const correctAnswer = await prisma.answer.findFirst({
      where: {
        questionId: questionId,
        isCorrect: true,
      },
      select: {
        isCorrect: true,
      },
    });

    return {
      id: question.id,
      questionText: question.questionText,
      points: question.points,
      timeLimit: question.timeLimit,
      type: question.type,
      correctAnswer: correctAnswer ? true : false,
      hasAnswers: answerCount > 0, // Indique si des réponses existent
    };
  } catch (e) {
    console.error(e);
    return null;
  }
}

// Met à jour les réponses TRUE_FALSE existantes
export const UpdateReponseTrueFalseService = async (
  questionId: number,
  isCorrect: boolean
): Promise<boolean> => {
  try {
    // Récupère toutes les réponses de la question
    const answers = await prisma.answer.findMany({
      where: { questionId: questionId },
    });

    if (answers.length === 0) {
      // Pas de réponses existantes, on retourne false pour forcer une création
      return false;
    }

    // Supprime toutes les anciennes réponses
    await prisma.answer.deleteMany({
      where: { questionId: questionId },
    });

    // Crée deux nouvelles réponses : True et False
    await prisma.answer.createMany({
      data: [
        {
          questionId: questionId,
          isCorrect: isCorrect === true,
          answerText: "True",
          order: 1,
        },
        {
          questionId: questionId,
          isCorrect: isCorrect === false,
          answerText: "False",
          order: 2,
        }
      ]
    });

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

// Récupère toutes les réponses d'une question
export const GetAnswersByQuestionIdService = async (questionId: number) => {
  try {
    const answers = await prisma.answer.findMany({
      where: { questionId: questionId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        answerText: true,
        isCorrect: true,
        order: true,
      },
    });
    return answers;
  } catch (e) {
    console.error(e);
    return null;
  }
}

// Sauvegarde plusieurs réponses pour une question (MULTIPLE_CHOICE)
export const SaveMultipleAnswersService = async (
  questionId: number,
  answers: Array<{ answerText: string; isCorrect: boolean; order: number }>
) => {
  try {
    // Supprime toutes les anciennes réponses
    await prisma.answer.deleteMany({
      where: { questionId: questionId },
    });

    // Crée les nouvelles réponses
    const createdAnswers = await prisma.answer.createMany({
      data: answers.map((ans) => ({
        questionId: questionId,
        answerText: ans.answerText,
        isCorrect: ans.isCorrect,
        order: ans.order,
      })),
    });

    return createdAnswers;
  } catch (e) {
    console.error(e);
    return null;
  }
}