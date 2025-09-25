<template>
  <q-item class="column">
    <div class="col-12 row">
      <q-toggle
        checked-icon="extension"
        unchecked-icon="extension_off"
        color="positive"
        :model-value="plugin.enabled"
        @update:model-value="(v) => $emit('toggle', v)"
      >
        <q-item-label>{{ plugin.dir ?? plugin.repo }}</q-item-label>
        <q-item-label caption>{{ plugin.branch }}</q-item-label>
      </q-toggle>
      <q-space />
      <q-btn round dense flat icon="delete" @click="$emit('remove')">
        <q-tooltip>Delete this plugin</q-tooltip>
      </q-btn>
    </div>

    <template v-if="isLoading">
      <div>
        <q-linear-progress rounded :animation-speed="500" :value="total ? progress / total : 0" />
      </div>
    </template>
  </q-item>
</template>

<script setup lang="ts">
import type { LoadProgress, Plugin } from 'src/stores/game-data';

const { plugin, isLoading, progress, total } = defineProps<
  {
    plugin: Plugin;
  } & LoadProgress
>();

defineEmits<{
  remove: [];
  toggle: [v: boolean];
}>();
</script>
