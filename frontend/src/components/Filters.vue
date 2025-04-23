<template>
    <div class="filter-card">
        <h3 class="filter-title">КІЛЬКІСТЬ ПЕРЕСАДОК</h3>
        <ul class="filter-options">
            <li class="filter-option" v-for="(option, index) in filters" :key="index" @click="toggleOption(option)">
                <div class="filter-checkbox" :class="{ checked: option.checked }"></div>
                <span class="filter-label">{{ option.label }}</span>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface FilterItem {
    transfers: number;
    label: string;
    checked: boolean;
}

const FILTERS: FilterItem[] = [
    {
        transfers: -1,
        label: 'Всі',
        checked: true,
    },
    {
        transfers: 0,
        label: 'Без пересадок',
        checked: false,
    },
    {
        transfers: 1,
        label: '1 пересадка',
        checked: false,
    },
    {
        transfers: 2,
        label: '2 пересадки',
        checked: false,
    },
    {
        transfers: 3,
        label: '3 пересадки',
        checked: false,
    },
];

const filters = ref<FilterItem[]>(FILTERS);

const emit = defineEmits<{
  (e: 'update:stops', stops: string | undefined): void;
}>();

// Логіка натискання на фільтри
const toggleOption = (option: FilterItem): void => {
    if (option.transfers === -1) {
        option.checked = !option.checked;

        filters.value.forEach((filter: FilterItem) => {
            if (filter.transfers !== -1) {
                filter.checked = option.checked;
            }
        });

        if (!option.checked) {
            const firstIndividual = filters.value.find((filter: FilterItem) => filter.transfers !== -1);
            if (firstIndividual) {
                firstIndividual.checked = true;
            }
        }
    } else {
        const allOption: FilterItem | undefined = filters.value.find((filter: FilterItem) => filter.transfers === -1);

        const checkedCount = filters.value.filter((filter: FilterItem) => filter.checked && filter.transfers !== -1).length;
        if (option.checked && checkedCount === 1) {
            return;
        }

        option.checked = !option.checked;

        const allIndividualSelected: boolean = filters.value
            .filter((filter: FilterItem) => filter.transfers !== -1)
            .every((filter: FilterItem) => filter.checked);

        if (allOption) {
            allOption.checked = allIndividualSelected;
        }
    }
};

watch(
  filters,
  () => {
    const selectedStops = filters.value
      .filter((filter) => filter.checked && filter.transfers !== -1)
      .map((filter) => filter.transfers)
      .join(',');

    if (filters.value.find((filter) => filter.transfers === -1)?.checked) {
      emit('update:stops', undefined); // Якщо вибрано "Всі", надсилаємо undefined
    } else {
      emit('update:stops', selectedStops || undefined);
    }
  },
  { deep: true }
);
</script>

<style scoped>
.filter-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0px 1px 3px 0px rgba(0,0,0,0.44);
    width: 220px;
    height: 252px;
    padding: 16px;
    grid-area: 2 / 2 / 4 / 3;
}

.filter-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    text-transform: uppercase;
    margin-top: 0;
    margin-bottom: 12px;
}

.filter-options {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

.filter-option {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;
    color: #333;
}

.filter-checkbox {
    width: 18px;
    height: 18px;
    border: 1px solid #ddd;
    border-radius: 3px;
    margin-right: 8px;
    position: relative;
    cursor: pointer;
}

.filter-checkbox.checked {
    background-color: #FFFFFF;
    border-color: #2196F3;
}

.filter-checkbox.checked::after {
    content: '';
    position: absolute;
    left: 6px;
    top: 3px;
    width: 4px;
    height: 8px;
    border: solid #2196F3;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.filter-label {
    cursor: pointer;
}
</style>