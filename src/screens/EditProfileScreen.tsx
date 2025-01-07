import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, spacing } from '../theme';
import * as ImagePicker from 'expo-image-picker';
import { habitsApi } from '../services/api';

interface EditProfileScreenProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProfileScreen({ onClose, onSuccess }: EditProfileScreenProps) {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    bio: user?.bio || '',
  });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    calculateProgress();
  }, [formData]);

  const calculateProgress = () => {
    const fields = ['username', 'fullName', 'email', 'phoneNumber', 'bio'];
    const filledFields = fields.filter(field => formData[field]?.trim().length > 0);
    setProgress((filledFields.length / fields.length) * 100);
  };

  const handleSave = async () => {
    try {
      if (!updateUser || !user) return;

      if (formData.username.length < 3) {
        Alert.alert('Invalid Username', 'Username must be at least 3 characters long');
        return;
      }

      const updatedUser = {
        ...user,
        ...formData,
      };

      await updateUser(updatedUser);
      Alert.alert('Success', 'Profile updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photos to change profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && updateUser && user) {
        const response = await habitsApi.uploadProfileImage({
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'profile.jpg'
        });

        if (response.status === 'success') {
          const updatedUser = {
            ...user,
            profile_image: response.data.profile_image
          };
          await updateUser(updatedUser);
          setFormData(prev => ({
            ...prev,
            profile_image: response.data.profile_image
          }));
        }
      }
    } catch (error) {
      console.error('Image pick/upload error:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    }
  };

  const ProgressHeader = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressTextContainer}>
        <Text style={styles.progressTitle}>
          {progress === 100 
            ? "You're done!" 
            : `You only need ${Math.ceil(100 - progress)}% more!`}
        </Text>
        <Text style={styles.progressSubtitle}>
          {progress === 100 
            ? "You've reached 100% and thankyou for completing your data!"
            : "Complete your data, and get our voucher of free shipping fee!"}
        </Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
    </View>
  );

  const ProfileImageSection = () => {
    const baseURL = 'http://localhost:3000';
    const imageUri = user?.profile_image 
      ? (user.profile_image.startsWith('http') 
          ? user.profile_image 
          : `${baseURL}${user.profile_image}`)
      : null;

    return (
      <View style={styles.profileImageContainer}>
        <View style={styles.profileImage}>
          {imageUri ? (
            <Image 
              source={{ uri: imageUri }} 
              style={styles.image}
              defaultSource={{ uri: 'https://via.placeholder.com/100' }}
            />
          ) : (
            <Text style={styles.imageText}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </Text>
          )}
          <TouchableOpacity 
            style={styles.editImageButton}
            onPress={handleImagePick}
          >
            <Ionicons name="camera" size={12} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onClose}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ProgressHeader />
        <ProfileImageSection />
        
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
              placeholder="Enter username"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
              placeholder="Enter full name"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Email Address</Text>
              {formData.email && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                  <Text style={styles.verifiedText}>VERIFIED</Text>
                </View>
              )}
            </View>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={formData.bio}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
              placeholder="Write something about yourself"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.saveChangesButton}
        onPress={handleSave}
      >
        <Text style={styles.saveChangesText}>Save Changes</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  saveButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  progressContainer: {
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  progressTextContainer: {
    marginBottom: spacing.md,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  progressSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 1.5,
    overflow: 'hidden',
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  },
  form: {
    padding: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bioInput: {
    height: 100,
    paddingTop: spacing.sm,
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  imageText: {
    fontSize: 40,
    fontWeight: '600',
    color: '#666',
  },
  editImageButton: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  saveChangesButton: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginBottom: Platform.OS === 'ios' ? 34 : 24,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  saveChangesText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 