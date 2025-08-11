import { create } from "zustand";

const useThemeStore = create((set) => ({
    theme: 'light',
    toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light',
    })),
    setTheme: (newTheme) => set({ theme: newTheme}),
}));

export default useThemeStore;