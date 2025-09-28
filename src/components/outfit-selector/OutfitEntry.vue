<template>
  <q-item>
    <q-card class="bg-secondary" flat>
      <q-list dense>
        <q-item>
          <q-item-section side>
            <q-avatar size="128px" font-size="1rem" square>
              <q-img fit="scale-down" :loading-show-delay="100" :src="outfit.thumbnail" />
            </q-avatar>
          </q-item-section>
          <q-item-section side>
            <q-chip :ripple="false" square size="sm">
              cost
              {{ numeral(outfit.cost).format('0,0') }}
            </q-chip>
          </q-item-section>
        </q-item>
        <q-item class="justify-center">
          <q-item-label caption class="self-center">{{ outfit.name }}</q-item-label>
        </q-item>
      </q-list>
    </q-card>
  </q-item>
</template>

<script setup lang="ts">
import type { Outfit } from 'src/stores/game-data';
import numeral from 'numeral';

defineProps<{ outfit: Outfit }>();
</script>
