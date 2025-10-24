import { $Enums } from "@prisma/client";
import prisma from "../utils/prisma.js";
enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  MULTIPLE_SELECT = "MULTIPLE_SELECT",
  TRUE_FALSE = "TRUE_FALSE",
  SHORT_ANSWER = "SHORT_ANSWER"
}
export const CreateQuestionInQuiz = async (quizId: number, Title: string, Type: QuestionType, temp: number, order: number) => {
  try {
    const points = 1000;
    const rep = await prisma.question.create({
      data: {
        quizId: quizId,
        questionText: Title,
        type: Type,
        timeLimit: temp,
        order: order,
        points: points,
      }
    })

    return rep
  } catch (e) {
    console.error(e)
  }
}

export const DeleteQuestionById = async (id: number) => {
  try {
    const res = prisma.question.delete({
      where: {
        id: id
      }
    })

    return res
  } catch (e) {
    console.error(e)
  }
}

export const NbQuestionDansQuiz = async (quizId: number) => {
  try {
    const rep = await prisma.question.findMany({
      where: {
        quizId: quizId,
      }
    })

    return rep.length

  } catch (error) {
    console.error(error)
  }
}


export const GetQuestionsByQuizId = async (quizid: number) => {
  try {
    const rep = await prisma.question.findMany({
      where: {
        quizId: quizid
      }
    })

    return rep

  } catch (e) {
    console.error(e)
  }
}

export const GetTitleById = async (questionId: number) => {
  try {
    const rep = await prisma.question.findUnique({
      select: {
        id: true,
        questionText: true,
        points: true,
        timeLimit: true,
        correctAnswerText: true,
      },
      where: {
        id: questionId
      }
    })
    return rep

  } catch (e) {
    console.error(e)
  }
}

export const ModifTitleQuestionService = async (questionId: number, title: string) => {
  try {
    const rep = await prisma.question.update({
      where: {
        id: questionId
      },
      data: {
        questionText: title
      }
    })
    return rep

  } catch (e) {
    console.error(e)
  }
}

// Modifie le temps prévu et le nombre de points d'une question
export const ModifTempsEtPointsQuestionService = async (questionId: number, timeLimit: number, points: number) => {
  try {
    const rep = await prisma.question.update({
      where: {
        id: questionId
      },
      data: {
        timeLimit: timeLimit,
        points: points
      }
    })
    return rep
  } catch (e) {
    console.error(e)
  }
}

// Modifie la réponse correcte pour une question SHORT_ANSWER
export const ModifShortAnswerService = async (questionId: number, correctAnswer: string) => {
  try {
    const rep = await prisma.question.update({
      where: {
        id: questionId
      },
      data: {
        correctAnswerText: correctAnswer
      }
    })
    return rep
  } catch (e) {
    console.error(e)
  }
}