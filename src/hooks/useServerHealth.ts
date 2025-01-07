import {useEffect} from 'react';
import {healthCheck} from '../services/api';

export const useServerHealth = () => {
  useEffect(() => {
    const checkServer = async () => {
      try {
        await healthCheck();
        console.log('Server is accessible');
      } catch (error) {
        console.error('Server is not accessible:', error);
      }
    };
    
    if (__DEV__) {
      checkServer();
    }
  }, []);
}; 