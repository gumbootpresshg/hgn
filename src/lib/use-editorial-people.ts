"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { HgnAuthor, HgnColumn } from "@/lib/writers";

export function useEditorialPeople() {
  const [authors, setAuthors] = useState<HgnAuthor[]>([]);
  const [columns, setColumns] = useState<HgnColumn[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data: authorRows }, { data: columnRows }] = await Promise.all([
        supabase.from("hgn_authors").select("id,display_name,slug,writer_type,is_active,sort_order").eq("is_active", true).order("sort_order", { ascending: true }).order("display_name", { ascending: true }),
        supabase.from("columnists").select("id,display_name,name,slug,author_id,is_active,sort_order").eq("is_active", true).order("sort_order", { ascending: true }).order("display_name", { ascending: true }),
      ]);
      if (!active) return;
      setAuthors((authorRows || []) as HgnAuthor[]);
      setColumns((columnRows || []) as HgnColumn[]);
    })();
    return () => { active = false; };
  }, []);

  return { authors, columns };
}
