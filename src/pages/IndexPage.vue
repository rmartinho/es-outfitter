<template>
  <q-page class="row items-center justify-evenly">
    <ship-selector :ships="data.ships" />
  </q-page>
</template>

<script setup lang="ts">
import ShipSelector from 'components/ship-selector/ShipSelector.vue';
import { storeToRefs } from 'pinia';
import { useGameDataStore } from 'stores/game-data';

const { data } = storeToRefs(useGameDataStore());
</script>
