<template>
  <div class="relative shrink-0" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="-rotate-90">
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke-width="stroke"
        class="stroke-secondary"
      />
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke-width="stroke"
        stroke-linecap="round"
        :stroke="color"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        class="transition-[stroke-dashoffset] duration-700"
      />
    </svg>
    <div class="absolute inset-0 flex-center flex-col leading-none">
      <span class="font-bold" :style="{ color, fontSize: `${size * 0.26}px` }">
        {{ Math.round(score) }}
      </span>
      <span class="text-muted-foreground" :style="{ fontSize: `${size * 0.1}px` }">
        / 100
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    score: number;
    size?: number;
  }>(),
  { size: 120 }
);

const stroke = computed(() => Math.max(6, props.size * 0.08));
const center = computed(() => props.size / 2);
const radius = computed(() => center.value - stroke.value / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);

const clamped = computed(() => Math.max(0, Math.min(100, props.score)));
const dashOffset = computed(() => circumference.value * (1 - clamped.value / 100));

const color = computed(() => {
  const s = clamped.value;
  if (s >= 85) return "#16a34a"; // green
  if (s >= 70) return "#2563eb"; // blue
  if (s >= 50) return "#d97706"; // amber
  return "#dc2626"; // red
});
</script>
