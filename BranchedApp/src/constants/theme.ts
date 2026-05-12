export const Colors = {
  bg:          '#06040e',
  bgStory:     '#0d0920',
  surface:     '#13102a',
  surfaceHigh: '#1e1a38',
  border:      '#2a2550',
  text:        '#e8e0ff',
  textSoft:    '#9b92c8',
  textMuted:   '#5a5280',
  accent:      '#c084fc',
  accentDim:   '#7c2de8',
  teal:        '#0e8c7a',
  amber:       '#c07010',
  purple:      '#7c2de8',
  win:         '#16a34a',
  fail:        '#c2410c',
  lesson:      '#7e22ce',

  choice: ['#7c2de8', '#0e8c7a', '#c07010'] as const,
} as const;

export const FontFamily = {
  heading: 'PlayfairDisplay_700Bold',
  body:    'Lato_400Regular',
  bodyBold:'Lato_700Bold',
} as const;

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
} as const;

export const Spacing = {
  xs:  4,
  sm:  8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl:48,
} as const;
