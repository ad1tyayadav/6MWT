import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';

interface TestResult {
  date: string;
  distance: number;
  duration: number;
  coordinates: Array<{ latitude: number; longitude: number; timestamp: number }>;
}

const HistoryScreen: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const storedResults = await AsyncStorage.getItem('walkTestResults');
      if (storedResults) {
        setResults(JSON.parse(storedResults));
      }
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };

  const filterResultsByPeriod = (period: 'week' | 'month' | 'all') => {
    const now = new Date();
    const filtered = results.filter((result) => {
      const resultDate = new Date(result.date);
      if (period === 'week') {
        return now.getTime() - resultDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
      } else if (period === 'month') {
        return now.getTime() - resultDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
      }
      return true;
    });
    return filtered;
  };

  const getChartData = () => {
    const filteredResults = filterResultsByPeriod(selectedPeriod);
    return {
      labels: filteredResults.map((result) => 
        new Date(result.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ).slice(-7),
      datasets: [{
        data: filteredResults.map((result) => result.distance).slice(-7),
      }],
    };
  };

  const getAverageDistance = () => {
    const filteredResults = filterResultsByPeriod(selectedPeriod);
    if (filteredResults.length === 0) return 0;
    return Math.round(
      filteredResults.reduce((sum, result) => sum + result.distance, 0) / filteredResults.length
    );
  };

  const getBestDistance = () => {
    const filteredResults = filterResultsByPeriod(selectedPeriod);
    if (filteredResults.length === 0) return 0;
    return Math.max(...filteredResults.map((result) => result.distance));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'week' && styles.selectedPeriod]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'week' && styles.selectedPeriodText]}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'month' && styles.selectedPeriod]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.selectedPeriodText]}>
              Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'all' && styles.selectedPeriod]}
            onPress={() => setSelectedPeriod('all')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'all' && styles.selectedPeriodText]}>
              All Time
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Average Distance</Text>
            <Text style={styles.statValue}>{getAverageDistance()}m</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Best Distance</Text>
            <Text style={styles.statValue}>{getBestDistance()}m</Text>
          </View>
        </View>

        {results.length > 0 ? (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Progress Chart</Text>
            <LineChart
              data={getChartData()}
              width={Dimensions.get('window').width - 32}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(45, 52, 54, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#4A90E2',
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No test results yet</Text>
            <Text style={styles.noDataSubtext}>Complete a 6-minute walk test to see your progress</Text>
          </View>
        )}

        <View style={styles.historyList}>
          <Text style={styles.historyTitle}>Recent Tests</Text>
          {filterResultsByPeriod(selectedPeriod).reverse().map((result, index) => (
            <View key={index} style={styles.historyItem}>
              <View>
                <Text style={styles.historyDate}>
                  {new Date(result.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.historyTime}>
                  {new Date(result.date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <Text style={styles.historyDistance}>{result.distance}m</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollContent: {
    padding: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedPeriod: {
    backgroundColor: '#4A90E2',
  },
  periodButtonText: {
    color: '#636E72',
    fontWeight: '600',
  },
  selectedPeriodText: {
    color: '#FFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  chartContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  noDataContainer: {
    backgroundColor: '#FFF',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
  },
  historyList: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F6FA',
  },
  historyDate: {
    fontSize: 16,
    color: '#2D3436',
    fontWeight: '600',
  },
  historyTime: {
    fontSize: 14,
    color: '#636E72',
  },
  historyDistance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
});

export default HistoryScreen; 