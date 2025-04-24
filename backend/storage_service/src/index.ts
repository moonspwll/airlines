// import mongoose from 'mongoose';
// import amqp from 'amqplib';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectMongoDB, TicketModel } from './mongodb.js';
import { connectRabbitMQ } from './rabbitmq.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkTicketsFile() {
    const ticketsPath = path.join(__dirname, 'tickets.json');
    try {
        await fs.access(ticketsPath);
        const data = await fs.readFile(ticketsPath, 'utf-8');
        const tickets = JSON.parse(data);
        return true;
    } catch (error) {
        if (error instanceof Error) {
            console.error('tickets.json not found or invalid:', error.message);
        } else {
            console.error('tickets.json not found or invalid:', error);
        }
        return false;
    }
}

async function seedTickets() {
    try {
        const count = await TicketModel.countDocuments();
        if (count > 0) {
            return;
        }

        const ticketsPath = path.join(__dirname, 'tickets.json');
        const ticketsData = await fs.readFile(ticketsPath, 'utf-8');
        const tickets = JSON.parse(ticketsData);
        await TicketModel.insertMany(tickets);
    } catch (error) {
        if (error instanceof Error) {
            console.error('Failed to seed tickets:', error.message);
        } else {
            console.error('Failed to seed tickets:', error);
        }
        throw error;
    }
}

async function initialize() {
    try {
        const hasTicketsFile = await checkTicketsFile();
        if (!hasTicketsFile) {
            console.error('Cannot proceed without tickets.json. Exiting...');
            process.exit(1);
        }

        await connectMongoDB();
        await seedTickets();
        await connectRabbitMQ();
    } catch (error) {
        if (error instanceof Error) {
            console.error('Initialization failed:', error.message);
        } else {
            console.error('Initialization failed:', error);
        }
        process.exit(1);
    }
}

initialize().catch(error => {
    console.error('Top-level error in initialize:', error.message);
    process.exit(1);
});
