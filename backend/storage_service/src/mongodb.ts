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

export async function getRandomTickets(
    limit: number = 10,
    filter: FilterOptions = {},
    sort: SortOptions = { sortBy: 'cheapest' }
): Promise<Ticket[]> {
    console.log('GETRANDOM', limit, filter, sort);
    const pipeline: any[] = [];

    // if (filter.stops && filter.stops.length > 0) {
    //     pipeline.push({
    //         $match: {
    //             $and: [
    //                 { 'segments.0.stopsCount': { $in: filter.stops } },
    //                 { 'segments.1.stopsCount': { $in: filter.stops } },
    //             ],
    //         },
    //     });
    // }

    // if (sort.sortBy === 'fastest') {
    //     pipeline.push({
    //         $addFields: {
    //             totalDuration: {
    //                 $sum: ['$segments.0.duration', '$segments.1.duration'],
    //             },
    //         },
    //     });
    // }

    // if (sort.sortBy === 'cheapest') {
    //     pipeline.push({ $sort: { price: 1 } });
    // } else if (sort.sortBy === 'fastest') {
    //     pipeline.push({ $sort: { totalDuration: 1 } });
    // } else if (sort.sortBy === 'optimal') {
    //     pipeline.push({ $sort: { price: 1 } });
    // }

    pipeline.push({ $sample: { size: limit } });

    const tickets = await TicketModel.aggregate<Ticket>(pipeline).exec();
    return tickets;
}
