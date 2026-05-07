import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { DetailScreen } from '../screens/DetailScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MovieListScreen } from '../screens/MovieListScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { WatchlistScreen } from '../screens/WatchlistScreen';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useWatchlistStore } from '../store/watchlistStore';
import type {
  HomeStackParamList,
  ProfileStackParamList,
  RootStackParamList,
  SearchStackParamList,
  WatchlistStackParamList,
} from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const SearchStack = createNativeStackNavigator<SearchStackParamList>();
const WatchlistStack = createNativeStackNavigator<WatchlistStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.surface,
    card: colors.surface,
    text: colors.on_surface,
    border: colors.surface_container,
    primary: colors.primary,
  },
};

function HomeStackNavigator(): React.ReactElement {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen
        name="MovieList"
        component={MovieListScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params.title,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.on_surface,
        })}
      />
    </HomeStack.Navigator>
  );
}

function SearchStackNavigator(): React.ReactElement {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="SearchMain" component={SearchScreen} />
    </SearchStack.Navigator>
  );
}

function WatchlistStackNavigator(): React.ReactElement {
  return (
    <WatchlistStack.Navigator screenOptions={{ headerShown: false }}>
      <WatchlistStack.Screen name="WatchlistMain" component={WatchlistScreen} />
    </WatchlistStack.Navigator>
  );
}

function ProfileStackNavigator(): React.ReactElement {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
    </ProfileStack.Navigator>
  );
}

function TabBarBackground(): React.ReactElement {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        blurType="dark"
        blurAmount={22}
        reducedTransparencyFallbackColor={colors.scrim}
        style={StyleSheet.absoluteFill}
      />
    );
  }
  return <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]} />;
}

function HomeTabIcon({ focused }: { focused: boolean }): React.ReactElement {
  return (
    <Text style={[tabBarIconStyles.icon, focused ? tabBarIconStyles.iconActive : tabBarIconStyles.iconIdle]}>
      ⌂
    </Text>
  );
}

function SearchTabIcon({ focused }: { focused: boolean }): React.ReactElement {
  return (
    <Text style={[tabBarIconStyles.icon, focused ? tabBarIconStyles.iconActive : tabBarIconStyles.iconIdle]}>
      ⌕
    </Text>
  );
}

function WatchlistTabIcon({ focused }: { focused: boolean }): React.ReactElement {
  return (
    <Text style={[tabBarIconStyles.icon, focused ? tabBarIconStyles.iconActive : tabBarIconStyles.iconIdle]}>
      ☰
    </Text>
  );
}

function ProfileTabIcon({ focused }: { focused: boolean }): React.ReactElement {
  return (
    <Text style={[tabBarIconStyles.icon, focused ? tabBarIconStyles.iconActive : tabBarIconStyles.iconIdle]}>
      ◉
    </Text>
  );
}

function TabNavigator(): React.ReactElement {
  const count = useWatchlistStore(s => s.items.length);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: 'transparent',
        },
        tabBarBackground: TabBarBackground,
        tabBarActiveTintColor: colors.primary_container,
        tabBarInactiveTintColor: colors.on_surface_variant,
        tabBarLabelStyle: { ...typography.label, fontSize: 13 },
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Home', tabBarIcon: HomeTabIcon }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchStackNavigator}
        options={{ tabBarLabel: 'Search', tabBarIcon: SearchTabIcon }}
      />
      <Tab.Screen
        name="WatchlistTab"
        component={WatchlistStackNavigator}
        options={{
          tabBarLabel: 'Watchlist',
          tabBarIcon: WatchlistTabIcon,
          tabBarBadge: count > 0 ? count : undefined,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ tabBarLabel: 'Profile', tabBarIcon: ProfileTabIcon }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator(): React.ReactElement {
  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Tabs" component={TabNavigator} />
        <RootStack.Screen name="Detail" component={DetailScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const tabBarIconStyles = StyleSheet.create({
  icon: {
    fontSize: spacing.xl,
  },
  iconActive: {
    color: colors.primary_container,
  },
  iconIdle: {
    color: colors.on_surface_variant,
  },
});
