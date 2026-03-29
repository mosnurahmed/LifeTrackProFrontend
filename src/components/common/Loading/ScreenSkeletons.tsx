/* eslint-disable react-native/no-inline-styles */
/**
 * Screen-specific skeleton loaders
 * Uses custom shimmer Bone component — no MaskedView needed.
 */

import React from 'react';
import { View, Dimensions } from 'react-native';
import { Skeleton, Bone, Row, Pad } from './Skeleton';

const { width } = Dimensions.get('window');
const W = width - 32;

// ─── Dashboard Skeleton ──────────────────────────────────────────────────────

export const DashboardSkeleton: React.FC = () => (
  <Skeleton>
    <Pad>
      {/* Quick Actions Grid */}
      <Bone w={100} h={14} r={4} mb={12} mt={16} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <View key={i} style={{ alignItems: 'center', width: (W - 20) / 3, gap: 6, paddingVertical: 12 }}>
            <Bone w={40} h={40} r={20} />
            <Bone w={50} h={10} r={4} />
          </View>
        ))}
      </View>

      {/* Monthly Summary - 3 cards */}
      <Bone w={130} h={14} r={4} mb={10} />
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        <Bone w={(W - 20) / 3} h={72} r={12} />
        <Bone w={(W - 20) / 3} h={72} r={12} />
        <Bone w={(W - 20) / 3} h={72} r={12} />
      </View>

      {/* Budget Card */}
      <Bone w={W} h={80} r={12} mb={16} />

      {/* Task Card */}
      <Bone w={W} h={64} r={12} mb={16} />

      {/* Top Spending */}
      <Bone w={110} h={14} r={4} mb={10} />
      {Array.from({ length: 3 }).map((_, i) => (
        <Row key={i} mb={12}>
          <Bone w={36} h={36} r={18} />
          <View style={{ flex: 1 }}>
            <Bone w="70%" h={12} r={4} mb={6} />
            <Bone w="100%" h={6} r={3} />
          </View>
          <Bone w={60} h={14} r={4} />
        </Row>
      ))}
    </Pad>
  </Skeleton>
);

// ─── Expenses / Income List Skeleton ─────────────────────────────────────────

export const ExpenseListSkeleton: React.FC = () => (
  <Skeleton>
    <Pad>
      <Bone w={W} h={90} r={14} mb={16} mt={12} />

      <Row gap={8} mb={16}>
        <Bone w={70} h={30} r={15} />
        <Bone w={80} h={30} r={15} />
        <Bone w={60} h={30} r={15} />
        <Bone w={75} h={30} r={15} />
      </Row>

      {Array.from({ length: 6 }).map((_, i) => (
        <Row key={i} mb={14} gap={12}>
          <Bone w={38} h={38} r={19} />
          <View style={{ flex: 1 }}>
            <Bone w="60%" h={13} r={4} mb={5} />
            <Bone w="40%" h={10} r={4} />
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Bone w={65} h={13} r={4} mb={5} />
            <Bone w={45} h={10} r={4} />
          </View>
        </Row>
      ))}
    </Pad>
  </Skeleton>
);

// ─── Budget Screen Skeleton ──────────────────────────────────────────────────

export const BudgetSkeleton: React.FC = () => (
  <Skeleton>
    <Pad>
      <Bone w={W} h={120} r={16} mb={20} mt={12} />
      <Bone w={140} h={14} r={4} mb={12} />

      {Array.from({ length: 5 }).map((_, i) => (
        <View key={i} style={{ marginBottom: 14 }}>
          <Row gap={10} mb={6}>
            <Bone w={34} h={34} r={17} />
            <View style={{ flex: 1 }}>
              <Bone w="55%" h={12} r={4} mb={4} />
              <Bone w="100%" h={6} r={3} />
            </View>
            <Bone w={55} h={12} r={4} />
          </Row>
        </View>
      ))}
    </Pad>
  </Skeleton>
);

// ─── Savings Goals Skeleton ──────────────────────────────────────────────────

export const SavingsSkeleton: React.FC = () => (
  <Skeleton>
    <Pad>
      <Bone w={W} h={100} r={14} mb={16} mt={12} />
      <Bone w={120} h={14} r={4} mb={12} />

      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} style={{ marginBottom: 12, padding: 14, borderRadius: 12 }}>
          <Row gap={10} mb={10}>
            <Bone w={40} h={40} r={20} />
            <View style={{ flex: 1 }}>
              <Bone w="65%" h={13} r={4} mb={5} />
              <Bone w="45%" h={10} r={4} />
            </View>
            <Bone w={50} h={18} r={9} />
          </Row>
          <Bone w="100%" h={6} r={3} />
        </View>
      ))}
    </Pad>
  </Skeleton>
);

// ─── Tasks Screen Skeleton ───────────────────────────────────────────────────

export const TasksSkeleton: React.FC = () => (
  <Skeleton>
    <Pad>
      <Row gap={8} mb={16} mt={12}>
        <Bone w={55} h={28} r={14} />
        <Bone w={70} h={28} r={14} />
        <Bone w={80} h={28} r={14} />
        <Bone w={65} h={28} r={14} />
      </Row>

      {Array.from({ length: 5 }).map((_, i) => (
        <Row key={i} mb={14} gap={12}>
          <Bone w={22} h={22} r={6} />
          <View style={{ flex: 1 }}>
            <Bone w="70%" h={13} r={4} mb={5} />
            <Row gap={6}>
              <Bone w={50} h={18} r={9} />
              <Bone w={65} h={18} r={9} />
            </Row>
          </View>
          <Bone w={8} h={8} r={4} />
        </Row>
      ))}
    </Pad>
  </Skeleton>
);

// ─── Bazar Screen Skeleton ───────────────────────────────────────────────────

export const BazarSkeleton: React.FC = () => (
  <Skeleton>
    <Pad>
      <Row gap={8} mb={16} mt={12}>
        <Bone w={50} h={28} r={14} />
        <Bone w={65} h={28} r={14} />
        <Bone w={75} h={28} r={14} />
      </Row>

      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} style={{ marginBottom: 12, padding: 14, borderRadius: 12 }}>
          <Row gap={10} mb={10}>
            <Bone w={36} h={36} r={18} />
            <View style={{ flex: 1 }}>
              <Bone w="60%" h={13} r={4} mb={5} />
              <Bone w="80%" h={10} r={4} />
            </View>
          </Row>
          <Bone w="100%" h={4} r={2} mb={8} />
          <Row>
            <Bone w={80} h={10} r={4} />
            <Bone w={80} h={10} r={4} ml={16} />
          </Row>
        </View>
      ))}
    </Pad>
  </Skeleton>
);

// ─── Notes Screen Skeleton ───────────────────────────────────────────────────

export const NotesSkeleton: React.FC = () => (
  <Skeleton>
    <Pad>
      <Bone w={W} h={38} r={10} mb={16} mt={12} />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1, gap: 10 }}>
          <Bone w="100%" h={120} r={12} />
          <Bone w="100%" h={90} r={12} />
          <Bone w="100%" h={140} r={12} />
        </View>
        <View style={{ flex: 1, gap: 10 }}>
          <Bone w="100%" h={90} r={12} />
          <Bone w="100%" h={130} r={12} />
          <Bone w="100%" h={100} r={12} />
        </View>
      </View>
    </Pad>
  </Skeleton>
);

// ─── Chat / Conversations Skeleton ───────────────────────────────────────────

export const ConversationsSkeleton: React.FC = () => (
  <Skeleton>
    <Pad>
      {Array.from({ length: 7 }).map((_, i) => (
        <Row key={i} mb={16} mt={i === 0 ? 12 : 0} gap={12}>
          <Bone w={48} h={48} r={24} />
          <View style={{ flex: 1 }}>
            <Bone w="55%" h={13} r={4} mb={6} />
            <Bone w="85%" h={11} r={4} />
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Bone w={40} h={10} r={4} mb={6} />
            <Bone w={18} h={18} r={9} />
          </View>
        </Row>
      ))}
    </Pad>
  </Skeleton>
);

// ─── Categories Screen Skeleton ──────────────────────────────────────────────

export const CategoriesSkeleton: React.FC = () => (
  <Skeleton>
    <Pad>
      <Row gap={8} mb={16} mt={12}>
        <Bone w={W / 2 - 5} h={36} r={10} />
        <Bone w={W / 2 - 5} h={36} r={10} />
      </Row>

      {Array.from({ length: 8 }).map((_, i) => (
        <Row key={i} mb={12} gap={12}>
          <Bone w={38} h={38} r={12} />
          <View style={{ flex: 1 }}>
            <Bone w="50%" h={13} r={4} mb={4} />
            <Bone w="30%" h={10} r={4} />
          </View>
          <Bone w={20} h={20} r={4} />
        </Row>
      ))}
    </Pad>
  </Skeleton>
);

// ─── Notifications Skeleton ──────────────────────────────────────────────────

export const NotificationsSkeleton: React.FC = () => (
  <Skeleton>
    <Pad>
      {Array.from({ length: 6 }).map((_, i) => (
        <Row key={i} mb={14} mt={i === 0 ? 8 : 0} gap={12}>
          <Bone w={44} h={44} r={22} />
          <View style={{ flex: 1 }}>
            <Bone w="65%" h={12} r={4} mb={5} />
            <Bone w="90%" h={11} r={4} mb={5} />
            <Bone w={60} h={9} r={4} />
          </View>
        </Row>
      ))}
    </Pad>
  </Skeleton>
);
