import { copy } from "@renovamen/utils";
import type { ValidPaperSize, Font, CVTemplate } from "~/composables/constant";

export type ResumeStyles = {
  marginV: number;
  marginH: number;
  lineHeight: number;
  paragraphSpace: number;
  themeColor: string;
  fontCJK: Font;
  fontEN: Font;
  fontSize: number;
  paper: ValidPaperSize;
  template?: string; // Template ID
};

export const useStyleStore = defineStore("style", () => {
  const { DEFAULT, TEMPLATE } = useConstant();
  const styles = reactive<ResumeStyles>(copy(DEFAULT.STYLES));

  const setStyle = async <T extends keyof ResumeStyles>(
    key: T,
    value: ResumeStyles[T]
  ) => {
    // handle Google fonts
    if (["fontCJK", "fontEN"].includes(key)) {
      await googleFontsService.resolve(value as Font);
    }

    // update styles for the current resume
    styles[key] = value;

    // update CSS
    // vue-smart-pages will handle margins, height and width
    if (!["marginV", "marginH"].includes(key)) dynamicCssService.injectToolbar(styles);
  };

  const applyTemplate = async (templateId: string) => {
    const template = TEMPLATE.getById(templateId);
    if (!template) return;

    // Apply template styles
    if (template.styles) {
      for (const [key, value] of Object.entries(template.styles)) {
        if (key in styles) {
          await setStyle(key as keyof ResumeStyles, value as ResumeStyles[keyof ResumeStyles]);
        }
      }
    }

    // Set template ID
    styles.template = templateId;

    // Apply template CSS
    if (template.css) {
      const { setData } = useDataStore();
      setData('css', template.css);
    }
  };

  const getCurrentTemplate = (): CVTemplate | null => {
    if (!styles.template) return null;
    return TEMPLATE.getById(styles.template) || null;
  };

  return {
    styles,
    setStyle,
    applyTemplate,
    getCurrentTemplate
  };
});
