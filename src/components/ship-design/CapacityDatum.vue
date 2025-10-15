<template>
  <q-item-section class="col-2">
    <q-item-label class="text-grey text-right" :color="negative ? 'negative' : 'accent'">
      {{ label }}
    </q-item-label>
  </q-item-section>
  <q-item-section>
    <q-slider
      :model-value="value.total - value.free"
      :max="value.total"
      readonly
      :color="negative ? 'negative' : 'primary'"
      track-color="accent"
      :markers
      reverse
      label
      label-always
      :label-value="`${numeral(value.free).format('0,0')}/${numeral(value.total).format('0,0')}`"
      switch-label-side
      track-size="1rem"
      thumb-size="0.8rem"
      thumb-color="transparent"
      :label-color="negative ? 'negative' : 'accent'"
    >
      <template #marker-label-group="{ markerList }">
        <div
          :class="markerList[value.total]!.classes"
          :style="markerList[value.total]!.style as any"
        >
          {{ value.total }}
        </div>
      </template>
    </q-slider>
  </q-item-section>
  <template v-if="description">
    <q-tooltip anchor="center left">{{ description }}</q-tooltip>
  </template>
</template>

<script setup lang="ts">
import numeral from 'numeral';
import { computed } from 'vue';

const { value = { free: 0, total: 0 } } = defineProps<{
  value: {
    free: number;
    total: number;
  };
  label: string;
  description?: string;
}>();

const negative = computed(() => value.free < 0);
const markers = computed(() => {
  const total = value.total;

  for (let factor = 1; ; factor *= 10) {
    if (total <= 10 * factor) {
      return 1 * factor;
    }
    if (total <= 20 * factor) {
      return 2 * factor;
    }
    if (total <= 50 * factor) {
      return 5 * factor;
    }
  }
});
</script>
