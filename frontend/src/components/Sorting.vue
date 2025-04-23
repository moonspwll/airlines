<template>
    <div class="tab-container">
        <button v-for="(tab, index) in tabs" :key="index" class="tab-button" :class="{ active: activeTab === tab.id }"
            @click="setActiveTab(tab.id)">
            {{ tab.label }}
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Tab {
  id: 'cheapest' | 'fastest' | 'optimal';
  label: string;
}

const tabs: Tab[] = [
  { id: 'cheapest', label: 'НАЙДЕШЕВШИЙ' },
  { id: 'fastest', label: 'НАЙШВИДШИЙ' },
  { id: 'optimal', label: 'ОПТИМАЛЬНИЙ' },
];

const activeTab = ref<string>('cheapest');

const emit = defineEmits<{
  (e: 'update:sortBy', sortBy: 'cheapest' | 'fastest' | 'optimal'): void;
}>();

const setActiveTab = (tabId: Tab['id']): void => {
  activeTab.value = tabId;
  emit('update:sortBy', tabId);
};
</script>

<style scoped>
.tab-container {
    display: flex;
    border-radius: 8px;
    overflow: hidden;
    height: 50px;
    max-width: 100%;
    box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.49);
    margin-bottom: 16px;
    /* box-sizing: border-box; */
}

.tab-button {
    flex: 1;
    padding: 16px 8px;
    background-color: white;
    border: none;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    cursor: pointer;
    transition: background-color 0.2s ease;
    border-right: 1px solid #e0e0e0;
    box-sizing: border-box;
}

.tab-button:last-child {
    border-right: none;
}

.tab-button.active {
    background-color: #0288d1;
    color: white;
}

.tab-button:hover:not(.active) {
    background-color: #f5f5f5;
}
</style>