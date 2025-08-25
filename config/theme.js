import { Platform } from 'react-native';

const isIOS = Platform.OS === 'ios';

// Beautiful dark blue and white theme
export const theme = {
  colors: {
    primary: '#1a237e', // Dark blue
    primaryDark: '#0d47a1',
    primaryLight: '#534bae',
    accent: '#2962ff', // Bright blue accent
    background: '#f8fafc', // Light gray background
    surface: '#ffffff',
    text: '#1a237e', // Dark blue text
    textSecondary: '#546e7a', // Gray text
    error: '#d32f2f',
    success: '#388e3c',
    warning: '#f57c00',
    info: '#1976d2',
    divider: '#e3f2fd',
    card: '#ffffff',
    border: '#e8eaf6',
    inputBackground: '#f9fafb',
    inputBorder: '#d1d5db',
    placeholder: '#999',
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700',
    },
    bodySmall: {
      fontFamily: 'System',
      fontWeight: '400',
      fontSize: isIOS ? 12 : 11,
    },
    labelLarge: {
      fontFamily: 'System',
      fontWeight: '500',
      fontSize: isIOS ? 14 : 13,
      letterSpacing: 0.1,
    },
    labelMedium: {
      fontFamily: 'System',
      fontWeight: '500',
      fontSize: isIOS ? 12 : 11,
      letterSpacing: 0.5,
    },
    labelSmall: {
      fontFamily: 'System',
      fontWeight: '500',
      fontSize: isIOS ? 11 : 10,
      letterSpacing: 0.5,
    },
    bodyLarge: {
      fontFamily: 'System',
      fontWeight: '400',
      fontSize: isIOS ? 16 : 15,
    },
    bodyMedium: {
      fontFamily: 'System',
      fontWeight: '400',
      fontSize: isIOS ? 14 : 13,
    },
    titleLarge: {
      fontFamily: 'System',
      fontWeight: '400',
      fontSize: isIOS ? 22 : 20,
    },
    titleMedium: {
      fontFamily: 'System',
      fontWeight: '500',
      fontSize: isIOS ? 16 : 15,
    },
    titleSmall: {
      fontFamily: 'System',
      fontWeight: '500',
      fontSize: isIOS ? 14 : 13,
    },
    headlineLarge: {
      fontFamily: 'System',
      fontWeight: '400',
      fontSize: isIOS ? 32 : 28,
    },
    headlineMedium: {
      fontFamily: 'System',
      fontWeight: '400',
      fontSize: isIOS ? 28 : 24,
    },
    headlineSmall: {
      fontFamily: 'System',
      fontWeight: '400',
      fontSize: isIOS ? 24 : 20,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  roundness: 12,
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
  },
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
};

// Common styles that can be reused
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.roundness,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
    marginVertical: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.roundness,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.inputBackground,
    fontSize: theme.fonts.bodyMedium.fontSize,
    color: theme.colors.text,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.roundness,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: theme.fonts.titleMedium.fontSize,
  },
  header: {
    backgroundColor: theme.colors.primary,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: theme.fonts.titleLarge.fontSize,
  },
};

// Helper functions for consistent styling
export const createResponsiveStyle = (iosStyle, androidStyle) => 
  Platform.select({
    ios: iosStyle,
    android: androidStyle,
  });

export const createShadowStyle = (shadowType = 'medium') => 
  theme.shadows[shadowType];

export const createTextStyle = (fontType = 'bodyMedium') => 
  theme.fonts[fontType];

export default theme;
