import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>6-Minute Walk Test</Text>
          <Text style={styles.subtitle}>Track your walking capacity</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('WalkTest')}
          >
            <Text style={styles.buttonText}>Start New Test</Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate('History')}
            >
              <Text style={styles.secondaryButtonText}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.secondaryButtonText}>Profile</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.achievementButton]}
            onPress={() => navigation.navigate('Achievements')}
          >
            <Text style={styles.secondaryButtonText}>Achievements</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Quick Tips</Text>
          <Text style={styles.infoText}>• Walk at your normal pace</Text>
          <Text style={styles.infoText}>• Stop if you feel uncomfortable</Text>
          <Text style={styles.infoText}>• Keep your phone steady while walking</Text>
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
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#636E72',
  },
  buttonContainer: {
    gap: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
    height: 60,
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    flex: 1,
    height: 100,
  },
  achievementButton: {
    backgroundColor: '#FFF',
    height: 60,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#2D3436',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 8,
  },
});

export default HomeScreen; 