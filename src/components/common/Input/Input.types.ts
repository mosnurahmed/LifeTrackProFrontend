/**
 * Input Component Types
 */

import { TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { Control, FieldValues, Path } from 'react-hook-form';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'phone' | 'multiline';

export interface InputProps<T extends FieldValues = any> extends Omit<TextInputProps, 'style'> {
  // react-hook-form integration
  control?: Control<T>;
  name?: Path<T>;
  
  // Basic props
  label?: string;
  placeholder?: string;
  type?: InputType;
  error?: string;
  
  // Icons
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  
  // Styling
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  
  // Other
  disabled?: boolean;
  required?: boolean;
}