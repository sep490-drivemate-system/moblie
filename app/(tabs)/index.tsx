import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { HomeViewModel } from '@/viewmodels/home/HomeViewModel';
import { useViewModel } from '@/viewmodels/shared/BaseViewModel';
import { RootState } from '@/lib/redux/store';

export default function TabOneScreen() {
  const homeSelector = (state: RootState) => state.home;
  const [homeState, homeViewModel] = useViewModel(HomeViewModel, homeSelector);

  useEffect(() => {
    // Load user info khi component mount
    homeViewModel.loadUserInfo();
  }, []);

  const handleRefresh = () => {
    homeViewModel.refreshData();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={homeState.isLoading}
          onRefresh={handleRefresh}
        />
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>{homeState.welcomeMessage}</Text>

        {homeState.userInfo && (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Hello, {homeState.userInfo.name}!</Text>
            <Text style={styles.userEmail}>{homeState.userInfo.email}</Text>
          </View>
        )}

        <View style={styles.separator} />

        <Text style={styles.subtitle}>Welcome to your dashboard</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => homeViewModel.updateWelcomeMessage('Welcome back!')}
        >
          <Text style={styles.buttonText}>Update Welcome Message</Text>
        </TouchableOpacity>

        {homeState.errorMessage && (
          <Text style={styles.errorText}>{homeState.errorMessage}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  userInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 10,
  },
});

