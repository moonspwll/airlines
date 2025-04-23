<template>
    <div class="tickets-container">
        <div v-for="(ticket, index) in tickets" :key="index" class="ticket-card">
            <div class="ticket-header">
                <div class="ticket-price">{{ ticket.price }}</div>
                <div class="ticket-airline">
                    <img src="../assets/ticket_logo.svg" alt="ticket.airline" class="airline-logo">
                </div>
            </div>

            <div class="ticket-segments">
                <div v-for="(segment, segIndex) in ticket.segments" :key="segIndex" class="ticket-segment">
                    <div class="segment-route">
                        <div class="segment-airports">{{ segment.origin }} - {{ segment.destination }}</div>
                        <div class="segment-times">{{ formatTimeRange(segment.date, segment.duration) }}</div>
                    </div>

                    <div class="segment-duration">
                        <div class="segment-label">ТРИВАЛІСТЬ</div>
                        <div class="segment-value">{{ formatDuration(segment.duration) }}</div>
                    </div>

                    <div class="segment-stops">
                        <div class="segment-label">{{ segment.stops.length }} ПЕРЕСАДК{{
                            getStopsSuffix(segment.stops.length) }}</div>
                        <div class="segment-value">{{ segment.stops.join(',') }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Ticket } from '../types/ticket';


function formatDuration(duration: number): string {
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  
  if (minutes === 0) {
    return `${hours}год`;
  }
  return `${hours}год ${minutes}хв`;
}

function formatTimeRange(dateString: string, minutesToAdd: number): string {
  // Парсимо дату
  const startDate = new Date(dateString);
  
  // Отримуємо початковий час
  const startHours = String(startDate.getUTCHours()).padStart(2, '0');
  const startMinutes = String(startDate.getUTCMinutes()).padStart(2, '0');
  
  // Додаємо хвилини
  const endDate = new Date(startDate.getTime() + minutesToAdd * 60 * 1000);
  
  // Отримуємо кінцевий час
  const endHours = String(endDate.getUTCHours()).padStart(2, '0');
  const endMinutes = String(endDate.getUTCMinutes()).padStart(2, '0');
  
  // Формуємо рядок
  return `${startHours}:${startMinutes} - ${endHours}:${endMinutes}`;
}

// defineProps<{
//     tickets: Ticket[];
// }>();
defineProps<{
    tickets: Array<{
        _id: string;
        price: number;
        carrier: string;
        segments: Array<{
            destination: string;
            origin: string;
            date: string;
            duration: number;
            stops: string[];
        }>;
    }>;
}>();

// interface TicketSegment {
//     departure: string;
//     arrival: string;
//     departureTime: string;
//     arrivalTime: string;
//     duration: string;
//     stopsCount: number;
//     stopCodes: string;
// }

// interface Ticket {
//     price: string;
//     airline: string;
//     airlineLogoUrl: string;
//     segments: TicketSegment[];
// }

// Function to get the correct Ukrainian suffix for stops count
const getStopsSuffix = (count: number): string => {
    if (count === 1) {
        return 'А';
    } else if (count >= 2 && count <= 4) {
        return 'И';
    } else {
        return 'ОК';
    }
};

// Sample ticket data
// const tickets_dep = ref<Ticket[]>([
//     {
//         price: '13 400 ₴',
//         airline: 'Wizz Air',
//         airlineLogoUrl: 'https://placehold.co/80x30/FFFFFF/8B0082?text=WIZZ',
//         segments: [
//             {
//                 departure: 'WAWsd',
//                 arrival: 'LAX',
//                 departureTime: '10:45',
//                 arrivalTime: '08:00',
//                 duration: '21год 15хв',
//                 stopsCount: 2,
//                 stopCodes: 'MUC, YVR'
//             },
//             {
//                 departure: 'WAW',
//                 arrival: 'LAX',
//                 departureTime: '11:20',
//                 arrivalTime: '00:50',
//                 duration: '13год 30хв',
//                 stopsCount: 1,
//                 stopCodes: 'MUC'
//             }
//         ]
//     },
//     {
//         price: '13 400 ₴',
//         airline: 'Wizz Air',
//         airlineLogoUrl: 'https://placehold.co/80x30/FFFFFF/8B0082?text=WIZZ',
//         segments: [
//             {
//                 departure: 'WAW',
//                 arrival: 'LAX',
//                 departureTime: '10:45',
//                 arrivalTime: '08:00',
//                 duration: '21год 15хв',
//                 stopsCount: 2,
//                 stopCodes: 'MUC, YVR'
//             },
//             {
//                 departure: 'WAW',
//                 arrival: 'LAX',
//                 departureTime: '11:20',
//                 arrivalTime: '00:50',
//                 duration: '13год 30хв',
//                 stopsCount: 1,
//                 stopCodes: 'MUC'
//             }
//         ]
//     },
//     {
//         price: '13 400 ₴',
//         airline: 'Wizz Air',
//         airlineLogoUrl: 'https://placehold.co/80x30/FFFFFF/8B0082?text=WIZZ',
//         segments: [
//             {
//                 departure: 'WAW',
//                 arrival: 'LAX',
//                 departureTime: '10:45',
//                 arrivalTime: '08:00',
//                 duration: '21год 15хв',
//                 stopsCount: 2,
//                 stopCodes: 'MUC, YVR'
//             },
//             {
//                 departure: 'WAW',
//                 arrival: 'LAX',
//                 departureTime: '11:20',
//                 arrivalTime: '00:50',
//                 duration: '13год 30хв',
//                 stopsCount: 1,
//                 stopCodes: 'MUC'
//             }
//         ]
//     }
// ]);
</script>

<style scoped>
.tickets-container {
    display: flex;
    flex-direction: column;
    /* gap: 16px; */
    max-width: 100%;
    /* max-width: 600px; */
    /* padding: 16px; */
    /* grid-area: 3 / 3 / 6 / 5; */
}

.ticket-card {
    background-color: white;
    border-radius: 8px;
    width: 100%;
    box-shadow: 0px 1px 3px 0px rgba(0,0,0,0.44);
    overflow: hidden;
    padding: 30px;
    margin-bottom: 16px;
    box-sizing: border-box;
}

.ticket-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.ticket-price {
    font-size: 24px;
    font-weight: 700;
    color: #2196f3;
}

.airline-logo {
    height: 32px;
    width: auto;
}

.ticket-segments {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.ticket-segment {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
}

.ticket-segment:first-child {
    border-top: none;
}

.segment-route,
.segment-duration,
.segment-stops {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.segment-airports {
    color: #A0B0B9;
    font-size: 16px;
    font-weight: 500;
}

.segment-times {
    font-size: 16px;
    font-weight: 500;
    color: #4A4A4A;
}

.segment-label {
    color: #9e9e9e;
    font-size: 16px;
    font-weight: 500;
    text-transform: uppercase;
}

.segment-value {
    font-size: 16px;
    font-weight: 500;
    color: #4A4A4A;
}
</style>