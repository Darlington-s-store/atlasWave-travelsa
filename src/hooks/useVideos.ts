import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Video {
  id: string;
  title: string;
  description: string | null;
  video_type: string;
  video_url: string | null;
  file_path: string | null;
  thumbnail_url: string | null;
  category: string;
  sort_order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export function useVideos(category?: string) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    let query = supabase
      .from("videos")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (!error && data) {
      setVideos(data as Video[]);
    }
    setLoading(false);
  }, [category]);

  useEffect(() => {
    fetchVideos();

    const channel = supabase
      .channel("videos_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "videos" }, () => {
        fetchVideos();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchVideos]);

  return { videos, loading, refetch: fetchVideos };
}

export function getVideoStorageUrl(path: string | null): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from("video-uploads").getPublicUrl(path);
  return data.publicUrl;
}

export function getEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return url;
}
