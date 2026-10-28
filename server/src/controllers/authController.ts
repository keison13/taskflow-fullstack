import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { generateToken } from "../utils/jwt.js";

// Cadastro de novo usuário
export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Este e-mail já está em uso." });
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar o usuário no banco
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Gerar o token JWT para o novo usuário já logar direto
    const token = generateToken(user.id);

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return res.status(500).json({ error: "Erro interno no servidor ao cadastrar usuário." });
  }
}

// Login de usuário existente
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    // Buscar usuário pelo e-mail
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "E-mail ou senha inválidos." });
    }

    // Validar a senha comparando o hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "E-mail ou senha inválidos." });
    }

    // Gerar token JWT
    const token = generateToken(user.id);

    return res.json({
      message: "Login efetuado com sucesso!",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ error: "Erro interno no servidor ao fazer login." });
  }
}