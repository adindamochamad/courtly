import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme/colors';

type SkeletonProps = {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
};

/** Pulsing placeholder shown while content loads. */
export function Skeleton({
  width = '100%',
  height,
  borderRadius = radius.sm,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.base, { width, height, borderRadius, opacity }, style]}
    />
  );
}

/** A card-shaped skeleton matching the facility list item layout. */
export function FacilityCardSkeleton() {
  return (
    <View style={skeletonStyles.card}>
      <Skeleton height={160} borderRadius={radius.md} />
      <View style={skeletonStyles.body}>
        <Skeleton width="60%" height={18} />
        <Skeleton width="40%" height={14} />
        <Skeleton width="30%" height={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.surfaceRaised },
});

const skeletonStyles = StyleSheet.create({
  card: { gap: 12 },
  body: { gap: 8 },
});
