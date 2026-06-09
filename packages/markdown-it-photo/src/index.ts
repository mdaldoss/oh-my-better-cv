import type { PluginSimple } from "markdown-it";

const photoInline = (state: any, silent: boolean) => {
  const start = state.pos;

  // Check for [PHOTO] opening tag
  if (state.src.slice(start, start + 7) !== "[PHOTO]") {
    return false;
  }

  // Find the closing [/PHOTO] tag
  const closeStart = state.src.indexOf("[/PHOTO]", start + 7);
  if (closeStart === -1) {
    return false;
  }

  // Extract the URL content between the tags
  const url = state.src.slice(start + 7, closeStart).trim();
  
  if (!url) {
    return false;
  }

  if (!silent) {
    const token = state.push("photo", "photo", 0);
    token.content = url;
    token.markup = "[PHOTO]";
  }

  state.pos = closeStart + 8; // Move past [/PHOTO]
  return true;
};

/**
 * A markdown-it plugin for rendering profile photos using [PHOTO]...[/PHOTO] syntax.
 */
export const MarkdownItPhoto: PluginSimple = (md) => {
  md.inline.ruler.after("escape", "photo", photoInline);

  md.renderer.rules.photo = (tokens, idx): string => {
    const token = tokens[idx];
    const url = token.content;
    
    return `<img src="${url}" alt="Profile Photo" class="profile-photo" data-photo-url="${url}" />`;
  };
};

export default MarkdownItPhoto;
