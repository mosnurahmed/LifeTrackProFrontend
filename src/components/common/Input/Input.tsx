/**
 * Reusable Input Component
 *
 * Supports: text, email, password, number, phone, multiline
 * Integrates with react-hook-form
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { InputProps } from './Input.types';

function Input<T extends FieldValues = any>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  disabled = false,
  required = false,
  ...rest
}: InputProps<T>) {
  const { colors, spacing, borderRadius, textStyles } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Get keyboard type based on input type
  const getKeyboardType = () => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'number':
        return 'numeric';
      case 'phone':
        return 'phone-pad';
      default:
        return 'default';
    }
  };

  // Get secure text entry for password
  const isSecure = type === 'password' && !isPasswordVisible;

  // Get text content type for autofill
  const getTextContentType = () => {
    switch (type) {
      case 'email':
        return 'emailAddress';
      case 'password':
        return 'password';
      case 'phone':
        return 'telephoneNumber';
      default:
        return 'none';
    }
  };

  const styles = createStyles(
    colors,
    spacing,
    borderRadius,
    textStyles,
    isFocused,
    !!error,
    disabled,
  );

  // Render input (with or without form control)
  const renderInput = (onChange?: any, onBlur?: any, value?: any) => (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Input Container */}
      <View style={styles.inputContainer}>
        {/* Left Icon */}
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={20}
            color={isFocused ? colors.primary : colors.text.secondary}
            style={styles.leftIcon}
          />
        )}

        {/* Text Input */}
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          keyboardType={getKeyboardType()}
          secureTextEntry={isSecure}
          textContentType={getTextContentType() as any}
          autoCapitalize={type === 'email' ? 'none' : 'sentences'}
          editable={!disabled}
          multiline={type === 'multiline'}
          numberOfLines={type === 'multiline' ? 4 : 1}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          onChangeText={onChange}
          value={value}
          {...rest}
        />

        {/* Right Icon or Password Toggle */}
        {type === 'password' ? (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.rightIcon}
          >
            <Icon
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Icon name={rightIcon} size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Error Message */}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );

  // If using react-hook-form
  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error: fieldError },
        }) => renderInput(onChange, onBlur, value)}
      />
    );
  }

  // Standalone input
  return renderInput();
}

const createStyles = (
  colors: any,
  spacing: any,
  borderRadius: any,
  textStyles: any,
  isFocused: boolean,
  hasError: boolean,
  disabled: boolean,
) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    label: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    required: {
      color: colors.danger,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: hasError
        ? colors.danger
        : isFocused
        ? colors.primary
        : colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: disabled ? colors.surface : colors.background,
      paddingHorizontal: spacing.md,
    },
    input: {
      flex: 1,
      ...textStyles.body,
      color: colors.text.primary,
      paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
      minHeight: 44,
    },
    leftIcon: {
      marginRight: spacing.sm,
    },
    rightIcon: {
      marginLeft: spacing.sm,
      padding: spacing.xs,
    },
    error: {
      ...textStyles.caption,
      color: colors.danger,
      marginTop: spacing.xs,
    },
  });

export default Input;
