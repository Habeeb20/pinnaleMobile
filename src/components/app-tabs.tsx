// import { NativeTabs } from 'expo-router/unstable-native-tabs';
// import { useColorScheme } from 'react-native';
//
// import { Colors } from '@/constants/theme';
//
// export default function AppTabs() {
//   const scheme = useColorScheme();
//   const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
//
//   return (
//     <NativeTabs
//       backgroundColor={colors.background}
//       indicatorColor={colors.backgroundElement}
//       labelStyle={{ selected: { color: colors.text } }}>
//       <NativeTabs.Trigger name="index">
//         <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
//         <NativeTabs.Trigger.Icon
//           src={require('@/assets/images/tabIcons/home.png')}
//           renderingMode="template"
//         />
//       </NativeTabs.Trigger>
//
//       <NativeTabs.Trigger name="explore">
//         <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
//         <NativeTabs.Trigger.Icon
//           src={require('@/assets/images/tabIcons/explore.png')}
//           renderingMode="template"
//         />
//       </NativeTabs.Trigger>
//     </NativeTabs>
//   );
// }



// src/components/app-tabs.tsx
import { Tabs } from "expo-router";
import { View } from "react-native";
import { useAuth } from "@/lib/auth-context";
import { ROLE_TABS } from "@/lib/role-nav-config";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const GOLD = "#D4AF37";
const NAVY = "#0B1220";
const NAVY_ELEVATED = "#141F35";

export default function AppTabs() {
  const { user } = useAuth();
  const tabs = ROLE_TABS[user?.role || "admin"] || ROLE_TABS.admin;
  const activeNames = tabs.map((t) => t.name);
  const insets = useSafeAreaInsets();
  // Every possible screen file must be registered; ones not in this role's
  // set are hidden via href: null so they don't show a tab button.
  const ALL_SCREENS = ["index", "people", "grades", "finance", "library", "schools", "more"];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: "#5A6379",
        tabBarStyle: {
          backgroundColor: NAVY_ELEVATED,
          borderTopColor: "#22304A",
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: 20,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      {ALL_SCREENS.map((screenName) => {
        const tabDef = tabs.find((t) => t.name === screenName);
        if (!tabDef) {
          // Not part of this role's nav — register but hide the tab button
          return (
            <Tabs.Screen key={screenName} name={screenName} options={{ href: null }} />
          );
        }
        const Icon = tabDef.icon;
        return (
          <Tabs.Screen
            key={screenName}
            name={screenName}
            options={{
              title: tabDef.label,
              tabBarIcon: ({ color, size }) => (
                <Icon size={size ?? 22} color={color} strokeWidth={2} />
              ),
            }}
          />
        );
      })}
    </Tabs>
  );
}