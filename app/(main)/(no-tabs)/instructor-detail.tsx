import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { instructorsData, Instructor } from '@/data/instructors_data';

const { width } = Dimensions.get('window');

export default function InstructorDetailScreen() {
  const router = useRouter();
  const { instructorId } = useLocalSearchParams();
  const [instructor, setInstructor] = useState<Instructor | null>(null);

  useEffect(() => {
    // Tìm instructor theo ID
    const foundInstructor = instructorsData.find(i => i.id === instructorId);
    if (foundInstructor) {
      setInstructor(foundInstructor);
    }
  }, [instructorId]);

  if (!instructor) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  const handleBooking = () => {
    Alert.alert(
      'Đặt lịch',
      `Bạn muốn đặt lịch với ${instructor.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đặt lịch', 
          onPress: () => {
            // Navigate to booking screen
            router.push({
              pathname: '/(main)/(no-tabs)/detail',
              params: { instructorId: instructor.id }
            });
          }
        }
      ]
    );
  };

  const handleContact = () => {
    Alert.alert('Liên hệ', `Số điện thoại: ${instructor.phone}`);
  };

  return (
    <View style={styles.container}>
      {/* Header with gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Image 
            source={{ uri: instructor.avatar }} 
            style={styles.avatar}
          />
          <Text style={styles.name}>{instructor.name}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {instructor.rating}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎓</Text>
            <Text style={styles.statNumber}>{instructor.experienceYears}</Text>
            <Text style={styles.statLabel}>Năm KN</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statNumber}>{instructor.totalBookings}</Text>
            <Text style={styles.statLabel}>Lượt đặt</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statNumber}>{instructor.pricing}</Text>
            <Text style={styles.statLabel}>Giá/buổi</Text>
          </View>
        </View>

        {/* Specialties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chuyên môn</Text>
          <View style={styles.specialtiesContainer}>
            {instructor.specialties.map((specialty, index) => (
              <View key={index} style={styles.specialtyChip}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giới thiệu</Text>
          <Text style={styles.description}>
            Giảng viên {instructor.name} có {instructor.experienceYears} năm kinh nghiệm trong lĩnh vực đào tạo lái xe. 
            Với phong cách giảng dạy chuyên nghiệp và tận tâm, đã giúp hơn {instructor.totalBookings} học viên 
            tự tin lái xe an toàn.
          </Text>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={styles.contactText}>{instructor.phone}</Text>
          </View>
          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📧</Text>
            <Text style={styles.contactText}>{instructor.email}</Text>
          </View>
          {instructor.distance && (
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📍</Text>
              <Text style={styles.contactText}>Cách bạn {instructor.distance.toFixed(1)} km</Text>
            </View>
          )}
        </View>

        {/* Availability Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trạng thái</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: instructor.availability === 'available' ? '#10b981' : '#ef4444' }
          ]}>
            <Text style={styles.statusText}>
              {instructor.availability === 'available' ? '✓ Có sẵn' : '✕ Đang bận'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={handleContact}
        >
          <Text style={styles.contactButtonText}>📞 Liên hệ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={handleBooking}
        >
          <Text style={styles.bookButtonText}>Đặt lịch ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#ffffff',
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  ratingBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ratingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -30,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyChip: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  specialtyText: {
    color: '#6b21a8',
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  statusBadge: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '700',
  },
  bookButton: {
    flex: 2,
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
