import React, { useMemo, useRef } from 'react';
import { View, Pressable, Text, Platform, Animated, Dimensions } from 'react-native';
import { Home as LucideHome, Car as LucideCar, Users as LucideUsers, Bookmark as LucideBookmark, User as LucideUser, Gauge as LucideGauge, Calendar as LucideCalendar, CalendarDays as LucideCalendarDays, ClipboardPlus as LucideClipboardPlus, Bell as LucideBell, Map as LucideMap, Package as LucidePackage, Circle as LucideCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CENTER_SIZE = 64; // diameter of floating button


type Item = {
    key: string;
    title: string;
    icon: string;
};

type Props = {
    items: Item[];
    activeKey: string;
    onPress: (key: string) => void;
    primaryColor?: string; // active icon & accents
    inactiveColor?: string; // inactive icon color
    containerBg?: string; // bar background
    activeBg?: string; // active pill background
    wrapperBg?: string; // outer background to carve the notch
    variant?: 'floatingCenter' | 'standard';
};

export const ModernBottomBar: React.FC<Props> = ({
    items,
    activeKey,
    onPress,
    primaryColor = '#00598A',
    inactiveColor = '#9aa8b2',
    containerBg = '#ffffff',
    variant = 'floatingCenter',
}) => {
    const scalesRef = useRef<Record<string, Animated.Value>>({});
    const insets = useSafeAreaInsets();
    const lucideIcons = useMemo(() => ({
        home: LucideHome,
        car: LucideCar,
        users: LucideUsers,
        bookmark: LucideBookmark,
        user: LucideUser,
        rental: LucideCalendar,
        gauge: LucideGauge,
        calendar: LucideCalendar,
        calendarDays: LucideCalendarDays,
        clipboardPlus: LucideClipboardPlus,
        bell: LucideBell,
        map: LucideMap,
        package: LucidePackage,
    } as const), []);
    const scales = useMemo(() => {
        const map: Record<string, Animated.Value> = {};
        items.forEach((it) => {
            map[it.key] = scalesRef.current[it.key] || new Animated.Value(1);
            scalesRef.current[it.key] = map[it.key];
        });
        return map;
    }, [items]);

    const animateTo = (key: string, toValue: number) => {
        const v = scales[key];
        if (!v) return;
        Animated.spring(v, {
            toValue,
            useNativeDriver: true,
            friction: 6,
            tension: 120,
        }).start();
    };

    const centerIndex = Math.floor(items.length / 2);
    const centerItem = items[centerIndex];

    if (variant === 'standard') {
        return (
            <View
                style={{
                    paddingHorizontal: 16,
                    paddingBottom: (Platform.OS === 'ios' ? 18 : 12) + Math.max(insets.bottom, 10),
                    paddingTop: 12,
                    width: '100%',
                    alignSelf: 'stretch',
                    alignItems: 'center',
                    overflow: 'hidden',
                    backgroundColor: containerBg,
                }}
            >
                <View
                    style={{
                        width: '100%',
                        height: 56,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                    }}
                >
                    {items.map((item) => {
                        const active = item.key === activeKey;
                        return (
                            <Pressable
                                key={item.key}
                                android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: true }}
                                onPressIn={() => animateTo(item.key, 0.9)}
                                onPressOut={() => animateTo(item.key, 1)}
                                onPress={() => onPress(item.key)}
                                style={{
                                    minWidth: 56,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingVertical: 6,
                                }}
                            >
                                <Animated.View style={{ transform: [{ scale: scales[item.key] ?? 1 }] }}>
                                    {(() => { const Icon = (lucideIcons as any)[item.icon] ?? LucideCircle; return <Icon size={22} color={active ? primaryColor : inactiveColor} strokeWidth={active ? 2.2 : 2.0} />; })()}
                                </Animated.View>
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        );
    }

    return (
        <View
            style={{
                paddingHorizontal: 16,
                paddingBottom: (Platform.OS === 'ios' ? 18 : 12) + Math.max(insets.bottom, 10),
                paddingTop: 22,
                width: '100%',
                alignSelf: 'stretch',
                alignItems: 'center',
                overflow: 'visible',
            }}
        >
            <View style={{ width: '100%', height: 70 }}>
                <View style={{ position: 'absolute', bottom: -6, left: 0, right: 0, height: 12, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }} />

                <View
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: 70,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-evenly',
                        paddingHorizontal: 10,
                    }}
                >
                    {items.map((item, idx) => {
                        const active = item.key === activeKey;
                        const isCenter = idx === centerIndex;
                        if (isCenter) {
                            return <View key={item.key} style={{ width: CENTER_SIZE + 6 }} />;
                        }
                        return (
                            <Pressable
                                key={item.key}
                                android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: true }}
                                onPressIn={() => animateTo(item.key, 0.9)}
                                onPressOut={() => animateTo(item.key, 1)}
                                onPress={() => onPress(item.key)}
                                style={{
                                    width: CENTER_SIZE + 6,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingVertical: 6,
                                }}
                            >
                                <Animated.View
                                    style={{ transform: [{ scale: scales[item.key] ?? 1 }], borderRadius: 999 }}
                                >
                                    {active ? (
                                        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, position: 'relative' }}>
                                            {(() => { const Icon = (lucideIcons as any)[item.icon] ?? LucideCircle; return <Icon size={20} color={primaryColor} strokeWidth={2.2} />; })()}
                                        </View>
                                    ) : (
                                        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999 }}>
                                            {(() => { const Icon = (lucideIcons as any)[item.icon] ?? LucideCircle; return <Icon size={20} color={inactiveColor} strokeWidth={2.0} />; })()}
                                        </View>
                                    )}
                                </Animated.View>
                            </Pressable>
                        );
                    })}
                </View>
            </View>
            {/* Floating Center Button */}
            {centerItem && (
                <View
                    pointerEvents="box-none"
                    style={{ position: 'absolute', left: 0, right: 0, top: 0, alignItems: 'center' }}
                >
                    <Animated.View style={{ transform: [{ scale: scales[centerItem.key] ?? 1 }] }}>
                        <Pressable
                            android_ripple={{ color: 'rgba(255,255,255,0.12)', borderless: true }}
                            onPressIn={() => animateTo(centerItem.key, 0.9)}
                            onPressOut={() => animateTo(centerItem.key, 1)}
                            onPress={() => onPress(centerItem.key)}
                            style={{
                                width: CENTER_SIZE,
                                height: CENTER_SIZE,
                                borderRadius: 999,
                                backgroundColor: primaryColor,
                                alignItems: 'center',
                                justifyContent: 'center',
                                shadowOpacity: 0.16,
                                shadowRadius: 16,
                                shadowOffset: { width: 0, height: 8 },
                                elevation: 10,
                            }}
                        >
                            {(() => { const Icon = (lucideIcons as any)[centerItem.icon] ?? LucideCircle; return <Icon size={28} color={'#ffffff'} strokeWidth={2.4} />; })()}
                        </Pressable>
                    </Animated.View>
                </View>
            )}
        </View>
    );
};

export default ModernBottomBar;


