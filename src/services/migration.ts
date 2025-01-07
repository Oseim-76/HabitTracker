import AsyncStorage from '@react-native-async-storage/async-storage';
import {Logger} from './logger';

interface Migration {
  version: number;
  migrate: () => Promise<void>;
}

const CURRENT_VERSION = 1;
const VERSION_KEY = 'app_version';

const migrations: Migration[] = [
  {
    version: 1,
    migrate: async () => {
      // Example migration: Add timeOfDay field to habits
      const habitsJson = await AsyncStorage.getItem('habits');
      if (habitsJson) {
        const habits = JSON.parse(habitsJson);
        const migratedHabits = habits.map((habit: any) => ({
          ...habit,
          timeOfDay: habit.timeOfDay || 'morning',
        }));
        await AsyncStorage.setItem('habits', JSON.stringify(migratedHabits));
      }
    },
  },
  // Add more migrations here as needed
];

export const MigrationService = {
  async migrate() {
    try {
      const version = Number(await AsyncStorage.getItem(VERSION_KEY)) || 0;
      
      if (version < CURRENT_VERSION) {
        Logger.info(`Starting migration from version ${version} to ${CURRENT_VERSION}`);
        
        for (const migration of migrations) {
          if (migration.version > version) {
            Logger.info(`Applying migration ${migration.version}`);
            await migration.migrate();
          }
        }
        
        await AsyncStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
        Logger.info('Migration completed successfully');
      }
    } catch (error) {
      Logger.error('Migration failed', error);
      throw error;
    }
  },
}; 