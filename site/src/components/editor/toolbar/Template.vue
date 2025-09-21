<template>
  <div class="p-4">
    <div class="flex items-center gap-2 mb-4">
      <span class="i-carbon:template text-lg" />
      <h3 class="text-sm font-medium">{{ t('toolbar.template.title') }}</h3>
    </div>

    <div class="space-y-3">
      <!-- Current Template Display -->
      <div v-if="currentTemplate" class="p-3 bg-accent rounded-lg">
        <div class="flex items-center gap-3">
          <img 
            :src="currentTemplate.preview" 
            :alt="currentTemplate.name"
            class="w-12 h-16 object-cover rounded border"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ currentTemplate.name }}</p>
            <p class="text-xs text-muted-foreground truncate">{{ currentTemplate.description }}</p>
          </div>
          <UiButton
            size="sm"
            variant="ghost"
            @click="showTemplateSelector = true"
          >
            <span class="i-carbon:edit text-sm" />
          </UiButton>
        </div>
      </div>

      <!-- Template Selector Button -->
      <UiButton
        v-else
        variant="outline"
        class="w-full justify-start"
        @click="showTemplateSelector = true"
      >
        <span class="i-carbon:template text-sm mr-2" />
        {{ t('toolbar.template.select') }}
      </UiButton>

      <!-- Template Categories -->
      <div v-if="showTemplateSelector" class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium">{{ t('toolbar.template.categories') }}</h4>
          <UiButton
            size="sm"
            variant="ghost"
            @click="showTemplateSelector = false"
          >
            <span class="i-carbon:close text-sm" />
          </UiButton>
        </div>

        <div class="space-y-2">
          <div
            v-for="category in templateCategories"
            :key="category.id"
            class="space-y-2"
          >
            <div class="flex items-center gap-2">
              <span :class="[category.icon, 'text-sm']" />
              <span class="text-xs font-medium text-muted-foreground">{{ category.name }}</span>
            </div>
            
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="template in getTemplatesByCategory(category.id)"
                :key="template.id"
                class="relative group cursor-pointer"
                @click="selectTemplate(template.id)"
              >
                <div class="p-2 border rounded-lg hover:bg-accent transition-colors">
                  <img 
                    :src="template.preview" 
                    :alt="template.name"
                    class="w-full h-20 object-cover rounded mb-2"
                  />
                  <div class="text-center">
                    <p class="text-xs font-medium truncate">{{ template.name }}</p>
                  </div>
                </div>
                
                <!-- Selected indicator -->
                <div
                  v-if="currentTemplate?.id === template.id"
                  class="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                >
                  <span class="i-carbon:checkmark text-xs text-primary-foreground" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useConstant } from '~/composables/constant';
import { useStyleStore } from '~/composables/stores/style';
import type { CVTemplate } from '~/composables/constant';

const { t } = useI18n();
const { TEMPLATE } = useConstant();
const { applyTemplate, getCurrentTemplate } = useStyleStore();

const showTemplateSelector = ref(false);

const templateCategories = computed(() => TEMPLATE.CATEGORIES);
const currentTemplate = computed(() => getCurrentTemplate());

const getTemplatesByCategory = (categoryId: string) => {
  return TEMPLATE.getByCategory(categoryId);
};

const selectTemplate = async (templateId: string) => {
  await applyTemplate(templateId);
  showTemplateSelector.value = false;
};
</script>
