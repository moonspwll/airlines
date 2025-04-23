import { v4 as uuidv4 } from 'uuid';
import { RequestHandler } from 'express';

import { sendToQueue } from '../rabbitmq.js';

import { Ticket } from '../types/ticket.js';
import { TicketsResponse } from '../types/ticket.js';

export const searchHandler: RequestHandler = async (req, res) => {
    console.log('SEARCH');
    const searchId = uuidv4();
    console.log('SEARCH ID', searchId);

    try {
        const tickets: Ticket[] = await sendToQueue<Ticket[]>('storage_queue', {
            action: 'getRandomTickets',
        });
        console.log('🟡 Sending to cache_create_queue', {
            searchId,
            ticketsLength: tickets.length,
        });
        await sendToQueue('cache_create_queue', { searchId, tickets });
        res.json({ searchId });
    } catch (error) {
        console.error('Error in /search:', (error as Error).message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const ticketsHandler: RequestHandler = async (req, res) => {
    const { searchId, sortBy, stops } = req.query;
    if (!searchId || typeof searchId !== 'string') {
        res.status(400).json({
            error: 'searchId is required and must be a string',
        });
        return;
    }

    try {
        const response: TicketsResponse = await sendToQueue<TicketsResponse>(
            'cache_get_queue',
            { searchId, sortBy, stops }
        );
        res.json(response);
    } catch (error) {
        console.error('Error in /tickets:', (error as Error).message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
