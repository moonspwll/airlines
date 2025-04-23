interface TicketSegment {
    destination: string;
    duration: number;
    origin: string;
    stops: string[];
    date: string;
    _id: string;
}

export interface Ticket {
    price: string;
    carrier: string;
    segments: TicketSegment[];
}
