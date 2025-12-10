/* eslint-disable react-native/no-inline-styles */
/**
 * Reusable Button Component
 *
 * Usage:
 * <Button onPress={handleSubmit}>Save</Button>
 * <Button variant="outline" size="lg">Edit</Button>
 * <Button loading={isLoading}>Submit</Button>
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  //   TouchableOpacityProps,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { ButtonProps } from './Button.types';
import { createButtonStyles } from './Button.styles';

const Button: React.FC<ButtonProps> = ({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  // Create dynamic styles
  const styles = createButtonStyles(colors, variant, size, disabled, fullWidth);

  // Get icon color based on variant
  const getIconColor = () => {
    if (variant === 'outline' || variant === 'ghost') {
      return colors.primary;
    }
    return colors.text.inverse;
  };

  // Get icon size based on button size
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 24;
      default:
        return 20;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        // Loading state
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={
              variant === 'outline' || variant === 'ghost'
                ? colors.primary
                : colors.text.inverse
            }
          />
          <Text style={[styles.text, textStyle, { marginLeft: 8 }]}>
            Loading...
          </Text>
        </View>
      ) : (
        // Normal state
        <>
          {icon && iconPosition === 'left' && (
            <Icon
              name={icon}
              size={getIconSize()}
              color={getIconColor()}
              style={styles.icon}
            />
          )}

          {typeof children === 'string' ? (
            <Text style={[styles.text, textStyle]}>{children}</Text>
          ) : (
            children
          )}

          {icon && iconPosition === 'right' && (
            <Icon
              name={icon}
              size={getIconSize()}
              color={getIconColor()}
              style={styles.icon}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
