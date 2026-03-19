const coreTheme = {
  background: '#1C1410',
  surface: '#2A1F18',
  text: '#F0EBE3',
  textSecondary: 'rgba(240,235,227,0.55)',
  textMuted: 'rgba(240,235,227,0.28)',
  border: 'rgba(255,255,255,0.07)',
  primary: '#E8622A',
  accent: '#F5D76E',
  inputBg: '#231A14',
  skeleton: '#2C211A',
  error: '#E05555',
  favorite: '#F5D76E',
  headerBg: '#1C1410',
  statBar: 'rgba(255,255,255,0.07)',
};

export const Colors = {
  light: coreTheme,
  dark: coreTheme,
} as const;

export type AppColors = { [K in keyof typeof Colors.light]: string };
