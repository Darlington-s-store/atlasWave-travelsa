import { useState } from "react";
import { Play } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { getVideoStorageUrl, getEmbedUrl, type Video } from "@/hooks/useVideos";
import { getStorageUrl } from "@/hooks/useSiteContent";

interface VideoPlayerProps {
  video: Video;
  className?: string;
  autoPlay?: boolean;
}

const VideoPlayer = ({ video, className = "", autoPlay = false }: VideoPlayerProps) => {
  const [playing, setPlaying] = useState(autoPlay);

  const thumbnail = video.thumbnail_url
    ? (video.thumbnail_url.startsWith("http") ? video.thumbnail_url : getStorageUrl(video.thumbnail_url))
    : null;

  if (video.video_type === "embed" && video.video_url) {
    const embedUrl = getEmbedUrl(video.video_url);
    if (!playing && thumbnail) {
      return (
        <div className={`relative cursor-pointer group rounded-xl overflow-hidden ${className}`} onClick={() => setPlaying(true)}>
          <AspectRatio ratio={16 / 9}>
            <img src={thumbnail} alt={video.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center group-hover:bg-foreground/40 transition-colors">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-7 h-7 text-accent-foreground ml-1" fill="currentColor" />
              </div>
            </div>
          </AspectRatio>
        </div>
      );
    }

    return (
      <div className={`rounded-xl overflow-hidden ${className}`}>
        <AspectRatio ratio={16 / 9}>
          <iframe
            src={`${embedUrl}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </AspectRatio>
      </div>
    );
  }

  if (video.video_type === "upload" && video.file_path) {
    const src = getVideoStorageUrl(video.file_path);
    if (!src) return null;

    return (
      <div className={`rounded-xl overflow-hidden ${className}`}>
        <AspectRatio ratio={16 / 9}>
          <video
            src={src}
            controls
            autoPlay={autoPlay}
            poster={thumbnail || undefined}
            className="w-full h-full object-cover"
          >
            Your browser does not support the video tag.
          </video>
        </AspectRatio>
      </div>
    );
  }

  return null;
};

export default VideoPlayer;
