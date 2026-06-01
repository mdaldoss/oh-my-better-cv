import * as localForage from "localforage";

export type AiProvider = "anthropic" | "openrouter";

/**
 * Where the AI requests are sent.
 *
 * - `browser`: call the provider directly from the browser with a key the user
 *   pastes in (bring-your-own-key). Fully local, no backend. This is the default.
 * - `supabase`: call a Supabase Edge Function proxy that holds the key
 *   server-side. Wired up later — the fields exist so the switch is trivial.
 */
export type AiBackendMode = "browser" | "supabase";

export type AiSettings = {
  mode: AiBackendMode;
  provider: AiProvider;

  // Browser (bring-your-own-key)
  anthropicKey: string;
  anthropicModel: string;
  openrouterKey: string;
  openrouterModel: string;

  // Supabase Edge Function proxy (optional, configured later)
  supabaseUrl: string;
  supabaseAnonKey: string;
  accessCode: string;
};

const STORAGE_KEY = "ohmycv_ai_settings";

export const DEFAULT_AI_SETTINGS: AiSettings = {
  mode: "browser",
  provider: "anthropic",
  anthropicKey: "",
  anthropicModel: "claude-sonnet-4-6",
  openrouterKey: "",
  openrouterModel: "openai/gpt-4o-mini",
  supabaseUrl: "",
  supabaseAnonKey: "",
  accessCode: ""
};

export const useAiSettingsStore = defineStore("ai-settings", () => {
  const settings = reactive<AiSettings>({ ...DEFAULT_AI_SETTINGS });
  const loaded = ref(false);

  const load = async () => {
    try {
      const saved = await localForage.getItem<Partial<AiSettings>>(STORAGE_KEY);
      if (saved) Object.assign(settings, { ...DEFAULT_AI_SETTINGS, ...saved });
    } catch (error) {
      console.error("Load AI settings error:", error);
    } finally {
      loaded.value = true;
    }
  };

  const save = async () => {
    try {
      await localForage.setItem(STORAGE_KEY, { ...toRaw(settings) });
    } catch (error) {
      console.error("Save AI settings error:", error);
    }
  };

  const setSettings = async (patch: Partial<AiSettings>) => {
    Object.assign(settings, patch);
    await save();
  };

  /**
   * Whether the currently selected backend has the minimum config it needs to
   * actually make a request.
   */
  const isConfigured = computed(() => {
    if (settings.mode === "supabase")
      return Boolean(settings.supabaseUrl && settings.supabaseAnonKey);

    return settings.provider === "anthropic"
      ? Boolean(settings.anthropicKey)
      : Boolean(settings.openrouterKey);
  });

  return { settings, loaded, load, save, setSettings, isConfigured };
});
