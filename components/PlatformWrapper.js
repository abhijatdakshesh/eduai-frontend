import React from 'react';
import {
  View,
  ScrollView,
  FlatList,
  SectionList,
  RefreshControl,
  StyleSheet,
  Text,
} from 'react-native';
import {
  Button,
  TextInput,
  Card,
  Title,
  Paragraph,
  Chip,
  FAB,
  Portal,
  List,
  Avatar,
  Divider,
  Badge,
  ProgressBar,
  Switch,
  RadioButton,
  Checkbox,
  SegmentedButtons,
  Searchbar,
  DataTable,
  ActivityIndicator,
  Snackbar,
  IconButton,
  Surface,
  TouchableRipple,
} from 'react-native-paper';

// Re-export React Native components
export {
  View,
  ScrollView,
  FlatList,
  SectionList,
  RefreshControl,
  StyleSheet,
  Text,
};

// Re-export React Native Paper components
export {
  Button,
  TextInput,
  Card,
  Title,
  Paragraph,
  Chip,
  FAB,
  Portal,
  List,
  Avatar,
  Divider,
  Badge,
  ProgressBar,
  Switch,
  RadioButton,
  Checkbox,
  SegmentedButtons,
  Searchbar,
  DataTable,
  ActivityIndicator,
  Snackbar,
  IconButton,
  Surface,
  TouchableRipple,
};

// Platform-specific components with consistent API
export const PlatformButton = ({ mode = 'contained', ...props }) => (
  <Button mode={mode} {...props} />
);

export const PlatformInput = ({ mode = 'outlined', ...props }) => (
  <TextInput mode={mode} {...props} />
);

export const PlatformCard = ({ elevation = 4, ...props }) => (
  <Card elevation={elevation} {...props} />
);

export const PlatformAvatar = ({ ...props }) => (
  <Avatar {...props} />
);

// Add Text property to PlatformAvatar
PlatformAvatar.Text = Avatar.Text;

export const PlatformModal = ({ visible, onDismiss, children, contentContainerStyle, ...props }) => {
  if (!visible) return null;
  
  return (
    <Portal>
      <View 
        style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: 'rgba(0,0,0,0.5)',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        onTouchEnd={onDismiss}
      >
        <View 
          style={[
            { 
              backgroundColor: 'white', 
              padding: 20, 
              borderRadius: 8, 
              margin: 20, 
              maxWidth: '90%',
              maxHeight: '80%',
            },
            contentContainerStyle
          ]}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {children}
        </View>
      </View>
    </Portal>
  );
};

export const PlatformList = ({ title, description, left, right, onPress, ...props }) => (
  <List.Item
    title={title}
    description={description}
    left={left}
    right={right}
    onPress={onPress}
    {...props}
  />
);

export const PlatformChip = ({ selected, onPress, ...props }) => (
  <Chip selected={selected} onPress={onPress} {...props} />
);

export const PlatformSearchbar = ({ placeholder, onChangeText, value, ...props }) => (
  <Searchbar placeholder={placeholder} onChangeText={onChangeText} value={value} {...props} />
);

export const PlatformFAB = ({ icon, onPress, ...props }) => (
  <FAB icon={icon} onPress={onPress} {...props} />
);

export const PlatformSnackbar = ({ visible, onDismiss, children, ...props }) => (
  <Snackbar visible={visible} onDismiss={onDismiss} {...props}>
    {children}
  </Snackbar>
);

export const PlatformBadge = ({ children, ...props }) => (
  <Badge {...props}>{children}</Badge>
);

export const PlatformProgressBar = ({ progress, color, ...props }) => (
  <ProgressBar progress={progress} color={color} {...props} />
);

export const PlatformSwitch = ({ value, onValueChange, ...props }) => (
  <Switch value={value} onValueChange={onValueChange} {...props} />
);

export const PlatformRadioButton = ({ value, onValueChange, ...props }) => (
  <RadioButton value={value} onValueChange={onValueChange} {...props} />
);

export const PlatformCheckbox = ({ status, onPress, ...props }) => (
  <Checkbox status={status} onPress={onPress} {...props} />
);

export const PlatformSegmentedButtons = ({ value, onValueChange, buttons, ...props }) => (
  <SegmentedButtons value={value} onValueChange={onValueChange} buttons={buttons} {...props} />
);

export const PlatformDataTable = ({ children, ...props }) => (
  <DataTable {...props}>{children}</DataTable>
);

export const PlatformActivityIndicator = ({ size = 'small', ...props }) => (
  <ActivityIndicator size={size} {...props} />
);

export const PlatformIconButton = ({ icon, onPress, ...props }) => (
  <IconButton icon={icon} onPress={onPress} {...props} />
);

export const PlatformSurface = ({ elevation = 4, ...props }) => (
  <Surface elevation={elevation} {...props} />
);

export const PlatformTouchableRipple = ({ onPress, children, ...props }) => (
  <TouchableRipple onPress={onPress} {...props}>
    {children}
  </TouchableRipple>
); 