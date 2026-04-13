// components/home/GovernmentSchemeCard.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const COLORS = {
  primary: '#0474FC',
  primaryLight: '#E8F1FE',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    light: '#9CA3AF',
  },
};

export const GovernmentSchemeCard = ({ scheme, onPress }: any) => {
  // Default scheme if none provided
  const defaultScheme = {
    name: 'Ayushman Bharat - PMJAY',
    department: 'Ministry of Health & Family Welfare',
    description: 'Health insurance scheme providing coverage up to ₹5 lakhs per family per year for secondary and tertiary care hospitalization.',
    benefit: 'Cashless treatment up to ₹5 lakhs',
    eligibility: 'Family income below ₹2.5 lakhs per year'
  };

  const currentScheme = scheme || defaultScheme;

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primary + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Ionicons name="medal-outline" size={24} color="#FFFFFF" />
          </LinearGradient>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.schemeName}>{currentScheme.name}</Text>
          <Text style={styles.department}>{currentScheme.department || 'Government of India'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.text.light} />
      </View>
      
      {currentScheme.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {currentScheme.description}
        </Text>
      ) : null}
      
      <View style={styles.cardFooter}>
        <View style={styles.tag}>
          <Ionicons name="cash-outline" size={14} color={COLORS.primary} />
          <Text style={styles.tagText}>{currentScheme.benefit || 'Financial Benefit'}</Text>
        </View>
        {currentScheme.eligibility ? (
          <View style={styles.tag}>
            <Ionicons name="people-outline" size={14} color={COLORS.primary} />
            <Text style={styles.tagText}>
              {typeof currentScheme.eligibility === 'string' ? currentScheme.eligibility.substring(0, 30) : String(currentScheme.eligibility)}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  schemeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  department: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  description: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.primary,
  },
});