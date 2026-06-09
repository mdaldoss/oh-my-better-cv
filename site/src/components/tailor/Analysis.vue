<template>
  <div class="space-y-5">
    <!-- Score + verdict -->
    <div class="flex items-center gap-4 rounded-lg border bg-background p-4">
      <TailorScoreRing :score="result.score" :size="104" />
      <div class="min-w-0 space-y-1">
        <div class="text-xs uppercase tracking-wide text-muted-foreground">
          {{ $t("tailor.analysis.match_score") }}
        </div>
        <p class="text-sm">{{ result.verdict }}</p>
      </div>
    </div>

    <!-- Core points -->
    <section v-if="result.core_points.length" class="space-y-2">
      <h3 class="flex items-center gap-1.5 font-semibold">
        <span i-tabler:target-arrow class="text-primary" />
        {{ $t("tailor.analysis.core_points") }}
      </h3>
      <ul class="list-disc pl-5 space-y-1 text-sm">
        <li v-for="(point, i) in result.core_points" :key="i">{{ point }}</li>
      </ul>
    </section>

    <!-- Missing skills -->
    <section v-if="result.missing.length" class="space-y-2">
      <h3 class="flex items-center gap-1.5 font-semibold">
        <span i-tabler:alert-triangle class="text-amber-500" />
        {{ $t("tailor.analysis.missing") }}
      </h3>
      <ul class="space-y-2 text-sm">
        <li
          v-for="(item, i) in result.missing"
          :key="i"
          class="rounded-md border bg-background p-2.5"
        >
          <div class="flex items-center gap-2">
            <span
              class="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
              :class="importanceClass(item.importance)"
            >
              {{ $t(`tailor.analysis.importance.${item.importance}`) }}
            </span>
            <span class="font-medium">{{ item.skill }}</span>
          </div>
          <p v-if="item.how_to_address" class="mt-1 text-muted-foreground">
            {{ item.how_to_address }}
          </p>
        </li>
      </ul>
    </section>

    <!-- Matched strengths -->
    <section v-if="result.matched.length" class="space-y-2">
      <h3 class="flex items-center gap-1.5 font-semibold">
        <span i-tabler:circle-check class="text-success" />
        {{ $t("tailor.analysis.matched") }}
      </h3>
      <ul class="space-y-1.5 text-sm">
        <li v-for="(item, i) in result.matched" :key="i" class="flex gap-2">
          <span i-tabler:check class="mt-0.5 shrink-0 text-success" />
          <span>
            <span class="font-medium">{{ item.skill }}</span>
            <span v-if="item.evidence" class="text-muted-foreground">
              — {{ item.evidence }}</span
            >
          </span>
        </li>
      </ul>
    </section>

    <!-- Keywords -->
    <section v-if="result.keywords.length" class="space-y-2">
      <h3 class="flex items-center gap-1.5 font-semibold">
        <span i-tabler:hash class="text-primary" />
        {{ $t("tailor.analysis.keywords") }}
      </h3>
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="(kw, i) in result.keywords"
          :key="i"
          class="rounded-full bg-secondary px-2.5 py-0.5 text-xs"
        >
          {{ kw }}
        </span>
      </div>
    </section>

    <!-- Recommendations -->
    <section v-if="result.recommendations.length" class="space-y-2">
      <h3 class="flex items-center gap-1.5 font-semibold">
        <span i-tabler:bulb class="text-info" />
        {{ $t("tailor.analysis.recommendations") }}
      </h3>
      <ul class="list-disc pl-5 space-y-1 text-sm">
        <li v-for="(rec, i) in result.recommendations" :key="i">{{ rec }}</li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts" setup>
import type { AnalysisResult, SkillImportance } from "~/utils/ai/types";

defineProps<{
  result: AnalysisResult;
}>();

const importanceClass = (importance: SkillImportance) => {
  if (importance === "high")
    return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300";
  if (importance === "medium")
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
  return "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300";
};
</script>
