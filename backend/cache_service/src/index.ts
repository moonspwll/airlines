// import amqp from 'amqplib';

// const cache = new Map();

// async function connectRabbitMQ() {
//     try {
//         const connection = await amqp.connect('amqp://rabbitmq:5672');
//         const channel = await connection.createChannel();
//         await channel.assertQueue('cache_create_queue', { durable: true });
//         await channel.assertQueue('cache_get_queue', { durable: true });

//         console.log('Cache RabbitMQ channel ready');

//         // Обробка створення кешу
//         await channel.consume(
//             'cache_create_queue',
//             async msg => {
//                 console.log('🟢 Got message!');
//                 if (!msg) {
//                     console.error(
//                         'Received null message in cache_create_queue'
//                     );
//                     return;
//                 }
//                 // console.log('TEST ##########22222', msg);
//                 const { searchId, tickets } = JSON.parse(
//                     msg.content.toString()
//                 );
//                 cache.set(searchId, { tickets, offset: 0 });
//                 console.log(
//                     `Cached ${tickets.length} tickets for searchId: ${searchId}`,
//                     cache
//                 );

//                 channel.sendToQueue(
//                     msg.properties.replyTo,
//                     Buffer.from(JSON.stringify({ status: 'ok' })),
//                     { correlationId: msg.properties.correlationId }
//                 );
//                 channel.ack(msg);
//             },
//             { noAck: false }
//         );

//         // Обробка отримання тікетів
//         await channel.consume(
//             'cache_get_queue',
//             async msg => {
//                 if (!msg) {
//                     console.error('Received null message in cache_get_queue');
//                     return;
//                 }
//                 console.log('TEST ##########!', msg);
//                 const { searchId, sortBy, stops } = JSON.parse(
//                     msg.content.toString()
//                 );
//                 const data = cache.get(searchId);
//                 if (!data) {
//                     console.log(`No cache found for searchId: ${searchId}`);
//                     channel.sendToQueue(
//                         msg.properties.replyTo,
//                         Buffer.from(
//                             JSON.stringify({ tickets: [], stop: true })
//                         ),
//                         { correlationId: msg.properties.correlationId }
//                     );
//                     channel.ack(msg);
//                     return;
//                 }

//                 const { tickets, offset } = data;
//                 console.log(`TEST1`, sortBy, stops);

//                 // if (!stops) {
//                 //     return tickets;
//                 // }

//                 // Парсимо stops у масив чисел (наприклад, "0,1" -> [0, 1])
//                 // const allowedStops = stops
//                 //     .split(',')
//                 //     .map(Number)
//                 //     .filter((n: number) => [0, 1, 2, 3].includes(n));

//                 // Якщо allowedStops порожній, повертаємо всі квитки
//                 // if (!allowedStops.length) {
//                 //     return tickets;
//                 // }

//                 // const filteredTickets = tickets.filter((ticket: any) => {
//                 //     // Підраховуємо загальну кількість зупинок у всіх сегментах
//                 //     const totalStops = ticket.segments.reduce(
//                 //         (acc: number, segment: any) => {
//                 //             return acc + segment.stops.length;
//                 //         },
//                 //         0
//                 //     );

//                 //     // Перевіряємо, чи загальна кількість зупинок входить до дозволених
//                 //     return allowedStops.includes(totalStops);
//                 // });
//                 const batchSize = 5;
//                 const batch = tickets.slice(offset, offset + batchSize);
//                 const stop = offset + batchSize >= tickets.length;

//                 cache.set(searchId, { tickets, offset: offset + batchSize });
//                 console.log(
//                     `Returning ${batch.length} tickets for searchId: ${searchId}, stop: ${stop}`
//                 );

//                 channel.sendToQueue(
//                     msg.properties.replyTo,
//                     Buffer.from(JSON.stringify({ tickets: batch, stop })),
//                     { correlationId: msg.properties.correlationId }
//                 );
//                 channel.ack(msg);
//             },
//             { noAck: false }
//         );

//         return channel;
//     } catch (error) {
//         if (error instanceof Error) {
//             console.error('Failed to connect to RabbitMQ:', error.message);
//         } else {
//             console.error('Failed to connect to RabbitMQ:', error);
//         }
//         throw error;
//     }
// }

// connectRabbitMQ()
//     .then(() => {
//         console.log('Cache service running');
//     })
//     .catch(error => {
//         console.error('Failed to start Cache service:', error.message);
//     });

import amqp from 'amqplib';

interface Ticket {
  _id: string;
  price: number;
  carrier: string;
  segments: {
    origin: string;
    destination: string;
    date: string;
    stops: string[];
    duration: number;
    _id: string;
  }[];
  __v: number;
}

const cache = new Map<string, { tickets: Ticket[]; offset: number }>();

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
        if (!msg) {
          console.error('Received null message in cache_create_queue');
          return;
        }
        try {
          const { searchId, tickets } = JSON.parse(msg.content.toString());
          cache.set(searchId, { tickets, offset: 0 });
          console.log(`Cached ${tickets.length} tickets for searchId: ${searchId}`);

          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify({ status: 'ok' })),
            { correlationId: msg.properties.correlationId }
          );
          channel.ack(msg);
        } catch (error) {
          console.error('Error processing cache_create_queue message:', error);
          channel.nack(msg, false, false);
        }
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
        try {
          const { searchId, sortBy, stops } = JSON.parse(msg.content.toString());
          console.log('Received cache_get_queue message:', { searchId, sortBy, stops });

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

          let { tickets, offset } = data;

          // Фільтрація за stops
          let filteredTickets = tickets;
          if (stops && stops !== '') {
            const allowedStops = stops
              .split(',')
              .map(Number)
              .filter((n: number) => [0, 1, 2, 3].includes(n));
            if (allowedStops.length > 0) {
              filteredTickets = tickets.filter((ticket: Ticket) => {
                const totalStops = ticket.segments.reduce(
                  (acc: number, segment: any) => acc + segment.stops.length,
                  0
                );
                return allowedStops.includes(totalStops);
              });
            }
          }

          // Сортування за sortBy
          let sortedTickets = [...filteredTickets];
          if (sortBy) {
            if (sortBy === 'cheapest') {
              sortedTickets.sort((a, b) => a.price - b.price);
            } else if (sortBy === 'fastest') {
              sortedTickets.sort((a, b) => {
                const durationA = a.segments.reduce((acc, seg) => acc + seg.duration, 0);
                const durationB = b.segments.reduce((acc, seg) => acc + seg.duration, 0);
                return durationA - durationB;
              });
            } else if (sortBy === 'optimal') {
              // Оптимальне сортування (наприклад, комбінація ціни та тривалості)
              sortedTickets.sort((a, b) => {
                const durationA = a.segments.reduce((acc, seg) => acc + seg.duration, 0);
                const durationB = b.segments.reduce((acc, seg) => acc + seg.duration, 0);
                const scoreA = a.price + durationA * 10; // Приклад: ціна + тривалість * коефіцієнт
                const scoreB = b.price + durationB * 10;
                return scoreA - scoreB;
              });
            }
          }

          const batchSize = 5;
          const batch = sortedTickets.slice(offset, offset + batchSize);
          const stop = offset + batchSize >= tickets.length;

          // Оновлюємо offset у кеші
          cache.set(searchId, { tickets, offset: offset + batchSize });
          console.log(`Returning ${batch.length} tickets for searchId: ${searchId}, stop: ${stop}`);

          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify({ tickets: batch, stop })),
            { correlationId: msg.properties.correlationId }
          );
          channel.ack(msg);
        } catch (error) {
          console.error('Error processing cache_get_queue message:', error);
          channel.nack(msg, false, false);
        }
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

connectRabbitMQ()
  .then(() => {
    console.log('Cache service running');
  })
  .catch((error) => {
    console.error('Failed to start Cache service:', error.message);
  });
