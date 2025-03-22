import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Achievement {
  id: string;
  title: string;
  description: string;
  requirement: number;
  progress: number;
  isUnlocked: boolean;
  category: 'distance' | 'frequency' | 'improvement';
}

const AchievementsScreen: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'distance' | 'frequency' | 'improvement'>('all');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      // Load test results to calculate achievements
      const results = await AsyncStorage.getItem('walkTestResults');
      const walkTests = results ? JSON.parse(results) : [];
      
      // Calculate total distance and frequency
      const totalDistance = walkTests.reduce((sum: number, test: any) => sum + test.distance, 0);
      const totalTests = walkTests.length;
      
      // Calculate improvement
      const sortedTests = [...walkTests].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latestTests = sortedTests.slice(0, 5);
      const improvement = latestTests.length > 1 
        ? ((latestTests[0].distance - latestTests[latestTests.length - 1].distance) / latestTests[latestTests.length - 1].distance) * 100
        : 0;

      const achievementsList: Achievement[] = [
        {
          id: 'first_walk',
          title: 'First Steps',
          description: 'Complete your first 6-minute walk test',
          requirement: 1,
          progress: totalTests,
          isUnlocked: totalTests >= 1,
          category: 'frequency',
        },
        {
          id: 'distance_1km',
          title: 'Distance Warrior',
          description: 'Accumulate 1km in total distance',
          requirement: 1000,
          progress: totalDistance,
          isUnlocked: totalDistance >= 1000,
          category: 'distance',
        },
        {
          id: 'distance_5km',
          title: 'Distance Master',
          description: 'Accumulate 5km in total distance',
          requirement: 5000,
          progress: totalDistance,
          isUnlocked: totalDistance >= 5000,
          category: 'distance',
        },
        {
          id: 'tests_5',
          title: 'Dedicated Walker',
          description: 'Complete 5 walk tests',
          requirement: 5,
          progress: totalTests,
          isUnlocked: totalTests >= 5,
          category: 'frequency',
        },
        {
          id: 'tests_10',
          title: 'Walking Expert',
          description: 'Complete 10 walk tests',
          requirement: 10,
          progress: totalTests,
          isUnlocked: totalTests >= 10,
          category: 'frequency',
        },
        {
          id: 'improvement_10',
          title: 'Steady Progress',
          description: 'Improve your distance by 10% over 5 tests',
          requirement: 10,
          progress: improvement,
          isUnlocked: improvement >= 10,
          category: 'improvement',
        },
      ];

      setAchievements(achievementsList);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const filteredAchievements = achievements.filter(
    achievement => selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const renderAchievement = (achievement: Achievement) => {
    const progress = Math.min(100, (achievement.progress / achievement.requirement) * 100);

    return (
      <TouchableOpacity
        key={achievement.id}
        style={[styles.achievementCard, achievement.isUnlocked && styles.unlockedCard]}
        onPress={() => {
          Alert.alert(
            achievement.title,
            `${achievement.description}\n\nProgress: ${Math.round(achievement.progress)}/${achievement.requirement} (${Math.round(progress)}%)`
          );
        }}
      >
        <View style={styles.achievementContent}>
          <Text style={[styles.achievementTitle, achievement.isUnlocked && styles.unlockedText]}>
            {achievement.title}
          </Text>
          <Text style={styles.achievementDescription}>{achievement.description}</Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.categorySelector}>
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === 'all' && styles.selectedCategory]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[styles.categoryText, selectedCategory === 'all' && styles.selectedCategoryText]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === 'distance' && styles.selectedCategory]}
            onPress={() => setSelectedCategory('distance')}
          >
            <Text style={[styles.categoryText, selectedCategory === 'distance' && styles.selectedCategoryText]}>
              Distance
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === 'frequency' && styles.selectedCategory]}
            onPress={() => setSelectedCategory('frequency')}
          >
            <Text style={[styles.categoryText, selectedCategory === 'frequency' && styles.selectedCategoryText]}>
              Frequency
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === 'improvement' && styles.selectedCategory]}
            onPress={() => setSelectedCategory('improvement')}
          >
            <Text style={[styles.categoryText, selectedCategory === 'improvement' && styles.selectedCategoryText]}>
              Improvement
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.achievementsContainer}>
          {filteredAchievements.map(renderAchievement)}
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
  categorySelector: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedCategory: {
    backgroundColor: '#4A90E2',
  },
  categoryText: {
    color: '#636E72',
    fontWeight: '600',
    fontSize: 12,
  },
  selectedCategoryText: {
    color: '#FFF',
  },
  achievementsContainer: {
    gap: 12,
  },
  achievementCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    opacity: 0.6,
  },
  unlockedCard: {
    opacity: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  achievementContent: {
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 4,
  },
  unlockedText: {
    color: '#4A90E2',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#636E72',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#F5F6FA',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
  },
  progressText: {
    fontSize: 12,
    color: '#636E72',
    minWidth: 35,
  },
});

export default AchievementsScreen; 