import React, { useState } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  offset?: number;
}

const Tooltip: React.FC<TooltipProps> = ({ children, content, offset = 8 }) => {
  const [visible, setVisible] = useState(false);

  return (
    <Pressable
      onPressIn={() => setVisible(true)}
      onPressOut={() => setVisible(false)}
      style={{ position: "relative" }}
    >
      {children}
      {visible && (
        <View style={[styles.tooltip, { marginTop: offset }]}>
          <Text style={styles.tooltipText}>{content}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tooltip: {
    position: "absolute",
    backgroundColor: "#333",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    zIndex: 1000,
    minWidth: 80,
    alignItems: "center",
  },
  tooltipText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
  },
});

export default Tooltip;
