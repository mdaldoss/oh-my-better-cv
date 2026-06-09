<template>
  <div id="tailor-page" class="flex flex-col min-h-screen">
    <SharedHeader>
      <template #tail>
        <AiSettingsDialog label />
      </template>
    </SharedHeader>

    <div class="workspace max-w-330 w-full mx-auto flex-1" p="x-4 y-6">
      <div class="px-1 mb-5">
        <h1 class="flex items-center gap-2 text-3xl font-bold">
          <span i-tabler:wand class="text-primary" />
          {{ $t("tailor.title") }}
        </h1>
        <p class="mt-1 text-muted-foreground">{{ $t("tailor.subtitle") }}</p>
      </div>

      <!-- Not configured banner -->
      <UiAlert v-if="aiSettings.loaded && !aiSettings.isConfigured" class="mb-5">
        <UiAlertTitle class="flex items-center gap-1.5">
          <span i-tabler:key class="text-primary" />
          {{ $t("tailor.not_configured.title") }}
        </UiAlertTitle>
        <UiAlertDescription
          class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{{ $t("tailor.not_configured.desc") }}</span>
          <AiSettingsDialog label variant="default" />
        </UiAlertDescription>
      </UiAlert>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- ============ Inputs ============ -->
        <div class="space-y-5">
          <!-- Master CV -->
          <section class="rounded-lg border bg-card p-4">
            <div class="mb-2 flex items-center justify-between">
              <h2 class="flex items-center gap-1.5 font-semibold">
                <span i-tabler:file-text class="text-primary" />
                {{ $t("tailor.master.title") }}
              </h2>
              <span v-if="savedAt" class="text-xs text-muted-foreground">
                {{ $t("tailor.master.saved", { time: savedAt }) }}
              </span>
            </div>
            <p class="mb-2 text-xs text-muted-foreground">
              {{ $t("tailor.master.hint") }}
            </p>

            <textarea
              v-model="cvDraft"
              :placeholder="$t('tailor.master.placeholder')"
              class="h-56 w-full resize-y rounded-md border border-input bg-background p-3 font-mono text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />

            <div class="mt-2 flex flex-wrap gap-2">
              <UiButton size="sm" variant="outline" @click="openFile">
                <span i-tabler:upload mr-1.5 />
                {{ $t("tailor.master.upload") }}
              </UiButton>
              <UiButton size="sm" @click="saveMaster" :disabled="!cvDraft.trim()">
                <span i-ic:baseline-save mr-1.5 />
                {{ $t("tailor.master.save") }}
              </UiButton>
              <UiButton
                v-if="masterCv.hasContent"
                size="sm"
                variant="ghost"
                @click="clearMaster"
              >
                {{ $t("tailor.master.clear") }}
              </UiButton>
            </div>
          </section>

          <!-- Job description -->
          <section class="rounded-lg border bg-card p-4">
            <h2 class="mb-2 flex items-center gap-1.5 font-semibold">
              <span i-tabler:briefcase class="text-primary" />
              {{ $t("tailor.job.title") }}
            </h2>
            <textarea
              v-model="jobDescription"
              :placeholder="$t('tailor.job.placeholder')"
              class="h-56 w-full resize-y rounded-md border border-input bg-background p-3 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </section>

          <!-- Actions -->
          <div class="flex flex-wrap gap-3">
            <UiButton class="gap-x-1.5" :disabled="!canRun || busy" @click="evaluate">
              <span v-if="loadingAnalyze" i-tabler:loader-2 class="animate-spin" />
              <span v-else i-tabler:chart-bar />
              {{ $t("tailor.actions.evaluate") }}
            </UiButton>
            <UiButton
              variant="secondary"
              class="gap-x-1.5"
              :disabled="!canRun || busy"
              @click="tailor"
            >
              <span v-if="loadingTailor" i-tabler:loader-2 class="animate-spin" />
              <span v-else i-tabler:wand />
              {{ $t("tailor.actions.tailor") }}
            </UiButton>
          </div>
        </div>

        <!-- ============ Results ============ -->
        <div class="space-y-5">
          <UiAlert v-if="error" variant="destructive">
            <UiAlertTitle>{{ $t("tailor.error") }}</UiAlertTitle>
            <UiAlertDescription>{{ error }}</UiAlertDescription>
          </UiAlert>

          <!-- Analysis -->
          <section
            v-if="analysis || loadingAnalyze"
            class="rounded-lg border bg-card p-4"
          >
            <div v-if="loadingAnalyze && !analysis" class="flex-center py-16">
              <span i-tabler:loader-2 class="animate-spin text-2xl text-primary" />
            </div>
            <TailorAnalysis v-else-if="analysis" :result="analysis" />
          </section>

          <!-- Tailored CV -->
          <section v-if="tailored || loadingTailor" class="rounded-lg border bg-card p-4">
            <div class="mb-3 flex items-center justify-between gap-2">
              <h2 class="flex items-center gap-1.5 font-semibold">
                <span i-tabler:sparkles class="text-primary" />
                {{ $t("tailor.result.title") }}
              </h2>
              <div v-if="tailored" class="flex gap-1.5">
                <UiButton size="xs" variant="outline" @click="copyTailored">
                  <span i-tabler:copy mr-1 />
                  {{ $t("tailor.result.copy") }}
                </UiButton>
                <UiButton size="xs" variant="outline" @click="downloadTailored">
                  <span i-tabler:download mr-1 />
                  {{ $t("tailor.result.download") }}
                </UiButton>
                <UiButton size="xs" @click="openInEditor">
                  <span i-tabler:edit mr-1 />
                  {{ $t("tailor.result.edit") }}
                </UiButton>
              </div>
            </div>

            <div v-if="loadingTailor && !tailored" class="flex-center py-16">
              <span i-tabler:loader-2 class="animate-spin text-2xl text-primary" />
            </div>

            <template v-else-if="tailored">
              <div class="mb-3 inline-flex rounded-md border p-0.5 text-sm">
                <button
                  v-for="tab in tabs"
                  :key="tab"
                  type="button"
                  class="rounded px-3 py-1 transition-colors"
                  :class="
                    resultTab === tab
                      ? 'bg-secondary font-medium'
                      : 'text-muted-foreground'
                  "
                  @click="resultTab = tab"
                >
                  {{ $t(`tailor.result.tab_${tab}`) }}
                </button>
              </div>

              <TailorPreview v-show="resultTab === 'preview'" :markdown="tailored" />

              <textarea
                v-show="resultTab === 'edit'"
                v-model="tailored"
                class="h-[480px] w-full resize-y rounded-md border border-input bg-background p-3 font-mono text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </template>
          </section>

          <!-- Empty state -->
          <div
            v-if="!analysis && !tailored && !loadingAnalyze && !loadingTailor && !error"
            class="rounded-lg border border-dashed p-10 text-center text-muted-foreground"
          >
            <span i-tabler:report-analytics class="text-4xl" />
            <p class="mt-3 text-sm">{{ $t("tailor.empty") }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { downloadFile, useFileDialog, readFile } from "@renovamen/utils";
import { aiService, AiError, type AnalysisResult } from "~/utils/ai";

const { t } = useI18n();
const router = useRouter();
const localePath = useLocalePath();
const toast = useToast();
const { TEMPLATES } = useConstant();

const aiSettings = useAiSettingsStore();
const masterCv = useMasterCvStore();

const cvDraft = ref("");
const jobDescription = ref("");

const analysis = ref<AnalysisResult | null>(null);
const tailored = ref("");
const loadingAnalyze = ref(false);
const loadingTailor = ref(false);
const error = ref("");

const tabs = ["preview", "edit"] as const;
const resultTab = ref<(typeof tabs)[number]>("preview");

onMounted(async () => {
  await Promise.all([aiSettings.load(), masterCv.load()]);
  cvDraft.value = masterCv.masterCv.content;
});

const busy = computed(() => loadingAnalyze.value || loadingTailor.value);
const canRun = computed(
  () =>
    aiSettings.isConfigured &&
    cvDraft.value.trim().length > 0 &&
    jobDescription.value.trim().length > 0
);

const savedAt = computed(() => {
  if (!masterCv.masterCv.updated_at) return "";
  return new Date(masterCv.masterCv.updated_at).toLocaleString();
});

// --- Master CV management ---
const { open: openFile, onChange } = useFileDialog(".md,.markdown,.txt");

onChange(async (file) => {
  const content = await readFile(file);
  cvDraft.value = content;
  await masterCv.save(content, file.name.replace(/\.[^.]+$/, ""));
  toast.masterCvSaved();
});

const saveMaster = async () => {
  await masterCv.save(cvDraft.value);
  toast.masterCvSaved();
};

const clearMaster = async () => {
  await masterCv.clear();
  cvDraft.value = "";
};

// --- AI actions ---
const ensureMasterSaved = async () => {
  if (cvDraft.value !== masterCv.masterCv.content) await masterCv.save(cvDraft.value);
};

const handleError = (e: unknown) => {
  const message = e instanceof AiError || e instanceof Error ? e.message : String(e);
  error.value = message;
  toast.aiError(message);
};

const evaluate = async () => {
  if (!canRun.value || busy.value) return;
  error.value = "";
  loadingAnalyze.value = true;

  try {
    await ensureMasterSaved();
    analysis.value = await aiService.analyze(cvDraft.value, jobDescription.value);
  } catch (e) {
    handleError(e);
  } finally {
    loadingAnalyze.value = false;
  }
};

const tailor = async () => {
  if (!canRun.value || busy.value) return;
  error.value = "";
  loadingTailor.value = true;

  try {
    await ensureMasterSaved();
    const result = await aiService.tailor(
      cvDraft.value,
      jobDescription.value,
      analysis.value
    );
    tailored.value = result.markdown;
    resultTab.value = "preview";
  } catch (e) {
    handleError(e);
  } finally {
    loadingTailor.value = false;
  }
};

// --- Result actions ---
const fileName = computed(() => {
  const base = (masterCv.masterCv.name || "tailored-cv").trim().replace(/\s+/g, "_");
  return `${base}_tailored`;
});

const downloadTailored = () => downloadFile(`${fileName.value}.md`, tailored.value);

const copyTailored = async () => {
  try {
    await navigator.clipboard.writeText(tailored.value);
    toast.copied();
  } catch {
    toast.aiError(t("notification.ai.copy_failed"));
  }
};

const openInEditor = async () => {
  const swiss = TEMPLATES.get("swiss")!;
  const data = await storageService.createResume({
    name: `${masterCv.masterCv.name || "CV"} — Tailored`,
    markdown: tailored.value,
    css: swiss.css,
    styles: swiss.styles
  });

  if (data) router.push(localePath(`/editor/${data.id}`));
};
</script>
