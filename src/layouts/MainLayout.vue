<template>
  <q-layout view="lHh Lpr lFf">
    <q-drawer show-if-above :model-value="true">
      <plugin-selector />
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import PluginSelector from 'components/plugin-selector/PluginSelector.vue';
</script>
