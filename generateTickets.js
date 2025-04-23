const fs = require('fs');

function generateTicket() {
  const carriers = ['LH', 'SU', 'BA'];
  const stopsOptions = ['LHR', 'CDG', 'FRA'];
  const getRandomDate = () => {
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    return new Date(2025, month, day).toISOString();
  };
  return {
    price: Math.floor(Math.random() * 9000) + 1000,
    carrier: carriers[Math.floor(Math.random() * 3)],
    segments: [
      {
        origin: 'KBP',
        destination: 'JFK',
        date: getRandomDate(),
        stops: Array.from({ length: Math.floor(Math.random() * 3) }, () => stopsOptions[Math.floor(Math.random() * 3)]),
        duration: Math.floor(Math.random() * 480) + 120,
      },
      {
        origin: 'JFK',
        destination: 'KBP',
        date: getRandomDate(),
        stops: Array.from({ length: Math.floor(Math.random() * 3) }, () => stopsOptions[Math.floor(Math.random() * 3)]),
        duration: Math.floor(Math.random() * 480) + 120,
      },
    ],
  };
}

const tickets = Array.from({ length: 100000 }, generateTicket);
fs.writeFileSync('tickets.json', JSON.stringify(tickets, null, 2));
console.log('Generated tickets.json with 100 000 tickets');