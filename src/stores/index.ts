import { defineStore } from '#q-app/wrappers';
import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import * as zipson from 'zipson';

export default defineStore(() => {
  const pinia = createPinia();
  pinia.use(
    createPersistedState({
      serializer: import.meta.env.DEV
        ? {
            serialize: JSON.stringify,
            deserialize: JSON.parse,
          }
        : {
            serialize: zipson.stringify,
            deserialize: zipson.parse,
          },
    }),
  );
  return pinia;
});
