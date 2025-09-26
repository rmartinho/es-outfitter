<template>
  <q-item>
    <q-card flat>
      <q-tooltip :delay="1000">
        <pre>{{ JSON.stringify(ship, null, 2) }}</pre>
      </q-tooltip>
      <q-list dense>
        <q-item>
          <q-item-section side>
            <q-avatar size="128px" font-size="1rem" square>
              <q-img fit="scale-down" :loading-show-delay="100" :src="ship.thumbnail" />
            </q-avatar>
          </q-item-section>
          <q-item-section side>
            <q-chip
              :ripple="false"
              square
              :color="ship.guns > 0 ? 'accent' : 'secondary'"
              size="sm"
            >
              <q-avatar>{{ ship.guns }}</q-avatar>
              {{ ship.guns == 1 ? 'gun' : 'guns' }}
            </q-chip>
            <q-chip
              :ripple="false"
              square
              :color="ship.turrets > 0 ? 'accent' : 'secondary'"
              size="sm"
            >
              <q-avatar>{{ ship.turrets }}</q-avatar>
              {{ ship.turrets == 1 ? 'turret' : 'turrets' }}
            </q-chip>
            <q-chip
              :ripple="false"
              square
              :color="ship.bays > 0 ? 'accent' : 'secondary'"
              size="sm"
            >
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

defineProps<{ ship: Ship }>();
</script>
