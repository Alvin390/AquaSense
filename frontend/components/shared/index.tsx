import React from 'react';
import { View, Text, StyleSheet, ViewStyle, DimensionValue, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/theme';
import { getStatusColor } from '../../utils/scoreColors';

// ==========================================
// 1. StatusChip Component
// ==========================================
export interface StatusChipProps {
  status?: string;
  score?: number;
  label?: string;
  style?: ViewStyle;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, score = 0, label, style }) => {
  const backgroundColor = getStatusColor(score, status);
  const displayLabel = label || status || (score ? `Score: ${Math.round(score)}` : 'No Data');

  return (
    <View style={[styles.chipBase, { backgroundColor }, style]}>
      <Text style={styles.chipText}>{displayLabel.toUpperCase()}</Text>
    </View>
  );
};

// ==========================================
// 2. SkeletonCard Component
// ==========================================
export interface SkeletonCardProps {
  height?: number;
  width?: DimensionValue; // Safe cross-platform type handling for both numbers and layout percentages
  style?: ViewStyle;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ height = 100, width = '100%', style }) => {
  return (
    <View
      style={[
        styles.skeletonBase,
        { height, width, backgroundColor: Colors.skeletonBase },
        style
      ]}
    />
  );
};

// ==========================================
// 3. SectionHeader Component
// ==========================================
export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, rightElement, style }) => {
  return (
    <View style={[styles.headerContainer, style]}>
      <View style={styles.headerTextGroup}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>
      {rightElement && <View>{rightElement}</View>}
    </View>
  );
};

// ==========================================
// 4. EmptyState Component
// ==========================================
export interface EmptyStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title = 'No Data Found', message, actionLabel, onAction, style }) => {
  return (
    <View style={[styles.centerContainer, style]}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.actionButton} onPress={onAction} activeOpacity={0.7}>
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

// ==========================================
// 5. DataUnavailable Component
// ==========================================
export interface DataUnavailableProps {
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const DataUnavailable: React.FC<DataUnavailableProps> = ({
  message = 'Data currently unavailable. Please check your connection.',
  onRetry,
  style
}) => {
  return (
    <View style={[styles.unavailableContainer, style]}>
      <Text style={styles.unavailableText}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.7}>
          <Text style={styles.retryButtonText}>Retry Connection</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

// ==========================================
// Extra Utility layout token left by Ralph
// ==========================================
export function Divider() {
  return <View style={styles.divider} />;
}

// ==========================================
// Design System Stylesheet (ZERO RAW HEX VALUES)
// ==========================================
const styles = StyleSheet.create({
  chipBase: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: Typography.bodySemiBold,
    fontSize: Typography.xs,
    color: Colors.cardBackground,
  },
  skeletonBase: {
    borderRadius: Radius.sm,
    marginVertical: Spacing.xs,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: Typography.heading,
    fontSize: Typography.sm,
    color: Colors.secondaryText,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontFamily: Typography.body,
    fontSize: Typography.xs,
    color: Colors.secondaryText,
    marginTop: Spacing.xs,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.lg,
    ...Shadows.base,
  },
  emptyTitle: {
    fontFamily: Typography.heading,
    fontSize: Typography.md,
    color: Colors.darkText,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    fontFamily: Typography.body,
    fontSize: Typography.sm,
    color: Colors.secondaryText,
    textAlign: 'center',
    lineHeight: Typography.lg,
  },
  actionButton: {
    backgroundColor: Colors.primaryTeal,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
  },
  actionButtonText: {
    fontFamily: Typography.bodySemiBold,
    fontSize: Typography.sm,
    color: Colors.cardBackground,
  },
  unavailableContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.backgroundWhite,
    borderWidth: 1,
    borderColor: Colors.cautionAmber,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  unavailableText: {
    fontFamily: Typography.body,
    fontSize: Typography.sm,
    color: Colors.darkText,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  retryButton: {
    borderColor: Colors.primaryTeal,
    borderWidth: 1,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
  },
  retryButtonText: {
    fontFamily: Typography.bodySemiBold,
    fontSize: Typography.xs,
    color: Colors.primaryTeal,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.skeletonBase,
    marginVertical: Spacing.sm
  },
});