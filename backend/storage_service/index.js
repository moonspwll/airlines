import mongoose from 'mongoose';
import amqp from 'amqplib';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    console.error('tickets.json not found or invalid:', error.message);
    return false;
  }
}

async function connectMongoDB() {
  const maxRetries = 5;
  let retries = 0;
  const mongoUrl = process.env.MONGO_URL || 'mongodb://mongodb:27017/tickets';

  console.log(`Attempting to connect to MongoDB: ${mongoUrl}`);

  while (retries < maxRetries) {
    try {
      await mongoose.connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
      console.log('Connected to MongoDB');
      return;
    } catch (error) {
      retries++;
      console.error(`Failed to connect to MongoDB (attempt ${retries}/${maxRetries}):`, error.message);
      if (retries === maxRetries) {
        console.error('Max retries reached. Exiting...');
        throw error;
      }
      console.log('Waiting 5 seconds before retrying...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

const ticketSchema = new mongoose.Schema({
  price: Number,
  carrier: String,
  segments: [{
    origin: String,
    destination: String,
    date: String,
    stops: [String],
    duration: Number,
  }],
});
const Ticket = mongoose.model('Ticket', ticketSchema);

async function seedTickets() {
  console.log('Entering seedTickets...');
  try {
    console.log('Checking for existing tickets in MongoDB...');
    const count = await Ticket.countDocuments();
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
    await Ticket.insertMany(tickets);
    console.log(`Inserted ${tickets.length} tickets into MongoDB`);
  } catch (error) {
    console.error('Failed to seed tickets:', error.message);
    throw error;
  }
}

async function connectRabbitMQ() {
  console.log('Attempting to connect to RabbitMQ:', process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672');
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672');
    
    connection.on('error', (err) => console.error('RabbitMQ connection error:', err.message));
    connection.on('close', () => console.error('RabbitMQ connection closed'));

    const channel = await connection.createChannel();
    await channel.assertQueue('storage_queue', { durable: true });

    console.log('Storage RabbitMQ channel ready');

    await channel.consume('storage_queue', async (msg) => {
      if (msg === null) {
        console.error('Received null message');
        return;
      }
      const { action } = JSON.parse(msg.content.toString());
      if (action === 'getRandomTickets') {
        const tickets = await Ticket.aggregate([{ $sample: { size: 100 } }]);
        console.log(`Sending ${tickets.length} random tickets to ${msg.properties.replyTo}`);
        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(tickets)), {
          correlationId: msg.properties.correlationId,
        });
      }
      channel.ack(msg);
    }, { noAck: false });

    return channel;
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error.message);
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
    console.error('Initialization failed:', error.message);
    process.exit(1);
  }
}

initialize().catch((error) => {
  console.error('Top-level error in initialize:', error.message);
  process.exit(1);
});