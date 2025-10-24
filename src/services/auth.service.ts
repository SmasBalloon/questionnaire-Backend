import prisma from "../utils/prisma.js";
import jwt from "jsonwebtoken";

export const findUniqueUSerbyEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  return user;
}

export const generateToken = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    }
  });

  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET");
  }

  if (!user || !user.email) {
    throw new Error("User not found");
  }

  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  return token;
}

export const registerUser = async (email: string, password: string, name: string) => {
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password,
        name: name,
      },
    });
    return user;
  } catch (error) {
    throw new Error("User registration failed");
  }
};

export const findPasswordByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    select: {
      password: true,
    },
    where: {
      email,
    },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user.password;
};


export const findUserByToken = async (token: string) => {
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET as string) as {
      email: string
    }

    return data.email
  } catch (e) {
    console.error(e);
  }
}