import React, { useMemo } from "react";
import { Tabs } from "expo-router";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useAppSelector } from "@/lib/redux/hooks";
import TabsViewModel from "@/viewmodels/shared/TabsViewModel";
import ModernBottomBar from "@/components/ui/bottom-bar";

export default function TabLayout() {
  const role = useAppSelector((s) => s.auth.user?.role ?? null);

  const vm = useMemo(() => new TabsViewModel(), []);

  const tabs = vm.getTabsForRole(role);

  return (
    <Tabs
      key={`tabs-${role ?? "none"}`}
      initialRouteName={vm.getInitialRouteName(role)}
      screenOptions={{ headerShown: false }}
      tabBar={(props: BottomTabBarProps) => (
        <ModernBottomBar
          items={tabs.map((t) => ({
            key: t.key,
            title: t.title,
            icon: t.icon,
          }))}
          activeKey={tabs[props.state.index]?.key}
          onPress={(key) => {
            const target = tabs.find((x) => x.key === key);
            if (target) {
              props.navigation.navigate(target.routeName as never);
            }
          }}
          primaryColor="#70E000"
          inactiveColor="#c1c7cd"
          containerBg="#ffffff"
          activeBg="rgba(46,125,50,0.12)"
          wrapperBg="#f3f4f6"
          variant="standard"
        />
      )}
    >
      {tabs.map((t) => (
        <Tabs.Screen
          key={t.key}
          name={t.routeName}
          options={{ title: t.title }}
        />
      ))}
    </Tabs>
  );
}
