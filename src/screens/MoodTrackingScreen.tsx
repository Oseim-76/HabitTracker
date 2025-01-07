import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';

const moods = [
  {emoji: '😊', label: 'Great', color: '#4CAF50'},
  {emoji: '🙂', label: 'Good', color: '#8BC34A'},
  {emoji: '😐', label: 'Okay', color: '#FFC107'},
  {emoji: '😕', label: 'Not Great', color: '#FF9800'},
  {emoji: '😢', label: 'Bad', color: '#f44336'},
];

export default function MoodTrackingScreen(): JSX.Element {
  const navigation = useNavigation();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const scaleAnim = React.useRef(new Animated.Value(0.5)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleMoodSelect = (index: number) => {
    setSelectedMood(index);
    // TODO: Save mood to storage/context
    setTimeout(() => {
      navigation.goBack();
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            transform: [{scale: scaleAnim}],
            opacity: scaleAnim,
          },
        ]}>
        <Text style={styles.title}>How are you feeling today?</Text>
        <Text style={styles.subtitle}>
          Track your mood to see how it affects your habits
        </Text>

        <View style={styles.moodGrid}>
          {moods.map((mood, index) => (
            <TouchableOpacity
              key={mood.label}
              style={[
                styles.moodButton,
                selectedMood === index && {
                  backgroundColor: mood.color + '20',
                  borderColor: mood.color,
                },
              ]}
              onPress={() => handleMoodSelect(index)}>
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text
                style={[
                  styles.moodLabel,
                  selectedMood === index && {color: mood.color},
                ]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  moodButton: {
    width: '45%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
}); 