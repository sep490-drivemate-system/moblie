import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MapPin,
  Clock,
  Route,
  Target,
  FileText,
  Send,
  Plus,
  Trash2,
  Navigation,
} from 'lucide-react-native';

interface RoutePoint {
  id: string;
  address: string;
  description: string;
  estimatedTime: string;
  skills: string[];
}

export default function CreateRouteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookingId = params.bookingId as string;

  const [routeTitle, setRouteTitle] = useState('');
  const [routeDescription, setRouteDescription] = useState('');
  const [totalDuration, setTotalDuration] = useState('');
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([
    {
      id: '1',
      address: '',
      description: '',
      estimatedTime: '',
      skills: [],
    }
  ]);

  const skillOptions = [
    'Điều khiển cơ bản',
    'Đỗ xe',
    'Chuyển làn',
    'Vượt xe',
    'Qua ngã tư',
    'Đi vòng xuyến',
    'Lùi xe',
    'Lên/xuống dốc',
    'Lái xe ban đêm',
    'Lái xe trong mưa',
  ];

  const addRoutePoint = () => {
    const newPoint: RoutePoint = {
      id: Date.now().toString(),
      address: '',
      description: '',
      estimatedTime: '',
      skills: [],
    };
    setRoutePoints([...routePoints, newPoint]);
  };

  const removeRoutePoint = (id: string) => {
    if (routePoints.length > 1) {
      setRoutePoints(routePoints.filter(point => point.id !== id));
    }
  };

  const updateRoutePoint = (id: string, field: keyof RoutePoint, value: any) => {
    setRoutePoints(routePoints.map(point => 
      point.id === id ? { ...point, [field]: value } : point
    ));
  };

  const toggleSkill = (pointId: string, skill: string) => {
    setRoutePoints(routePoints.map(point => {
      if (point.id === pointId) {
        const skills = point.skills.includes(skill)
          ? point.skills.filter(s => s !== skill)
          : [...point.skills, skill];
        return { ...point, skills };
      }
      return point;
    }));
  };

  const validateRoute = () => {
    if (!routeTitle.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề lộ trình');
      return false;
    }
    if (!totalDuration.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập thời gian tổng');
      return false;
    }
    for (let point of routePoints) {
      if (!point.address.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ cho tất cả điểm dừng');
        return false;
      }
      if (!point.estimatedTime.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập thời gian dự kiến cho tất cả điểm dừng');
        return false;
      }
    }
    return true;
  };

  const handleSendRoute = () => {
    if (!validateRoute()) return;

    Alert.alert(
      'Gửi lộ trình',
      'Bạn có chắc chắn muốn gửi lộ trình này cho học viên?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gửi',
          onPress: () => {
            // Simulate sending route
            Alert.alert(
              'Đã gửi lộ trình!',
              'Lộ trình đã được gửi đến học viên. Họ sẽ nhận được thông báo để xem xét.',
              [
                {
                  text: 'OK',
                  onPress: () => router.back()
                }
              ]
            );
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo lộ trình</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Route Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Route size={24} color="#3b82f6" strokeWidth={2} />
            <Text style={styles.cardTitle}>Thông tin lộ trình</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tiêu đề lộ trình *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="VD: Lộ trình học lái cơ bản"
              value={routeTitle}
              onChangeText={setRouteTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mô tả tổng quan</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Mô tả ngắn gọn về lộ trình này..."
              value={routeDescription}
              onChangeText={setRouteDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Thời gian tổng dự kiến *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="VD: 3 giờ 30 phút"
              value={totalDuration}
              onChangeText={setTotalDuration}
            />
          </View>
        </View>

        {/* Route Points */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Navigation size={24} color="#10b981" strokeWidth={2} />
            <Text style={styles.cardTitle}>Điểm dừng trong lộ trình</Text>
            <TouchableOpacity style={styles.addButton} onPress={addRoutePoint}>
              <Plus size={20} color="#10b981" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {routePoints.map((point, index) => (
            <View key={point.id} style={styles.routePoint}>
              <View style={styles.pointHeader}>
                <Text style={styles.pointNumber}>Điểm {index + 1}</Text>
                {routePoints.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeRoutePoint(point.id)}
                  >
                    <Trash2 size={16} color="#ef4444" strokeWidth={2} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Địa chỉ *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập địa chỉ điểm dừng"
                  value={point.address}
                  onChangeText={(text) => updateRoutePoint(point.id, 'address', text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mô tả hoạt động</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="VD: Luyện tập đỗ xe song song"
                  value={point.description}
                  onChangeText={(text) => updateRoutePoint(point.id, 'description', text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Thời gian dự kiến *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="VD: 30 phút"
                  value={point.estimatedTime}
                  onChangeText={(text) => updateRoutePoint(point.id, 'estimatedTime', text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kỹ năng luyện tập</Text>
                <View style={styles.skillsContainer}>
                  {skillOptions.map((skill) => (
                    <TouchableOpacity
                      key={skill}
                      style={[
                        styles.skillTag,
                        point.skills.includes(skill) && styles.skillTagSelected
                      ]}
                      onPress={() => toggleSkill(point.id, skill)}
                    >
                      <Text style={[
                        styles.skillTagText,
                        point.skills.includes(skill) && styles.skillTagTextSelected
                      ]}>
                        {skill}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Send Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.sendButton} onPress={handleSendRoute}>
          <LinearGradient
            colors={['#3b82f6', '#1d4ed8']}
            style={styles.sendButtonGradient}
          >
            <Send size={20} color="#ffffff" strokeWidth={2} />
            <Text style={styles.sendButtonText}>Gửi lộ trình cho học viên</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#1e293b',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  addButton: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  routePoint: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pointNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  removeButton: {
    padding: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  skillTagSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  skillTagText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  skillTagTextSelected: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  sendButton: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
