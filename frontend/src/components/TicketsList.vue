<template>
    <div class="tickets-container">
        <div v-for="(ticket, index) in tickets" :key="index" class="ticket-card">
            <div class="ticket-header">
                <div class="ticket-price">{{ ticket.price }} ₴</div>
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
import { formatTimeRange, formatDuration } from '../utils/timeUtil.js';
import { getStopsSuffix } from '../utils/transferSuffixUtil.js';

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
</script>

<style scoped>
.tickets-container {
    display: flex;
    flex-direction: column;
    max-width: 100%;
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