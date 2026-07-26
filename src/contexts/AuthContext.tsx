"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchCentralPortalData } from "@/services/centralService";

interface AuthContextType {
  user: any;
  dadosPortal: any;
  loading: boolean;
  refetchData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  dadosPortal: null,
  loading: true,
  refetchData: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [dadosPortal, setDadosPortal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const carregarDadosGlobais = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const central = await fetchCentralPortalData();
        setDadosPortal(central);
      } else {
        setUser(null);
        setDadosPortal(null);
      }
    } catch (err) {
      console.error("Erro no AuthProvider ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosGlobais();

    // Inscrição para escutar login/logout em tempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        carregarDadosGlobais();
      } else {
        setUser(null);
        setDadosPortal(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, dadosPortal, loading, refetchData: carregarDadosGlobais }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
