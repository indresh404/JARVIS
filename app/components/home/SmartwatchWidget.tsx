// components/home/SmartwatchWidget.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const SmartwatchWidget: React.FC = () => {
  const [healthData, setHealthData] = useState<any>({
    heart_rate: 75,
    bp: "118/76",
    spo2: 97,
    status: "Normal",
    timestamp: new Date().toISOString()
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [prevStatus, setPrevStatus] = useState<string>("Normal");
  const [autoMode, setAutoMode] = useState<'normal' | 'abnormal'>('normal');
  const intervalRef = useRef<any>(null);
  const autoIntervalRef = useRef<any>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const heartBeatAnim = useRef(new Animated.Value(1)).current;

  // Get the correct URL based on platform
  const getApiUrl = () => {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000/health?mode=normal';
    }
    if (Platform.OS === 'ios') {
      return 'http://localhost:5000/health?mode=normal';
    }
    return 'http://10.157.29.186:5000/health?mode=normal';
  };

  // Generate random health data
  const generateRandomData = () => {
    const isNormal = autoMode === 'normal';
    
    // Randomly switch mode sometimes for variety
    const randomSwitch = Math.random();
    let currentMode = autoMode;
    
    if (randomSwitch < 0.3) { // 30% chance to switch mode
      currentMode = autoMode === 'normal' ? 'abnormal' : 'normal';
      setAutoMode(currentMode);
    }
    
    if (currentMode === 'normal') {
      return {
        heart_rate: Math.floor(Math.random() * (90 - 70 + 1) + 70),
        bp: `${Math.floor(Math.random() * (120 - 110 + 1) + 110)}/${Math.floor(Math.random() * (80 - 70 + 1) + 70)}`,
        spo2: Math.floor(Math.random() * (100 - 95 + 1) + 95),
        status: "Normal",
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        heart_rate: Math.floor(Math.random() * (150 - 110 + 1) + 110),
        bp: `${Math.floor(Math.random() * (180 - 140 + 1) + 140)}/${Math.floor(Math.random() * (120 - 90 + 1) + 90)}`,
        spo2: Math.floor(Math.random() * (94 - 80 + 1) + 80),
        status: "Abnormal",
        timestamp: new Date().toISOString()
      };
    }
  };

  // Continuous heartbeat animation
  const startHeartbeatAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartBeatAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
        Animated.timing(heartBeatAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  };

  // Animate when data changes
  const animateDataChange = () => {
    LayoutAnimation.configureNext({
      duration: 400,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'easeInEaseOut', property: 'scaleXY' },
      delete: { type: 'easeInEaseOut', property: 'opacity' },
    });
    
    // Fade animation for the whole widget
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.5, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    
    // Scale animation for the badge
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    
    // Pulse animation for heartbeat effect
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  // Update data automatically
  const updateDataAutomatically = () => {
    const newData = generateRandomData();
    
    // Check if status changed
    if (newData.status !== prevStatus) {
      setPrevStatus(newData.status);
      animateDataChange();
    } else {
      animateDataChange();
    }
    
    console.log('🔄 Auto Data:', newData.status, '- Heart:', newData.heart_rate, 'BP:', newData.bp, 'SpO2:', newData.spo2);
    setHealthData(newData);
  };

  // Try to connect to Python API
  const fetchHealthData = async () => {
    try {
      const url = getApiUrl();
      console.log('📡 Fetching from Python:', url);
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Connected to Python! Data:', data.status, '- Heart:', data.heart_rate);
        
        setIsConnected(true);
        
        // Stop auto mode if Python is connected
        if (autoIntervalRef.current) {
          clearInterval(autoIntervalRef.current);
          autoIntervalRef.current = null;
        }
        
        // Check if status changed
        if (data.status !== prevStatus) {
          setPrevStatus(data.status);
          animateDataChange();
        } else {
          animateDataChange();
        }
        
        setHealthData(data);
      } else {
        setIsConnected(false);
        startAutoMode();
      }
    } catch (error) {
      console.log('⏳ Python not connected - Using auto mode');
      setIsConnected(false);
      startAutoMode();
    }
  };

  // Start auto-changing mode
  const startAutoMode = () => {
    if (!autoIntervalRef.current && !isConnected) {
      console.log('🎲 Starting auto data mode (changes every 2-3 seconds)');
      autoIntervalRef.current = setInterval(() => {
        updateDataAutomatically();
      }, Math.random() * 1000 + 2000); // Random interval between 2-3 seconds
    }
  };

  const retryConnection = () => {
    console.log('🔄 Retrying Python connection...');
    fetchHealthData();
  };

  const toggleAutoMode = () => {
    if (isConnected) {
      // If connected to Python, disconnect and go to auto mode
      setIsConnected(false);
      startAutoMode();
    } else {
      // If in auto mode, try to reconnect to Python
      retryConnection();
    }
  };

  useEffect(() => {
    startHeartbeatAnimation();
    // Always start auto mode immediately — smooth live updates
    updateDataAutomatically();
    autoIntervalRef.current = setInterval(() => {
      updateDataAutomatically();
    }, 2500);

    // Also try Python connection in background
    fetchHealthData();
    intervalRef.current = setInterval(() => {
      if (!isConnected) fetchHealthData();
    }, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
    };
  }, []);

  // Get color based on value ranges
  const getHeartRateColor = (value: number) => {
    if (value < 60) return '#F59E0B';
    if (value > 100) return '#EF4444';
    return '#10B981';
  };

  const getSpO2Color = (value: number) => {
    if (value < 90) return '#EF4444';
    if (value < 95) return '#F59E0B';
    return '#10B981';
  };

  const getBPColor = (bpString: string) => {
    const systolic = parseInt(bpString.split('/')[0]);
    if (systolic > 140) return '#EF4444';
    if (systolic > 120) return '#F59E0B';
    return '#10B981';
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>⌚ Live Smartwatch Data</Text>
            <View style={[styles.statusDot, isConnected ? styles.connectedDot : styles.disconnectedDot]} />
          </View>
          <View style={styles.headerRight}>
            <Animated.View 
              style={[
                styles.badge, 
                healthData.status === 'Normal' ? styles.normalBadge : styles.abnormalBadge,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <Text style={styles.badgeText}>{healthData.status}</Text>
            </Animated.View>
            <TouchableOpacity style={styles.modeToggle} onPress={toggleAutoMode}>
              <Text style={styles.modeToggleText}>
                {isConnected ? '📡 Python' : '🎲 Auto'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.metricsContainer}>
          {/* Heart Rate */}
          <View style={styles.metric}>
            <Animated.View style={{ transform: [{ scale: heartBeatAnim }] }}>
              <Ionicons name="heart" size={32} color={getHeartRateColor(healthData.heart_rate)} />
            </Animated.View>
            <Animated.Text style={[
              styles.metricValue, 
              { color: getHeartRateColor(healthData.heart_rate) }
            ]}>
              {healthData.heart_rate}
            </Animated.Text>
            <Text style={styles.metricLabel}>Heart Rate</Text>
            <Text style={styles.unit}>BPM</Text>
            <View style={styles.trendIndicator}>
              {healthData.heart_rate > 100 && <Text style={styles.trendUp}>↑ High</Text>}
              {healthData.heart_rate < 60 && <Text style={styles.trendDown}>↓ Low</Text>}
              {healthData.heart_rate >= 60 && healthData.heart_rate <= 100 && <Text style={styles.trendNormal}>✓ Normal</Text>}
            </View>
          </View>

          {/* Blood Pressure */}
          <View style={styles.metric}>
            <Ionicons name="water" size={32} color={getBPColor(healthData.bp)} />
            <Animated.Text style={[
              styles.metricValue, 
              { color: getBPColor(healthData.bp) }
            ]}>
              {healthData.bp}
            </Animated.Text>
            <Text style={styles.metricLabel}>Blood Pressure</Text>
            <Text style={styles.unit}>mmHg</Text>
            <View style={styles.trendIndicator}>
              {parseInt(healthData.bp.split('/')[0]) > 140 && <Text style={styles.trendUp}>↑ High</Text>}
              {parseInt(healthData.bp.split('/')[0]) >= 120 && parseInt(healthData.bp.split('/')[0]) <= 139 && <Text style={styles.trendWarning}>⚠ Elevated</Text>}
              {parseInt(healthData.bp.split('/')[0]) < 120 && <Text style={styles.trendNormal}>✓ Normal</Text>}
            </View>
          </View>

          {/* SpO2 */}
          <View style={styles.metric}>
            <Ionicons name="leaf" size={32} color={getSpO2Color(healthData.spo2)} />
            <Animated.Text style={[
              styles.metricValue, 
              { color: getSpO2Color(healthData.spo2) }
            ]}>
              {healthData.spo2}
            </Animated.Text>
            <Text style={styles.metricLabel}>SpO2</Text>
            <Text style={styles.unit}>%</Text>
            <View style={styles.trendIndicator}>
              {healthData.spo2 < 90 && <Text style={styles.trendDown}>↓ Critical</Text>}
              {healthData.spo2 >= 90 && healthData.spo2 < 95 && <Text style={styles.trendWarning}>⚠ Low</Text>}
              {healthData.spo2 >= 95 && <Text style={styles.trendNormal}>✓ Normal</Text>}
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Ionicons name="time-outline" size={12} color="#9CA3AF" />
          <Text style={styles.timestamp}>
            Updated: {new Date(healthData.timestamp).toLocaleTimeString()}
          </Text>
        </View>

        

       
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectedDot: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  disconnectedDot: {
    backgroundColor: '#F59E0B',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  normalBadge: {
    backgroundColor: '#D1FAE5',
  },
  abnormalBadge: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  modeToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  modeToggleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  unit: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  trendIndicator: {
    marginTop: 4,
    alignItems: 'center',
  },
  trendUp: {
    fontSize: 9,
    color: '#EF4444',
    fontWeight: '600',
  },
  trendDown: {
    fontSize: 9,
    color: '#EF4444',
    fontWeight: '600',
  },
  trendWarning: {
    fontSize: 9,
    color: '#F59E0B',
    fontWeight: '600',
  },
  trendNormal: {
    fontSize: 9,
    color: '#10B981',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 6,
  },
  timestamp: {
    fontSize: 10,
    color: '#9CA3AF',
  },
 
  

});