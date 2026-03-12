import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import WhatsAppButton from "@/components/WhatsAppButton";
import VideoPlayer from "@/components/VideoPlayer";
import { useVideos, type Video } from "@/hooks/useVideos";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Play, Film, Loader2 } from "lucide-react";
import { getStorageUrl } from "@/hooks/useSiteContent";
import { getVideoStorageUrl, getEmbedUrl } from "@/hooks/useVideos";

const categories = [
  { value: "", label: "All Videos" },
  { value: "hero", label: "Featured" },
  { value: "services", label: "Services" },
  { value: "gallery", label: "Gallery" },
  { value: "about", label: "About Us" },
];

const VideoGallery = () => {
  const { videos, loading } = useVideos();
  const [activeCategory, setActiveCategory] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const filtered = activeCategory
    ? videos.filter((v) => v.category === activeCategory)
    : videos;

  const getThumbnail = (video: Video) => {
    if (video.thumbnail_url) {
      return video.thumbnail_url.startsWith("http")
        ? video.thumbnail_url
        : getStorageUrl(video.thumbnail_url);
    }
    // Auto-generate YouTube thumbnail
    if (video.video_url) {
      const ytMatch = video.video_url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="bg-primary py-16 md:py-24">
          <div className="container text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Film className="w-12 h-12 text-accent mx-auto mb-4" />
              <h1 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
                Video <span className="text-accent">Gallery</span>
              </h1>
              <p className="text-primary-foreground/70 max-w-2xl mx-auto text-lg">
                Watch our latest videos showcasing our services, success stories, and expert insights.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filter */}
        <div className="container py-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={activeCategory === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="container">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Film className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No videos found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((video, i) => {
                const thumb = getThumbnail(video);
                return (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative rounded-xl overflow-hidden bg-muted aspect-video">
                      {thumb ? (
                        <img src={thumb} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <Film className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/30 transition-colors flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 text-accent-foreground ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <h3 className="font-display font-semibold text-foreground group-hover:text-accent transition-colors">{video.title}</h3>
                      {video.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{video.description}</p>
                      )}
                      <span className="inline-block mt-2 text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground capitalize">{video.category}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Video modal */}
      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-foreground">
          {selectedVideo && (
            <div>
              <VideoPlayer video={selectedVideo} autoPlay />
              <div className="p-4 bg-card">
                <h3 className="font-display font-semibold text-foreground">{selectedVideo.title}</h3>
                {selectedVideo.description && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedVideo.description}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
      <BackToTop />
      <WhatsAppButton />
    </div>
  );
};

export default VideoGallery;
