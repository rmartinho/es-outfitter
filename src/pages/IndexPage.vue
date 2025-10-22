<template>
  <q-page class="q-ma-lg col">
    <design-builder v-model="design" />
  </q-page>
</template>

<script setup lang="ts">
import DesignBuilder from 'components/ship-design/DesignBuilder.vue';
import { ref } from 'vue';
import type { Design } from 'src/model/design';

const design = ref<Design>({
  ship: { name: '', category: '', thumbnail: '' },
  variant: undefined,
  outfits: new Map(),
});
</script>
