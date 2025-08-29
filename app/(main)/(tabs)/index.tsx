import React, { useMemo } from 'react';
import { Redirect } from 'expo-router';
import { useAppSelector } from '@/lib/redux/hooks';
import TabsViewModel from '@/viewmodels/TabsViewModel';

export default function TabsIndexRedirect() {
    const role = useAppSelector((s) => s.auth.user?.role ?? null);
    const vm = useMemo(() => new TabsViewModel(), []);
    const href = vm.getIndexRedirectHref(role);
    return <Redirect href={href as any} />;
}
