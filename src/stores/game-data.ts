import { computedAsync } from '@vueuse/core';
import { Octokit } from 'octokit';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { BASE_GAME_OWNER, BASE_GAME_REPO } from 'src/constants';
import { parse } from 'src/model/data';
import { computed, ref, watchEffect } from 'vue';

export interface Ship {
  name: string;
}

export interface Variant {
  base: string;
  name: string;
}

export interface Outfit {
  name: string;
}

export interface PluginData {
  ships: Record<string, Ship>;
  variants: Record<string, Variant>;
  outfits: Record<string, Outfit>;
}

function parseDataFile(text: string): PluginData {
  return parse(text) as PluginData;
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
      const empty = { ships: {}, variants: {}, outfits: {} };
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

      const id = parsePluginUrl(url);
      if (!id) throw new Error('invalid plugin string');

      plugins.value.push(id);

      const empty = { ships: {}, variants: {}, outfits: {} };
      const data = computedAsync(
        async () => {
          const urls = await listDataFiles(octokit, id);
          total.value = urls.length;
          const dataParts = await Promise.all(
            urls.map(async (url) => {
              const res = await fetch(url);
              const text = await res.text();
              progress.value += 1;
              return parseDataFile(text);
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
    dir,
    isBase: owner == BASE_GAME_OWNER && repo == BASE_GAME_REPO,
    enabled: true,
    url,
  };
}

function getRawUrl(
  octokit: Octokit,
  {
    owner,
    repo,
    dir,
    root_sha,
    file,
  }: Pick<Plugin, 'owner' | 'repo' | 'dir'> & { root_sha: string; file: string },
): string {
  const path = dir ? `${dir}/${file}` : file;
  return `https://raw.githubusercontent.com/${owner}/${repo}/${root_sha}/${path}`;
}

async function listDataFiles(octokit: Octokit, { owner, repo, dir, branch }: Plugin) {
  branch ??= (await octokit.rest.repos.get({ owner, repo })).data.default_branch;
  const path = dir ? `${dir}/data` : 'data';
  let tree_sha = branch;
  let res = await octokit.rest.git.getTree({ owner, repo, tree_sha });
  const root_sha = res.data.sha;

  const components = path.split('/').reverse();
  while (components.length > 0) {
    const component = components.pop();
    const res = await octokit.rest.git.getTree({ owner, repo, tree_sha });
    const sha = res.data.tree.find((t) => t.path == component)?.sha;
    if (!sha) return [];
    tree_sha = sha;
  }
  res = await octokit.rest.git.getTree({ owner, repo, tree_sha, recursive: 'true' });

  return res.data.tree
    .filter((t) => t.type != 'tree')
    .map((t) => {
      const file = `data/${t.path}`;
      return getRawUrl(octokit, { owner, repo, dir, root_sha, file });
    });
}

export interface Plugin {
  owner: string;
  repo: string;
  branch?: string | undefined;
  dir?: string | undefined;

  isBase: boolean;
  enabled: boolean;
  url: string;
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGameDataStore, import.meta.hot));
}
