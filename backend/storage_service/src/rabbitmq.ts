import amqp from 'amqplib';

import { getRandomTickets } from './mongodb.js';

export async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(
            process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'
        );

        connection.on('error', err =>
            console.error('RabbitMQ connection error:', err.message)
        );
        connection.on('close', () =>
            console.error('RabbitMQ connection closed')
        );

        const channel = await connection.createChannel();
        await channel.assertQueue('storage_queue', { durable: true });

        await channel.consume(
            'storage_queue',
            async msg => {
                if (msg === null) {
                    console.error('Received null message');
                    return;
                }
                const { action } = JSON.parse(msg.content.toString());
                if (action === 'getRandomTickets') {
                    const tickets = await getRandomTickets(Math.floor(Math.random() * 50));

                    channel.sendToQueue(
                        msg.properties.replyTo,
                        Buffer.from(JSON.stringify(tickets)),
                        {
                            correlationId: msg.properties.correlationId,
                        }
                    );
                }
                channel.ack(msg);
            },
            { noAck: false }
        );

        return channel;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Failed to connect to RabbitMQ:', error.message);
        } else {
            console.error('Failed to connect to RabbitMQ:', error);
        }
        throw error;
    }
}
