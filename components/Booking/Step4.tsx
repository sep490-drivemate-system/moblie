import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CheckCircle, Home, Users, Route, Car, Mountain, Navigation, Construction, Clock, Moon, Settings, Target, Repeat, Award } from "lucide-react-native";
import { RoadType, Skill } from "@/models/booking/booking";

interface Step4Props {
  selectedRoadTypes: RoadType[];
  selectedSkills: Skill[];
  onRoadTypeToggle: (road: RoadType) => void;
  onSkillToggle: (skill: Skill) => void;
}

const roadTypes: RoadType[] = [
  { id: "residential", label: "Đường khu dân cư vắng", icon: "Home" },
  { id: "urban", label: "Đường đô thị (trong thành phố)", icon: "Users" },
  {
    id: "national",
    label: "Quốc lộ (lưu lượng xe trung bình – cao)",
    icon: "Route",
  },
  {
    id: "highway",
    label: "Đường cao tốc (tốc độ cao, giữ làn, vượt xe)",
    icon: "Car",
  },
  {
    id: "mountain",
    label: "Đường đèo / đường núi (nhiều dốc, cua gấp)",
    icon: "Mountain",
  },
  {
    id: "long_distance",
    label: "Đường dài / đường trường (liên tỉnh, đi xa)",
    icon: "Navigation",
  },
  {
    id: "crowded",
    label: "Đường qua khu đông dân cư / chợ / trường học",
    icon: "Users",
  },
  {
    id: "construction",
    label: "Đường đang thi công / mặt đường xấu",
    icon: "Construction",
  },
  {
    id: "slippery",
    label: "Đường trơn trượt (mưa, sình lầy)",
    icon: "Clock",
  },
  { id: "night", label: "Đường ban đêm", icon: "Moon" },
];

const skills: Skill[] = [
  {
    id: "basic_control",
    label: "Điều khiển cơ bản (ga, phanh, vô lăng)",
    icon: "Settings",
  },
  { id: "parking", label: "Đỗ xe (song song, dọc, ngang)", icon: "Car" },
  {
    id: "lane_change",
    label: "Chuyển làn đường an toàn",
    icon: "Navigation",
  },
  { id: "overtaking", label: "Vượt xe đúng cách", icon: "Target" },
  { id: "intersection", label: "Qua ngã tư, đèn đỏ", icon: "Route" },
  { id: "roundabout", label: "Đi vòng xuyến", icon: "Repeat" },
  { id: "reverse", label: "Lùi xe an toàn", icon: "Navigation" },
  { id: "uphill_downhill", label: "Lên dốc, xuống dốc", icon: "Mountain" },
  { id: "night_driving", label: "Lái xe ban đêm", icon: "Moon" },
  { id: "rain_driving", label: "Lái xe trong mưa", icon: "Clock" },
  { id: "highway_driving", label: "Lái xe cao tốc", icon: "Car" },
  { id: "defensive_driving", label: "Lái xe phòng thủ", icon: "Award" },
];

const iconComponents = {
  Home,
  Users,
  Route,
  Car,
  Mountain,
  Navigation,
  Construction,
  Clock,
  Moon,
  Settings,
  Target,
  Repeat,
  Award,
};

export default function Step4({
  selectedRoadTypes,
  selectedSkills,
  onRoadTypeToggle,
  onSkillToggle,
}: Step4Props) {
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          🛣️ Chọn loại đường muốn di chuyển
        </Text>
        <Text style={styles.sectionDesc}>
          Chọn một hoặc nhiều loại đường để luyện tập
        </Text>

        {roadTypes.map((road) => {
          const IconComponent = iconComponents[road.icon as keyof typeof iconComponents];

          return (
            <TouchableOpacity
              key={road.id}
              style={[
                styles.optionCard,
                selectedRoadTypes.find((r) => r.id === road.id) &&
                  styles.optionCardActive,
              ]}
              onPress={() => onRoadTypeToggle(road)}
            >
              <View style={styles.optionIconContainer}>
                {IconComponent && (
                  <IconComponent
                    size={24}
                    color={
                      selectedRoadTypes.find((r) => r.id === road.id)
                        ? "#667eea"
                        : "#64748b"
                    }
                    strokeWidth={2}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.optionText,
                  selectedRoadTypes.find((r) => r.id === road.id) &&
                    styles.optionTextActive,
                ]}
              >
                {road.label}
              </Text>
              {selectedRoadTypes.find((r) => r.id === road.id) && (
                <CheckCircle size={20} color="#667eea" strokeWidth={2} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          🎯 Chọn kỹ năng muốn được huấn luyện
        </Text>
        <Text style={styles.sectionDesc}>
          Chọn các kỹ năng bạn muốn cải thiện
        </Text>

        {skills.map((skill) => {
          const IconComponent = iconComponents[skill.icon as keyof typeof iconComponents];

          return (
            <TouchableOpacity
              key={skill.id}
              style={[
                styles.optionCard,
                selectedSkills.find((s) => s.id === skill.id) &&
                  styles.optionCardActive,
              ]}
              onPress={() => onSkillToggle(skill)}
            >
              <View style={styles.optionIconContainer}>
                {IconComponent && (
                  <IconComponent
                    size={24}
                    color={
                      selectedSkills.find((s) => s.id === skill.id)
                        ? "#667eea"
                        : "#64748b"
                    }
                    strokeWidth={2}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.optionText,
                  selectedSkills.find((s) => s.id === skill.id) &&
                    styles.optionTextActive,
                ]}
              >
                {skill.label}
              </Text>
              {selectedSkills.find((s) => s.id === skill.id) && (
                <CheckCircle size={20} color="#667eea" strokeWidth={2} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
    lineHeight: 20,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    position: "relative",
    marginBottom: 12,
  },
  optionCardActive: {
    borderColor: "#667eea",
    backgroundColor: "#f0f4ff",
  },
  optionIconContainer: {
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    lineHeight: 20,
  },
  optionTextActive: {
    color: "#667eea",
    fontWeight: "700",
  },
});
