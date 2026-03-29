/* eslint-disable react-native/no-inline-styles */
/**
 * Custom Skeleton with shimmer — no external skeleton library needed.
 * Uses Animated API + LinearGradient for a smooth shimmer effect.
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../../hooks/useTheme';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Shimmer Bone ────────────────────────────────────────────────────────────
// A single animated placeholder block with shimmer sweep.

interface BoneProps {
  w: number | string;
  h: number;
  r?: number;
  mb?: number;
  mt?: number;
  ml?: number;
}

const ShimmerBone: React.FC<BoneProps & { baseColor: string; shimmerColor: string }> = ({
  w, h, r = 8, mb = 0, mt = 0, ml = 0, baseColor, shimmerColor,
}) => {
  const animVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(animVal, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [animVal]);

  const translateX = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_W, SCREEN_W],
  });

  return (
    <View
      style={{
        width: w as any,
        height: h,
        borderRadius: r,
        marginBottom: mb,
        marginTop: mt,
        marginLeft: ml,
        backgroundColor: baseColor,
        overflow: 'hidden',
      }}
    >
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={['transparent', shimmerColor, 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

// ─── Skeleton Context ────────────────────────────────────────────────────────

const SkeletonContext = React.createContext({ baseColor: '#E1E9EE', shimmerColor: '#F2F8FC' });

export const Skeleton: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDark } = useTheme();
  const baseColor = isDark ? '#1E293B' : '#E8ECF0';
  const shimmerColor = isDark ? '#334155' : '#F5F7FA';

  return (
    <SkeletonContext.Provider value={{ baseColor, shimmerColor }}>
      <View>{children}</View>
    </SkeletonContext.Provider>
  );
};

// ─── Bone (public) ───────────────────────────────────────────────────────────
// Use inside <Skeleton> wrapper.

export const Bone: React.FC<BoneProps> = (props) => {
  const { baseColor, shimmerColor } = React.useContext(SkeletonContext);
  return <ShimmerBone {...props} baseColor={baseColor} shimmerColor={shimmerColor} />;
};

// ─── Layout helpers ──────────────────────────────────────────────────────────

export const Row: React.FC<{
  children: React.ReactNode;
  gap?: number;
  mb?: number;
  mt?: number;
}> = ({ children, gap = 10, mb = 0, mt = 0 }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap, marginBottom: mb, marginTop: mt }}>
    {children}
  </View>
);

export const Pad: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={{ paddingHorizontal: 16 }}>{children}</View>
);

// ─── Backward compat ─────────────────────────────────────────────────────────

export const SkeletonCard: React.FC = () => (
  <Skeleton>
    <Pad>
      <Row mb={16}>
        <Bone w={48} h={48} r={24} />
        <View style={{ flex: 1 }}>
          <Bone w="80%" h={14} r={4} mb={6} />
          <Bone w="55%" h={11} r={4} />
        </View>
      </Row>
    </Pad>
  </Skeleton>
);

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <Skeleton>
    <Pad>
      {Array.from({ length: count }).map((_, i) => (
        <Row key={i} mb={16}>
          <Bone w={48} h={48} r={24} />
          <View style={{ flex: 1 }}>
            <Bone w="80%" h={14} r={4} mb={6} />
            <Bone w="55%" h={11} r={4} />
          </View>
        </Row>
      ))}
    </Pad>
  </Skeleton>
);
