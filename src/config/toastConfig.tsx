/**
 * Toast Configuration
 *
 * Custom toast styles matching app theme
 */

import { BaseToastProps } from 'react-native-toast-message';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { lightColors, darkColors } from '../theme/colors';

export const toastConfig = {
  success: (props: BaseToastProps) => (
    <View style={[styles.container, styles.success]}>
      <Icon name="checkmark-circle" size={24} color="#FFF" />
      <View style={styles.textContainer}>
        <Text style={styles.text1}>{props.text1}</Text>
        {props.text2 && <Text style={styles.text2}>{props.text2}</Text>}
      </View>
    </View>
  ),

  error: (props: BaseToastProps) => (
    <View style={[styles.container, styles.error]}>
      <Icon name="close-circle" size={24} color="#FFF" />
      <View style={styles.textContainer}>
        <Text style={styles.text1}>{props.text1}</Text>
        {props.text2 && <Text style={styles.text2}>{props.text2}</Text>}
      </View>
    </View>
  ),

  info: (props: BaseToastProps) => (
    <View style={[styles.container, styles.info]}>
      <Icon name="information-circle" size={24} color="#FFF" />
      <View style={styles.textContainer}>
        <Text style={styles.text1}>{props.text1}</Text>
        {props.text2 && <Text style={styles.text2}>{props.text2}</Text>}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  success: {
    backgroundColor: lightColors.success,
  },
  error: {
    backgroundColor: lightColors.danger,
  },
  info: {
    backgroundColor: lightColors.info,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  text1: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  text2: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 2,
  },
});
