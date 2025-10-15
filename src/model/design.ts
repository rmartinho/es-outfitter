import type { Ship, Outfit, Variant, Attributes, AttributeKey } from 'src/stores/game-data';
import { computed, ref, toRefs } from 'vue';

type Capacity = {
  free: number;
  total: number;
};

type Mass = {
  unladen: number;
  laden: number;
};

type Accel = {
  maxSpeed: number;
  unladen: number;
  laden: number;
};

type Speed = Omit<Accel, 'maxSpeed'>;

type Power = {
  rate: number;
  duration: number;
};

type Equilibrium = {
  rate: number;
  equilibrium: number;
};

type Scanner = {
  distance: number;
  duration: number;
};

type Resistance = {
  bleed: number;
  block: number;
};

export type Design = {
  ship: Ship;
  variant: Variant | undefined;
  outfits: Map<Outfit, number>;
};

export function useDesign(design: Design) {
  const { ship, variant, outfits } = toRefs(design);
  const parts = computed(() => {
    const parts = new Map<Attributes, number>(outfits.value);
    parts.set(
      {
        ...ship.value,
        'gun ports':
          variant.value?.['gun ports'] != undefined ? undefined : ship.value['gun ports'],
        'turret mounts':
          variant.value?.['turret mounts'] != undefined ? undefined : ship.value['turret mounts'],
        'fighter bays':
          variant.value?.['fighter bays'] != undefined ? undefined : ship.value['fighter bays'],
      },
      1,
    );
    if (variant.value) {
      parts.set(variant.value, 1);
    }

    return parts.entries().toArray();
  });

  const star = ref({ power: 1, wind: 0.64 });

  const cost = computed(() => sum(parts.value, 'cost'));

  const crew = computed(() => sum(parts.value, 'required crew'));

  const space = computed(() => {
    const totalBunks = sum(parts.value, 'bunks');
    return {
      guns: capacity(parts.value, 'gun ports'),
      turrets: capacity(parts.value, 'turret mounts'),
      bays: sumPositive(parts.value, 'fighter bays'),
      outfits: capacity(parts.value, 'outfit space'),
      weapons: capacity(parts.value, 'weapon capacity'),
      engines: capacity(parts.value, 'engine capacity'),
      cargo: sum(parts.value, 'cargo space'),
      bunks: {
        total: totalBunks,
        free: totalBunks - crew.value,
      },
    };
  });

  const mass = computed(() => {
    const unladen = sum(parts.value, 'mass');
    return {
      unladen,
      laden: unladen + sum(parts.value, 'cargo space'),
    };
  });

  const inertia = computed(() => {
    const reduction = 1 + sum(parts.value, 'inertia reduction');
    return {
      unladen: mass.value.unladen / reduction,
      laden: mass.value.laden / reduction,
    };
  });

  const drag = computed(() => {
    const base = sum(parts.value, 'drag');
    const reduction = 1 + sum(parts.value, 'drag reduction');
    return Math.min(base / reduction, inertia.value.unladen);
  });

  const shields = computed(() => {
    return {
      total: sum(parts.value, 'shields'),
      charge: sum(parts.value, 'shield generation'),
      delayedCharge: sum(parts.value, 'delayed shield generation'),
    };
  });

  const hull = computed(() => {
    return {
      total: sum(parts.value, 'hulls'),
      repair: sum(parts.value, 'hull repair'),
      delayedRepair: sum(parts.value, 'delayed hull repair'),
    };
  });

  const movement = computed(() => {
    return {
      forward: accel(parts.value, 'thrust', drag.value, inertia.value),
      turn: speed(parts.value, 'turn', inertia.value),
      reverse: accel(parts.value, 'reverse thrust', drag.value, inertia.value),
      afterburner: accel(parts.value, 'afterburner thrust', drag.value, inertia.value),
    };
  });

  const energy = computed(() => {
    const generate = sum(parts.value, 'energy generation');
    const consume = sum(parts.value, 'energy consumption');
    const solar = sum(parts.value, 'solar collection') * star.value.power;
    const cooling = sum(parts.value, 'cooling energy');

    const capacity = sum(parts.value, 'energy capacity');
    const idle = generate + solar - consume - cooling;

    const thrusting = sum(parts.value, 'thrusting energy');
    const turning = sum(parts.value, 'turning energy');
    const moving = thrusting + turning;

    const firing = sumFraction(parts.value, 'firing energy', 'reload');

    const shield = sum(parts.value, 'shield energy');
    const dShield = sum(parts.value, 'delayed shield energy');
    const hull = sum(parts.value, 'hull energy');
    const dHull = sum(parts.value, 'delayed hull energy');
    const recovering = shield + Math.max(0, dShield) + hull + Math.max(0, dHull);

    const peak = idle - Math.max(0, moving) - Math.max(0, firing) - Math.max(0, recovering);

    return {
      capacity,
      idle: power(idle, 0, capacity),
      peak: power(peak, 0, capacity),
      moving: power(moving, idle, capacity),
      firing: power(firing, idle, capacity),
      recovering: power(recovering, idle, capacity),
    };
  });

  const fuel = computed(() => {
    const generate = sum(parts.value, 'fuel generation');
    const consume = sum(parts.value, 'fuel consumption');
    const solar = Math.sqrt(sum(parts.value, 'ramscoop')) * star.value.wind * 0.03;
    const cooling = sum(parts.value, 'cooling fuel');

    const jump = parts.value.reduce(
      (acc, [o]) => (o['jump fuel'] ? Math.min(o['jump fuel'], acc) : acc),
      Infinity,
    );

    const capacity = sum(parts.value, 'fuel capacity');
    const idle = generate + solar - consume - cooling;

    const thrusting = sum(parts.value, 'thrusting fuel');
    const turning = sum(parts.value, 'turning fuel');
    const moving = thrusting + turning;

    const firing = sumFraction(parts.value, 'firing fuel', 'reload');

    const shield = sum(parts.value, 'shield fuel');
    const dShield = sum(parts.value, 'delayed shield fuel');
    const hull = sum(parts.value, 'hull fuel');
    const dHull = sum(parts.value, 'delayed hull fuel');
    const recovering = shield + Math.max(0, dShield) + hull + Math.max(0, dHull);

    const peak = idle - Math.max(0, moving) - Math.max(0, firing) - Math.max(0, recovering);

    return {
      capacity,
      idle: power(idle, 0, jump),
      peak: power(peak, 0, jump),
      moving: power(moving, idle, jump),
      firing: power(firing, idle, jump),
      recovering: power(recovering, idle, jump),
    };
  });

  const heat = computed(() => {
    const capacity = 100 * (mass.value.unladen + sum(parts.value, 'heat capacity'));
    const inefficiency = sum(parts.value, 'cooling inefficiency');
    const efficiency =
      2 + 2 / (1 + Math.exp(inefficiency / -2)) - 4 / (1 + Math.exp(inefficiency / -4));
    const dissipation = sum(parts.value, 'heat dissipation') / 1000;

    const generate = sum(parts.value, 'heat generation');
    const solar = sum(parts.value, 'solar heat') * star.value.power;

    const passive = efficiency * sum(parts.value, 'cooling');
    const active = efficiency * sum(parts.value, 'active cooling');
    const maxDissipation = dissipation + active / capacity;

    const idle = generate + solar - passive;

    const thrusting = sum(parts.value, 'thrusting heat');
    const turning = sum(parts.value, 'turning heat');
    const moving = thrusting + turning;

    const firing = sumFraction(parts.value, 'firing heat', 'reload');

    const shield = sum(parts.value, 'shield heat');
    const dShield = sum(parts.value, 'delayed shield heat');
    const hull = sum(parts.value, 'hull heat');
    const dHull = sum(parts.value, 'delayed hull heat');
    const recovering = shield + Math.max(0, dShield) + hull + Math.max(0, dHull);

    const peak =
      generate - passive + Math.max(0, moving) + Math.max(0, firing) + Math.max(0, recovering);

    return {
      capacity,
      idle: equilibrium(idle, maxDissipation, capacity, -active - maxDissipation * capacity),
      peak: equilibrium(peak, maxDissipation, capacity),
      moving: equilibrium(moving, maxDissipation, capacity),
      firing: equilibrium(firing, maxDissipation, capacity),
      recovering: equilibrium(recovering, maxDissipation, capacity),
    };
  });

  const scan = computed(() => {
    const outfitPower = sum(parts.value, 'outfit scan power');
    const outfitEfficiency = sum(parts.value, 'outfit scan efficiency');

    const cargoPower = sum(parts.value, 'cargo scan power');
    const cargoEfficiency = sum(parts.value, 'cargo scan efficiency');

    const asteroidPower = sum(parts.value, 'asteroid scan power');

    const tacticalPower = sum(parts.value, 'tactical scan power');

    return {
      outfit: scanner(outfitPower, outfitEfficiency, 15),
      cargo: scanner(cargoPower, cargoEfficiency, 5),
      asteroid: scanner(asteroidPower),
      tactical: scanner(tacticalPower),
    };
  });

  const opacity = computed(() => {
    const outfit = sum(parts.value, 'outfit scan opacity');
    const cargo = sum(parts.value, 'cargo scan opacity');
    return {
      outfit: space.value.outfits.total + outfit,
      cargo: space.value.cargo + cargo,
    };
  });

  const smuggling = computed(() => {
    const concealment = sum(parts.value, 'scan concealment');
    const interference = 1 - 1 / (1 + sum(parts.value, 'scan interference'));

    return {
      concealment,
      interference,
    };
  });

  const boarding = computed(() => {
    const attack = sum(parts.value, 'capture attack'); // TODO wrong pick max instead
    const defense = sum(parts.value, 'capture defense');

    return {
      attack,
      defense,
    };
  });

  const jamming = computed(() => {
    const radar = 1 - 1 / (1 + sum(parts.value, 'radar jamming'));
    const optical = 1 - 1 / (1 + sum(parts.value, 'optical jamming'));

    return {
      radar,
      optical,
    };
  });

  const antiMissile = computed(() => {
    const rate = parts.value.reduce(
      (acc, [o, n]) => (n * ((o['anti-missile'] ?? 0) > 0 ? 1 : 0)) / (o['reload'] ?? 1) + acc,
      0,
    );
    const invReloadSum = parts.value.reduce(
      (acc, [o, n]) => n * ((o['anti-missile'] ?? 0) > 0 ? 1 / (o['reload'] ?? 1) : 0) + acc,
      0,
    );
    const strength = sumFraction(parts.value, 'anti-missile', 'reload') / invReloadSum;

    return {
      rate: FPS * rate,
      strength,
    };
  });

  const resistance = computed(() => {
    return {
      disruption: resist(parts.value, 'disruption resistance', 'disruption protection'),
      ion: resist(parts.value, 'ion resistance', 'ion protection'),
      scramble: resist(parts.value, 'scramble resistance', 'scramble protection'),
      slowing: resist(parts.value, 'slowing resistance', 'slowing protection'),
      discharge: resist(parts.value, 'discharge resistance', 'discharge protection'),
      corrosion: resist(parts.value, 'corrosion resistance', 'corrosion protection'),
      leak: resist(parts.value, 'leak resistance', 'leak protection'),
      burn: resist(parts.value, 'burn resistance', 'burn protection'),
    };
  });

  const ammo = computed(() => {
    return {
      javelin: capacity(parts.value, 'javelin capacity'),
      meteor: capacity(parts.value, 'meteor capacity'),
      sidewinder: capacity(parts.value, 'sidewinder capacity'),
      heavy: capacity(parts.value, 'heavy capacity'),
      torpedo: capacity(parts.value, 'torpedo capacity'),
      typhoon: capacity(parts.value, 'typhoon capacity'),
      gatling: capacity(parts.value, 'gatling capacity'),
      tracker: capacity(parts.value, 'tracker capacity'),
      railgun: capacity(parts.value, 'railgun capacity'),
      emp: capacity(parts.value, 'emp capacity'),
      teciimach: capacity(parts.value, 'teciimach capacity'),
      firelight: capacity(parts.value, 'firelight capacity'),
      firestorm: capacity(parts.value, 'firestorm capacity'),
      piercer: capacity(parts.value, 'piercer capacity'),
      mine: capacity(parts.value, 'mine capacity'),
      speck: capacity(parts.value, 'speck capacity'),
      nettle: capacity(parts.value, 'nettle capacity'),
      orchid: capacity(parts.value, 'orchid capacity'),
      ophrys: capacity(parts.value, 'ophrys capacity'),
      finisher: capacity(parts.value, 'finisher capacity'),
      thunderhead: capacity(parts.value, 'thunderhead capacity'),
      swarm: capacity(parts.value, 'swarm capacity'),
      spike: capacity(parts.value, 'spike capacity'),
      'star tail': capacity(parts.value, 'star tail capacity'),
    };
  });

  const attachments = computed(() => {
    return {
      'anchor point': capacity(parts.value, 'anchor point'),
      'spinal mount': capacity(parts.value, 'spinal mount'),
      'magnetic nozzle': capacity(parts.value, 'magnetic nozzle'),
      'lasing power': capacity(parts.value, 'lasing power'),
    };
  });

  return {
    star,
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
  };
}

function sum(parts: Array<[Attributes, number]>, key: AttributeKey): number {
  return parts.reduce((acc, [o, n]) => n * (o[key] ?? 0) + acc, 0);
}

function sumPositive(parts: Array<[Attributes, number]>, key: AttributeKey): number {
  return parts
    .filter(([o]) => (o[key] ?? 0) > 0)
    .reduce((acc, [o, n]) => n * (o[key] ?? 0) + acc, 0);
}

function sumFraction(
  parts: Array<[Attributes, number]>,
  denominator: AttributeKey,
  numerator: AttributeKey,
): number {
  return parts.reduce((acc, [o, n]) => (n * (o[denominator] ?? 0)) / (o[numerator] ?? 1) + acc, 0);
}

function capacity(parts: Array<[Attributes, number]>, key: AttributeKey): Capacity {
  return {
    total: sumPositive(parts, key),
    free: sum(parts, key),
  };
}

function accel(
  parts: Array<[Attributes, number]>,
  key: AttributeKey,
  drag: number,
  inertia: Mass,
): Accel {
  const force = sum(parts, key);
  const max = force / drag;
  const unladen = force / inertia.unladen;
  const laden = force / inertia.laden;
  return {
    maxSpeed: FPS * max,
    laden: FPS * FPS * laden,
    unladen: FPS * FPS * unladen,
  };
}

function speed(parts: Array<[Attributes, number]>, key: AttributeKey, inertia: Mass): Speed {
  const force = sum(parts, key);
  const unladen = force / inertia.unladen;
  const laden = force / inertia.laden;
  return {
    laden: FPS * laden,
    unladen: FPS * unladen,
  };
}

function power(rate: number, idle: number, capacity: number): Power {
  return {
    rate: FPS * rate,
    duration: Math.abs(capacity / (FPS * (idle - rate))),
  };
}

function equilibrium(
  prod: number,
  dissipation: number,
  capacity: number,
  additional: number = 0,
): Equilibrium {
  void capacity; // TODO cooldown time
  if (dissipation == 0) {
    if (prod == 0) {
      return {
        rate: 0,
        equilibrium: 0,
      };
    } else {
      return {
        rate: prod,
        equilibrium: Infinity,
      };
    }
  }
  return {
    rate: FPS * (prod + additional),
    equilibrium: Math.max(0, prod / dissipation),
  };
}

function scanner(power: number, efficiency?: number, reference: number = 1): Scanner {
  return {
    distance: 100 * Math.sqrt(power),
    duration: efficiency ? Math.sqrt(100 / (efficiency / reference)) : 0,
  };
}

function resist(
  parts: Array<[Attributes, number]>,
  resistanceKey: AttributeKey,
  protectionKey: AttributeKey,
): Resistance {
  const protection = sum(parts, protectionKey);

  return {
    bleed: sum(parts, resistanceKey),
    block: 1 - 1 / (1 + protection),
  };
}

const FPS = 60;
