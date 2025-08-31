import { themeManager } from './manager';
import type { I18nKeyStyle, ThemeTokens } from './types';

function applyStyleToElement(el: HTMLElement, style: I18nKeyStyle, tokens: ThemeTokens) {
  if (style.colorVar) el.style.color = getComputedStyle(document.body).getPropertyValue(style.colorVar) || (undefined as any);
  if (style.fontSize) el.style.fontSize = style.fontSize;
  if (style.fontWeight) el.style.fontWeight = String(style.fontWeight);
  if (style.lineHeight) el.style.lineHeight = style.lineHeight;
  if (style.letterSpacing) el.style.letterSpacing = style.letterSpacing;
  if (style.textTransform) el.style.textTransform = style.textTransform;
}

/**
 * Apply styles to elements annotated with data-i18n-key
 * Example: <span data-i18n-key="title">标题</span>
 */
export function applyI18nStyles(root: HTMLElement = document.body) {
  const { pack, mode } = themeManager.getCurrent();
  const tokens = (mode === 'dark' ? pack.dark : pack.light) as ThemeTokens;
  const styles = tokens.i18nStyles || {};
  const nodes = root.querySelectorAll<HTMLElement>('[data-i18n-key]');
  nodes.forEach((el) => {
    const key = el.getAttribute('data-i18n-key') || '';
    const style = resolveI18nStyle(styles, key);
    if (style) applyStyleToElement(el, style, tokens);
  });
}

/** register a MutationObserver to auto-apply when DOM updates */
let observer: MutationObserver | null = null;
export function enableI18nStyleObserver(root: HTMLElement = document.body) {
  if (observer) return;
  observer = new MutationObserver(() => applyI18nStyles(root));
  observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-i18n-key'] });
  applyI18nStyles(root);
}

export function disableI18nStyleObserver() {
  if (observer) observer.disconnect();
  observer = null;
}

/**
 * 支持样式解析优先级：精确匹配 > 前缀通配（a.b.*）> 全局默认（*）
 */
export function resolveI18nStyle(all: Record<string, I18nKeyStyle>, key: string): I18nKeyStyle | undefined {
  if (!key) return all['*'];
  if (all[key]) return all[key];
  // prefix wildcards: a.b.c -> try a.b.* then a.*
  const parts = key.split('.');
  for (let i = parts.length - 1; i >= 1; i--) {
    const prefix = parts.slice(0, i).join('.') + '.*';
    if (all[prefix]) return all[prefix];
  }
  return all['*'];
}
