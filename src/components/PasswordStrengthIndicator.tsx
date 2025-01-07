import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface Props {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<Props> = ({password}) => {
  const getStrength = (): {
    strength: 'weak' | 'medium' | 'strong';
    color: string;
    width: string;
  } => {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    const length = password.length;

    const criteria = [hasLower, hasUpper, hasNumber, hasSpecial, length >= 8].filter(Boolean).length;

    if (criteria <= 2) return {strength: 'weak', color: '#FF3B30', width: '33%'};
    if (criteria <= 4) return {strength: 'medium', color: '#FF9500', width: '66%'};
    return {strength: 'strong', color: '#34C759', width: '100%'};
  };

  const {strength, color, width} = getStrength();

  return (
    <View style={styles.container}>
      <View style={styles.strengthBar}>
        <View style={[styles.strengthIndicator, {backgroundColor: color, width}]} />
      </View>
      <Text style={[styles.strengthText, {color}]}>
        Password Strength: {strength.charAt(0).toUpperCase() + strength.slice(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginBottom: 5,
  },
  strengthIndicator: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    textAlign: 'right',
  },
}); 