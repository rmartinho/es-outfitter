<template>
  <q-page class="row items-center justify-evenly">
    <!-- <ship-selector :ships="data.ships" /> -->
    <outfit-selector :outfits="data.outfits" />
  </q-page>
</template>

<script setup lang="ts">
import OutfitSelector from 'components/outfit-selector/OutfitSelector.vue';
import { storeToRefs } from 'pinia';
import { useGameDataStore } from 'stores/game-data';

const { data } = storeToRefs(useGameDataStore());
</script>
