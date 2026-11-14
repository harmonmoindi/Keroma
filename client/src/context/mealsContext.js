import { createContext, useContext } from "react";

export const MealsContext = createContext(null);

export function useMeals() {
  return useContext(MealsContext);
}