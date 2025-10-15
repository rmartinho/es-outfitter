<template>
  <q-page class="q-ma-lg col">
    <ship-builder v-model="design" />
  </q-page>
</template>

<script setup lang="ts">
import ShipBuilder from 'components/ship-builder/ShipBuilder.vue';
import { storeToRefs } from 'pinia';
import { useGameDataStore } from 'stores/game-data';
import { ref } from 'vue';
import type { Design } from 'src/model/design';

const { data } = storeToRefs(useGameDataStore());

const design = ref<Design>({
  ship: Object.values(data.value.ships)[0] ?? { name: '', category: '', thumbnail: '' },
  variant: undefined,
  outfits: new Map(),
});
</script>
