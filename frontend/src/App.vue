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

const sortBy = ref<'cheapest' | 'fastest' | 'optimal' | undefined>('cheapest');
const stops = ref<string>('');
const { tickets } = useTickets(stops, sortBy);
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
