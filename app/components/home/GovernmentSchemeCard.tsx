// components/home/GovernmentSchemeCard.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Scheme {
  id: string;
  name: string;
  description: string;
  coverage: string;
  eligibility: string;
  icon: string;
}

const GOVERNMENT_SCHEMES: Scheme[] = [
  {
    id: 'pmjay',
    name: 'PMJAY',
    description: 'Pradhan Mantri Jan Arogya Yojana',
    coverage: '₹5 Lakh per family',
    eligibility: 'BPL & APL families',
    icon: 'hospital-box',
  },
  {
    id: 'nrhm',
    name: 'NRHM',
    description: 'National Rural Health Mission',
    coverage: 'Basic health services',
    eligibility: 'Rural population',
    icon: 'heart-pulse',
  },
  {
    id: 'nhm',
    name: 'NHM',
    description: 'National Health Mission',
    coverage: 'Comprehensive health',
    eligibility: 'All citizens',
    icon: 'shield-heart',
  },
];

interface GovernmentSchemeCardProps {
  onSchemePress?: (scheme: Scheme) => void;
}

export const GovernmentSchemeCard: React.FC<GovernmentSchemeCardProps> = ({ onSchemePress }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="leaf" size={16} color="#10b981" />
        </View>
        <Text style={styles.headerTitle}>Available Health Schemes</Text>
      </View>

      {/* Schemes List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        style={styles.schemesList}
      >
        {GOVERNMENT_SCHEMES.map((scheme) => (
          <LinearGradient
            key={scheme.id}
            colors={['#064e3b', '#065f46', '#047857']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.schemeCard}
          >
            {/* Top accent bar */}
            <View style={styles.schemeAccent} />

            {/* Icon */}
            <View style={styles.schemeIconContainer}>
              <MaterialCommunityIcons
                name={scheme.icon as any}
                size={32}
                color="#10b981"
              />
            </View>

            {/* Content */}
            <View style={styles.schemeContent}>
              <Text style={styles.schemeName}>{scheme.name}</Text>
              <Text style={styles.schemeDescription}>{scheme.description}</Text>
              
              <View style={styles.schemeDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Coverage</Text>
                  <Text style={styles.detailValue}>{scheme.coverage}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Eligibility</Text>
                  <Text style={styles.detailValue}>{scheme.eligibility}</Text>
                </View>
              </View>
            </View>

            {/* Border */}
            <View style={styles.schemeBorder} />
          </LinearGradient>
        ))}
      </ScrollView>

      {/* Info Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <MaterialCommunityIcons name="information" size={14} color="#10b981" />
          <Text style={styles.footerText}>
            Your profile is matched with these schemes based on eligibility
          </Text>
        </View>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  schemesList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  schemeCard: {
    width: width * 0.75,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  schemeAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#10b981',
  },
  schemeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  schemeContent: {
    zIndex: 2,
  },
  schemeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  schemeDescription: {
    fontSize: 11,
    color: '#d1d5db',
    marginBottom: 12,
    fontWeight: '500',
  },
  schemeDetails: {
    gap: 10,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 185, 129, 0.2)',
  },
  detailLabel: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '700',
  },
  schemeBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footerText: {
    fontSize: 11,
    color: '#d1d5db',
    fontWeight: '500',
    flex: 1,
  },
});
