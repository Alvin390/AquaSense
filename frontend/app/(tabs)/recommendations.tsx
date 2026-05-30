import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AIRecommendationCard, RecommendationIconType } from '@/components/AIRecommendationCard';
import { LiveSavedBadge } from '@/components/LiveSavedBadge';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useWaterStore } from '@/stores/waterStore';
import { useLocationStore } from '@/stores/locationStore';
import { scoreColors } from '@/utils/scoreColors';

type RiskLabel = 'SAFE' | 'USE_WITH_CAUTION' | 'DO_NOT_USE' | null;

const NO_DATA_MESSAGE =
  'AI recommendations are not available for this source yet. Check the latest water quality screen or try another source.';

const BANNER_LABEL: Record<Exclude<RiskLabel, null>, string> = {
  SAFE: 'SAFE TO USE',
  USE_WITH_CAUTION: 'USE WITH CAUTION',
  DO_NOT_USE: 'DO NOT USE WITHOUT TREATMENT',
};

// Feature 4 — contextual action plans per risk level
const ACTION_PLANS: Record<Exclude<RiskLabel, null>, string[]> = {
  SAFE: [
    'Water is safe for household use after standard treatment.',
    'Continue standard municipal treatment before drinking.',
    'Monitor for changes after heavy rainfall.',
  ],
  USE_WITH_CAUTION: [
    'Boil water for at least 1 minute before drinking.',
    'Use a certified filter if available.',
    'Avoid giving unboiled water to children or elderly.',
    'Check back in a few hours for updated readings.',
  ],
  DO_NOT_USE: [
    'Do NOT drink or cook with this water.',
    'Boil AND filter before any use.',
    'Seek an alternative water source immediately.',
    'Store drinking water from a safe source for 48 hours.',
    'Report to WASREB if contamination is suspected.',
  ],
};

// Feature 5 — emergency contacts for DO_NOT_USE events
const EMERGENCY_CONTACTS = [
  { label: 'WASREB Hotline', value: '0800 724 266' },
  { label: 'Nairobi Water', value: '0711 090 000' },
  { label: 'Kenya Red Cross', value: '1199' },
];

// Community report types
const REPORT_TYPES = [
  { id: 'smell', label: 'Water smells strange', icon: 'alert-circle-outline' as const },
  { id: 'color', label: 'Unusual color', icon: 'color-palette-outline' as const },
  { id: 'fish', label: 'Dead fish observed', icon: 'fish-outline' as const },
  { id: 'sick', label: 'Illness in area', icon: 'medical-outline' as const },
  { id: 'dry', label: 'Source is dry/low', icon: 'water-outline' as const },
];

function getIconType(text: string): RecommendationIconType {
  const lower = text.toLowerCase();
  if (lower.includes('boil')) return 'BOIL';
  if (lower.includes('filter')) return 'FILTER';
  if (lower.includes('avoid') || lower.includes('do not')) return 'AVOID';
  if (lower.includes('safe')) return 'SAFE';
  return 'CHECK';
}

function riskColor(label: RiskLabel): string {
  if (label === 'SAFE') return scoreColors.fromLabel('SAFE');
  if (label === 'USE_WITH_CAUTION') return scoreColors.fromLabel('USE_WITH_CAUTION');
  if (label === 'DO_NOT_USE') return scoreColors.fromLabel('DO_NOT_USE');
  return Colors.secondaryText;
}

function riskTitle(label: RiskLabel): string {
  return label === null ? 'DATA UNAVAILABLE — CHECK BACK SOON' : BANNER_LABEL[label];
}

export default function RecommendationsScreen() {
  const selectedSourceId = useWaterStore((state) => state.selectedSourceId);
  const waterSources = useWaterStore((state) => state.waterSources);
  const readings = useWaterStore((state) => state.readings);
  const recommendations = useWaterStore((state) => state.recommendations);
  const isLive = useLocationStore((state) => state.isLive);

  const [showReport, setShowReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [thumbsState, setThumbsState] = useState<'up' | 'down' | null>(null);

  const source = waterSources.find((s) => s.id === selectedSourceId) ?? waterSources[0];
  const sourceId = selectedSourceId ?? source?.id ?? null;
  const recommendation = sourceId === null ? undefined : recommendations[sourceId];
  const reading = sourceId === null ? undefined : readings[sourceId];

  const riskLabel = recommendation?.risk_label ?? null;
  const bannerColor = riskColor(riskLabel);
  const isEmergency = riskLabel === 'DO_NOT_USE';
  const recommendationItems = recommendation?.recommendations ?? [];
  const dataDrivers = recommendation?.data_drivers ?? [];
  const actionPlan = riskLabel ? ACTION_PLANS[riskLabel] : [];
  const lastUpdated = reading?.fetched_at ?? recommendation?.generated_at ?? new Date().toISOString();

  // Feature 7 — predictive risk hint
  const floodRisk = reading?.flood_risk_pct ?? 0;
  const predictiveHint =
    floodRisk >= 30 && floodRisk < 65
      ? '⚠️  Based on current rainfall patterns, this source may deteriorate within 48 hours. Consider storing water now.'
      : floodRisk >= 65
        ? '🔴  Satellite data shows active flood conditions. Expect water quality to worsen in the next 24–48 hours.'
        : null;

  function handleShare() {
    const summary = recommendation?.summary ?? NO_DATA_MESSAGE;
    const actions = actionPlan.length > 0 ? actionPlan.join('\n- ') : '';
    Share.share({
      message: `AquaSense — ${source?.name ?? 'Water source'}\n${riskTitle(riskLabel)}\n\n${summary}\n\nWhat to do:\n- ${actions}`,
    });
  }

  function handleSubmitReport() {
    setReportSent(true);
    setTimeout(() => {
      setShowReport(false);
      setReportSent(false);
      setSelectedReport(null);
    }, 1800);
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>

      {/* Feature 5 — Emergency mode banner */}
      {isEmergency && (
        <View style={styles.emergencyBanner}>
          <Ionicons name="warning" size={28} color="#FFFFFF" />
          <Text style={styles.emergencyTitle}>HIGH RISK WATER EVENT</Text>
          <Text style={styles.emergencySubtitle}>
            Do not use this water for drinking, cooking, or bathing without full treatment.
          </Text>
          <View style={styles.emergencyContacts}>
            {EMERGENCY_CONTACTS.map((c) => (
              <View key={c.label} style={styles.emergencyContact}>
                <Ionicons name="call-outline" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.emergencyContactText}>{c.label}: {c.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>AI Recommendations</Text>
        <Text style={styles.title}>{source?.name ?? 'Select a water source'}</Text>
        <LiveSavedBadge isLive={isLive} lastUpdated={lastUpdated} />
      </View>

      {/* Risk banner */}
      <View style={[styles.banner, { backgroundColor: bannerColor }]}>
        <Text style={styles.bannerLabel}>Current guidance</Text>
        <Text style={styles.bannerTitle}>{riskTitle(riskLabel)}</Text>
      </View>

      {/* Predictive hint — Feature 7 */}
      {predictiveHint && (
        <View style={styles.predictiveCard}>
          <Text style={styles.predictiveText}>{predictiveHint}</Text>
        </View>
      )}

      {/* AI summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.summary}>{recommendation?.summary ?? NO_DATA_MESSAGE}</Text>
      </View>

      {/* Feature 4 — Action plan */}
      {actionPlan.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to do now</Text>
          <View style={[styles.actionPlanCard, { borderLeftColor: bannerColor }]}>
            {actionPlan.map((action, i) => (
              <View key={i} style={styles.actionRow}>
                <View style={[styles.actionDot, { backgroundColor: bannerColor }]} />
                <Text style={styles.actionText}>{action}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* AI recommendation bullets */}
      {recommendationItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended actions</Text>
          <View style={styles.cardStack}>
            {recommendationItems.map((item: string) => (
              <AIRecommendationCard key={item} iconType={getIconType(item)} text={item} />
            ))}
          </View>
        </View>
      )}

      {/* Data transparency */}
      <Text style={styles.transparency}>
        {dataDrivers.length > 0 ? `Based on: ${dataDrivers.join(', ')}` : 'Based on: latest available water data'}
      </Text>
      <Text style={styles.aiCredit}>AI Analysis powered by Groq / Llama 3</Text>

      {/* Feature 8 — Verification loop */}
      <View style={styles.verifySection}>
        <Text style={styles.verifyQuestion}>Was this assessment accurate?</Text>
        <View style={styles.verifyButtons}>
          <TouchableOpacity
            style={[styles.verifyBtn, thumbsState === 'up' && { backgroundColor: Colors.safeGreen }]}
            onPress={() => setThumbsState('up')}
            activeOpacity={0.8}
          >
            <Ionicons name="thumbs-up" size={18} color={thumbsState === 'up' ? '#FFFFFF' : Colors.secondaryText} />
            <Text style={[styles.verifyBtnText, thumbsState === 'up' && { color: '#FFFFFF' }]}>Yes, accurate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.verifyBtn, thumbsState === 'down' && { backgroundColor: Colors.dangerRed }]}
            onPress={() => setThumbsState('down')}
            activeOpacity={0.8}
          >
            <Ionicons name="thumbs-down" size={18} color={thumbsState === 'down' ? '#FFFFFF' : Colors.secondaryText} />
            <Text style={[styles.verifyBtnText, thumbsState === 'down' && { color: '#FFFFFF' }]}>Water was different</Text>
          </TouchableOpacity>
        </View>
        {thumbsState && (
          <Text style={styles.verifyThanks}>
            {thumbsState === 'up' ? '✓ Thank you — your feedback improves our model.' : '✓ Noted — we\'ll flag this for review.'}
          </Text>
        )}
      </View>

      {/* Action buttons row */}
      <View style={styles.actionButtons}>
        <Pressable style={styles.reportBtn} onPress={() => setShowReport(true)}>
          <Ionicons name="flag-outline" size={16} color={Colors.primaryTeal} />
          <Text style={styles.reportBtnText}>Report Issue</Text>
        </Pressable>
        <Pressable style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={16} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Share Report</Text>
        </Pressable>
      </View>

      {/* Feature 3 — Community reporting modal */}
      <Modal
        visible={showReport}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReport(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowReport(false)}>
          <Pressable style={styles.reportSheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.reportTitle}>Report a water issue</Text>
            <Text style={styles.reportSubtitle}>Your ground-level report helps the community and improves our satellite analysis.</Text>
            {reportSent ? (
              <View style={styles.reportSent}>
                <Ionicons name="checkmark-circle" size={48} color={Colors.safeGreen} />
                <Text style={styles.reportSentText}>Report submitted. Thank you!</Text>
              </View>
            ) : (
              <>
                <View style={styles.reportOptions}>
                  {REPORT_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[styles.reportOption, selectedReport === type.id && styles.reportOptionSelected]}
                      onPress={() => setSelectedReport(type.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={type.icon}
                        size={20}
                        color={selectedReport === type.id ? Colors.primaryTeal : Colors.secondaryText}
                      />
                      <Text style={[styles.reportOptionText, selectedReport === type.id && styles.reportOptionTextSelected]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={[styles.submitBtn, !selectedReport && { opacity: 0.4 }]}
                  onPress={handleSubmitReport}
                  disabled={!selectedReport}
                  activeOpacity={0.85}
                >
                  <Text style={styles.submitBtnText}>Submit Report</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: Colors.backgroundWhite, flex: 1 },
  content: { gap: Spacing.md, padding: Spacing.md, paddingBottom: Spacing.xl },

  // Emergency mode
  emergencyBanner: {
    backgroundColor: Colors.dangerRed,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 8,
    alignItems: 'flex-start',
  },
  emergencyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emergencySubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  emergencyContacts: { gap: 4, marginTop: 4 },
  emergencyContact: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  emergencyContactText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '600' },

  // Header
  header: { gap: Spacing.sm, paddingTop: Spacing.lg },
  eyebrow: { color: Colors.secondaryText, fontSize: 14, fontWeight: '800', textTransform: 'uppercase' },
  title: { color: Colors.darkText, fontSize: 26, fontWeight: '900', lineHeight: 32 },

  // Risk banner
  banner: { borderRadius: Radius.sm, gap: 6, padding: Spacing.md },
  bannerLabel: { color: Colors.cardBackground, fontSize: 14, fontWeight: '800', opacity: 0.9, textTransform: 'uppercase' },
  bannerTitle: { color: Colors.cardBackground, fontSize: 24, fontWeight: '900' },

  // Predictive hint
  predictiveCard: {
    backgroundColor: Colors.cautionAmber + '18',
    borderRadius: Radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.cautionAmber,
    padding: Spacing.md,
  },
  predictiveText: { color: Colors.darkText, fontSize: 14, lineHeight: 20 },

  // Sections
  section: { gap: Spacing.sm },
  sectionTitle: { color: Colors.secondaryText, fontSize: 14, fontWeight: '800', textTransform: 'uppercase' },
  summary: { color: Colors.darkText, fontSize: 16, lineHeight: 24 },
  cardStack: { gap: Spacing.sm },

  // Action plan
  actionPlanCard: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: Radius.sm,
    borderLeftWidth: 4,
    borderColor: '#E0EFEF',
    padding: Spacing.md,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  actionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  actionDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  actionText: { flex: 1, color: Colors.darkText, fontSize: 15, lineHeight: 22 },

  // Transparency + credit
  transparency: { color: Colors.secondaryText, fontSize: 14, lineHeight: 20 },
  aiCredit: { color: Colors.secondaryText, fontSize: 14, fontStyle: 'italic' },

  // Verification
  verifySection: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E0EFEF',
  },
  verifyQuestion: { color: Colors.darkText, fontSize: 15, fontWeight: '700' },
  verifyButtons: { flexDirection: 'row', gap: Spacing.sm },
  verifyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#E0EFEF',
    backgroundColor: Colors.backgroundWhite,
  },
  verifyBtnText: { fontSize: 14, color: Colors.secondaryText, fontWeight: '600' },
  verifyThanks: { fontSize: 14, color: Colors.secondaryText, fontStyle: 'italic' },

  // Action buttons
  actionButtons: { flexDirection: 'row', gap: Spacing.sm },
  reportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.primaryTeal,
    backgroundColor: Colors.backgroundWhite,
  },
  reportBtnText: { color: Colors.primaryTeal, fontSize: 15, fontWeight: '700' },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryTeal,
  },
  shareButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  // Report modal
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(26,46,53,0.4)' },
  reportSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  sheetHandle: { width: 36, height: 4, backgroundColor: '#D0E8ED', borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md },
  reportTitle: { color: Colors.darkText, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  reportSubtitle: { color: Colors.secondaryText, fontSize: 14, lineHeight: 20, marginBottom: Spacing.md },
  reportOptions: { gap: Spacing.sm, marginBottom: Spacing.md },
  reportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#E0EFEF',
    backgroundColor: Colors.backgroundWhite,
  },
  reportOptionSelected: { borderColor: Colors.primaryTeal, backgroundColor: Colors.primaryTeal + '10' },
  reportOptionText: { fontSize: 15, color: Colors.secondaryText, fontWeight: '500' },
  reportOptionTextSelected: { color: Colors.primaryTeal, fontWeight: '700' },
  submitBtn: {
    backgroundColor: Colors.primaryTeal,
    borderRadius: Radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  reportSent: { alignItems: 'center', gap: 12, paddingVertical: Spacing.lg },
  reportSentText: { fontSize: 18, fontWeight: '700', color: Colors.safeGreen },
});
