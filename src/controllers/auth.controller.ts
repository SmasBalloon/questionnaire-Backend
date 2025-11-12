
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import {
  registerUser,
  findPasswordByEmail,
  findUniqueUSerbyEmail,
  generateToken
} from "../services/auth.service.js";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Email, password, and name are required" });
    }

    const emailExists = await findUniqueUSerbyEmail(email);
    if (emailExists) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Logic for user registration with hashedPassword
    await registerUser(email, hashedPassword, name);
    res.status(200).json({ message: "Registration successful" });

  } catch (error) {
    res.status(401).json({ message: "Invalid credentials" });
    next(error);
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const hashedPasswordServ = await findPasswordByEmail(email)
    const isMatch = await bcrypt.compare(password, hashedPasswordServ)
    console.log(isMatch)

    if (isMatch) {
      const token = await generateToken(email)
      return res.status(200).json({ token })
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }

  } catch (error) {
    res.status(401).json({ message: "Invalid credentials" });
    next(error);
  }
}


