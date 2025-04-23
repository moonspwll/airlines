// import { ref } from 'vue';
// import { Ticket } from '@/types/ticket';

// export function useTickets() {
//   const tickets = ref<Ticket[]>([]);
//   let searchId: string | null = null;
//   let isPolling = false;

//   const startSearch = async () => {
//     try {
//       const response = await fetch('http://localhost:3000/search');
//       const data = await response.json();
//       searchId = data.searchId;
//       await pollTickets(); // Викликаємо pollTickets після отримання searchId
//     } catch (error) {
//       console.error('Error starting search:', error);
//     }
//   };

//   const pollTickets = async () => {
//     if (!searchId || isPolling) return;
//     isPolling = true;

//     try {
//       const response = await fetch(`http://localhost:3000/tickets?searchId=${searchId}`);
//       const { tickets: newTickets, stop } = await response.json() as { tickets: Ticket[]; stop: boolean };

//       // Оновлюємо tickets
//       tickets.value = [...tickets.value, ...newTickets];
//       console.log('New tickets received:', tickets.value);
//       if (!stop) {
//         console.log('Scheduling next poll...');
//         setTimeout(async () => {
//           isPolling = false; // Скидаємо isPolling перед наступним викликом
//           await pollTickets(); // Викликаємо pollTickets асинхронно
//         }, 1000);
//       } else {
//         console.log('Polling stopped');
//         isPolling = false;
//       }
//     } catch (error) {
//       console.error('Error polling tickets:', error);
//       isPolling = false;
//     }
//   };

//   // Ініціюємо пошук при створенні composable
//   startSearch();

//   return { tickets };
// }
//##############################################################3
import { ref, watch, type Ref } from 'vue';
// import type { Ticket } from '@/types/ticket';

export function useTickets(stops: Ref<string | undefined>, sortBy: Ref<'cheapest' | 'fastest' | 'optimal' | undefined>) {
  const tickets = ref<any[]>([]);
  const searchId = ref<string | null>(null);
  let isPolling = false;
  let pollingTimeout: ReturnType<typeof setTimeout> | null = null;

  const startSearch = async () => {
    try {
      const params = new URLSearchParams();
      if (stops.value) params.append('stops', stops.value);
      if (sortBy.value) params.append('sortBy', sortBy.value);

      const response = await fetch(`http://localhost:3000/search?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch searchId');
      const data = await response.json();
      searchId.value = data.searchId;
      tickets.value = []; // Очищаємо старі квитки
      await pollTickets();
    } catch (error) {
      console.error('Error starting search:', error);
    }
  };

  const stopPolling = () => {
    if (pollingTimeout) {
      clearTimeout(pollingTimeout);
      pollingTimeout = null;
    }
    isPolling = false;
  };

  const pollTickets = async () => {
    if (!searchId.value || isPolling) return;
    isPolling = true;

    try {
      const params = new URLSearchParams({ searchId: searchId.value });
      if (stops.value) params.append('stops', stops.value);
      if (sortBy.value) params.append('sortBy', sortBy.value);

      const response = await fetch(`http://localhost:3000/tickets?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const { tickets: newTickets, stop, needsRefresh } = await response.json() as {
        tickets: any[];
        stop: boolean;
        needsRefresh: boolean;
      };

      if (needsRefresh) {
        stopPolling();
        await startSearch(); // Оновлюємо кеш, якщо параметри змінилися
        return;
      }

      tickets.value = [...tickets.value, ...newTickets];
      console.log('New tickets received:', tickets.value);

      if (!stop) {
        console.log('Scheduling next poll...');
        pollingTimeout = setTimeout(async () => {
          isPolling = false;
          await pollTickets();
        }, 1000);
      } else {
        console.log('Polling stopped');
        isPolling = false;
      }
    } catch (error) {
      console.error('Error polling tickets:', error);
      isPolling = false;
    }
  };

  // Реагуємо на зміни stops або sortBy
  watch([stops, sortBy], () => {
    console.log('Stops or sortBy changed:', { stops: stops.value, sortBy: sortBy.value });
    stopPolling();
    startSearch();
  });

  // Ініціюємо пошук при створенні composable
  startSearch();

  return { tickets };
}
