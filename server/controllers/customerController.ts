import { Response } from 'express';
import { Order } from '../models/Order.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getCustomers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Não autenticado.' }); return; }
    let filter: Record<string, unknown> = {};
    const isSeller = req.user.role === 'seller' && req.user.sellerId;
    if (isSeller) filter = { 'items.sellerId': req.user.sellerId };

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    const customerMap = new Map<string, any>();

    for (const order of orders) {
      const email = order.customerEmail.toLowerCase();
      let items = order.items;
      let orderTotal = order.totalAmount;
      if (isSeller && req.user.sellerId) {
        items = order.items.filter(item => item.sellerId.toString() === req.user?.sellerId);
        orderTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      }
      if (items.length === 0) continue;

      if (!customerMap.has(email)) {
        customerMap.set(email, {
          email, name: order.customerName, phone: order.customerPhone || 'Não especificado',
          nif: order.customerNif || 'N/A',
          address: order.customerAddress || order.shippingAddress || null,
          totalOrders: 0, totalSpent: 0, orders: []
        });
      }

      const client = customerMap.get(email);
      client.totalOrders += 1;
      client.totalSpent += orderTotal;
      if (order.customerPhone && client.phone === 'Não especificado') client.phone = order.customerPhone;
      if (order.customerNif && client.nif === 'N/A') client.nif = order.customerNif;
      if (!client.address && (order.customerAddress || order.shippingAddress)) {
        client.address = order.customerAddress || order.shippingAddress;
      }

      client.orders.push({
        _id: order._id, deliveryMethod: order.deliveryMethod, totalAmount: orderTotal,
        paymentStatus: order.paymentStatus, createdAt: order.createdAt, items
      });
    }
    res.json(Array.from(customerMap.values()));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar dados dos clientes.' });
  }
};

export const getCustomerByEmail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.params;
    const allCustomers = await Order.find({ customerEmail: email.toLowerCase() }).sort({ createdAt: -1 });

    if (allCustomers.length === 0) {
      res.status(404).json({ error: 'Cliente não encontrado.' });
      return;
    }

    const first = allCustomers[0];
    const isSeller = req.user?.role === 'seller' && req.user?.sellerId;
    let totalSpent = 0; const history = [];

    for (const order of allCustomers) {
      let items = order.items;
      let orderTotal = order.totalAmount;
      if (isSeller && req.user?.sellerId) {
        items = order.items.filter(item => item.sellerId.toString() === req.user?.sellerId);
        orderTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      }
      if (items.length === 0) continue;
      totalSpent += orderTotal;
      history.push({
        _id: order._id, deliveryMethod: order.deliveryMethod, totalAmount: orderTotal,
        paymentStatus: order.paymentStatus, createdAt: order.createdAt, items
      });
    }

    res.json({
      name: first.customerName, email: first.customerEmail,
      phone: first.customerPhone || 'Não especificado', nif: first.customerNif || 'N/A',
      address: first.customerAddress || first.shippingAddress || null,
      totalOrders: history.length, totalSpent, history
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter ficha do cliente.' });
  }
};

export const updateCustomer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetEmail = req.params.email.toLowerCase();
    const { name, email, phone, nif, street, city, postalCode, country } = req.body;

    if (!name || !email || !phone) {
      res.status(400).json({ error: 'Nome, E-mail e Telefone são de preenchimento obrigatório.' });
      return;
    }

    const updateFields: Record<string, any> = {
      customerName: name,
      customerEmail: email.toLowerCase(),
      customerPhone: phone,
      customerNif: nif || '',
      customerAddress: {
        street: street || '',
        city: city || '',
        postalCode: postalCode || '',
        country: country || 'Portugal'
      }
    };

    const result = await Order.updateMany({ customerEmail: targetEmail }, { $set: updateFields });
    if (result.matchedCount === 0) {
      res.status(404).json({ error: 'Nenhum registo de cliente encontrado com este e-mail.' });
      return;
    }

    res.json({ message: 'Dados do cliente e morada atualizados com sucesso.', email: email.toLowerCase() });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar dados do cliente.' });
  }
};
