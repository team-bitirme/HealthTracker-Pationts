import { Link, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeaderButton } from '../../components/HeaderButton';
import { TabBarIcon } from '../../components/TabBarIcon';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#4263eb',
          tabBarInactiveTintColor: '#868e96',
          tabBarStyle: {
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom + 8,
            paddingTop: 8,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            backgroundColor: 'white',
            borderTopWidth: 0,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginBottom: -2,
          },
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Ana Sayfa',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="home" color={color} focused={focused} />
            ),
          }}
        />
        {/* <Tabs.Screen
          name="veri-ekle"
          options={{
            title: 'Veri Ekle',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="plus-circle" color={color} focused={focused} />
            ),
          }}
        /> */}
        <Tabs.Screen
          name="egzersizler"
          options={{
            title: 'Egzersizler',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="heart" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="veriler"
          options={{
            title: 'Veriler',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="list" color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
