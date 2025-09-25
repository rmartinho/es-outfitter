<template>
  <q-item class="column">
    <div class="col-12 row">
      <q-checkbox
        class="col-11 ellipsis"
        dense
        checked-icon="extension"
        unchecked-icon="extension_off"
        color="positive"
        :model-value="plugin.enabled"
        @update:model-value="(v) => $emit('toggle', v)"
      >
        <q-item-label>{{ name }}</q-item-label>
        <q-item-label caption>{{ plugin.branch }}</q-item-label>
      </q-checkbox>
      <q-btn class="col-1" round dense flat icon="delete" @click="$emit('remove')">
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
import { computed } from 'vue';

const { plugin, isLoading, progress, total } = defineProps<
  {
    plugin: Plugin;
  } & LoadProgress
>();

defineEmits<{
  remove: [];
  toggle: [v: boolean];
}>();

const name = computed(() => (plugin.dir ? plugin.dir.split('/').at(-1) : plugin.repo));
</script>
