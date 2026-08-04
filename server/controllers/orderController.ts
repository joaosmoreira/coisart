import { Request, Response } from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { AuthenticatedRequest } from '../types/index.js';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerEmail, customerName, customerPhone, customerNif, customerAddress, deliveryMethod, shippingAddress, items, paymentStatus } = req.body;

    if (!customerEmail || !customerName || !customerPhone || !deliveryMethod || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Nome, E-mail e Telefone são de preenchimento obrigatório.' });
      return;
    }

    if (deliveryMethod === 'shipping' && (!shippingAddress || !shippingAddress.street || !shippingAddress.city)) {
      res.status(400).json({ error: 'Endereço de envio (Rua e Cidade) obrigatório para entrega CTT / Transportadora.' });
      return;
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        res.status(400).json({ error: `O artigo ${item.title || item.productId} já não está disponível.` });
        return;
      }

      const itemTotal = product.price * (item.quantity || 1);
      totalAmount += itemTotal;

      validatedItems.push({
        productId: product._id,
        sellerId: product.sellerId,
        title: product.title,
        price: product.price,
        quantity: item.quantity || 1,
        type: product.type
      });
    }

    const finalAddress = shippingAddress || customerAddress;

    const order = await Order.create({
      customerEmail,
      customerName,
      customerPhone: customerPhone || '',
      customerNif: customerNif || '',
      customerAddress: finalAddress,
      deliveryMethod,
      shippingAddress: deliveryMethod === 'shipping' ? finalAddress : undefined,
      items: validatedItems,
      totalAmount,
      paymentStatus: paymentStatus || 'completed'
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Erro ao criar encomenda:', error);
    res.status(500).json({ error: 'Erro interno ao processar a encomenda.' });
  }
};

export const getOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado.' });
      return;
    }

    if (req.user.role === 'admin') {
      const orders = await Order.find().sort({ createdAt: -1 });
      res.json(orders);
      return;
    }

    if (req.user.role === 'seller' && req.user.sellerId) {
      const sellerIdStr = req.user.sellerId;
      const rawOrders = await Order.find({ 'items.sellerId': sellerIdStr }).sort({ createdAt: -1 });

      const filteredOrders = rawOrders.map(order => {
        const doc = order.toObject();
        doc.items = doc.items.filter(item => item.sellerId.toString() === sellerIdStr);
        return doc;
      });

      res.json(filteredOrders);
      return;
    }

    res.status(403).json({ error: 'Sem acesso a encomendas.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar encomendas.' });
  }
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentStatus, isResend, resendReason } = req.body;
    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ error: 'Encomenda não encontrada.' });
      return;
    }

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (isResend !== undefined) order.isResend = Boolean(isResend);
    if (resendReason !== undefined) order.resendReason = resendReason;

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar estado da encomenda.' });
  }
};
