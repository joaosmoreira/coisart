import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Seller } from '../models/Seller.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getSellers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isFeatured } = req.query;
    const filter: Record<string, unknown> = {};
    if (isFeatured === 'true') filter.isFeatured = true;

    const sellers = await Seller.find(filter).sort({ name: 1 });
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar os vendedores.' });
  }
};

export const getSellerBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const seller = await Seller.findOne({ slug: slug.toLowerCase() });

    if (!seller) {
      res.status(404).json({ error: 'Vendedor não encontrado.' });
      return;
    }

    const products = await Product.find({ sellerId: seller._id, isActive: true })
      .populate('categoryId', 'name slug')
      .populate('sellerId', 'name slug avatarUrl')
      .sort({ createdAt: -1 });

    res.json({ seller, products });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar o perfil do vendedor.' });
  }
};

export const createSeller = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name, slug, bio, avatarUrl, links, disciplines, isFeatured } = req.body;

    if (!email || !password || !name || !slug) {
      res.status(400).json({ error: 'Campos obrigatórios em falta.' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ error: 'Já existe uma conta com este e-mail.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email: email.toLowerCase(), passwordHash, role: 'seller' });

    const seller = await Seller.create({
      userId: user._id,
      name,
      slug: slug.toLowerCase(),
      bio: bio || '',
      avatarUrl: avatarUrl || '',
      links: links || [],
      disciplines: disciplines || [],
      isFeatured: Boolean(isFeatured),
      isActive: true
    });

    res.status(201).json({ seller, user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao criar conta de vendedor.' });
  }
};

export const updateSeller = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const seller = await Seller.findById(id);

    if (!seller) {
      res.status(404).json({ error: 'Vendedor não encontrado.' });
      return;
    }

    if (req.user?.role !== 'admin' && req.user?.sellerId !== seller._id.toString()) {
      res.status(403).json({ error: 'Sem permissão para atualizar este perfil.' });
      return;
    }

    const { name, slug, bio, avatarUrl, links, disciplines, isFeatured, isActive } = req.body;
    if (name) seller.name = name;
    if (slug) seller.slug = slug.toLowerCase();
    if (bio !== undefined) seller.bio = bio;
    if (avatarUrl !== undefined) seller.avatarUrl = avatarUrl;
    if (links !== undefined) seller.links = links;
    if (disciplines !== undefined) seller.disciplines = disciplines;
    if (isFeatured !== undefined && req.user?.role === 'admin') seller.isFeatured = isFeatured;
    if (isActive !== undefined && req.user?.role === 'admin') seller.isActive = isActive;

    await seller.save();
    res.json(seller);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar dados do vendedor.' });
  }
};
