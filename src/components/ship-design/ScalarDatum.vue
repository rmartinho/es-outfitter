<template>
  <q-item-section class="col-2">
    <q-item-label class="text-grey text-right">{{ label }}</q-item-label>
  </q-item-section>
  <q-item-section>
    <q-item-label>
      <formatted-value :value :unit format="0,0" />
    </q-item-label>
  </q-item-section>
  <template v-if="description">
    <q-tooltip anchor="center left">{{ description }}</q-tooltip>
  </template>
</template>

<script setup lang="ts">
import FormattedValue from './FormattedValue.vue';

defineProps<{
  value: number;
  label: string;
  description?: string;
  unit?: string;
}>();
</script>
