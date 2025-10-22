<template>
  <q-card>
    <q-card-section horizontal>
      <q-card-section class="q-gutter-md">
        <q-list bordered class="q-gutter-sm rounded-borders">
          <q-select
            filled
            v-model="design.ship"
            :options="shipOptions"
            option-label="name"
            label="Ship hull"
            hide-selected
            fill-input
            use-input
            input-debounce="0"
            hide-dropdown-icon
            @filter="filterShips"
            @update:model-value="resetVariant"
          >
            <template #before>
              <q-icon name="rocket">
                <q-tooltip>Ship hull</q-tooltip>
              </q-icon>
            </template>
            <template #prepend>
              <q-avatar square>
                <q-img fit="contain" :src="design.ship.thumbnail" />
              </q-avatar>
            </template>
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">No results</q-item-section>
              </q-item>
            </template>
            <template #option="{ itemProps, opt }">
              <ship-entry v-bind="itemProps" :ship="opt" />
            </template>
          </q-select>
          <template v-if="sortedVariants.length > 0">
            <q-select
              filled
              v-model="design.variant"
              :options="variantOptions"
              option-label="name"
              label="Hull variant"
              hide-selected
              fill-input
              use-input
              input-debounce="0"
              clearable
              hide-dropdown-icon
              @filter="filterVariants"
            >
              <template #before>
                <q-icon name="plumbing">
                  <q-tooltip>Hull variant</q-tooltip>
                </q-icon>
              </template>
              <template #prepend v-if="design.variant">
                <q-avatar square>
                  <q-img fit="contain" :src="design.variant.thumbnail ?? design.ship.thumbnail" />
                </q-avatar>
              </template>
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">No results</q-item-section>
                </q-item>
              </template>
              <template #option="{ itemProps, opt }">
                <ship-entry v-bind="itemProps" :ship="opt" />
              </template>
            </q-select>
          </template>
          <q-select
            filled
            v-model="newOutfit"
            :options="outfitOptions"
            option-label="name"
            label="New outfit"
            hide-selected
            fill-input
            use-input
            input-debounce="0"
            clearable
            hide-dropdown-icon
            @filter="filterOutfits"
          >
            <template #before>
              <q-icon name="memory">
                <q-tooltip>Outfits</q-tooltip>
              </q-icon>
            </template>
            <template #after>
              <q-btn round flat icon="add" @click="addOutfit">
                <q-tooltip>Add outfit</q-tooltip>
              </q-btn>
            </template>
            <template #prepend>
              <q-avatar square>
                <q-img fit="contain" :src="newOutfit?.thumbnail" />
              </q-avatar>
            </template>
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">No results</q-item-section>
              </q-item>
            </template>
            <template #option="{ itemProps, opt }">
              <outfit-entry style="height: 3rem" v-bind="itemProps" :outfit="opt" />
            </template>
          </q-select>
        </q-list>
        <q-list bordered class="rounded-borders" style="width: 400px">
          <template v-if="design.outfits.size == 0">
            <q-item style="height: 4rem">
              <q-item-section>
                <q-item-label class="self-center text-grey text-italic">No outfits</q-item-label>
              </q-item-section>
            </q-item>
          </template>
          <template v-else>
            <template v-for="([outfit, count], i) in design.outfits" :key="i">
              <q-item dense style="height: 4rem">
                <q-item-section class="col-auto">
                  <q-btn-group rounded flat>
                    <q-btn dense size="xs" icon="remove" @click="decOutfit(outfit)" />
                    <q-chip square dense>{{ count }}</q-chip>
                    <q-btn dense size="xs" icon="add" @click="incOutfit(outfit)" />
                  </q-btn-group>
                </q-item-section>
                <q-item-section>
                  <outfit-entry :outfit :count />
                </q-item-section>
                <q-space />
                <q-item-section class="col-auto">
                  <q-btn round icon="delete" @click="delOutfit(outfit)" />
                </q-item-section>
              </q-item>
            </template>
          </template>
        </q-list>
      </q-card-section>
      <q-card-section style="max-width: 400px">
        <design-view :design />
        <q-card-section>
          <q-chip>capture attack {{ numeral(boarding.attack).format('0,0') }}</q-chip>
          <q-chip>capture defense {{ numeral(boarding.defense).format('0,0') }}</q-chip>
        </q-card-section>
        <q-card-section>
          <template v-for="key in Object.keys(ammo)" :key>
            <q-chip>
              {{ key }} {{ numeral(ammo[key as keyof typeof ammo].free).format('0,0') }} /{{
                numeral(ammo[key as keyof typeof ammo].total).format('0,0')
              }}
            </q-chip>
          </template>
        </q-card-section>
        <q-card-section>
          <template v-for="key in Object.keys(attachments)" :key>
            <q-chip>
              {{ key }}
              {{ numeral(attachments[key as keyof typeof attachments].free).format('0,0') }} /{{
                numeral(attachments[key as keyof typeof attachments].total).format('0,0')
              }}
            </q-chip>
          </template>
        </q-card-section>
      </q-card-section>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import OutfitEntry from './OutfitEntry.vue';
import ShipEntry from './ShipEntry.vue';
import DesignView from './DesignView.vue';
import { storeToRefs } from 'pinia';
import { type Design, useDesign } from 'src/model/design';
import { type Outfit, useGameDataStore } from 'stores/game-data';
import { computed, ref } from 'vue';
import numeral from 'numeral';

const { data } = storeToRefs(useGameDataStore());
const design = defineModel<Design>({ required: true });

const { boarding, ammo, attachments } = useDesign(design.value);

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

const sortedShips = computed(() =>
  Object.freeze(
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
  ),
);

const shipOptions = computed(() => {
  const name = shipFilter.value.toLowerCase();
  return sortedShips.value.filter((s) => s.name.toLowerCase().indexOf(name) > -1);
});

const sortedVariants = computed(() =>
  Object.freeze(Object.values(data.value.variants).filter((v) => v.base == design.value.ship.name)),
);

const variantOptions = computed(() => {
  const name = variantFilter.value.toLowerCase();
  return sortedVariants.value.filter((v) => v.name.toLowerCase().indexOf(name) > -1);
});
const resetVariant = () => {
  design.value.variant = undefined;
};

const newOutfit = ref<Outfit | undefined>();
const setOutfit = (outfit: Outfit, count: number) => {
  if (count < 0) {
    design.value.outfits.delete(outfit);
  } else {
    design.value.outfits.set(outfit, count);
  }
};
const incOutfit = (outfit: Outfit) => {
  const prev = design.value.outfits.get(outfit) ?? 0;
  setOutfit(outfit, prev + 1);
};
const decOutfit = (outfit: Outfit) => {
  const prev = design.value.outfits.get(outfit) ?? 0;
  setOutfit(outfit, prev - 1);
};
const delOutfit = (outfit: Outfit) => {
  setOutfit(outfit, -1);
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

const sortedOutfits = computed(() =>
  Object.freeze(
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
  ),
);

const outfitOptions = computed(() => {
  const name = outfitFilter.value.toLowerCase();
  return sortedOutfits.value.filter((o) => o.name.toLowerCase().indexOf(name) > -1);
});

const shipFilter = ref('');
const filterShips = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    shipFilter.value = val;
  });
};
const variantFilter = ref('');
const filterVariants = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    variantFilter.value = val;
  });
};
const outfitFilter = ref('');
const filterOutfits = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    outfitFilter.value = val;
  });
};
</script>
