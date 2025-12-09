/**
 * Typography System
 */

export interface Typography {
  fontFamily: {
    regular: string;
    medium: string;
    semiBold: string;
    bold: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
  };
  fontWeight: {
    regular: '400';
    medium: '500';
    semiBold: '600';
    bold: '700';
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  letterSpacing: {
    tight: number;
    normal: number;
    wide: number;
  };
}

export const typography: Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System'
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700'
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5
  }
};

export const textStyles = {
  h1: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold as any,
    lineHeight: typography.fontSize['4xl'] * typography.lineHeight.tight,
    fontFamily: typography.fontFamily.bold
  },
  h2: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold as any,
    lineHeight: typography.fontSize['3xl'] * typography.lineHeight.tight,
    fontFamily: typography.fontFamily.bold
  },
  h3: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semiBold as any,
    lineHeight: typography.fontSize['2xl'] * typography.lineHeight.normal,
    fontFamily: typography.fontFamily.semiBold
  },
  h4: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold as any,
    lineHeight: typography.fontSize.xl * typography.lineHeight.normal,
    fontFamily: typography.fontFamily.semiBold
  },
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular as any,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    fontFamily: typography.fontFamily.regular
  },
  bodyMedium: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as any,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    fontFamily: typography.fontFamily.medium
  },
  bodySemiBold: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold as any,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    fontFamily: typography.fontFamily.semiBold
  },
  caption: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular as any,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    fontFamily: typography.fontFamily.regular
  },
  captionMedium: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    fontFamily: typography.fontFamily.medium
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium as any,
    lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
    textTransform: 'uppercase' as const,
    letterSpacing: typography.letterSpacing.wide,
    fontFamily: typography.fontFamily.medium
  },
  button: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold as any,
    lineHeight: typography.fontSize.base * typography.lineHeight.tight,
    fontFamily: typography.fontFamily.semiBold
  }
};