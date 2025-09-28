<template>
  <q-page class="row items-center justify-evenly">
    <q-card class="full-width">
      <q-tabs v-model="tab" dense active-color="primary" indicator-color="primary">
        <q-tab name="ships" label="Ships" />
        <q-tab name="outfits" label="Outfits" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="ships">
          <ship-selector :ships="data.ships" />
        </q-tab-panel>

        <q-tab-panel name="outfits">
          <outfit-selector :outfits="data.outfits" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import ShipSelector from 'components/ship-selector/ShipSelector.vue';
import OutfitSelector from 'components/outfit-selector/OutfitSelector.vue';
import { storeToRefs } from 'pinia';
import { useGameDataStore } from 'stores/game-data';
import { ref } from 'vue';

const { data } = storeToRefs(useGameDataStore());

const tab = ref('ships');
</script>
