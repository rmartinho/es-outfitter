<template>
  <q-list class="row q-gutter-xs justify-evenly" dense>
    <template v-for="outfit in sortedOutfits" :key="outfit.name">
      <outfit-entry :outfit />
    </template>
  </q-list>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import OutfitEntry from './OutfitEntry.vue';
import type { Outfit } from 'stores/game-data';

const { outfits } = defineProps<{ outfits: Record<string, Outfit> }>();

const categoryOrder = [
  'Guns',
  'Turrets',
  'Secondary Weapons',
  'Ammunition',
  'Systems',
  'Power',
  'Engines',
  'Hand to Hand',
  'Unique',
  'Special',
];

const seriesOrder = [
  'Cooling',
  'Shields',
  'Jammers',
  'Ramscoops',
  'Drives',
  'Scanners',
  'Functional Unique',
  'Expansions',
  'Passenger',
  'Fuel',
  'Special Systems',
  'H2H',
  'Fortifications',
  'Non-Functional Unique',
  'Licenses',
];

const sortedOutfits = computed(() =>
  Object.values(outfits).sort((a, b) => {
    let idxA = categoryOrder.indexOf(a.category);
    let idxB = categoryOrder.indexOf(b.category);
    idxA = idxA == -1 ? categoryOrder.length : idxA;
    idxB = idxB == -1 ? categoryOrder.length : idxB;
    if (idxA != idxB) {
      return idxA - idxB;
    }
    const catCmp = a.category.localeCompare(b.category);
    if (catCmp != 0) {
      return catCmp;
    }

    idxA = seriesOrder.indexOf(a.series ?? '');
    idxB = seriesOrder.indexOf(b.series ?? '');
    idxA = idxA == -1 ? seriesOrder.length : idxA;
    idxB = idxB == -1 ? seriesOrder.length : idxB;
    if (idxA != idxB) {
      return idxA - idxB;
    }
    const seriesCmp = (a.series ?? 'ZZZZZZZZ').localeCompare(b.series ?? 'ZZZZZZZZ');
    if (seriesCmp != 0) {
      return seriesCmp;
    }

    idxA = a.index ?? 0;
    idxB = b.index ?? 0;
    if (idxA != idxB) {
      return idxA - idxB;
    }

    return a.name.localeCompare(b.name);
  }),
);
</script>
