/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const TokensLightModule = require('@shared/design-tokens/dist/mobile/TokensLight');
const TokensDarkModule = require('@shared/design-tokens/dist/mobile/TokensDark');
const TokensLight = TokensLightModule.default ?? TokensLightModule;
const TokensDark = TokensDarkModule.default ?? TokensDarkModule;

export const Colors = {
  light: {
    text: TokensLight.lightSemanticColorTextPrimary,
    background: TokensLight.lightSemanticColorBgSubtle,
    tint: TokensLight.lightSemanticColorTextAccent,
    icon: TokensLight.lightSemanticColorIconPrimary,
    tabIconDefault: TokensLight.lightSemanticColorIconSecondary,
    tabIconSelected: TokensLight.lightSemanticColorTextAccent,
  },
  dark: {
    text: TokensDark.darkSemanticColorTextPrimary,
    background: TokensDark.darkSemanticColorBgSubtle,
    tint: TokensDark.darkSemanticColorTextAccent,
    icon: TokensDark.darkSemanticColorIconPrimary,
    tabIconDefault: TokensDark.darkSemanticColorIconSecondary,
    tabIconSelected: TokensDark.darkSemanticColorTextAccent,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
