import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useCustomerInterface } from '../../hooks/useCustomerInterface';
import { MenuHeader } from '../../components/customer/MenuHeader';
import { MenuSection } from '../../components/customer/MenuSection';
import { LoadingScreen } from '@/components/customer/LoadingScreen';
import { ProfileNavButton } from '@/components/common/ProfileNavButton';
import { CustomerTestimonialsSection } from '@/components/customer/CustomerTestimonialsSection';
import { WeeklyWinnerSection } from '@/components/customer/WeeklyWinnerSection';
import { Footer } from '@/components/common/Footer';

export const CustomerInterface = () => {
  const {
    menuItems,
    categories,
    combos,
    selectedCategory,
    loading,
    setSelectedCategory,
    addToCart,
    addComboToCart
  } = useCustomerInterface();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <ProfileNavButton />
      <ScrollView contentContainerStyle={styles.content}>
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
    backgroundColor: '#FFD700', // substituindo gradiente por cor sólida (RN precisa de LinearGradient)
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    flexGrow: 1,
  },
  menuSection: {
    marginTop: 24,
  },
});
