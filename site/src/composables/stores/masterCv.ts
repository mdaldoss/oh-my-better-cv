import * as localForage from "localforage";

/**
 * The reference "full content" CV the user keeps in memory. It is the single
 * source of truth that every tailored CV is generated from. Stored locally
 * (IndexedDB via localForage), like the rest of the app's data.
 */
export type MasterCv = {
  name: string;
  content: string;
  updated_at: string;
};

const STORAGE_KEY = "ohmycv_master_cv";

export const useMasterCvStore = defineStore("master-cv", () => {
  const masterCv = reactive<MasterCv>({
    name: "",
    content: "",
    updated_at: ""
  });
  const loaded = ref(false);

  const load = async () => {
    try {
      const saved = await localForage.getItem<MasterCv>(STORAGE_KEY);
      if (saved) Object.assign(masterCv, saved);
    } catch (error) {
      console.error("Load master CV error:", error);
    } finally {
      loaded.value = true;
    }
  };

  const save = async (content: string, name?: string) => {
    masterCv.content = content;
    if (name !== undefined) masterCv.name = name;
    masterCv.updated_at = new Date().toISOString();

    try {
      await localForage.setItem(STORAGE_KEY, { ...toRaw(masterCv) });
    } catch (error) {
      console.error("Save master CV error:", error);
    }
  };

  const clear = async () => {
    masterCv.name = "";
    masterCv.content = "";
    masterCv.updated_at = "";

    try {
      await localForage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Clear master CV error:", error);
    }
  };

  const hasContent = computed(() => masterCv.content.trim().length > 0);

  return { masterCv, loaded, load, save, clear, hasContent };
});
