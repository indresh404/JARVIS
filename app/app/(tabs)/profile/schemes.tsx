// app/(tabs)/profile/schemes.tsx
import { GovernmentSchemeCard } from '@/components/home/GovernmentSchemeCard';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const COLORS = {
  primary: '#0474FC',
  primaryLight: '#E8F1FE',
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    light: '#9CA3AF',
  },
};

// Mock data for government schemes
const MOCK_SCHEMES = [
  {
    id: '1',
    name: 'Ayushman Bharat - PM-JAY',
    description: 'Health insurance scheme providing coverage of up to ₹5 lakh per family per year.',
    department: 'Ministry of Health',
    category: 'Healthcare',
    benefit: '₹5 lakh coverage',
    eligibility: 'BPL families',
  },
  {
    id: '2',
    name: 'Pradhan Mantri Matru Vandana Yojana',
    description: 'Maternity benefit program providing cash incentives to pregnant mothers.',
    department: 'Women & Child Development',
    category: 'Women',
    benefit: '₹5,000 cash',
    eligibility: 'Pregnant mothers',
  },
  {
    id: '3',
    name: 'National Health Mission',
    description: 'Healthcare scheme providing accessible healthcare to rural and urban populations.',
    department: 'Ministry of Health',
    category: 'Healthcare',
    benefit: 'Free healthcare',
    eligibility: 'All citizens',
  },
  {
    id: '4',
    name: 'Pradhan Mantri Suraksha Bima Yojana',
    description: 'Accidental insurance scheme for death or disability due to accident.',
    department: 'Ministry of Finance',
    category: 'Financial',
    benefit: '₹2 lakh cover',
    eligibility: 'Age 18-70 years',
  },
  {
    id: '5',
    name: 'National Disability Pension Scheme',
    description: 'Pension scheme for persons with severe or multiple disabilities.',
    department: 'Social Justice',
    category: 'Disability',
    benefit: '₹1,000-1,500/month',
    eligibility: '80%+ disability',
  },
  {
    id: '6',
    name: 'Indira Gandhi Old Age Pension Scheme',
    description: 'Pension scheme for elderly persons above 60 years.',
    department: 'Rural Development',
    category: 'Elderly',
    benefit: '₹200-500/month',
    eligibility: 'Age 60+ years',
  },
  {
    id: '7',
    name: 'Balika Samriddhi Yojana',
    description: 'Scheme for welfare of girl children providing financial assistance.',
    department: 'Women & Child Development',
    category: 'Children',
    benefit: '₹500-1,000',
    eligibility: 'Girl child',
  },
  {
    id: '8',
    name: 'Pradhan Mantri Jeevan Jyoti Bima Yojana',
    description: 'Life insurance scheme for death due to any cause.',
    department: 'Ministry of Finance',
    category: 'Financial',
    benefit: '₹2 lakh cover',
    eligibility: 'Age 18-50 years',
  },
];

export default function SchemesScreen() {
  const router = useRouter();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Healthcare', 'Financial', 'Disability', 'Elderly', 'Women', 'Children'];

  useEffect(() => {
    // Load mock data
    setTimeout(() => {
      setSchemes(MOCK_SCHEMES);
      setFilteredSchemes(MOCK_SCHEMES);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    filterSchemes();
  }, [searchQuery, selectedCategory, schemes]);

  const filterSchemes = () => {
    if (!schemes || schemes.length === 0) {
      setFilteredSchemes([]);
      return;
    }

    let filtered = [...schemes];

    if (searchQuery) {
      filtered = filtered.filter(
        (scheme) =>
          (scheme.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          scheme.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          scheme.department?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((scheme) =>
        scheme.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredSchemes(filtered);
  };

  const handleSchemePress = (scheme: any) => {
    if (!scheme) return;
    
    Alert.alert(
      scheme.name,
      `${scheme.description || 'No description available'}\n\nEligibility: ${scheme.eligibility || 'Check official website'}\n\nBenefits: ${scheme.benefit || 'Various benefits'}`,
      [
        { text: 'Close', style: 'cancel' },
        { 
          text: 'Apply Now', 
          onPress: () => {
            Alert.alert('How to Apply', 'Please visit the nearest government office to apply for this scheme.\n\nRequired documents:\n• Aadhaar Card\n• Income Certificate\n• Residence Proof');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Government Schemes</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={COLORS.text.light} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search schemes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.text.light}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.text.light} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Schemes List */}
      <ScrollView
        style={styles.schemesList}
        contentContainerStyle={styles.schemesContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading schemes...</Text>
          </View>
        ) : filteredSchemes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.text.light} />
            <Text style={styles.emptyTitle}>No schemes found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultsCount}>
              Found {filteredSchemes.length} schemes
            </Text>
            {filteredSchemes.map((scheme) => (
              <GovernmentSchemeCard 
                key={scheme.id} 
                scheme={scheme} 
                onPress={() => handleSchemePress(scheme)}
              />
            ))}
          </>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.primary,
    padding: 0,
  },
  categoriesContainer: {
    maxHeight: 50,
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  schemesList: {
    flex: 1,
  },
  schemesContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  resultsCount: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});