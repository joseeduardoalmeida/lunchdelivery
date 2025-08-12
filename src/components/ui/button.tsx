// // Button.tsx
// import React from "react";
// import { Pressable, Text, PressableProps } from "react-native";
// import { cva, type VariantProps } from "class-variance-authority";
// import { cn } from "@/lib/utils"; // ajuste se necessário

// // Definindo as variantes usando CVA adaptado para NativeWind
// const buttonVariants = cva(
//   "flex-row items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
//   {
//     variants: {
//       variant: {
//         default: "bg-blue-500 text-white",
//         destructive: "bg-red-500 text-white",
//         outline: "border border-gray-300 bg-transparent",
//         secondary: "bg-gray-200 text-black",
//         ghost: "bg-transparent",
//         link: "bg-transparent underline text-blue-500",
//       },
//       size: {
//         default: "h-10 px-4",
//         sm: "h-9 px-3",
//         lg: "h-11 px-8",
//         icon: "h-10 w-10",
//       },
//     },
//     defaultVariants: {
//       variant: "default",
//       size: "default",
//     },
//   }
// );

// export interface ButtonProps
//   extends PressableProps,
//     VariantProps<typeof buttonVariants> {
//   children: React.ReactNode;
// }

// export const Button = ({
//   variant,
//   size,
//   children,
//   className,
//   ...props
// }: ButtonProps) => {
//   return (
//     <Pressable
//       className={cn(buttonVariants({ variant, size, className }))}
//       {...props}
//     >
//       {typeof children === "string" ? (
//         <Text className="text-white">{children}</Text>
//       ) : (
//         children
//       )}
//     </Pressable>
//   );
// };
