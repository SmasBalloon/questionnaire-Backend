import prisma from "../utils/prisma";

export const addQuiz = async (id: number, name: string, description: string) =>  {
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

export const DeleteQuizById = async (id : number) => {
  try {
    const res = prisma.quiz.delete({
      where : {
        id : id
      }
    })

    return res
  } catch (e) {
    console.error(e)
  }
}