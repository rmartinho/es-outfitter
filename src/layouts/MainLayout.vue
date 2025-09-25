<template>
  <q-layout view="lHh Lpr lFf">
    <q-drawer show-if-above :model-value="true">
      <q-card class="q-ma-sm">
        <plugin-selector />
      </q-card>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import PluginSelector from 'components/plugin-selector/PluginSelector.vue';
</script>
