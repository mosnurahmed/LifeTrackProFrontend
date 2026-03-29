/**
 * Income Statistics Screen - Professional Minimal
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../../../hooks/useTheme';
import { useIncomeStats, useDailyIncomes } from '../../../hooks/api/useIncome';
import { Spinner, ErrorState, useGuide } from '../../../components/common';
import { formatCurrency } from '../../../utils/formatters';

const { width } = Dimensions.get('window');

const IncomeStatsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { GuideButton, GuideView } = useGuide('incomeStats');
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 90>(30);

  const { data: statsData, isLoading, error } = useIncomeStats();
  const { data: dailyData } = useDailyIncomes(selectedPeriod);

  const stats = statsData?.data;
  const dailyIncomes = dailyData?.data?.data || dailyData?.data || [];

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';
  const bgColor = colors.background;
  const accent = '#10B981';

  const chartConfig = {
    backgroundGradientFrom: surfaceC,
    backgroundGradientTo: surfaceC,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: () => textSec,
    style: { borderRadius: 10 },
  };

  const safeDaily = Array.isArray(dailyIncomes) ? dailyIncomes : [];

  const lineChartData = {
    labels: safeDaily.slice(-7).map((d: any) => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [{
      data: safeDaily.slice(-7).map((d: any) => d.total || 0),
      color: () => accent,
      strokeWidth: 2,
    }],
  };

  const pieChartData = stats?.categoryBreakdown?.slice(0, 5).map((cat: any, i: number) => ({
    name: cat.categoryName,
    population: cat.total,
    color: cat.categoryColor || [accent, '#8B5CF6', '#F59E0B', '#3B82F6', '#EF4444'][i % 5],
    legendFontColor: textPri,
    legendFontSize: 11,
  })) || [];

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: surfaceC, borderBottomColor: borderC }]}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color={textPri} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textPri }]}>Income Statistics</Text>
          <View style={{ width: 38 }} />
        </View>
        <Spinner text="Loading statistics..." />
      </View>
    );
  }

  if (error || !stats) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: surfaceC, borderBottomColor: borderC }]}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color={textPri} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textPri }]}>Income Statistics</Text>
          <View style={{ width: 38 }} />
        </View>
        <ErrorState title="Failed to load" message="Please try again" onRetry={() => navigation.goBack()} />
      </View>
    );
  }

  const SummaryCard = ({ icon, color, value, label, sub }: any) => (
    <View style={[styles.summaryCard, { backgroundColor: surfaceC, borderColor: borderC }]}>
      <View style={[styles.summaryIcon, { backgroundColor: color + '15' }]}>
        <Icon name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.summaryValue, { color: textPri }]} numberOfLines={1}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: textSec }]}>{label}</Text>
      {sub && <Text style={[styles.summarySub, { color: textSec }]}>{sub}</Text>}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: surfaceC, borderBottomColor: borderC }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={textPri} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPri }]}>Income Statistics</Text>
        <GuideButton color={textPri} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
        {/* Summary Grid */}
        <View style={styles.summaryGrid}>
          <SummaryCard icon="calendar-outline" color={accent} value={formatCurrency(stats.thisMonth?.total || 0)} label="This Month" sub={`${stats.thisMonth?.count || 0} entries`} />
          <SummaryCard icon="time-outline" color="#8B5CF6" value={formatCurrency(stats.lastMonth?.total || 0)} label="Last Month" sub={`${stats.lastMonth?.count || 0} entries`} />
          <SummaryCard icon="analytics-outline" color="#F59E0B" value={formatCurrency(stats.thisMonth?.count > 0 ? stats.thisMonth.total / stats.thisMonth.count : 0)} label="Average" sub="Per entry" />
          <SummaryCard icon="infinite-outline" color="#3B82F6" value={formatCurrency(stats.allTime?.total || 0)} label="All Time" sub={`${stats.allTime?.count || 0} entries`} />
        </View>

        {/* Period Selector */}
        <View style={styles.periodRow}>
          {([7, 30, 90] as const).map(days => (
            <TouchableOpacity
              key={days}
              style={[styles.periodBtn, selectedPeriod === days && { backgroundColor: accent, borderColor: accent }]}
              onPress={() => setSelectedPeriod(days)}
            >
              <Text style={[styles.periodText, { color: textSec }, selectedPeriod === days && { color: '#FFF' }]}>
                {days}D
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily Trend */}
        {safeDaily.length > 0 && lineChartData.datasets[0].data.length > 0 && (
          <View style={[styles.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <View style={styles.cardHeader}>
              <Icon name="trending-up" size={16} color={accent} />
              <Text style={[styles.cardTitle, { color: textPri }]}>Daily Trend</Text>
            </View>
            <LineChart
              data={lineChartData}
              width={width - 64}
              height={180}
              chartConfig={chartConfig}
              bezier
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLines={false}
              withDots={true}
              withShadow={false}
              fromZero
              style={{ borderRadius: 10, marginTop: 8 }}
            />
          </View>
        )}

        {/* Pie Chart */}
        {pieChartData.length > 0 && (
          <View style={[styles.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <View style={styles.cardHeader}>
              <Icon name="pie-chart-outline" size={16} color={accent} />
              <Text style={[styles.cardTitle, { color: textPri }]}>By Category</Text>
            </View>
            <PieChart
              data={pieChartData}
              width={width - 64}
              height={180}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 0]}
              absolute
            />
          </View>
        )}

        {/* Top Sources */}
        {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
          <View style={[styles.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <View style={styles.cardHeader}>
              <Icon name="list-outline" size={16} color={accent} />
              <Text style={[styles.cardTitle, { color: textPri }]}>Top Sources</Text>
            </View>
            {stats.categoryBreakdown.slice(0, 5).map((cat: any, i: number) => (
              <View key={cat.categoryId || i} style={[styles.catRow, i < Math.min(stats.categoryBreakdown.length, 5) - 1 && { borderBottomWidth: 1, borderBottomColor: borderC }]}>
                <View style={[styles.catIcon, { backgroundColor: (cat.categoryColor || accent) + '15' }]}>
                  <Icon name={cat.categoryIcon || 'cash-outline'} size={16} color={cat.categoryColor || accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.catName, { color: textPri }]}>{cat.categoryName}</Text>
                  <Text style={[styles.catCount, { color: textSec }]}>{cat.count} entries</Text>
                </View>
                <Text style={[styles.catAmount, { color: accent }]}>{formatCurrency(cat.total)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Insights */}
        {stats.comparison && stats.comparison.percentageChange !== 0 && (
          <View style={[styles.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <View style={styles.cardHeader}>
              <Icon name="bulb-outline" size={16} color="#F59E0B" />
              <Text style={[styles.cardTitle, { color: textPri }]}>Insight</Text>
            </View>
            <Text style={[styles.insightText, { color: textSec }]}>
              Your income is{' '}
              <Text style={{ color: stats.comparison.percentageChange > 0 ? accent : '#EF4444', fontWeight: '700' }}>
                {Math.abs(stats.comparison.percentageChange).toFixed(1)}% {stats.comparison.percentageChange > 0 ? 'higher' : 'lower'}
              </Text>
              {' '}than last month.
            </Text>
          </View>
        )}
      </ScrollView>
      <GuideView />
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

  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  summaryCard: {
    width: (width - 42) / 2, borderRadius: 14, borderWidth: 1, padding: 14, gap: 2,
  },
  summaryIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  summaryValue: { fontSize: 15, fontWeight: '700' },
  summaryLabel: { fontSize: 12 },
  summarySub: { fontSize: 10, marginTop: 1 },

  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  periodBtn: {
    flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  periodText: { fontSize: 13, fontWeight: '600' },

  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: '700' },

  catRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  catIcon: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  catName: { fontSize: 13, fontWeight: '600' },
  catCount: { fontSize: 11, marginTop: 1 },
  catAmount: { fontSize: 13, fontWeight: '700' },

  insightText: { fontSize: 13, lineHeight: 20 },
});

export default IncomeStatsScreen;
