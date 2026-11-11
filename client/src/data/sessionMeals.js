import { meals } from "./meals";
import { shuffle } from "../utils/shuffle";

let current = shuffle(meals);

export const getMeals = () => current;
export const reshuffle = () => {
  current = shuffle(meals);
};