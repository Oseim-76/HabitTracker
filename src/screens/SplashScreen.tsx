import React, {useEffect} from 'react';
import {View, StyleSheet, Animated, Dimensions} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

const {width} = Dimensions.get('window');

export function SplashScreen() {
  const scaleValue = new Animated.Value(0);
  const opacityValue = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: opacityValue,
            transform: [{scale: scaleValue}],
          },
        ]}>
        <Ionicons name="calendar-outline" size={64} color="#f4511e" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  iconContainer: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: (width * 0.4) / 2,
    backgroundColor: 'rgba(244, 81, 30, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 