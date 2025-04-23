export interface Ticket {
    price: number;
    carrier: string;
    segments: [
        {
            origin: string;
            destination: string;
            date: string;
            stops: string[];
            duration: number;
        },
        {
            origin: string;
            destination: string;
            date: string;
            stops: string[];
            duration: number;
        },
    ];
}

export interface TicketsResponse {
    tickets: Ticket[];
    stop: boolean;
}
