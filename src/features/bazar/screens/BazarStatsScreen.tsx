/* eslint-disable react-native/no-inline-styles */
/**
 * Bazar Statistics Screen — Professional Minimal
 */

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-chart-kit';
import { useTheme } from '../../../hooks/useTheme';
import { useBazarStats } from '../../../hooks/api/useBazar';
import { Spinner, ErrorState } from '../../../components/common';
import { formatCurrency } from '../../../utils/formatters';

const { width } = Dimensions.get('window');

const BazarStatsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const { data: statsData, isLoading, error } = useBazarStats();
  const stats = statsData?.data;

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';

  const pieData = stats && (stats.completedLists > 0 || stats.activeLists > 0) ? [
    { name: 'Done', population: stats.completedLists || 0, color: '#4A9B6E', legendFontColor: textPri, legendFontSize: 11 },
    { name: 'Active', population: stats.activeLists || 0, color: colors.primary, legendFontColor: textPri, legendFontSize: 11 },
  ] : [];

  const chartConfig = {
    backgroundGradientFrom: surfaceC,
    backgroundGradientTo: surfaceC,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: surfaceC, borderBottomColor: borderC }]}>
      <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={22} color={textPri} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: textPri }]}>Shopping Statistics</Text>
      <View style={{ width: 38 }} />
    </View>
  );

  if (isLoading) return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {header}
      <Spinner text="Loading..." />
    </View>
  );

  if (error || !stats) return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {header}
      <ErrorState title="Failed to load" message="Please try again" onRetry={() => navigation.goBack()} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {header}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
        {/* Summary Row */}
        <View style={[styles.summaryCard, { backgroundColor: surfaceC, borderColor: borderC }]}>
          {[
            { val: stats.totalLists || 0, label: 'Lists' },
            { val: stats.completedLists || 0, label: 'Done' },
            { val: stats.activeLists || 0, label: 'Active' },
            { val: stats.totalItems || 0, label: 'Items' },
          ].map((s, i) => (
            <View key={i} style={[styles.summaryItem, i < 3 && { borderRightWidth: 1, borderRightColor: borderC }]}>
              <Text style={[styles.summaryVal, { color: textPri }]}>{s.val}</Text>
              <Text style={[styles.summaryLabel, { color: textSec }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <View style={[styles.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <View style={styles.cardHeader}>
              <Icon name="pie-chart-outline" size={16} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: textPri }]}>Lists Overview</Text>
            </View>
            <PieChart
              data={pieData}
              width={width - 64}
              height={160}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 0]}
              absolute
            />
          </View>
        )}

        {/* Spending */}
        <View style={[styles.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
          <View style={styles.cardHeader}>
            <Icon name="wallet-outline" size={16} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: textPri }]}>Spending</Text>
          </View>
          <View style={styles.spendRow}>
            {[
              { label: 'Total Spent', val: formatCurrency(stats.totalSpent || 0), color: textPri },
              { label: 'This Month', val: formatCurrency(stats.thisMonthSpent || 0), color: '#4A9B6E' },
              { label: 'Avg/List', val: formatCurrency(stats.averagePerList || 0), color: '#D4956A' },
            ].map((s, i) => (
              <View key={i} style={[styles.spendItem, i < 2 && { borderRightWidth: 1, borderRightColor: borderC }]}>
                <Text style={[styles.spendVal, { color: s.color }]}>{s.val}</Text>
                <Text style={[styles.spendLabel, { color: textSec }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Categories */}
        {stats.topCategories && stats.topCategories.length > 0 && (
          <View style={[styles.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <View style={styles.cardHeader}>
              <Icon name="list-outline" size={16} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: textPri }]}>Top Categories</Text>
            </View>
            {stats.topCategories.slice(0, 5).map((cat: any, i: number) => (
              <View key={i} style={[styles.listRow, i < Math.min(stats.topCategories.length, 5) - 1 && { borderBottomWidth: 1, borderBottomColor: borderC }]}>
                <View style={[styles.rank, { backgroundColor: i === 0 ? colors.primary + '20' : borderC }]}>
                  <Text style={[styles.rankText, { color: i === 0 ? colors.primary : textSec }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.listName, { color: textPri }]}>{cat.name}</Text>
                <Text style={[styles.listCount, { color: textSec }]}>{cat.count} items</Text>
              </View>
            ))}
          </View>
        )}

        {/* Most Purchased */}
        {stats.mostPurchasedItems && stats.mostPurchasedItems.length > 0 && (
          <View style={[styles.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <View style={styles.cardHeader}>
              <Icon name="cart-outline" size={16} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: textPri }]}>Most Purchased</Text>
            </View>
            {stats.mostPurchasedItems.slice(0, 8).map((item: any, i: number) => (
              <View key={i} style={[styles.listRow, i < Math.min(stats.mostPurchasedItems.length, 8) - 1 && { borderBottomWidth: 1, borderBottomColor: borderC }]}>
                <View style={[styles.rank, { backgroundColor: i < 3 ? colors.primary + '20' : borderC }]}>
                  <Text style={[styles.rankText, { color: i < 3 ? colors.primary : textSec }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.listName, { color: textPri }]}>{item.name}</Text>
                <View style={[styles.countBadge, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[styles.countBadgeText, { color: colors.primary }]}>{item.count}x</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Insights */}
        {stats.totalSpent > 0 && (
          <View style={[styles.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <View style={styles.cardHeader}>
              <Icon name="bulb-outline" size={16} color="#D4956A" />
              <Text style={[styles.cardTitle, { color: textPri }]}>Insights</Text>
            </View>
            <Text style={[styles.insightText, { color: textSec }]}>
              You've completed <Text style={{ color: textPri, fontWeight: '700' }}>{stats.completedLists || 0}</Text> shopping trips
              with an average of <Text style={{ color: textPri, fontWeight: '700' }}>{formatCurrency(stats.averagePerList || 0)}</Text> per trip.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1,
  },
  headerBtn: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700' },

  summaryCard: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 12 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: 16, fontWeight: '800', marginBottom: 1 },
  summaryLabel: { fontSize: 10 },

  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700' },

  spendRow: { flexDirection: 'row' },
  spendItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  spendVal: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  spendLabel: { fontSize: 11 },

  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, gap: 10 },
  rank: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  rankText: { fontSize: 11, fontWeight: '700' },
  listName: { flex: 1, fontSize: 13, fontWeight: '600' },
  listCount: { fontSize: 12 },
  countBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  countBadgeText: { fontSize: 11, fontWeight: '700' },

  insightText: { fontSize: 13, lineHeight: 20 },
});

export default BazarStatsScreen;
