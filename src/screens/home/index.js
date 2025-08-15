import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useCustomerInterface } from "@/hooks/useCustomerInterface";
import { MenuHeader } from "@/components/customer/MenuHeader";
import { MenuSection } from "@/components/customer/MenuSection";
import { LoadingScreen } from "@/components/customer/LoadingScreen";
import { ProfileNavButton } from "@/components/common/ProfileNavButton";
import { CustomerTestimonialsSection } from "@/components/customer/CustomerTestimonialsSection";
import { WeeklyWinnerSection } from "@/components/customer/WeeklyWinnerSection";
import { Footer } from "@/components/common/Footer";

export const CustomerInterface = () => {
  const {
    menuItems,
    categories,
    combos,
    selectedCategory,
    loading,
    setSelectedCategory,
    addToCart,
    addComboToCart,
  } = useCustomerInterface();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <ProfileNavButton />

      {/* Conteúdo rolável */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        <MenuHeader />

        <View style={styles.menuSection}>
          <MenuSection
            combos={combos}
            menuItems={menuItems}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            isShowcase={true}
          />
        </View>

        <WeeklyWinnerSection />
        <CustomerTestimonialsSection />
        <Footer />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Gradiente: usaremos expo-linear-gradient ou react-native-linear-gradient
    backgroundColor: "#FFA500", // fallback
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  menuSection: {
    marginTop: 32,
  },
});
