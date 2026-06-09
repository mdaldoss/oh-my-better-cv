<template>
  <UiDialog v-model:open="open">
    <UiDialogTrigger as-child>
      <UiButton
        :variant="variant"
        :size="label ? 'sm' : 'round'"
        :class="label ? 'h-8 gap-x-1.5' : ''"
        :aria-label="$t('ai.settings.title')"
      >
        <span i-tabler:settings text-base />
        <span v-if="label" class="hide-on-mobile">{{ $t("ai.settings.title") }}</span>
      </UiButton>
    </UiDialogTrigger>

    <UiDialogScrollContent class="sm:max-w-130">
      <UiDialogHeader>
        <UiDialogTitle>{{ $t("ai.settings.title") }}</UiDialogTitle>
        <UiDialogDescription>{{ $t("ai.settings.desc") }}</UiDialogDescription>
      </UiDialogHeader>

      <div class="space-y-5 text-sm">
        <!-- Backend mode -->
        <div class="space-y-2">
          <label class="font-medium">{{ $t("ai.settings.backend") }}</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="m in modes"
              :key="m.value"
              type="button"
              class="rounded-md border px-3 py-2 text-left transition-colors"
              :class="
                form.mode === m.value
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-input hover:bg-accent'
              "
              @click="form.mode = m.value"
            >
              <div class="font-medium">{{ m.title }}</div>
              <div class="text-xs text-muted-foreground">{{ m.hint }}</div>
            </button>
          </div>
        </div>

        <!-- Provider -->
        <div class="space-y-2">
          <label class="font-medium">{{ $t("ai.settings.provider") }}</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="p in providers"
              :key="p.value"
              type="button"
              class="rounded-md border px-3 py-2 transition-colors"
              :class="
                form.provider === p.value
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-input hover:bg-accent'
              "
              @click="form.provider = p.value"
            >
              {{ p.title }}
            </button>
          </div>
        </div>

        <!-- Browser (BYOK) fields -->
        <template v-if="form.mode === 'browser'">
          <template v-if="form.provider === 'anthropic'">
            <div class="space-y-1.5">
              <label class="font-medium">{{ $t("ai.settings.api_key") }}</label>
              <UiInput
                v-model="form.anthropicKey"
                type="password"
                autocomplete="off"
                placeholder="sk-ant-..."
              />
            </div>
            <div class="space-y-1.5">
              <label class="font-medium">{{ $t("ai.settings.model") }}</label>
              <UiInput v-model="form.anthropicModel" placeholder="claude-sonnet-4-6" />
            </div>
          </template>

          <template v-else>
            <div class="space-y-1.5">
              <label class="font-medium">{{ $t("ai.settings.api_key") }}</label>
              <UiInput
                v-model="form.openrouterKey"
                type="password"
                autocomplete="off"
                placeholder="sk-or-..."
              />
            </div>
            <div class="space-y-1.5">
              <label class="font-medium">{{ $t("ai.settings.model") }}</label>
              <UiInput v-model="form.openrouterModel" placeholder="openai/gpt-4o-mini" />
            </div>
          </template>

          <p class="text-xs text-muted-foreground">
            {{ $t("ai.settings.byok_note") }}
            <a
              :href="keyHelp.href"
              target="_blank"
              rel="noopener"
              class="text-primary underline-offset-2 hover:underline"
            >
              {{ keyHelp.label }}
            </a>
          </p>
        </template>

        <!-- Supabase proxy fields (configured later) -->
        <template v-else>
          <div class="space-y-1.5">
            <label class="font-medium">{{ $t("ai.settings.supabase_url") }}</label>
            <UiInput v-model="form.supabaseUrl" placeholder="https://xxxx.supabase.co" />
          </div>
          <div class="space-y-1.5">
            <label class="font-medium">{{ $t("ai.settings.supabase_anon") }}</label>
            <UiInput v-model="form.supabaseAnonKey" type="password" autocomplete="off" />
          </div>
          <div class="space-y-1.5">
            <label class="font-medium">{{ $t("ai.settings.access_code") }}</label>
            <UiInput v-model="form.accessCode" type="password" autocomplete="off" />
          </div>
          <p class="text-xs text-muted-foreground">
            {{ $t("ai.settings.supabase_note") }}
          </p>
        </template>
      </div>

      <UiDialogFooter>
        <UiButton variant="ghost" @click="open = false">
          {{ $t("ai.settings.cancel") }}
        </UiButton>
        <UiButton @click="onSave">{{ $t("ai.settings.save") }}</UiButton>
      </UiDialogFooter>
    </UiDialogScrollContent>
  </UiDialog>
</template>

<script lang="ts" setup>
import type {
  AiBackendMode,
  AiProvider,
  AiSettings
} from "~/composables/stores/aiSettings";

withDefaults(
  defineProps<{
    /** Show a text label next to the gear icon */
    label?: boolean;
    variant?: string;
  }>(),
  {
    label: false,
    variant: "ghost-secondary"
  }
);

const { t } = useI18n();
const aiSettings = useAiSettingsStore();
const toast = useToast();

const open = ref(false);
const form = reactive<AiSettings>({ ...aiSettings.settings });

// Refresh the form from the store every time the dialog is opened
watch(open, (isOpen) => {
  if (isOpen) Object.assign(form, aiSettings.settings);
});

const modes = computed(() => [
  {
    value: "browser" as AiBackendMode,
    title: t("ai.settings.mode_browser"),
    hint: t("ai.settings.mode_browser_hint")
  },
  {
    value: "supabase" as AiBackendMode,
    title: t("ai.settings.mode_supabase"),
    hint: t("ai.settings.mode_supabase_hint")
  }
]);

const providers: Array<{ value: AiProvider; title: string }> = [
  { value: "anthropic", title: "Anthropic" },
  { value: "openrouter", title: "OpenRouter" }
];

const keyHelp = computed(() =>
  form.provider === "anthropic"
    ? {
        label: "console.anthropic.com",
        href: "https://console.anthropic.com/settings/keys"
      }
    : { label: "openrouter.ai/keys", href: "https://openrouter.ai/keys" }
);

const onSave = async () => {
  await aiSettings.setSettings({ ...toRaw(form) });
  toast.aiSettingsSaved();
  open.value = false;
};
</script>
