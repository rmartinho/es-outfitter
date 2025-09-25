<template>
  <q-list class="q-gutter-sm">
    <q-item-label header>Plugins</q-item-label>
    <q-item>
      <q-list class="q-ml-md" dense>
        <q-item-label>{{ Object.values(data.ships).length }} ships</q-item-label>
        <q-item-label caption> +{{ Object.values(data.variants).length }} variants </q-item-label>
        <q-item-label>{{ Object.values(data.outfits).length }} outfits</q-item-label>
      </q-list>
    </q-item>
    <q-item>
      <q-list>
        <q-form @submit="add">
          <q-input
            ref="new-url"
            dense
            standout="bg-primary text-secondary"
            item-aligned
            type="text"
            v-model="newUrl"
            label="New plugin URL"
          >
            <template #append>
              <q-btn
                :disable="newUrl.trim().length == 0"
                round
                dense
                flat
                icon="playlist_add"
                @click="add"
              >
                <q-tooltip>Add new plugin</q-tooltip>
              </q-btn>
            </template>
          </q-input>
        </q-form>

        <template
          v-for="{ plugin, state: { isLoading, progress, total } } in pluginStates"
          :key="plugin.url"
        >
          <plugin-entry
            class="q-pa-none"
            :plugin
            :is-loading
            :progress
            :total
            @toggle="(v) => (plugin.enabled = v)"
            @remove="() => removePlugin(plugin.url)"
          />
        </template>
      </q-list>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { QInput } from 'quasar';
import PluginEntry from './PluginEntry.vue';
import { storeToRefs } from 'pinia';
import { BASE_GAME_URL } from 'src/constants';
import { useGameDataStore } from 'stores/game-data';
import { computed, ref, useTemplateRef, watchEffect } from 'vue';

const { addPlugin, removePlugin } = useGameDataStore();
const { plugins, data, loadState } = storeToRefs(useGameDataStore());

const newUrl = ref(plugins.value.length == 0 ? BASE_GAME_URL : '');

const pluginStates = computed(() =>
  plugins.value.map((plugin) => ({ plugin, state: loadState.value[plugin.url]! })),
);

const add = () => {
  addPlugin(newUrl.value);
  newUrl.value = '';
};

const input = useTemplateRef<QInput>('new-url');

watchEffect(() => {
  if (plugins.value.length == 0) {
    newUrl.value = BASE_GAME_URL;
    input.value?.focus();
  }
});
</script>

<style lang="css" module>
li {
  display: flex;
  place-items: center;
  gap: 2px;
}
</style>
