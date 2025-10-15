<template>
  <q-item>
    <q-item-section avatar>
      <q-img fit="scale-down" :loading-show-delay="100" :src="outfit.thumbnail" />
    </q-item-section>
    <q-item-section>
      <q-item-label caption class="self-center">{{ outfit.name }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import type { Outfit } from 'src/stores/game-data';

defineProps<{ outfit: Outfit }>();
</script>
