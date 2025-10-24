import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

const isLogin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token = req.headers.authorization;

  if (Array.isArray(token)) {
    token = token[0];
  }

  // Check if token is defined
  if (!token) {
    res.status(401).json({ message: 'Token manquant' })
    return
  }

  // Extraire le token du format "Bearer <token>"
  if (token.startsWith('Bearer ')) {
    token = token.slice(7); // Remove "Bearer " prefix
  } else {
    res.status(401).json({ message: 'Format de token invalide. Utilisez "Bearer <token>"' })
    return
  }

  try {
    if (!process.env.JWT_SECRET) {
      res.status(401).json({ message: 'contacter un administrateur' })
      return
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      email: string
    }

    const user = await prisma.user.findUnique({
      where: {
        email: decoded.email
      }
    })
    if (!user) {
      res.status(401).json({ message: 'connecter avec un compte qui n\'existe pas' })
      return
    }

    // Stocker l'utilisateur dans la requête
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    // Appeler next() pour passer au contrôleur suivant
    next();

  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'probleme backend' })
    return
  }
}

export default isLogin