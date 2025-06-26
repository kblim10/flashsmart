import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'native-base';
import { FontAwesome5 } from '@expo/vector-icons';

// Screens
// Catatan: kita belum membuat screen-nya, tapi nanti akan diimplementasikan
import HomeScreen from '../screens/HomeScreen';
import UploadScreen from '../screens/UploadScreen';
import StudyScreen from '../screens/StudyScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FlashcardDetailScreen from '../screens/FlashcardDetailScreen';
import CategoryScreen from '../screens/CategoryScreen';
import PremiumScreen from '../screens/PremiumScreen';

// Tipe untuk Stack Navigator
export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  FlashcardDetail: { id: string };
  Category: { category: string };
  Premium: undefined;
  Study: { flashcardIds?: string[] };
};

// Tipe untuk Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Upload: undefined;
  Library: undefined;
  Profile: undefined;
};

// Membuat navigasi
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Bottom Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6C9BC0', // primary.500
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Beranda',
          tabBarIcon: ({ color, size }) => (
            <Icon
              as={FontAwesome5}
              name="home"
              color={color}
              size={size - 2}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Upload"
        component={UploadScreen}
        options={{
          tabBarLabel: 'Upload',
          tabBarIcon: ({ color, size }) => (
            <Icon
              as={FontAwesome5}
              name="file-upload"
              color={color}
              size={size - 2}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Perpustakaan',
          tabBarIcon: ({ color, size }) => (
            <Icon
              as={FontAwesome5}
              name="book"
              color={color}
              size={size - 2}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Icon
              as={FontAwesome5}
              name="user"
              color={color}
              size={size - 2}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Stack Navigator utama
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen
          name="FlashcardDetail"
          component={FlashcardDetailScreen}
          options={{
            headerShown: true,
            title: 'Detail Flashcard',
          }}
        />
        <Stack.Screen
          name="Category"
          component={CategoryScreen}
          options={({ route }) => ({
            headerShown: true,
            title: route.params.category,
          })}
        />
        <Stack.Screen
          name="Premium"
          component={PremiumScreen}
          options={{
            headerShown: true,
            title: 'Premium',
          }}
        />
        <Stack.Screen
          name="Study"
          component={StudyScreen}
          options={{
            headerShown: true,
            title: 'Belajar',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 