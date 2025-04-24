import mongoose from 'mongoose';

interface Ticket {
    _id: string;
    price: string;
    airline: string;
    airlineLogoUrl: string;
    segments: {
        departure: string;
        arrival: string;
        departureTime: string;
        arrivalTime: string;
        duration: string;
        stopsCount: number;
        stopCodes: string;
    }[];
}

interface FilterOptions {
    stops?: number[]; // Наприклад, [0, 1, 2, 3] для "без пересадок", "1 пересадка" тощо
}

interface SortOptions {
    sortBy?: 'cheapest' | 'fastest' | 'optimal';
}

export async function connectMongoDB() {
    const maxRetries = 5;
    let retries = 0;
    const mongoUrl = process.env.MONGO_URL || 'mongodb://mongodb:27017/tickets';

    console.log(`Attempting to connect to MongoDB: ${mongoUrl}`);

    while (retries < maxRetries) {
        try {
            await mongoose.connect(mongoUrl, {
                serverSelectionTimeoutMS: 5000,
            });
            console.log('Connected to MongoDB');
            return;
        } catch (error) {
            retries++;
            if (error instanceof Error) {
                console.error(
                    `Failed to connect to MongoDB (attempt ${retries}/${maxRetries}):`,
                    error.message
                );
            } else {
                console.error(
                    `Failed to connect to MongoDB (attempt ${retries}/${maxRetries}):`,
                    error
                );
            }
            if (retries === maxRetries) {
                console.error('Max retries reached. Exiting...');
                throw error;
            }
            console.log('Waiting 5 seconds before retrying...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

const ticketSchema = new mongoose.Schema({
    price: Number,
    carrier: String,
    segments: [
        {
            origin: String,
            destination: String,
            date: String,
            stops: [String],
            duration: Number,
        },
    ],
});
export const TicketModel = mongoose.model('Ticket', ticketSchema);

// @TODO В подальшому можливість формувати відсортовані і відфільтровані дані в самому запиті в монгу
export async function getRandomTickets(
    limit: number = 10,
    filter: FilterOptions = {},
    sort: SortOptions = { sortBy: 'cheapest' }
): Promise<Ticket[]> {
    const pipeline: any[] = [];

    pipeline.push({ $sample: { size: limit } });

    const tickets = await TicketModel.aggregate<Ticket>(pipeline).exec();
    return tickets;
}
