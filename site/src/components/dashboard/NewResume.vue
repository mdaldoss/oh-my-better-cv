<template>
  <div class="w-56 h-80">
    <UiDialog v-model:open="open">
      <UiDialogTrigger as-child>
        <button
          class="resume-card group w-[210px] h-[299px] flex-center flex-col gap-2 bg-secondary hover:bg-background ring-when-focus"
          :aria-label="$t('dashboard.new')"
        >
          <span i-ic:round-plus text="5xl muted-foreground group-hover:primary" />
          <span class="text-sm text-muted-foreground group-hover:text-primary">
            {{ $t("dashboard.new") }}
          </span>
        </button>
      </UiDialogTrigger>

      <UiDialogContent class="sm:max-w-130">
        <UiDialogHeader>
          <UiDialogTitle>{{ $t("dashboard.template.header") }}</UiDialogTitle>
          <UiDialogDescription>{{ $t("dashboard.template.desc") }}</UiDialogDescription>
        </UiDialogHeader>

        <div class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="template in templates"
            :key="template.id"
            type="button"
            class="rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-accent disabled:opacity-60"
            :disabled="creating"
            @click="create(template)"
          >
            <div class="flex items-center gap-1.5 font-semibold">
              <span i-tabler:file-text class="text-primary" />
              {{ template.name }}
            </div>
            <p class="mt-1 text-xs text-muted-foreground">{{ template.description }}</p>
          </button>
        </div>
      </UiDialogContent>
    </UiDialog>
  </div>
</template>

<script lang="ts" setup>
import type { ResumeTemplate } from "~/composables/constant";

const router = useRouter();
const localePath = useLocalePath();
const { TEMPLATES } = useConstant();

const templates = TEMPLATES.LIST;
const open = ref(false);
const creating = ref(false);

const create = async (template: ResumeTemplate) => {
  if (creating.value) return;
  creating.value = true;

  const data = await storageService.createResume({
    name: template.id === TEMPLATES.DEFAULT_ID ? "New Resume" : template.name,
    markdown: template.markdown,
    css: template.css,
    styles: template.styles
  });

  creating.value = false;
  open.value = false;

  if (data) router.push(localePath(`/editor/${data.id}`));
};
</script>
