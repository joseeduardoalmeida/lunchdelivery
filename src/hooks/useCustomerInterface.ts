import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dataService } from '../services/dataService';
import { MenuItem, CartItem, Category, WeeklyCombo } from '../types';
import { v4 as uuidv4 } from 'uuid'; // Instalar: npm install uuid

export const useCustomerInterface = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [combos, setCombos] = useState<WeeklyCombo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [items, cats, combosData] = await Promise.all([
        dataService.getMenuItems(),
        dataService.getCategories(),
        dataService.getWeeklyCombos()
      ]);

      const savedCart = await getCart();

      setMenuItems(items);
      setCategories(cats);
      setCombos(combosData);
      setCart(savedCart || []);

      if (cats.length > 0) {
        setSelectedCategory(cats[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCart = async (cartData: CartItem[]) => {
    try {
      await AsyncStorage.setItem('@cart', JSON.stringify(cartData));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const getCart = async (): Promise<CartItem[] | null> => {
    try {
      const value = await AsyncStorage.getItem('@cart');
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error loading cart:', error);
      return null;
    }
  };

  const addToCart = (menuItem: MenuItem, combinations?: { first: MenuItem; second: MenuItem }) => {
    setCart(prevCart => {
      if (combinations) {
        const combinedMenuItem: MenuItem = {
          ...menuItem,
          id: uuidv4(),
          name: `1/2 ${combinations.first.name} + 1/2 ${combinations.second.name}`,
          price: (combinations.first.price + combinations.second.price) / 2,
          combinationData: combinations
        };

        return [...prevCart, {
          id: uuidv4(),
          menuItem: combinedMenuItem,
          quantity: 1
        }];
      }

      const existingItem = prevCart.find(item => item.menuItem.id === menuItem.id);

      if (existingItem) {
        return prevCart.map(item =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, {
          id: uuidv4(),
          menuItem,
          quantity: 1
        }];
      }
    });
  };

  const addComboToCart = (combo: WeeklyCombo) => {
    const comboMenuItem: MenuItem = {
      id: combo.id,
      name: combo.name,
      description: combo.description,
      price: combo.promotionalPrice || combo.price,
      image: combo.image || '',
      category: 'combo',
      available: true,
      preparation_time: 20
    };

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.menuItem.id === combo.id);

      if (existingItem) {
        return prevCart.map(item =>
          item.menuItem.id === combo.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, {
          id: uuidv4(),
          menuItem: comboMenuItem,
          quantity: 1
        }];
      }
    });
  };

  const updateCartItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    AsyncStorage.removeItem('@cart');
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    menuItems,
    categories,
    combos,
    selectedCategory,
    cart,
    showOrderConfirmation,
    loading,
    setSelectedCategory,
    setShowOrderConfirmation,
    addToCart,
    addComboToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getCartItemsCount
  };
};
