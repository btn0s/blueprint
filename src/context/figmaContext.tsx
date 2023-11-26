"use client";
import React, {
  createContext,
  FC,
  useState,
  useEffect,
  useContext,
  PropsWithChildren,
} from "react";

import { SESSIONSTORAGE_FIGMA_TOKEN_KEY } from "@/constants";

interface FigmaContext {
  token: string | null;
  setToken: (token: string | null) => void;
}

const figmaContext = createContext<FigmaContext>({
  token: null,
  setToken: () => {},
});

const FigmaProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = sessionStorage.getItem(SESSIONSTORAGE_FIGMA_TOKEN_KEY);
    setTokenState(storedToken);
  }, []);

  const setToken = (newToken: string | null) => {
    sessionStorage.setItem(SESSIONSTORAGE_FIGMA_TOKEN_KEY, newToken ?? "");
    setTokenState(newToken);
  };

  return (
    <figmaContext.Provider value={{ token, setToken }}>
      {children}
    </figmaContext.Provider>
  );
};

const useFigmaContext = () => {
  const context = useContext(figmaContext);

  if (context === undefined) {
    throw new Error("useFigmaContext must be used within a FigmaProvider");
  }

  return context;
};

export { FigmaProvider, useFigmaContext };
