import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from "react-native";

type Variant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type Size = "default" | "sm" | "lg" | "icon";

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "default",
  onPress,
  disabled,
  children,
  style,
  textStyle,
}) => {
  const buttonStyles = [
    styles.base,
    variantStyles[variant],
    sizeStyles[size],
    disabled ? styles.disabled : null,
    style,
  ];

  const textStyles = [
    styles.textBase,
    textVariantStyles[variant],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {typeof children === "string" ? (
        <Text style={textStyles}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  textBase: {
    fontSize: 14,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});

const variantStyles: Record<Variant, ViewStyle> = {
  default: { backgroundColor: "#2563eb" }, // azul
  destructive: { backgroundColor: "#dc2626" }, // vermelho
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  secondary: { backgroundColor: "#e5e7eb" },
  ghost: { backgroundColor: "transparent" },
  link: { backgroundColor: "transparent" },
};

const textVariantStyles: Record<Variant, TextStyle> = {
  default: { color: "#fff" },
  destructive: { color: "#fff" },
  outline: { color: "#111827" },
  secondary: { color: "#111827" },
  ghost: { color: "#111827" },
  link: { color: "#2563eb", textDecorationLine: "underline" },
};

const sizeStyles: Record<Size, ViewStyle> = {
  default: { paddingHorizontal: 16, paddingVertical: 10, height: 40 },
  sm: { paddingHorizontal: 12, paddingVertical: 8, height: 36, borderRadius: 6 },
  lg: { paddingHorizontal: 20, paddingVertical: 12, height: 44, borderRadius: 10 },
  icon: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
};
