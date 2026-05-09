import { motion } from "framer-motion";
import { Play, Film } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import VideoPlayer from "@/components/VideoPlayer";
import { useVideos, type Video } from "@/hooks/useVideos";
import { getStorageUrl } from "@/hooks/useSiteContent";

interface VideoSectionProps {
  category: string;
  title?: string;
  subtitle?: string;
  maxVideos?: number;
  bgClass?: string;
}

const VideoSection = ({ category, title = "Watch Our Videos", subtitle, maxVideos = 3, bgClass = "" }: VideoSectionProps) => {
  const { videos, loading } = useVideos(category);
  const [selected, setSelected] = useState<Video | null>(null);

  if (loading || videos.length === 0) return null;

  const displayed = videos.slice(0, maxVideos);

  const getThumbnail = (video: Video) => {
    if (video.thumbnail_url) {
      return video.thumbnail_url.startsWith("http") ? video.thumbnail_url : getStorageUrl(video.thumbnail_url);
    }
    if (video.video_url) {
      const ytMatch = video.video_url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }
    return null;
  };

  return (
    <section className={`py-24 ${bgClass}`}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">{subtitle}</p>}
        </motion.div>

        <div className={`grid gap-6 ${displayed.length === 1 ? "max-w-2xl mx-auto" : displayed.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}>
          {displayed.map((video, i) => {
            const thumb = getThumbnail(video);
            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
                onClick={() => setSelected(video)}
              >
                <div className="relative rounded-xl overflow-hidden aspect-video bg-muted">
                  {thumb ? (
                    <img src={thumb} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <Film className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/30 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-accent-foreground ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </div>
                <h3 className="mt-3 font-display font-semibold text-foreground group-hover:text-accent transition-colors">{video.title}</h3>
                {video.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{video.description}</p>}
              </motion.div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-foreground">
          {selected && (
            <div>
              <VideoPlayer video={selected} autoPlay />
              <div className="p-4 bg-card">
                <h3 className="font-display font-semibold text-foreground">{selected.title}</h3>
                {selected.description && <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default VideoSection;
