<template>
  <q-card>
    <q-card-section horizontal>
      <q-card-section>
        <q-avatar size="128px" square>
          <q-img fit="scale-down" :loading-show-delay="100" :src="design.ship.thumbnail" />
        </q-avatar>
        <q-select dense v-model="design.ship" :options="shipOptions" option-label="name">
          <template #option="{ itemProps, opt }">
            <ship-entry v-bind="itemProps" :ship="opt" />
          </template>
        </q-select>
        <q-select dense v-model="newOutfit" :options="outfitOptions" option-label="name">
          <template #prepend>
            <q-avatar square>
              <q-img fit="scale-down" :loading-show-delay="100" :src="newOutfit?.thumbnail" />
            </q-avatar>
          </template>
          <template #after>
            <q-btn round flat icon="add" @click="addOutfit">
              <q-tooltip>Add outfit</q-tooltip>
            </q-btn>
          </template>
          <template #option="{ itemProps, opt }">
            <outfit-entry v-bind="itemProps" :outfit="opt" />
          </template>
        </q-select>
        <q-scroll-area style="height: 60vh; width: 400px">
          <q-list>
            <template v-for="([outfit, count], i) in design.outfits" :key="i">
              <q-item>
                <outfit-entry :outfit :count />
                <q-space />
                <q-item>
                  <q-btn round flat icon="remove" @click="decOutfit(outfit)" />
                  <q-chip>{{ count }}</q-chip>
                  <q-btn round flat icon="add" @click="incOutfit(outfit)" />
                </q-item>
              </q-item>
            </template>
          </q-list>
        </q-scroll-area>
      </q-card-section>
      <q-card-section horizontal>
        <q-card-section>
          <q-chip>Cost {{ numeral(cost).format('0,0') }}</q-chip>
        </q-card-section>
        <q-card-section>
          <q-chip>
            Gun ports {{ numeral(space.guns.free).format('0,0') }} /
            {{ numeral(space.guns.total).format('0,0') }}
          </q-chip>
          <q-chip>
            Turret mounts {{ numeral(space.turrets.free).format('0,0') }} /
            {{ numeral(space.turrets.total).format('0,0') }}
          </q-chip>
          <q-chip> Fighter bays {{ numeral(space.bays).format('0,0') }} </q-chip>
        </q-card-section>
        <q-card-section>
          <q-chip>
            Outfit space {{ numeral(space.outfits.free).format('0,0') }} /
            {{ numeral(space.outfits.total).format('0,0') }}
          </q-chip>
          <q-chip>
            Weapon space {{ numeral(space.weapons.free).format('0,0') }} /
            {{ numeral(space.weapons.total).format('0,0') }}
          </q-chip>
          <q-chip>
            Engine space {{ numeral(space.engines.free).format('0,0') }} /
            {{ numeral(space.engines.total).format('0,0') }}
          </q-chip>
          <q-chip> Cargo {{ numeral(space.cargo).format('0,0') }} </q-chip>
          <q-chip>
            Bunks {{ numeral(space.bunks.free).format('0,0') }} /
            {{ numeral(space.bunks.total).format('0,0') }}
          </q-chip>
          <q-chip>
            Mass {{ numeral(mass.unladen).format('0,0') }}
            -
            {{ numeral(mass.laden).format('0,0') }}
          </q-chip>
        </q-card-section>
        <q-card-section>
          <q-chip>
            Shields {{ numeral(shields.total).format('0,0') }} ({{
              numeral(shields.charge).format('0,0')
            }}/s)
          </q-chip>
          <q-chip>
            Hull {{ numeral(hull.total).format('0,0') }} ({{
              numeral(hull.repair).format('0,0')
            }}/s)
          </q-chip>
        </q-card-section>
        <q-card-section>
          <q-chip>Max speed {{ numeral(movement.forward.maxSpeed).format('0,0') }}</q-chip>
          <q-chip>
            Thrust {{ numeral(movement.forward.laden).format('0,0') }} -
            {{ numeral(movement.forward.unladen).format('0,0') }}
          </q-chip>
          <q-chip>
            Turn {{ numeral(movement.turn.laden).format('0,0') }} -
            {{ numeral(movement.turn.unladen).format('0,0') }}
          </q-chip>
          <q-chip>
            Reverse {{ numeral(movement.reverse.laden).format('0,0') }} -
            {{ numeral(movement.reverse.unladen).format('0,0') }}
          </q-chip>
          <q-chip>
            Afterburner {{ numeral(movement.afterburner.laden).format('0,0') }} -
            {{ numeral(movement.afterburner.unladen).format('0,0') }}
          </q-chip>
        </q-card-section>
        <q-card-section>
          <q-chip>Energy capacity {{ numeral(energy.capacity).format('0,0') }}</q-chip>
          <q-chip
            >Idle {{ numeral(energy.idle.rate).format('+0,0') }} ({{
              numeral(energy.idle.duration).format('0,0')
            }}s)</q-chip
          >
          <q-chip
            >Moving {{ numeral(-energy.moving.rate).format('+0,0') }} ({{
              numeral(energy.moving.duration).format('0,0')
            }}s)</q-chip
          >
          <q-chip
            >Firing {{ numeral(-energy.firing.rate).format('+0,0') }} ({{
              numeral(energy.firing.duration).format('0,0')
            }}s)</q-chip
          >
          <q-chip
            >Recovering {{ numeral(-energy.recovering.rate).format('+0,0') }} ({{
              numeral(energy.recovering.duration).format('0,0')
            }}s)</q-chip
          >
          <q-chip
            >Peak {{ numeral(energy.peak.rate).format('+0,0') }} ({{
              numeral(energy.peak.duration).format('0,0')
            }}s)</q-chip
          >
        </q-card-section>
        <q-card-section>
          <q-chip>Fuel capacity {{ numeral(fuel.capacity).format('0,0') }}</q-chip>
          <q-chip
            >Idle {{ numeral(fuel.idle.rate).format('+0,0') }} ({{
              numeral(fuel.idle.duration).format('0,0')
            }}s)</q-chip
          >
          <q-chip
            >Moving {{ numeral(-fuel.moving.rate).format('+0,0') }} ({{
              numeral(fuel.moving.duration).format('0,0')
            }}s)</q-chip
          >
          <q-chip
            >Firing {{ numeral(-fuel.firing.rate).format('+0,0') }} ({{
              numeral(fuel.firing.duration).format('0,0')
            }}s)</q-chip
          >
          <q-chip
            >Recovering {{ numeral(-fuel.recovering.rate).format('+0,0') }} ({{
              numeral(fuel.recovering.duration).format('0,0')
            }}s)</q-chip
          >
          <q-chip
            >Peak {{ numeral(fuel.peak.rate).format('+0,0') }} ({{
              numeral(fuel.peak.duration).format('0,0')
            }}s)</q-chip
          >
        </q-card-section>
        <q-card-section>
          <q-chip>Heat capacity {{ numeral(heat.capacity).format('0,0') }}</q-chip>
          <q-chip
            >Idle {{ numeral(heat.idle.rate).format('+0,0') }} ~{{
              numeral(heat.idle.equilibrium / heat.capacity).format('0,0%')
            }}</q-chip
          >
          <q-chip
            >Moving {{ numeral(heat.moving.rate).format('+0,0') }} ~{{
              numeral(heat.moving.equilibrium / heat.capacity).format('0,0%')
            }}</q-chip
          >
          <q-chip
            >Firing {{ numeral(heat.firing.rate).format('+0,0') }} ~{{
              numeral(heat.firing.equilibrium / heat.capacity).format('0,0%')
            }}</q-chip
          >
          <q-chip
            >Recovering {{ numeral(heat.recovering.rate).format('+0,0') }} ~{{
              numeral(heat.recovering.equilibrium / heat.capacity).format('0,0%')
            }}</q-chip
          >
          <q-chip
            >Peak {{ numeral(heat.peak.rate).format('+0,0') }} ~{{
              numeral(heat.peak.equilibrium / heat.capacity).format('0,0%')
            }}</q-chip
          >
        </q-card-section>
        <q-card-section>
          <q-chip
            >Outfit scan @{{ numeral(scan.outfit.distance).format('0,0') }} ({{
              numeral(scan.outfit.duration).format('0,0')
            }}s)</q-chip
          >
          <q-chip
            >Cargo scan @{{ numeral(scan.cargo.distance).format('0,0') }} ({{
              numeral(scan.cargo.duration).format('0,0')
            }}s)</q-chip
          >
          <q-chip
            >Tactical scan @{{ numeral(scan.tactical.distance).format('0,0') }} ({{
              numeral(scan.tactical.duration).format('0,0')
            }}s)</q-chip
          >
          <q-chip
            >Asteroid scan @{{ numeral(scan.asteroid.distance).format('0,0') }} ({{
              numeral(scan.asteroid.duration).format('0,0')
            }}s)</q-chip
          >
        </q-card-section>
        <q-card-section>
          <q-chip>Outfit opacity {{ numeral(opacity.outfit).format('0,0') }}</q-chip>
          <q-chip>Cargo opacity {{ numeral(opacity.cargo).format('0,0') }}</q-chip>
          <q-chip>Scan concealment {{ numeral(smuggling.concealment).format('0,0') }}</q-chip>
          <q-chip>Scan interference {{ numeral(smuggling.interference).format('0,0%') }}</q-chip>
        </q-card-section>
        <q-card-section>
          <q-chip>Capture attack {{ numeral(boarding.attack).format('0,0') }}</q-chip>
          <q-chip>Capture defense {{ numeral(boarding.defense).format('0,0') }}</q-chip>
        </q-card-section>
        <q-card-section>
          <q-chip>Radar jamming {{ numeral(jamming.radar).format('0,0%') }}</q-chip>
          <q-chip>Optical jamming {{ numeral(jamming.optical).format('0,0%') }}</q-chip>
          <q-chip
            >Anti-missile {{ numeral(antiMissile.strength).format('0,0') }} x{{
              numeral(antiMissile.rate).format('0,0')
            }}/s</q-chip
          >
        </q-card-section>
        <q-card-section>
          <q-chip>
            Disruption resistance {{ numeral(resistance.disruption.block).format('0,0') }} ({{
              numeral(resistance.disruption.bleed).format('0,0')
            }}/s)
          </q-chip>
          <q-chip>
            Ion resistance {{ numeral(resistance.ion.block).format('0,0') }} ({{
              numeral(resistance.ion.bleed).format('0,0')
            }}/s)
          </q-chip>
          <q-chip>
            Scramble resistance {{ numeral(resistance.scramble.block).format('0,0') }} ({{
              numeral(resistance.scramble.bleed).format('0,0')
            }}/s)
          </q-chip>
          <q-chip>
            Slowing resistance {{ numeral(resistance.slowing.block).format('0,0') }} ({{
              numeral(resistance.slowing.bleed).format('0,0')
            }}/s)
          </q-chip>
          <q-chip>
            Discharge resistance {{ numeral(resistance.discharge.block).format('0,0') }} ({{
              numeral(resistance.discharge.bleed).format('0,0')
            }}/s)
          </q-chip>
          <q-chip>
            Corrosion resistance {{ numeral(resistance.corrosion.block).format('0,0') }} ({{
              numeral(resistance.corrosion.bleed).format('0,0')
            }}/s)
          </q-chip>
          <q-chip>
            Leak resistance {{ numeral(resistance.leak.block).format('0,0') }} ({{
              numeral(resistance.leak.bleed).format('0,0')
            }}/s)
          </q-chip>
          <q-chip>
            Burn resistance {{ numeral(resistance.burn.block).format('0,0') }} ({{
              numeral(resistance.burn.bleed).format('0,0')
            }}/s)
          </q-chip>
        </q-card-section>
        <q-card-section>
          <q-chip>
            javelin {{ numeral(ammo.javelin.free).format('0,0') }} /{{
              numeral(ammo.javelin.total).format('0,0')
            }}
          </q-chip>
        </q-card-section>
        <q-card-section>
          <q-chip>
            Anchor point {{ numeral(attachments['anchor point'].free).format('0,0') }} /{{
              numeral(attachments['anchor point'].total).format('0,0')
            }}
          </q-chip>
          <q-chip>
            Spinal mount {{ numeral(attachments['spinal mount'].free).format('0,0') }} /{{
              numeral(attachments['spinal mount'].total).format('0,0')
            }}
          </q-chip>
          <q-chip>
            Magnetic nozzle {{ numeral(attachments['magnetic nozzle'].free).format('0,0') }} /{{
              numeral(attachments['magnetic nozzle'].total).format('0,0')
            }}
          </q-chip>
          <q-chip>
            Lasing power {{ numeral(attachments['lasing power'].free).format('0,0') }} /{{
              numeral(attachments['lasing power'].total).format('0,0')
            }}
          </q-chip>
        </q-card-section>
      </q-card-section>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import OutfitEntry from 'components/outfit-selector/OutfitEntry.vue';
import ShipEntry from 'components/ship-selector/ShipEntry.vue';
import { storeToRefs } from 'pinia';
import { type Design, useDesign } from 'src/model/design';
import { type Outfit, useGameDataStore } from 'stores/game-data';
import { computed, ref } from 'vue';
import numeral from 'numeral';

const { data } = storeToRefs(useGameDataStore());
const design = defineModel<Design>({ required: true });

const {
  cost,
  space,
  mass,
  shields,
  hull,
  movement,
  energy,
  fuel,
  heat,
  scan,
  opacity,
  smuggling,
  boarding,
  jamming,
  antiMissile,
  resistance,
  ammo,
  attachments,
} = useDesign(design.value);

const shipCategoryOrder = [
  'Transport',
  'Space Liner',
  'Light Freighter',
  'Heavy Freighter',
  'Utility',
  'Interceptor',
  'Light Warship',
  'Medium Warship',
  'Heavy Warship',
  'Superheavy',
  'Fighter',
  'Drone',
];

const shipOptions = computed(() =>
  Object.values(data.value.ships).sort((a, b) => {
    let idxA = shipCategoryOrder.indexOf(a.category);
    let idxB = shipCategoryOrder.indexOf(b.category);
    idxA = idxA == -1 ? shipCategoryOrder.length : idxA;
    idxB = idxB == -1 ? shipCategoryOrder.length : idxB;
    if (idxA != idxB) {
      return idxA - idxB;
    }
    const catCmp = a.category.localeCompare(b.category);
    if (catCmp != 0) {
      return catCmp;
    }

    return a.name.localeCompare(b.name);
  }),
);

const newOutfit = ref<Outfit | undefined>();
const incOutfit = (outfit: Outfit) => {
  const prev = design.value.outfits.get(outfit) ?? 0;
  design.value.outfits.set(outfit, prev + 1);
};
const decOutfit = (outfit: Outfit) => {
  const prev = design.value.outfits.get(outfit) ?? 0;
  if (prev <= 1) {
    design.value.outfits.delete(outfit);
  } else {
    design.value.outfits.set(outfit, prev - 1);
  }
};
const addOutfit = () => {
  if (!newOutfit.value) return;
  incOutfit(newOutfit.value);
};

const outfitCategoryOrder = [
  'Guns',
  'Turrets',
  'Secondary Weapons',
  'Ammunition',
  'Systems',
  'Power',
  'Engines',
  'Hand to Hand',
  'Unique',
  'Special',
];

const seriesOrder = [
  'Cooling',
  'Shields',
  'Jammers',
  'Ramscoops',
  'Drives',
  'Scanners',
  'Functional Unique',
  'Expansions',
  'Passenger',
  'Fuel',
  'Special Systems',
  'H2H',
  'Fortifications',
  'Non-Functional Unique',
  'Licenses',
];

const outfitOptions = computed(() =>
  Object.values(data.value.outfits).sort((a, b) => {
    let idxA = outfitCategoryOrder.indexOf(a.category);
    let idxB = outfitCategoryOrder.indexOf(b.category);
    idxA = idxA == -1 ? outfitCategoryOrder.length : idxA;
    idxB = idxB == -1 ? outfitCategoryOrder.length : idxB;
    if (idxA != idxB) {
      return idxA - idxB;
    }
    const catCmp = a.category.localeCompare(b.category);
    if (catCmp != 0) {
      return catCmp;
    }

    idxA = seriesOrder.indexOf(a.series ?? '');
    idxB = seriesOrder.indexOf(b.series ?? '');
    idxA = idxA == -1 ? seriesOrder.length : idxA;
    idxB = idxB == -1 ? seriesOrder.length : idxB;
    if (idxA != idxB) {
      return idxA - idxB;
    }
    const seriesCmp = (a.series ?? 'ZZZZZZZZ').localeCompare(b.series ?? 'ZZZZZZZZ');
    if (seriesCmp != 0) {
      return seriesCmp;
    }

    idxA = a.index ?? 0;
    idxB = b.index ?? 0;
    if (idxA != idxB) {
      return idxA - idxB;
    }

    return a.name.localeCompare(b.name);
  }),
);
</script>
