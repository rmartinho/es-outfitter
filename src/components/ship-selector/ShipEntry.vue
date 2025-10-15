<template>
  <q-item>
    <q-item-section avatar>
      <q-img fit="contain" :loading-show-delay="100" :src="ship.thumbnail" />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ ship.name }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import type { Ship } from 'src/stores/game-data';

defineProps<{ ship: Ship }>();
</script>
