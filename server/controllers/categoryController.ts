import { Request, Response } from 'express';
import { Category } from '../models/Category.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar categorias.' });
  }
};

export const createCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) {
      res.status(400).json({ error: 'Nome e slug são obrigatórios para a categoria.' });
      return;
    }

    const existing = await Category.findOne({ slug: slug.toLowerCase() });
    if (existing) {
      res.status(400).json({ error: 'Já existe uma categoria com este slug.' });
      return;
    }

    const category = await Category.create({ name, slug: slug.toLowerCase() });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar categoria.' });
  }
};
