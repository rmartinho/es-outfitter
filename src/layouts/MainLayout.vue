<template>
  <q-layout view="hHh lpr fFf">
    <q-header>
      <q-toolbar>
        <q-icon size="md" name="svguse:icon.svg" />
        <q-toolbar-title>Endless Sky Outfitter</q-toolbar-title>
        <q-btn flat round dense icon="extension" @click="showPlugins = !showPlugins">
          <q-tooltip>Plugins</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>

  <q-dialog position="right" persistent maximized backdrop-filter="blur(4px)" v-model="showPlugins">
    <q-card bordered>
      <q-toolbar>
        <q-icon size="md" name="extension" />
        <q-toolbar-title>Plugins</q-toolbar-title>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>
      <plugin-selector v-model="showPlugins" />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import PluginSelector from 'components/plugin-selector/PluginSelector.vue';
import { ref } from 'vue';

const showPlugins = ref(false);
</script>
