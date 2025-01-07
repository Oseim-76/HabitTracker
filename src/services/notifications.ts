import * as Notifications from 'expo-notifications';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function scheduleSilentMode(bedTime: Date, wakeUpTime: Date) {
  // Schedule Do Not Disturb mode
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Silent Mode Activated',
      body: 'Do Not Disturb is now on until wake-up time',
    },
    trigger: {
      hour: bedTime.getHours(),
      minute: bedTime.getMinutes(),
      repeats: true,
    },
  });
}

export async function scheduleGradualWake(wakeUpTime: Date, startVolume: number = 0) {
  // Schedule gradual volume increase
  const WAKE_DURATION = 15; // minutes
  const VOLUME_STEPS = 5;
  
  for (let i = 0; i < VOLUME_STEPS; i++) {
    const stepTime = new Date(wakeUpTime);
    stepTime.setMinutes(stepTime.getMinutes() - WAKE_DURATION + (i * (WAKE_DURATION / VOLUME_STEPS)));
    
    const volume = startVolume + ((100 - startVolume) * (i / VOLUME_STEPS));
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Wake Up',
        body: 'Time to start your day',
        sound: true,
        vibrate: [0, 100 * (i + 1)],
      },
      trigger: {
        hour: stepTime.getHours(),
        minute: stepTime.getMinutes(),
        repeats: true,
      },
    });
  }
} 