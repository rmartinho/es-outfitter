<template>{{ numeral(value).format(format) }}{{ unit ? `\u202f${unit}` : '' }}</template>

<script setup lang="ts">
import numeral from 'numeral';

const { format = '0,0' } = defineProps<{
  value: number;
  unit?: string | undefined;
  format?: string | undefined;
}>();
</script>
