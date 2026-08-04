import { Request, Response } from 'express';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();

    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({
          categoryId: cat._id,
          isActive: true,
          stock: { $gt: 0 }
        });
        return {
          ...cat,
          productCount
        };
      })
    );

    res.json(categoriesWithCounts);
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

export const updateCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json({ error: 'Categoria não encontrada.' });
      return;
    }

    if (slug) {
      const existing = await Category.findOne({ slug: slug.toLowerCase(), _id: { $ne: id } });
      if (existing) {
        res.status(400).json({ error: 'Já existe outra categoria com este slug.' });
        return;
      }
      category.slug = slug.toLowerCase();
    }

    if (name) {
      category.name = name;
    }

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar categoria.' });
  }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      res.status(404).json({ error: 'Categoria não encontrada.' });
      return;
    }

    const productCount = await Product.countDocuments({ categoryId: id });
    if (productCount > 0) {
      res.status(400).json({ error: `Não é possível eliminar: existem ${productCount} artigos associados a esta categoria.` });
      return;
    }

    await Category.findByIdAndDelete(id);
    res.json({ message: 'Categoria eliminada com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao eliminar categoria.' });
  }
};
