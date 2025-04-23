import amqp from 'amqplib';

const cache = new Map();

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect('amqp://rabbitmq:5672');
    const channel = await connection.createChannel();
    await channel.assertQueue('cache_create_queue', { durable: true });
    await channel.assertQueue('cache_get_queue', { durable: true });

    console.log('Cache RabbitMQ channel ready');

    // Обробка створення кешу
    await channel.consume(
      'cache_create_queue',
      async (msg) => {
        console.log('🟢 Got message!');
        if (!msg) {
          console.error('Received null message in cache_create_queue');
          return;
        }
        // console.log('TEST ##########22222', msg);
        const { searchId, tickets } = JSON.parse(msg.content.toString());
        cache.set(searchId, { tickets, offset: 0 });
        console.log(`Cached ${tickets.length} tickets for searchId: ${searchId}`, cache);

        channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify({status: 'ok'})),
            { correlationId: msg.properties.correlationId }
        );
        channel.ack(msg);
      },
      { noAck: false }
    );

    // Обробка отримання тікетів
    await channel.consume(
      'cache_get_queue',
      async (msg) => {
        if (!msg) {
          console.error('Received null message in cache_get_queue');
          return;
        }
        console.log('TEST ##########!', msg);
        const { searchId } = JSON.parse(msg.content.toString());
        const data = cache.get(searchId);
        if (!data) {
          console.log(`No cache found for searchId: ${searchId}`);
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify({ tickets: [], stop: true })),
            { correlationId: msg.properties.correlationId }
          );
          channel.ack(msg);
          return;
        }

        const { tickets, offset } = data;
        const batchSize = 5;
        const batch = tickets.slice(offset, offset + batchSize);
        const stop = offset + batchSize >= tickets.length;

        cache.set(searchId, { tickets, offset: offset + batchSize });
        console.log(`Returning ${batch.length} tickets for searchId: ${searchId}, stop: ${stop}`);

        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify({ tickets: batch, stop })),
          { correlationId: msg.properties.correlationId }
        );
        channel.ack(msg);
      },
      { noAck: false }
    );

    return channel;
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error.message);
    throw error;
  }
}

connectRabbitMQ()
  .then(() => {
    console.log('Cache service running');
  })
  .catch((error) => {
    console.error('Failed to start Cache service:', error.message);
  });