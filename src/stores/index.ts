import { defineStore } from '#q-app/wrappers';
import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import { stringify, parse } from 'zipson';

export default defineStore(() => {
  const pinia = createPinia();
  pinia.use(
    createPersistedState({
      serializer: {
        serialize: stringify,
        deserialize: parse,
      },
    }),
  );
  return pinia;
});
