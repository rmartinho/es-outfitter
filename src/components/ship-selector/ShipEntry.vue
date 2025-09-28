<template>
  <q-item>
    <q-card class="bg-secondary" flat>
      <q-list dense>
        <q-item>
          <q-item-section side>
            <q-avatar size="128px" font-size="1rem" square>
              <q-img fit="scale-down" :loading-show-delay="100" :src="ship.thumbnail" />
            </q-avatar>
          </q-item-section>
          <q-item-section side>
            <q-chip :ripple="false" square size="sm">
              cost
              {{ numeral(ship.cost).format('0,0') }}
            </q-chip>
            <q-chip :class="{ invisible: ship.guns == 0 }" :ripple="false" square size="sm">
              <q-avatar>{{ ship.guns }}</q-avatar>
              {{ ship.guns == 1 ? 'gun' : 'guns' }}
            </q-chip>
            <q-chip :class="{ invisible: ship.turrets == 0 }" :ripple="false" square size="sm">
              <q-avatar>{{ ship.turrets }}</q-avatar>
              {{ ship.turrets == 1 ? 'turret' : 'turrets' }}
            </q-chip>
            <q-chip :class="{ invisible: ship.bays == 0 }" :ripple="false" square size="sm">
              <q-avatar>{{ ship.bays }}</q-avatar>
              {{ ship.bays == 1 ? 'bay' : 'bays' }}
            </q-chip>
          </q-item-section>
        </q-item>
        <q-item class="justify-center">
          <q-item-label caption class="self-center">{{ ship.name }}</q-item-label>
        </q-item>
      </q-list>
    </q-card>
  </q-item>
</template>

<script setup lang="ts">
import type { Ship } from 'src/stores/game-data';
import numeral from 'numeral';

defineProps<{ ship: Ship }>();
</script>
