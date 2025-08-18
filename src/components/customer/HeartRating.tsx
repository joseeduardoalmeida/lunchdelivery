import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface HeartRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  style?: any;
}

export const HeartRating: React.FC<HeartRatingProps> = ({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
  style,
}) => {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  const handlePress = (newRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => handlePress(star)}
          disabled={readonly}
          activeOpacity={0.7}
        >
          <Icon
            name="heart"
            size={sizeMap[size]}
            color={star <= rating ? "#ef4444" : "#d1d5db"} // vermelho cheio ou cinza
            style={!readonly ? styles.clickable : undefined}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 4,
  },
  clickable: {
    marginHorizontal: 2,
  },
});
