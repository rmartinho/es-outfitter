<template>
  <q-list class="row q-gutter-xs justify-evenly" dense>
    <template v-for="ship in sortedShips" :key="ship.name">
      <ship-entry :ship />
    </template>
  </q-list>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ShipEntry from './ShipEntry.vue';
import type { Ship } from 'stores/game-data';

const { ships } = defineProps<{ ships: Record<string, Ship> }>();

const categoryOrder = [
  'Transport',
  'Space Liner',
  'Light Freighter',
  'Heavy Freighter',
  'Utility',
  'Interceptor',
  'Light Warship',
  'Medium Warship',
  'Heavy Warship',
  'Superheavy',
  'Fighter',
  'Drone',
];

const sortedShips = computed(() =>
  Object.values(ships).sort((a, b) => {
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

    return a.name.localeCompare(b.name);
  }),
);
</script>
