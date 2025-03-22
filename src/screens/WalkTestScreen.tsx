import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

type WalkTestScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WalkTest'>;
};

interface Coordinate {
  latitude: number;
  longitude: number;
  timestamp: number;
}

const TOTAL_TIME = 360; // 6 minutes in seconds

const WalkTestScreen: React.FC<WalkTestScreenProps> = ({ navigation }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [distance, setDistance] = useState(0);
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    requestLocationPermission();
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setHasPermission(true);
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location);
      }
      setIsLoading(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to get location permission');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isStarted) {
      endTest();
    }
    return () => clearInterval(interval);
  }, [isStarted, timeLeft]);

  const startTest = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Location permission is needed to track your walk');
      return;
    }

    setIsStarted(true);
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (location) => {
        const newCoordinate: Coordinate = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: location.timestamp,
        };

        setCoordinates((prev) => {
          if (prev.length > 0) {
            const lastCoord = prev[prev.length - 1];
            const newDistance = calculateDistance(
              lastCoord.latitude,
              lastCoord.longitude,
              newCoordinate.latitude,
              newCoordinate.longitude
            );
            setDistance((prevDistance) => prevDistance + newDistance);
          }
          return [...prev, newCoordinate];
        });

        mapRef.current?.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      }
    );
  };

  const endTest = async () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }
    setIsStarted(false);

    const testResult = {
      date: new Date().toISOString(),
      distance: Math.round(distance),
      coordinates: coordinates,
      duration: TOTAL_TIME - timeLeft,
    };

    try {
      const existingResults = await AsyncStorage.getItem('walkTestResults');
      const results = existingResults ? JSON.parse(existingResults) : [];
      results.push(testResult);
      await AsyncStorage.setItem('walkTestResults', JSON.stringify(results));
      
      setShowCompletionModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to save test results');
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        {currentLocation && (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Polyline
              coordinates={coordinates.map(coord => ({
                latitude: coord.latitude,
                longitude: coord.longitude,
              }))}
              strokeColor="#4A90E2"
              strokeWidth={3}
            />
          </MapView>
        )}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Time Left</Text>
            <Text style={styles.statValue}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{Math.round(distance)}m</Text>
          </View>
        </View>

        {!isStarted ? (
          <TouchableOpacity style={styles.startButton} onPress={startTest}>
            <Text style={styles.buttonText}>Start Test</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.startButton, styles.endButton]} onPress={endTest}>
            <Text style={styles.buttonText}>End Test</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showCompletionModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Test Completed!</Text>
            <Text style={styles.modalText}>
              You walked {Math.round(distance)} meters in {TOTAL_TIME - timeLeft} seconds.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.historyButton]}
                onPress={() => {
                  setShowCompletionModal(false);
                  navigation.navigate('History');
                }}
              >
                <Text style={styles.modalButtonText}>View History</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.homeButton]}
                onPress={() => {
                  setShowCompletionModal(false);
                  navigation.navigate('Home');
                }}
              >
                <Text style={styles.modalButtonText}>Return Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 20,
    margin: 16,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    padding: 16,
    borderRadius: 12,
    minWidth: 140,
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
  startButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  endButton: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  historyButton: {
    backgroundColor: '#4A90E2',
  },
  homeButton: {
    backgroundColor: '#2ECC71',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WalkTestScreen; 