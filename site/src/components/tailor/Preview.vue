<template>
  <div
    class="overflow-scroll hide-scrollbar rounded-md border bg-secondary"
    border="4 secondary"
  >
    <VueZoom ref="zoom" :scale="scale">
      <SharedResumeRender
        :id="previewId"
        ref="renderRef"
        :markdown="markdown"
        :css="css"
        :styles="styles"
      />
    </VueZoom>
  </div>
</template>

<script lang="ts" setup>
import VueZoom from "@ohmycv/vue-zoom";
import { delay } from "@renovamen/utils";
import { SharedResumeRender } from "#components";

const props = defineProps<{
  markdown: string;
}>();

const { PAPER, TEMPLATES } = useConstant();

const previewId = "tailor-preview";
const swiss = TEMPLATES.get("swiss")!;
const css = swiss.css;
const styles = swiss.styles;

const zoom = ref<InstanceType<typeof VueZoom>>();
const renderRef = ref<InstanceType<typeof SharedResumeRender>>();
const scale = ref(0.6);

const { width } = useElementSize(zoom);

const fitWidth = () => {
  if (width.value) scale.value = width.value / PAPER.sizeToPx(styles.paper, "w");
};

const setup = async () => {
  // styles defined via the CSS editor (the template backbone)
  dynamicCssService.injectCssEditor(css, previewId);
  // load fonts used by the template
  await googleFontsService.resolve(styles.fontEN);
  await googleFontsService.resolve(styles.fontCJK);
  // styles defined via the toolbar (theme color, font size, spacing, ...)
  dynamicCssService.injectToolbar(styles, previewId);

  await delay(80);
  renderRef.value?.render();
  fitWidth();
};

onMounted(setup);

watch(width, fitWidth);

// Re-render when the user edits the tailored markdown
watchThrottled(
  () => props.markdown,
  async () => {
    await nextTick();
    renderRef.value?.render();
  },
  { throttle: 300 }
);
</script>
