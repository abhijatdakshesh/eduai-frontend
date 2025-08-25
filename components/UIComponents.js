import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet, 
  Platform,
  Dimensions,
  ScrollView,
  ActivityIndicator
} from 'react-native';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

// Theme colors
export const colors = {
  primary: '#1a237e',
  primaryDark: '#0d47a1',
  primaryLight: '#534bae',
  accent: '#2962ff',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1a237e',
  textSecondary: '#546e7a',
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
};

// Card Component
export const Card = ({ children, style, ...props }) => (
  <View style={[styles.card, style]} {...props}>
    {children}
  </View>
);

// Button Component
export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  ...props 
}) => {
  const buttonStyles = [
    styles.button,
    styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}`],
    disabled && styles.buttonDisabled,
    style
  ];

  const textStyles = [
    styles.buttonText,
    styles[`buttonText${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`buttonText${size.charAt(0).toUpperCase() + size.slice(1)}`],
    disabled && styles.buttonTextDisabled,
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? colors.primary : '#ffffff'} 
          size="small" 
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// Input Component
export const Input = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoComplete = 'off',
  returnKeyType = 'done',
  onSubmitEditing,
  style,
  labelStyle,
  inputStyle,
  error,
  ...props 
}) => (
  <View style={[styles.inputContainer, style]}>
    {label && <Text style={[styles.inputLabel, labelStyle]}>{label}</Text>}
    <TextInput
      style={[
        styles.input,
        error && styles.inputError,
        inputStyle
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.placeholder}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoComplete={autoComplete}
      returnKeyType={returnKeyType}
      onSubmitEditing={onSubmitEditing}
      {...props}
    />
    {error && <Text style={styles.inputErrorText}>{error}</Text>}
  </View>
);

// Chip Component
export const Chip = ({ 
  title, 
  onPress, 
  selected = false, 
  style, 
  textStyle,
  ...props 
}) => (
  <TouchableOpacity
    style={[
      styles.chip,
      selected && styles.chipSelected,
      style
    ]}
    onPress={onPress}
    {...props}
  >
    <Text style={[
      styles.chipText,
      selected && styles.chipTextSelected,
      textStyle
    ]}>
      {title}
    </Text>
  </TouchableOpacity>
);

// Section Header Component
export const SectionHeader = ({ title, subtitle, style, titleStyle, subtitleStyle }) => (
  <View style={[styles.sectionHeader, style]}>
    <Text style={[styles.sectionTitle, titleStyle]}>{title}</Text>
    {subtitle && <Text style={[styles.sectionSubtitle, subtitleStyle]}>{subtitle}</Text>}
  </View>
);

// Loading Component
export const LoadingView = ({ message = 'Loading...', style }) => (
  <View style={[styles.loadingContainer, style]}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

// Empty State Component
export const EmptyState = ({ 
  icon = '📭', 
  title = 'No Data', 
  message = 'There\'s nothing to display here.',
  actionTitle,
  onAction,
  style 
}) => (
  <View style={[styles.emptyState, style]}>
    <Text style={styles.emptyStateIcon}>{icon}</Text>
    <Text style={styles.emptyStateTitle}>{title}</Text>
    <Text style={styles.emptyStateMessage}>{message}</Text>
    {actionTitle && onAction && (
      <Button 
        title={actionTitle} 
        onPress={onAction} 
        variant="outline" 
        size="small"
        style={styles.emptyStateButton}
      />
    )}
  </View>
);

// Search Input Component
export const SearchInput = ({ 
  value, 
  onChangeText, 
  placeholder = 'Search...',
  style,
  ...props 
}) => (
  <View style={[styles.searchContainer, style]}>
    <Text style={styles.searchIcon}>🔍</Text>
    <TextInput
      style={styles.searchInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.placeholder}
      {...props}
    />
  </View>
);

// Divider Component
export const Divider = ({ style, color = colors.divider, height = 1 }) => (
  <View style={[styles.divider, { backgroundColor: color, height }, style]} />
);

// Badge Component
export const Badge = ({ 
  title, 
  variant = 'default', 
  size = 'medium',
  style, 
  textStyle 
}) => (
  <View style={[
    styles.badge,
    styles[`badge${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`badge${size.charAt(0).toUpperCase() + size.slice(1)}`],
    style
  ]}>
    <Text style={[
      styles.badgeText,
      styles[`badgeText${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
      styles[`badgeText${size.charAt(0).toUpperCase() + size.slice(1)}`],
      textStyle
    ]}>
      {title}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  // Card styles
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    marginVertical: 8,
  },

  // Button styles
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.textSecondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonMedium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  buttonTextPrimary: {
    color: '#ffffff',
  },
  buttonTextSecondary: {
    color: '#ffffff',
  },
  buttonTextOutline: {
    color: colors.primary,
  },
  buttonTextSmall: {
    fontSize: isIOS ? 14 : 12,
  },
  buttonTextMedium: {
    fontSize: isIOS ? 16 : 14,
  },
  buttonTextLarge: {
    fontSize: isIOS ? 18 : 16,
  },
  buttonTextDisabled: {
    opacity: 0.6,
  },

  // Input styles
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: isIOS ? 16 : 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.inputBackground,
    fontSize: isIOS ? 16 : 14,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputErrorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },

  // Chip styles
  chip: {
    backgroundColor: colors.divider,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#ffffff',
  },

  // Section header styles
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: isIOS ? 20 : 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: isIOS ? 14 : 12,
    color: colors.textSecondary,
  },

  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: isIOS ? 16 : 14,
    color: colors.textSecondary,
  },

  // Empty state styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: isIOS ? 20 : 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: isIOS ? 16 : 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    marginTop: 8,
  },

  // Search styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: colors.textSecondary,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: isIOS ? 16 : 14,
    color: colors.text,
  },

  // Divider styles
  divider: {
    width: '100%',
  },

  // Badge styles
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDefault: {
    backgroundColor: colors.divider,
  },
  badgeSuccess: {
    backgroundColor: colors.success,
  },
  badgeError: {
    backgroundColor: colors.error,
  },
  badgeWarning: {
    backgroundColor: colors.warning,
  },
  badgeInfo: {
    backgroundColor: colors.info,
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeMedium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontWeight: '600',
    color: colors.text,
  },
  badgeTextDefault: {
    color: colors.text,
  },
  badgeTextSuccess: {
    color: '#ffffff',
  },
  badgeTextError: {
    color: '#ffffff',
  },
  badgeTextWarning: {
    color: '#ffffff',
  },
  badgeTextInfo: {
    color: '#ffffff',
  },
  badgeTextSmall: {
    fontSize: 10,
  },
  badgeTextMedium: {
    fontSize: 12,
  },
  badgeTextLarge: {
    fontSize: 14,
  },
});

export default {
  Card,
  Button,
  Input,
  Chip,
  SectionHeader,
  LoadingView,
  EmptyState,
  SearchInput,
  Divider,
  Badge,
  colors,
};
