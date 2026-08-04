import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Seller } from '../models/Seller.js';
import { Category } from '../models/Category.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendedor, categoria, tipo, search, minPrice, maxPrice, isFeatured } = req.query;
    const filter: Record<string, unknown> = { isActive: true };

    if (vendedor) {
      const isId = mongoose.Types.ObjectId.isValid(vendedor as string);
      const query = isId ? { $or: [{ slug: (vendedor as string).toLowerCase() }, { _id: vendedor }] } : { slug: (vendedor as string).toLowerCase() };
      const sellerDoc = await Seller.findOne(query);
      if (sellerDoc) filter.sellerId = sellerDoc._id;
    }

    if (categoria) {
      const isId = mongoose.Types.ObjectId.isValid(categoria as string);
      const query = isId ? { $or: [{ slug: (categoria as string).toLowerCase() }, { _id: categoria }] } : { slug: (categoria as string).toLowerCase() };
      const catDoc = await Category.findOne(query);
      if (catDoc) filter.categoryId = catDoc._id;
    }

    if (tipo) filter.type = tipo;
    if (isFeatured === 'true') filter.isFeatured = true;

    if (minPrice || maxPrice) {
      const pFilter: Record<string, number> = {};
      if (minPrice) pFilter.$gte = Number(minPrice);
      if (maxPrice) pFilter.$lte = Number(maxPrice);
      filter.price = pFilter;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter)
      .populate('sellerId', 'name slug avatarUrl bio isActive')
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar produtos.' });
  }
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const param = req.params.slug;
    const isId = mongoose.Types.ObjectId.isValid(param);
    const query = isId ? { $or: [{ slug: param.toLowerCase() }, { _id: param }] } : { slug: param.toLowerCase() };

    const product = await Product.findOne(query)
      .populate('sellerId', 'name slug avatarUrl bio links isActive')
      .populate('categoryId', 'name slug');

    if (!product) {
      res.status(404).json({ error: 'Artigo não encontrado.' });
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar o artigo.' });
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, slug, description, materials, price, type, digitalFileUrl, allowPhysicalPrint, physicalPrintPrice, images, stock, categoryId, sellerId } = req.body;
    let targetSellerId = req.user?.role === 'admin' && sellerId ? sellerId : req.user?.sellerId;
    if (!targetSellerId) {
      res.status(400).json({ error: 'Vendedor inválido ou não associado.' });
      return;
    }

    const finalStock = type === 'physical_unique' ? 1 : (Number(stock) || 1);

    const product = await Product.create({
      sellerId: targetSellerId,
      categoryId,
      title,
      slug: slug.toLowerCase(),
      description,
      materials: materials || '',
      price: Number(price),
      type,
      digitalFileUrl,
      allowPhysicalPrint: Boolean(allowPhysicalPrint),
      physicalPrintPrice: Number(physicalPrintPrice) || 0,
      images: images || [],
      stock: finalStock
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar artigo.' });
  }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Artigo não encontrado.' });
      return;
    }
    if (req.user?.role !== 'admin' && req.user?.sellerId !== product.sellerId.toString()) {
      res.status(403).json({ error: 'Sem permissão para alterar este artigo.' });
      return;
    }

    if (req.body.type === 'physical_unique') {
      req.body.stock = 1;
    }

    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar artigo.' });
  }
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Artigo não encontrado.' });
      return;
    }
    if (req.user?.role !== 'admin' && req.user?.sellerId !== product.sellerId.toString()) {
      res.status(403).json({ error: 'Sem permissão para eliminar este artigo.' });
      return;
    }
    product.isActive = false;
    await product.save();
    res.json({ message: 'Artigo desativado com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao eliminar artigo.' });
  }
};
