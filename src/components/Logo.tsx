import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

export function Logo() {
  return (
    <View style={styles.container}>
      <Ionicons name="leaf-outline" size={40} color="#f4511e" />
      <Text style={styles.text}>HabitFlow</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f4511e',
    marginTop: 8,
  },
}); 