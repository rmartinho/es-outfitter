import { computedAsync } from '@vueuse/core';
import { Octokit } from 'octokit';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { BASE_GAME_OWNER, BASE_GAME_REPO } from 'src/constants';
import { parse } from 'src/model/data';
import { computed, ref, watchEffect } from 'vue';

export type Ship = {
  name: string;
  category: string;
  thumbnail: string;
} & Attributes;

export type Variant = {
  base: string;
  name: string;
  thumbnail?: string;
} & Attributes;

export type Outfit = {
  name: string;
  category: string;
  thumbnail: string;
  index?: number;
  series?: string;
} & Attributes;

export const attributeKeys = [
  'cost',

  'outfit space',
  'weapon capacity',
  'engine capacity',
  'gun ports',
  'turret mounts',
  'fighter bays',

  'bunks',
  'required crew',

  'mass',
  'inertia reduction',
  'cargo space',

  'shields',
  'shield generation',
  'delayed shield generation',

  'hull',
  'hull repair rate',
  'delayed hull repair rate',

  'drag',
  'drag reduction',

  'thrust',
  'turn',
  'reverse thrust',
  'afterburner thrust',

  'energy capacity',
  'energy generation',
  'solar collection',
  'energy consumption',
  'cooling energy',
  'thrusting energy',
  'turning energy',
  'reverse thrusting energy',
  'afterburner energy',
  'firing energy',
  'shield energy',
  'delayed shield energy',
  'hull energy',
  'delayed hull energy',

  'fuel capacity',
  'fuel generation',
  'ramscoop',
  'fuel consumption',
  'cooling fuel',
  'thrusting fuel',
  'turning fuel',
  'reverse thrusting fuel',
  'afterburner fuel',
  'firing fuel',
  'shield fuel',
  'delayed shield fuel',
  'hull fuel',
  'delayed hull fuel',
  'jump fuel',

  'cooling',
  'active cooling',
  'heat dissipation',
  'cooling inefficiency',
  'heat capacity',
  'heat generation',
  'solar heat',
  'heat consumption',
  'cooling heat',
  'thrusting heat',
  'turning heat',
  'reverse thrusting heat',
  'afterburner heat',
  'firing heat',
  'shield heat',
  'delayed shield heat',
  'hull heat',
  'delayed hull heat',

  'outfit scan power',
  'outfit scan efficiency',
  'cargo scan power',
  'cargo scan efficiency',
  'asteroid scan power',
  'tactical scan power',

  'outfit scan opacity',
  'cargo scan opacity',
  'scan concealment',
  'scan interference',

  'capture attack',
  'capture defense',

  'radar jamming',
  'optical jamming',
  'anti-missile',

  'disruption resistance',
  'disruption protection',
  'ion resistance',
  'ion protection',
  'scramble resistance',
  'scramble protection',
  'slowing resistance',
  'slowing protection',
  'discharge resistance',
  'discharge protection',
  'corrosion resistance',
  'corrosion protection',
  'leak resistance',
  'leak protection',
  'burn resistance',
  'burn protection',

  'javelin capacity',
  'meteor capacity',
  'sidewinder capacity',
  'heavy capacity',
  'torpedo capacity',
  'typhoon capacity',
  'gatling capacity',
  'tracker capacity',
  'railgun capacity',
  'emp capacity',
  'teciimach capacity',
  'firelight capacity',
  'firestorm capacity',
  'piercer capacity',
  'mine capacity',
  'speck capacity',
  'nettle capacity',
  'orchid capacity',
  'ophrys capacity',
  'finisher capacity',
  'thunderhead capacity',
  'swarm capacity',
  'spike capacity',
  'star tail capacity',

  'anchor point',
  'spinal mount',
  'magnetic nozzle',
  'lasing power',

  'reload',
] as const;

export type AttributeKey = (typeof attributeKeys)[number];

export type Attributes = {
  [K in AttributeKey]?: number | undefined;
};

export interface PluginData {
  ships: Record<string, Ship>;
  variants: Record<string, Variant>;
  outfits: Record<string, Outfit>;
}

const hiddenShipCategories = ['Unclassified', 'Unclassified Minor'];
const hiddenOutfitCategories = ['Licenses', 'Minerals'];

function parseDataFile(plugin: Plugin, text: string): PluginData {
  const data = parse(text) as PluginData;
  data.variants = Object.fromEntries(
    Object.entries(data.variants).filter(([, v]) => {
      const {
        base,
        name,
        ['gun ports']: guns,
        ['turret mounts']: turrets,
        ['fighter bays']: bays,
        ...attributes
      } = v;
      void [base, name];
      return guns || turrets || bays || Object.keys(attributes).length > 0;
    }),
  );

  for (const s of Object.values(data.ships)) {
    if (!s.category || !s.thumbnail || hiddenShipCategories.includes(s.category)) {
      delete data.ships[s.name];
      continue;
    }
    s.thumbnail = getRawUrl({ ...plugin, file: `images/${s.thumbnail}.png` });
  }

  for (const v of Object.values(data.variants)) {
    if (v.thumbnail) {
      v.thumbnail = getRawUrl({ ...plugin, file: `images/${v.thumbnail}.png` });
    }
  }

  for (const o of Object.values(data.outfits)) {
    if (!o.category || !o.thumbnail || hiddenOutfitCategories.includes(o.category)) {
      delete data.outfits[o.name];
      continue;
    }
    o.thumbnail = getRawUrl({ ...plugin, file: `images/${o.thumbnail}.png` });
  }

  return data;
}

function mergePluginData(lhs: PluginData, rhs?: PluginData) {
  Object.assign(lhs.ships, rhs?.ships);
  Object.assign(lhs.variants, rhs?.variants);
  Object.assign(lhs.outfits, rhs?.outfits);
  return lhs;
}

export type LoadProgress = {
  isLoading: boolean;
  progress: number;
  total?: number | undefined;
};

export const useGameDataStore = defineStore(
  'game-data',
  () => {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    const plugins = ref<Plugin[]>([]);

    const pluginData = ref<Record<string, PluginData>>({});
    const loadState = ref<Record<string, LoadProgress>>({});

    const data = computed(() => {
      const empty = { ships: {}, variants: {}, outfits: {} } as PluginData;
      return plugins.value
        .filter((p) => p.enabled)
        .reduce((acc, { url }) => mergePluginData(acc, pluginData.value[url]), empty);
    });

    const pluginIndex = (url: string) => plugins.value.findIndex((p) => p.url == url);

    const addPlugin = (url: string) => {
      const isLoading = ref(false);
      const progress = ref(0);
      const total = ref<number>();

      watchEffect(() => {
        loadState.value[url] = {
          isLoading: isLoading.value,
          progress: progress.value,
          total: total.value,
        };
      });

      if (pluginIndex(url) >= 0) {
        return loadState.value[url];
      }

      const plugin = parsePluginUrl(url);
      if (!plugin) throw new Error('invalid plugin string');

      plugins.value.push(plugin);

      const empty = { ships: {}, variants: {}, outfits: {} } as PluginData;
      const data = computedAsync(
        async () => {
          const urls = await listDataFiles(octokit, plugin);
          total.value = urls.length;
          const dataParts = await Promise.all(
            urls.map(async (url) => {
              const res = await fetch(url);
              const text = await res.text();
              progress.value += 1;
              return parseDataFile(plugin, text);
            }),
          );
          return dataParts.reduce(mergePluginData, { ...empty });
        },
        { ...empty },
        isLoading,
      );
      watchEffect(() => {
        pluginData.value[url] = data.value;
      });
      return { isLoading, progress, total };
    };

    const removePlugin = (plugin: string) => {
      const index = pluginIndex(plugin);
      plugins.value.splice(index, 1);
    };

    return {
      data,
      plugins,
      pluginData,
      loadState,
      addPlugin,
      removePlugin,
    };
  },
  {
    persist: {
      pick: ['plugins', 'pluginData', 'loadState'],
      afterHydrate: (ctx) => {
        const store = ctx.store as ReturnType<typeof useGameDataStore>;
        for (const p of store.plugins) {
          if (!store.loadState[p.url] || store.loadState[p.url]!.isLoading) {
            store.removePlugin(p.url);
          }
        }
      },
    },
  },
);

function parsePluginUrl(url: string): Plugin | undefined {
  const urlPath = new URL(url).pathname;
  const [, owner, repo, , branch, ...pathParts] = urlPath.split('/');
  if (!owner || !repo) return;

  const dir = pathParts.length > 0 ? pathParts.join('/') : undefined;
  return {
    owner,
    repo,
    branch,
    sha: undefined,
    dir,
    isBase: owner == BASE_GAME_OWNER && repo == BASE_GAME_REPO,
    enabled: true,
    url,
  } as unknown as Plugin;
}

function getRawUrl({
  owner,
  repo,
  dir,
  sha,
  file,
}: Pick<Plugin, 'owner' | 'repo' | 'dir'> & { sha: string; file: string }): string {
  const path = dir ? `${dir}/${file}` : file;
  return `https://raw.githubusercontent.com/${owner}/${repo}/${sha}/${path}`;
}

async function listDataFiles(octokit: Octokit, plugin: Plugin) {
  return listFiles(octokit, plugin, 'data');
}

async function listFiles(octokit: Octokit, plugin: Plugin, folder: 'data' | 'images') {
  plugin.branch ??= (
    await octokit.rest.repos.get({ owner: plugin.owner, repo: plugin.repo })
  ).data.default_branch;
  plugin.sha ??= (
    await octokit.rest.git.getTree({
      owner: plugin.owner,
      repo: plugin.repo,
      tree_sha: plugin.branch,
    })
  ).data.sha;

  const { owner, repo, dir, sha } = plugin;
  let tree_sha = sha;
  const path = dir ? `${dir}/${folder}` : folder;
  const components = path.split('/').reverse();
  while (components.length > 0) {
    const component = components.pop();
    const res = await octokit.rest.git.getTree({ owner, repo, tree_sha });
    const sha = res.data.tree.find((t) => t.path == component)?.sha;
    if (!sha) return [];
    tree_sha = sha;
  }
  const res = await octokit.rest.git.getTree({ owner, repo, tree_sha, recursive: 'true' });

  return res.data.tree
    .filter((t) => t.type != 'tree')
    .map((t) => {
      const file = `${folder}/${t.path}`;
      return getRawUrl({ owner, repo, dir, sha, file });
    });
}

export interface Plugin {
  owner: string;
  repo: string;
  branch: string;
  sha: string;
  dir?: string | undefined;

  isBase: boolean;
  enabled: boolean;
  url: string;
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGameDataStore, import.meta.hot));
}
