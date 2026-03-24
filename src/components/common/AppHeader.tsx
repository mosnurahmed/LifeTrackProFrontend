/**
 * AppHeader — reusable header for all screens
 *
 * Tab screens (showDrawer=true): LEFT = drawer menu, RIGHT = optional custom
 * Non-tab screens: LEFT = back arrow, RIGHT = drawer menu
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/useTheme';

interface AppHeaderProps {
  title: string;
  right?: React.ReactNode;
  showDrawer?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, right, showDrawer }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();

  const isTab = showDrawer || !navigation.canGoBack();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + 10,
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* Left */}
      <TouchableOpacity
        style={styles.btn}
        onPress={() => isTab
          ? navigation.dispatch(DrawerActions.openDrawer())
          : navigation.goBack()
        }
        activeOpacity={0.7}
      >
        <Icon
          name={isTab ? 'grid-outline' : 'arrow-back'}
          size={22}
          color={colors.text.primary}
        />
      </TouchableOpacity>

      {/* Title */}
      <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>
        {title}
      </Text>

      {/* Right */}
      {isTab ? (
        <View style={styles.rightWrap}>{right ?? <View style={styles.btn} />}</View>
      ) : (
        <View style={styles.rightWrap}>
          {right ?? (
            <TouchableOpacity
              style={styles.btn}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              activeOpacity={0.7}
            >
              <Icon name="grid-outline" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  btn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 4,
  },
  rightWrap: {
    minWidth: 38,
    alignItems: 'flex-end',
  },
});

export default AppHeader;
