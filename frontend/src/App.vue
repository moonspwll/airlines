<template>
  <div>
    <a href="#">
      <img src="./assets/Logo.svg" class="logo" alt="Air tickets" />
    </a>
  </div>
  <div class="container">
    <Filters v-model:stops="stops" />
    <div class="main">
      <Sorting v-model:sortBy="sortBy" />
      <TicketsList :tickets="tickets" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue';

import Filters from './components/Filters.vue';
import Sorting from './components/Sorting.vue';
import TicketsList from './components/TicketsList.vue';

import { useTickets } from './composables/useTickets';

interface Segment {
    origin: string;
    destination: string;
    date: string; // ISO date string
    stops: string[]; // Array of stop codes
    duration: number; // Duration in minutes
    _id: string;
}

interface Ticket {
    _id: string;
    price: number; // Price as a number
    carrier: string; // Airline carrier code
    segments: Segment[]; // Array of segments
    __v: number; // Version key
}

// defineProps<{
//   tickets: Ticket[];
// }>();

// const { tickets } = useTickets(stops, sortBy);
// const filters = ref({ stops: [] }); // Наприклад, [0, 1, 2] для кількості пересадок
// const sort = ref('cheapest'); // 'price' або 'duration'

const sortBy = ref<'cheapest' | 'fastest' | 'optimal' | undefined>('cheapest');
const stops = ref<string>(''); // Define stops as a reactive property
const { tickets } = useTickets(stops, sortBy);
// watch(() => tickets.value, (newTickets) => {
//   // Викликати фільтрацію та сортування при зміні списку квитків
//   // filteredTickets.value = filterAndSortTickets(newTickets);
// });
// const filteredTickets = computed(() => {
  // let result = tickets.value;

  // // Фільтрація за пересадками
  // if (filters.value.stops.length) {
  //   result = result.filter((ticket) =>
  //     filters.value.stops.includes(ticket.segments[0].stops.length) &&
  //     filters.value.stops.includes(ticket.segments[1].stops.length)
  //   );
  // }

  // // Сортування
  // result = [...result].sort((a, b) => {
  //   if (sort.value === 'price') return a.price - b.price;
  //   if (sort.value === 'duration') {
  //     const durationA = a.segments[0].duration + a.segments[1].duration;
  //     const durationB = b.segments[0].duration + b.segments[1].duration;
  //     return durationA - durationB;
  //   }
  //   return 0;
  // });

  // // Повертаємо перші 5 квитків
  // return result.slice(0, 5);
// });
</script>
<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.container {
  min-width: 960px;
  display: flex;
  justify-content: space-evenly;
  flex-direction: row;
  flex-wrap: wrap;
}

.main {
  flex: 1;
  margin-left: 16px;
}
</style>
