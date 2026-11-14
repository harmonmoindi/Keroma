import { useEffect, useState } from "react";
import { fetchMeals } from "../data/api";
import { shuffle } from "../utils/shuffle";
import { MealsContext } from "./mealsContext";

export default function MealsProvider({ children }) {
  const [allMeals, setAllMeals] = useState([]);
  const [meals, setMeals] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"

  useEffect(() => {
    let cancelled = false;

    fetchMeals()
      .then((data) => {
        if (cancelled) return;
        setAllMeals(data);
        setMeals(shuffle(data));
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // we'll call this right after login
  const reshuffle = () => setMeals(shuffle(allMeals));

  return (
    <MealsContext.Provider value={{ meals, status, reshuffle }}>
      {children}
    </MealsContext.Provider>
  );
}