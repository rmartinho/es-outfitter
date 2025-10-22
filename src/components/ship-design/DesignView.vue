<template>
  <q-list bordered class="rounded-borders">
    <q-item>
      <scalar-datum :value="cost" unit="¤" label="cost" description="Cost" />
    </q-item>

    <q-separator />

    <q-expansion-item hide-expand-icon>
      <template #header>
        <capacity-datum :value="space.outfits" label="outfits" description="Outfit space" />
      </template>
      <q-item>
        <capacity-datum :value="space.engines" label="engines" description="Engine space" />
      </q-item>
      <q-expansion-item hide-expand-icon>
        <template #header>
          <capacity-datum :value="space.weapons" label="weapons" description="Weapon space" />
        </template>
        <q-item>
          <capacity-datum :value="space.guns" label="guns" description="Gun ports" />
        </q-item>
        <q-item>
          <capacity-datum :value="space.turrets" label="turrets" description="Turret mounts" />
        </q-item>
      </q-expansion-item>
      <q-item>
        <capacity-datum :value="space.bunks" label="bunks" description="Bunk space" />
      </q-item>
      <template v-if="space.bays > 0">
        <q-item>
          <scalar-datum :value="space.bays" label="bays" description="Fighter bays" />
        </q-item>
      </template>
      <q-item>
        <scalar-datum :value="mass.unladen" unit="t" label="mass" description="Empty mass" />
      </q-item>
      <q-item>
        <scalar-datum :value="space.cargo" unit="t" label="cargo" description="Cargo space" />
      </q-item>
    </q-expansion-item>

    <q-separator />

    <q-expansion-item hide-expand-icon>
      <template #header="{ expanded }">
        <template v-if="expanded">
          <scalar-datum :value="shields.total" label="shields" description="Shield capacity" />
          <template v-if="shields.charge > 0">
            <scalar-datum :value="shields.charge" unit="/s" label="charge" />
          </template>
          <template v-if="shields.delayedCharge > 0">
            <scalar-datum :value="shields.delayedCharge" unit="/s" label="delayed" />
          </template>
        </template>
        <template v-else>
          <scalar-datum :value="shields.total" label="shields" description="Shields & hull" />
          <scalar-datum :value="hull.total" label="hull" />
        </template>
      </template>
      <q-item>
        <scalar-datum :value="hull.total" label="hull" description="Hull strength" />
        <template v-if="hull.repair > 0">
          <scalar-datum :value="hull.repair" unit="/s" label="repair" />
        </template>
        <template v-if="hull.delayedRepair > 0">
          <scalar-datum :value="hull.delayedRepair" unit="/s" label="delayed" />
        </template>
      </q-item>
    </q-expansion-item>

    <q-separator />

    <q-expansion-item hide-expand-icon>
      <template #header="{ expanded }">
        <template v-if="expanded">
          <scalar-datum
            :value="movement.forward.maxSpeed"
            unit="m/s"
            label="speed"
            description="Maximum speed"
          />
        </template>
        <template v-else>
          <scalar-datum
            :value="movement.forward.laden"
            unit="m/s²"
            label="thrust"
            description="Movement"
          />
          <scalar-datum :value="movement.turn.laden" unit="°/s" label="turn" />
        </template>
      </template>

      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">thrust</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="movement.forward.laden" unit="m/s²" label="full" />
            <scalar-datum :value="movement.forward.unladen" unit="m/s²" label="empty" />
          </q-item>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">turn</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="movement.turn.laden" unit="°/s" label="full" />
            <scalar-datum :value="movement.turn.unladen" unit="°/s" label="empty" />
          </q-item>
        </q-item-section>
      </q-item>
      <template v-if="movement.reverse.laden > 0">
        <q-item>
          <q-item-section class="col-2">
            <q-item-label class="text-grey text-right">reverse</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item dense>
              <scalar-datum :value="movement.reverse.laden" unit="m/s²" label="full" />
              <scalar-datum :value="movement.reverse.unladen" unit="m/s²" label="empty" />
            </q-item>
          </q-item-section>
        </q-item>
      </template>
      <template v-if="movement.afterburner.laden > 0">
        <q-item>
          <q-item-section class="col-2">
            <q-item-label class="text-grey text-right">afterburn</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item dense>
              <scalar-datum :value="movement.afterburner.laden" unit="m/s²" label="full" />
              <scalar-datum :value="movement.afterburner.unladen" unit="m/s²" label="empty" />
            </q-item>
          </q-item-section>
        </q-item>
      </template>
    </q-expansion-item>

    <q-separator />

    <q-expansion-item hide-expand-icon>
      <template #header="{ expanded }">
        <template v-if="expanded">
          <scalar-datum
            :value="energy.capacity"
            unit="kJ"
            label="energy"
            description="Energy capacity"
          />
        </template>
        <template v-else>
          <scalar-datum
            :value="energy.idle.duration"
            unit="s"
            :label="energy.idle.rate > 0 ? 'idle charge' : 'idle disch'"
          />
          <scalar-datum
            :value="energy.peak.duration"
            unit="s"
            :label="energy.peak.rate > 0 ? 'peak charge' : 'peak disch'"
          />
        </template>
      </template>

      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">idle</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="energy.idle.rate" unit="kW" label="power" />
            <template v-if="energy.idle.rate != 0">
              <scalar-datum
                :value="energy.idle.duration"
                unit="s"
                :label="energy.idle.rate > 0 ? 'charge' : 'disch'"
              />
            </template>
          </q-item>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">move</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="-energy.moving.rate" unit="kW" label="power" />
            <template v-if="energy.moving.rate != 0">
              <scalar-datum
                :value="energy.moving.duration"
                unit="s"
                :label="-energy.moving.rate > 0 ? 'charge' : 'disch'"
              />
            </template>
          </q-item>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">fire</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="-energy.firing.rate" unit="kW" label="power" />
            <template v-if="energy.firing.rate != 0">
              <scalar-datum
                :value="energy.firing.duration"
                unit="s"
                :label="-energy.firing.rate > 0 ? 'charge' : 'disch'"
              />
            </template>
          </q-item>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">recover</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="-energy.recovering.rate" unit="kW" label="power" />
            <template v-if="energy.recovering.rate != 0">
              <scalar-datum
                :value="energy.recovering.duration"
                unit="s"
                :label="-energy.recovering.rate > 0 ? 'charge' : 'disch'"
              />
            </template>
          </q-item>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">peak</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="energy.peak.rate" unit="kW" label="power" />
            <template v-if="energy.peak.rate != 0">
              <scalar-datum
                :value="energy.peak.duration"
                unit="s"
                :label="energy.peak.rate > 0 ? 'charge' : 'disch'"
              />
            </template>
          </q-item>
        </q-item-section>
      </q-item>
    </q-expansion-item>

    <q-separator />

    <q-expansion-item hide-expand-icon>
      <template #header="{ expanded }">
        <template v-if="expanded">
          <scalar-datum :value="fuel.capacity" unit="L" label="fuel" description="Fuel capacity" />
        </template>
        <template v-else>
          <scalar-datum
            :value="fuel.idle.duration"
            unit="s"
            :label="fuel.idle.rate > 0 ? 'idle jump' : 'idle empty'"
          />
          <scalar-datum
            :value="fuel.peak.duration"
            unit="s"
            :label="fuel.peak.rate > 0 ? 'peak jump' : 'peak empty'"
          />
        </template>
      </template>

      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">idle</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="fuel.idle.rate" unit="L/s" label="flow" />
            <template v-if="fuel.idle.rate != 0">
              <scalar-datum
                :value="fuel.idle.duration"
                unit="s"
                :label="fuel.idle.rate > 0 ? 'jump' : 'empty'"
              />
            </template>
          </q-item>
        </q-item-section>
      </q-item>
      <template v-if="fuel.moving.rate != 0">
        <q-item>
          <q-item-section class="col-2">
            <q-item-label class="text-grey text-right">move</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item dense>
              <scalar-datum :value="-fuel.moving.rate" unit="L/s" label="flow" />
              <template v-if="fuel.moving.rate != 0">
                <scalar-datum
                  :value="fuel.moving.duration"
                  unit="s"
                  :label="-fuel.moving.rate > 0 ? 'jump' : 'empty'"
                />
              </template>
            </q-item>
          </q-item-section>
        </q-item>
      </template>
      <template v-if="fuel.firing.rate != 0">
        <q-item>
          <q-item-section class="col-2">
            <q-item-label class="text-grey text-right">fire</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item dense>
              <scalar-datum :value="-fuel.firing.rate" unit="L/s" label="flow" />
              <template v-if="fuel.firing.rate != 0">
                <scalar-datum
                  :value="fuel.firing.duration"
                  unit="s"
                  :label="-fuel.firing.rate > 0 ? 'jump' : 'empty'"
                />
              </template>
            </q-item>
          </q-item-section>
        </q-item>
      </template>
      <template v-if="fuel.recovering.rate != 0">
        <q-item>
          <q-item-section class="col-2">
            <q-item-label class="text-grey text-right">recover</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item dense>
              <scalar-datum :value="-fuel.recovering.rate" unit="L/s" label="flow" />
              <template v-if="fuel.recovering.rate != 0">
                <scalar-datum
                  :value="fuel.recovering.duration"
                  unit="s"
                  :label="-fuel.recovering.rate > 0 ? 'jump' : 'empty'"
                />
              </template>
            </q-item>
          </q-item-section>
        </q-item>
      </template>
      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">peak</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="fuel.peak.rate" unit="L/s" label="flow" />
            <template v-if="fuel.peak.rate != 0">
              <scalar-datum
                :value="fuel.peak.duration"
                unit="s"
                :label="fuel.peak.rate > 0 ? 'jump' : 'empty'"
              />
            </template>
          </q-item>
        </q-item-section>
      </q-item>
    </q-expansion-item>

    <q-separator />

    <q-expansion-item hide-expand-icon>
      <template #header="{ expanded }">
        <template v-if="expanded">
          <scalar-datum :value="heat.capacity" unit="kJ" label="heat" description="Heat capacity" />
        </template>
        <template v-else>
          <scalar-datum
            :value="(100 * heat.idle.equilibrium) / heat.capacity"
            unit="%"
            label="idle temp"
          />
          <scalar-datum
            :value="(100 * heat.peak.equilibrium) / heat.capacity"
            unit="%"
            label="peak temp"
          />
        </template>
      </template>

      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">idle</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="heat.idle.rate" unit="kW" label="power" />
            <template v-if="Math.round((100 * heat.idle.equilibrium) / heat.capacity) != 0">
              <scalar-datum
                :value="(100 * heat.idle.equilibrium) / heat.capacity"
                unit="%"
                label="eq"
              />
            </template>
          </q-item>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">move</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="heat.moving.rate" unit="kW" label="power" />
            <template v-if="Math.round((100 * heat.moving.equilibrium) / heat.capacity) != 0">
              <scalar-datum
                :value="(100 * heat.moving.equilibrium) / heat.capacity"
                unit="%"
                label="eq"
              />
            </template>
          </q-item>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">fire</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="heat.firing.rate" unit="kW" label="power" />
            <template v-if="Math.round((100 * heat.firing.equilibrium) / heat.capacity) != 0">
              <scalar-datum
                :value="(100 * heat.firing.equilibrium) / heat.capacity"
                unit="%"
                label="eq"
              />
            </template>
          </q-item>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">recover</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="heat.recovering.rate" unit="kW" label="power" />
            <template v-if="Math.round((100 * heat.recovering.equilibrium) / heat.capacity) != 0">
              <scalar-datum
                :value="(100 * heat.recovering.equilibrium) / heat.capacity"
                unit="%"
                label="eq"
              />
            </template>
          </q-item>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">peak</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="heat.peak.rate" unit="kW" label="power" />
            <template v-if="heat.peak.rate != 0">
              <scalar-datum
                :value="(100 * heat.peak.equilibrium) / heat.capacity"
                unit="%"
                label="eq"
              />
            </template>
          </q-item>
        </q-item-section>
      </q-item>
    </q-expansion-item>

    <q-separator />

    <q-expansion-item hide-expand-icon>
      <template #header="{ expanded }">
        <template v-if="expanded">
          <q-item-section class="col-2">
            <q-item-label class="text-grey text-right">outfit</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item dense>
              <scalar-datum :value="scan.outfit.distance" unit="m" label="range" />
              <scalar-datum :value="scan.outfit.duration" unit="s" label="time" />
            </q-item>
          </q-item-section>
        </template>
        <template v-else>
          <scalar-datum
            :value="scan.outfit.duration"
            unit="s"
            label="outfit scan"
            description="Scanners"
          />
          <scalar-datum :value="scan.cargo.duration" unit="s" label="cargo scan" />
        </template>
      </template>

      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">cargo</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="scan.cargo.distance" unit="m" label="range" />
            <scalar-datum :value="scan.cargo.duration" unit="s" label="time" />
          </q-item>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">tactical</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="scan.tactical.distance" unit="m" label="range" />
          </q-item>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">asteroid</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="scan.asteroid.distance" unit="m" label="range" />
          </q-item>
        </q-item-section>
      </q-item>
    </q-expansion-item>

    <q-separator />

    <q-expansion-item hide-expand-icon>
      <template #header="{ expanded }">
        <template v-if="expanded">
          <scalar-datum
            :value="100 * (1 - opacity.outfit / space.outfits.total)"
            unit="%"
            label="outfit opacity"
          />
          <scalar-datum
            :value="100 * (1 - opacity.cargo / space.cargo)"
            unit="%"
            label="cargo opacity"
          />
        </template>
        <template v-else>
          <scalar-datum
            :value="100 * (1 - opacity.cargo / space.cargo)"
            unit="%"
            label="cargo opacity"
            description="Smuggling"
          />
          <scalar-datum :value="100 * smuggling.interference" unit="%" label="interf" />
        </template>
      </template>

      <q-item>
        <scalar-datum :value="smuggling.concealment" unit="t" label="conceal" />
        <scalar-datum :value="100 * smuggling.interference" unit="%" label="interf" />
      </q-item>
    </q-expansion-item>

    <q-separator />

    <q-expansion-item hide-expand-icon>
      <template #header>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">jamming</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="100 * jamming.radar" unit="%" label="radar" />
            <scalar-datum :value="100 * jamming.optical" unit="%" label="optical" />
          </q-item>
        </q-item-section>
      </template>

      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">anti missile</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="antiMissile.strength" label="factor" />
            <scalar-datum :value="antiMissile.rate" unit="/s" label="rate" />
          </q-item>
        </q-item-section>
      </q-item>
    </q-expansion-item>

    <q-separator />

    <q-expansion-item hide-expand-icon>
      <template #header="{ expanded }">
        <template v-if="expanded">
          <q-item-section class="col-2">
            <q-item-label class="text-grey text-right">disruption</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item dense>
              <scalar-datum :value="resistance.disruption.block" label="block" />
              <scalar-datum :value="resistance.disruption.bleed" unit="/s" label="bleed" />
            </q-item>
          </q-item-section>
        </template>
        <template v-else>
          <q-item-section class="col-2">
            <q-item-label class="text-grey text-right">resistances</q-item-label>
          </q-item-section>
        </template>
      </template>

      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">ion</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="resistance.ion.block" label="block" />
            <scalar-datum :value="resistance.ion.bleed" unit="/s" label="bleed" />
          </q-item>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">scramble</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="resistance.scramble.block" label="block" />
            <scalar-datum :value="resistance.scramble.bleed" unit="/s" label="bleed" />
          </q-item>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">slowing</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="resistance.slowing.block" label="block" />
            <scalar-datum :value="resistance.slowing.bleed" unit="/s" label="bleed" />
          </q-item>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">discharge</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="resistance.discharge.block" label="block" />
            <scalar-datum :value="resistance.discharge.bleed" unit="/s" label="bleed" />
          </q-item>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">corrosion</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="resistance.corrosion.block" label="block" />
            <scalar-datum :value="resistance.corrosion.bleed" unit="/s" label="bleed" />
          </q-item>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">leak</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="resistance.leak.block" label="block" />
            <scalar-datum :value="resistance.leak.bleed" unit="/s" label="bleed" />
          </q-item>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="col-2">
          <q-item-label class="text-grey text-right">burn</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item dense>
            <scalar-datum :value="resistance.burn.block" label="block" />
            <scalar-datum :value="resistance.burn.bleed" unit="/s" label="bleed" />
          </q-item>
        </q-item-section>
      </q-item>
    </q-expansion-item>
  </q-list>
</template>

<script setup lang="ts">
import ScalarDatum from './ScalarDatum.vue';
import CapacityDatum from './CapacityDatum.vue';
import { type Design, useDesign } from 'src/model/design';

const { design } = defineProps<{ design: Design }>();

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
  jamming,
  antiMissile,
  resistance,
  // boarding,
  // ammo,
  // attachments,
} = useDesign(design);
</script>
