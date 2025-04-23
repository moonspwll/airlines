import mongoose from 'mongoose';
import amqp from 'amqplib';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectMongoDB, TicketModel } from './mongodb.js';
import { connectRabbitMQ } from './rabbitmq.js';

console.log('Starting storage service...');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkTicketsFile() {
    const ticketsPath = path.join(__dirname, 'tickets.json');
    console.log('Checking for tickets.json at:', ticketsPath);
    try {
        await fs.access(ticketsPath);
        console.log('tickets.json found');
        const data = await fs.readFile(ticketsPath, 'utf-8');
        const tickets = JSON.parse(data);
        console.log(`Parsed ${tickets.length} tickets from tickets.json`);
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
    console.log('Entering seedTickets...');
    try {
        console.log('Checking for existing tickets in MongoDB...');
        const count = await TicketModel.countDocuments();
        console.log(`Found ${count} tickets in database`);
        if (count > 0) {
            console.log('Database already seeded, skipping...');
            return;
        }

        console.log('Seeding tickets from tickets.json...');
        const ticketsPath = path.join(__dirname, 'tickets.json');
        console.log('Reading file:', ticketsPath);
        const ticketsData = await fs.readFile(ticketsPath, 'utf-8');
        const tickets = JSON.parse(ticketsData);
        console.log(`Parsed ${tickets.length} tickets from tickets.json`);
        await TicketModel.insertMany(tickets);
        console.log(`Inserted ${tickets.length} tickets into MongoDB`);
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
    console.log('Starting initialization...');
    try {
        console.log('Checking tickets.json before MongoDB connection...');
        const hasTicketsFile = await checkTicketsFile();
        if (!hasTicketsFile) {
            console.error('Cannot proceed without tickets.json. Exiting...');
            process.exit(1);
        }

        await connectMongoDB();
        console.log('Calling seedTickets...');
        await seedTickets();
        console.log('Calling connectRabbitMQ...');
        await connectRabbitMQ();
        console.log('Initialization completed');
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
