import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  medicalConditions: string;
}

const ProfileScreen: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    medicalConditions: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      setIsEditing(false);
      Alert.alert('Success', 'Profile saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  const renderField = (label: string, value: string, key: keyof UserProfile) => {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(text) => setProfile({ ...profile, [key]: text })}
            placeholder={`Enter your ${label.toLowerCase()}`}
          />
        ) : (
          <Text style={styles.fieldValue}>{value || 'Not set'}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {profile.name ? profile.name[0].toUpperCase() : '?'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              if (isEditing) {
                saveProfile();
              } else {
                setIsEditing(true);
              }
            }}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Save' : 'Edit Profile'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          {renderField('Name', profile.name, 'name')}
          {renderField('Age', profile.age, 'age')}
          {renderField('Gender', profile.gender, 'gender')}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Physical Information</Text>
          {renderField('Height (cm)', profile.height, 'height')}
          {renderField('Weight (kg)', profile.weight, 'weight')}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Medical Information</Text>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Medical Conditions</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={profile.medicalConditions}
                onChangeText={(text) =>
                  setProfile({ ...profile, medicalConditions: text })
                }
                placeholder="Enter any medical conditions or notes"
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={styles.fieldValue}>
                {profile.medicalConditions || 'No medical conditions specified'}
              </Text>
            )}
          </View>
        </View>

        {isEditing && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setIsEditing(false);
              loadProfile();
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  editButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: '#2D3436',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DFE6E9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2D3436',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  cancelButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen; 