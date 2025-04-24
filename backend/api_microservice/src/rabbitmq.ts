import amqp, { Connection, Channel } from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

let connection: Connection | undefined;
let channel: Channel | undefined;

// Підключення до RabbitMQ
export async function connectRabbitMQ(): Promise<void> {
    try {
        connection = await amqp.connect('amqp://rabbitmq:5672');
        channel = await connection.createChannel();
        await channel.assertQueue('storage_queue', { durable: true });
        await channel.assertQueue('cache_create_queue', { durable: true });
        await channel.assertQueue('cache_get_queue', { durable: true });
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        throw error;
    }
}

// Функція для відправки повідомлення в чергу і отримання відповіді
export async function sendToQueue<T>(
    queue: string,
    message: object
): Promise<T> {
    if (!channel) {
        throw new Error('RabbitMQ channel is not initialized');
    }

    try {
        const correlationId = uuidv4();
        const replyQueue = await channel.assertQueue('', {
            exclusive: true,
            autoDelete: true,
            arguments: { 'x-expires': 30000 },
        });

        return new Promise<T>((resolve, reject) => {
            if (!channel) {
                reject(new Error('RabbitMQ channel is not initialized'));
                return;
            }

            channel.consume(
                replyQueue.queue,
                msg => {
                    if (msg === null) {
                        reject(new Error('Consumer cancelled'));
                        return;
                    }

                    if (msg.properties.correlationId === correlationId) {
                        try {
                            const response: T = JSON.parse(
                                msg.content.toString()
                            );
                            resolve(response);
                            // Явно видаляємо тимчасову чергу після отримання відповіді
                            if (channel) {
                                channel
                                    .deleteQueue(replyQueue.queue)
                                    .catch(err =>
                                        console.error(
                                            `Failed to delete queue ${replyQueue.queue}:`,
                                            (err as Error).message
                                        )
                                    );
                            } else {
                                console.error(
                                    'Failed to delete queue: RabbitMQ channel is not initialized'
                                );
                            }
                        } catch (error) {
                            console.error(
                                'Failed to parse message content:',
                                (error as Error).message
                            );
                            reject(error);
                        }
                    }
                },
                { noAck: true }
            );

            channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
                correlationId,
                replyTo: replyQueue.queue,
            });
        });
    } catch (error) {
        console.error(`Error in sendToQueue: ${(error as Error).message}`);
        throw error;
    }
}
