import { Request, Response } from 'express';
import { Event } from '../models/Event.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getEvent = async (_req: Request, res: Response): Promise<void> => {
  try {
    let event = await Event.findOne({ isActive: true }).populate('participatingSellers.sellerId');
    if (!event) {
      event = await Event.findOne().sort({ createdAt: -1 }).populate('participatingSellers.sellerId');
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter dados da próxima feira.' });
  }
};

export const updateEvent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, date, time, location, bannerUrl, description, participatingSellers } = req.body;

    let event = await Event.findOne({ isActive: true });
    if (!event) {
      event = new Event({
        title: title || 'Feira Coisart — Edição de Primavera 2026',
        date: date || '16 & 17 de Maio de 2026',
        time: time || '10:00 - 19:00',
        location: location || 'Praça das Fontaínhas, Vila das Aves',
        bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200',
        description: description || 'Uma mostra vibrante de artesanato contemporâneo, pintura, cerâmica e trabalhos de autor com os nossos artesãos locais.',
        participatingSellers: participatingSellers || [],
        isActive: true
      });
    } else {
      if (title !== undefined) event.title = title;
      if (date !== undefined) event.date = date;
      if (time !== undefined) event.time = time;
      if (location !== undefined) event.location = location;
      if (bannerUrl !== undefined) event.bannerUrl = bannerUrl;
      if (description !== undefined) event.description = description;
      if (participatingSellers !== undefined) event.participatingSellers = participatingSellers;
    }

    await event.save();
    const updated = await Event.findById(event._id).populate('participatingSellers.sellerId');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar dados do próximo evento.' });
  }
};
