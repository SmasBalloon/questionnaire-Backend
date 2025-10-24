import prisma from "../utils/prisma.js";

export const addQuiz = async (id: number, name: string, description: string) => {
  try {
    const res = await prisma.quiz.create({
      data: {
        title: name,
        description: description ?? null,
        creatorId: id
      }
    })
    return res
  } catch (e) {
    console.error('Erreur lors de la création du quiz:', e)
    throw e
  }
}

export const getQuizById = async (id: number) => {
  try {
    const res = await prisma.quiz.findMany({
      where: {
        creatorId: id
      }
    })

    return res
  } catch (e) {
    console.error(e)
  }
}

export const DeleteQuizById = async (id: number) => {
  try {
    const res = prisma.quiz.delete({
      where: {
        id: id
      }
    })

    return res
  } catch (e) {
    console.error(e)
  }
}

export const getQuizInfoById = async (id: number) => {
  try {
    const res = await prisma.quiz.findUnique({
      where: {
        id: id
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true
      }
    })

    return res
  } catch (e) {
    console.error('Erreur lors de la récupération du quiz:', e)
    throw e
  }
}

export const getQuizWithQuestions = async (id: number) => {
  try {
    const res = await prisma.quiz.findUnique({
      where: {
        id: id
      },
      include: {
        questions: {
          orderBy: {
            order: 'asc'
          },
          include: {
            answers: {
              select: {
                id: true,
                answerText: true,
                isCorrect: true
              }
            }
          }
        }
      }
    })

    return res
  } catch (e) {
    console.error('Erreur lors de la récupération du quiz avec questions:', e)
    throw e
  }
}