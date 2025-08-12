import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface LocationResult {
    place_id: string;
    display_name: string;
    lat: string;
    lon: string;
    type: string;
    address: {
        road?: string;
        house_number?: string;
        city?: string;
        state?: string;
        country?: string;
        postcode?: string;
    };
}

interface AddressSearchModalProps {
    visible: boolean;
    onClose: () => void;
    onLocationSelect: (lat: number, lng: number, displayName: string) => void;
    currentLocation: { latitude: number; longitude: number };
}

export const AddressSearchModal: React.FC<AddressSearchModalProps> = ({
    visible,
    onClose,
    onLocationSelect,
    currentLocation,
}) => {
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    // Search for locations when text changes
    useEffect(() => {
        if (searchText.trim().length < 3) {
            setSearchResults([]);
            return;
        }

        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set new timeout for debounced search
        const timeout = setTimeout(() => {
            searchLocations(searchText);
        }, 500);

        setSearchTimeout(timeout);

        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [searchText]);

    // Search locations using Nominatim API
    const searchLocations = async (query: string) => {
        if (query.trim().length < 3) return;

        setIsLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1&viewbox=${currentLocation.longitude - 0.1},${currentLocation.latitude - 0.1},${currentLocation.longitude + 0.1},${currentLocation.latitude + 0.1}&bounded=1`
            );
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Error searching locations:', error);
            Alert.alert('Error', 'Failed to search locations. Please check your internet connection.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle location selection
    const handleLocationSelect = (location: LocationResult) => {
        const lat = parseFloat(location.lat);
        const lng = parseFloat(location.lon);
        const displayName = location.display_name.split(',').slice(0, 3).join(',');
        
        onLocationSelect(lat, lng, displayName);
        onClose();
        setSearchText('');
        setSearchResults([]);
    };

    // Format display name for better readability
    const formatDisplayName = (location: LocationResult) => {
        const parts = location.display_name.split(',');
        if (parts.length <= 3) return location.display_name;
        
        // Show first 3 parts for better readability
        return parts.slice(0, 3).join(',') + '...';
    };

    // Render location item
    const renderLocationItem = ({ item }: { item: LocationResult }) => (
        <TouchableOpacity
            style={styles.locationItem}
            onPress={() => handleLocationSelect(item)}
        >
            <View style={styles.locationContent}>
                <Text style={styles.locationName} numberOfLines={2}>
                    {formatDisplayName(item)}
                </Text>
                <Text style={styles.locationType}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </Text>
            </View>
            <View style={styles.locationArrow}>
                <Text style={styles.arrowText}>→</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Search Destination</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Input */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Enter destination address..."
                        placeholderTextColor="#999"
                        value={searchText}
                        onChangeText={setSearchText}
                        autoFocus={true}
                        returnKeyType="search"
                        onSubmitEditing={() => searchLocations(searchText)}
                    />
                    {isLoading && (
                        <ActivityIndicator style={styles.loadingIndicator} color="#007AFF" />
                    )}
                </View>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <View style={styles.resultsContainer}>
                        <Text style={styles.resultsTitle}>
                            Found {searchResults.length} location(s)
                        </Text>
                        <FlatList
                            data={searchResults}
                            renderItem={renderLocationItem}
                            keyExtractor={(item) => item.place_id}
                            style={styles.resultsList}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                )}

                {/* No Results */}
                {searchText.length >= 3 && !isLoading && searchResults.length === 0 && (
                    <View style={styles.noResultsContainer}>
                        <Text style={styles.noResultsText}>
                            No locations found for "{searchText}"
                        </Text>
                        <Text style={styles.noResultsSubtext}>
                            Try a different search term or check your spelling
                        </Text>
                    </View>
                )}

                {/* Current Location Info */}
                <Card className="p-4 m-4 bg-card">
                    <Text style={styles.currentLocationTitle}>📍 Current Location</Text>
                    <Text style={styles.currentLocationText}>
                        Lat: {currentLocation.latitude.toFixed(6)}
                    </Text>
                    <Text style={styles.currentLocationText}>
                        Lng: {currentLocation.longitude.toFixed(6)}
                    </Text>
                </Card>

                {/* Instructions */}
                <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsTitle}>💡 Tips:</Text>
                    <Text style={styles.instructionsText}>
                        • Enter at least 3 characters to search
                    </Text>
                    <Text style={styles.instructionsText}>
                        • Include city name for better results
                    </Text>
                    <Text style={styles.instructionsText}>
                        • You can also enter coordinates (lat,lng)
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        color: '#666',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    searchInput: {
        flex: 1,
        height: 44,
        paddingHorizontal: 12,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        fontSize: 16,
        color: '#333',
    },
    loadingIndicator: {
        marginLeft: 12,
    },
    resultsContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    resultsTitle: {
        padding: 16,
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        backgroundColor: '#f8f8f8',
    },
    resultsList: {
        flex: 1,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    locationContent: {
        flex: 1,
    },
    locationName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    locationType: {
        fontSize: 12,
        color: '#666',
        textTransform: 'capitalize',
    },
    locationArrow: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    noResultsText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
    },
    noResultsSubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    currentLocationTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    currentLocationText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    instructionsContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    instructionsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    instructionsText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
});
