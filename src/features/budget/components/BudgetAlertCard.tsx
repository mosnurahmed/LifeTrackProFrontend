/**
 * Budget Alert Card - Shows budget warnings
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { useBudgetAlerts } from '../../../hooks/api/useBudget';
import { Card } from '../../../components/common';

const BudgetAlertCard: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius } = useTheme();

  const { data: alertsData } = useBudgetAlerts();
  const alerts = alertsData?.data || [];

  const styles = createStyles(colors, textStyles, spacing, borderRadius);

  if (alerts.length === 0) return null;

  return (
    <Card style={styles.container}>
      <TouchableOpacity
        onPress={() => (navigation as any).navigate('Budget')}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Icon name="warning" size={20} color={colors.warning} />
          <Text style={styles.title}>Budget Alerts</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{alerts.length}</Text>
          </View>
        </View>

        {alerts.slice(0, 3).map((alert: any) => (
          <View key={alert.categoryId} style={styles.alertItem}>
            <View
              style={[
                styles.alertDot,
                {
                  backgroundColor:
                    alert.status === 'exceeded'
                      ? colors.danger
                      : colors.warning,
                },
              ]}
            />
            <Text style={styles.alertText} numberOfLines={1}>
              <Text style={styles.alertCategory}>{alert.categoryName}</Text> at{' '}
              {alert.percentage.toFixed(0)}%
            </Text>
          </View>
        ))}

        {alerts.length > 3 && (
          <Text style={styles.moreText}>+{alerts.length - 3} more alerts</Text>
        )}
      </TouchableOpacity>
    </Card>
  );
};

const createStyles = (
  colors: any,
  textStyles: any,
  spacing: any,
  borderRadius: any,
) =>
  StyleSheet.create({
    container: {
      backgroundColor: `${colors.warning}10`,
      borderWidth: 1,
      borderColor: `${colors.warning}30`,
      marginBottom: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    title: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      fontWeight: '600',
      flex: 1,
    },
    badge: {
      backgroundColor: colors.warning,
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      ...textStyles.caption,
      fontSize: 10,
      color: colors.text.inverse,
      fontWeight: '700',
    },
    alertItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.xs,
    },
    alertDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    alertText: {
      ...textStyles.body,
      color: colors.text.secondary,
      flex: 1,
    },
    alertCategory: {
      fontWeight: '600',
      color: colors.text.primary,
    },
    moreText: {
      ...textStyles.caption,
      color: colors.text.tertiary,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
  });

export default BudgetAlertCard;
