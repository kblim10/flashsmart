/**
 * FlashSmart
 * Aplikasi flashcard dengan bantuan AI untuk pembelajaran efisien
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { NativeBaseProvider } from 'native-base';
import { theme } from './src/utils/theme';
import AppNavigator from './src/navigation';
import { databaseService } from './src/services/dbservice';

function App(): React.JSX.Element {
  // Inisialisasi database saat aplikasi dimuat
  useEffect(() => {
    const initDB = async () => {
      try {
        await databaseService.initDatabase();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initDB();

    // Tutup database saat aplikasi unmount
    return () => {
      databaseService.closeDatabase();
    };
  }, []);

  return (
    <NativeBaseProvider theme={theme}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </NativeBaseProvider>
  );
}

export default App;
