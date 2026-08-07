import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useAlunoMetrics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        let targetUid: string | undefined;

        const { data: authData } = await supabase.auth.getUser();
        targetUid = authData?.user?.id;

        if (!targetUid && typeof window !== "undefined") {
          targetUid = localStorage.getItem("haas_uid") || 
                      localStorage.getItem("supabase_uid") || 
                      localStorage.getItem("user_id") || undefined;
        }

        if (!targetUid) {
          targetUid = (typeof window !== "undefined" ? localStorage.getItem("haas_user_id") : undefined);
        }

        if (!targetUid) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("vw_aluno_dashboard")
          .select("*")
          .eq("user_id", targetUid)
          .maybeSingle();

        if (error) {
          console.error("❌ Erro em useAlunoMetrics:", error);
        } else if (data) {
          setMetrics(data);
        }
      } catch (err) {
        console.error("💥 Exceção em useAlunoMetrics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, []);

  return { metrics, loading };
}
