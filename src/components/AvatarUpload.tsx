import { useState, useRef, useCallback } from "react";
import { Camera, Upload, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import imageCompression from "browser-image-compression";

interface AvatarUploadProps {
  onUploaded?: (url: string) => void;
  currentUrl?: string;
  size?: "sm" | "md" | "lg";
}

const AvatarUpload = ({ onUploaded, currentUrl, size = "md" }: AvatarUploadProps) => {
  const { user, updateProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-20 h-20 text-lg",
  };

  const initials = user?.fullName
    ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleFile = async (file: File) => {
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 512,
        useWebWorker: true,
      });
      const url = URL.createObjectURL(compressed);
      setPreview(url);
    } catch {
      toast({ title: "Error", description: "Could not process image.", variant: "destructive" });
    }
  };

  const startCamera = async () => {
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      toast({ title: "Camera access denied", description: "Please allow camera access in your browser settings.", variant: "destructive" });
      setCameraOpen(false);
    }
  };

  const capture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    const url = canvas.toDataURL("image/jpeg", 0.8);
    setPreview(url);
    stopCamera();
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const upload = async () => {
    if (!preview || !user) return;
    setUploading(true);
    try {
      const blob = await fetch(preview).then(r => r.blob());
      const path = `${user.id}/profile.jpg`;
      const { error } = await supabase.storage.from("avatars").upload(path, blob, {
        upsert: true,
        contentType: "image/jpeg",
      });
      if (error) throw error;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      await updateProfile({ avatar: publicUrl });
      onUploaded?.(publicUrl);
      toast({ title: "Photo updated!" });
      setOpen(false);
      setPreview(null);
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-all relative group`}
        aria-label="Change profile photo"
      >
        {currentUrl || user?.avatar ? (
          <img src={currentUrl || user?.avatar} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary/10 flex items-center justify-center font-bold text-primary">
            {initials}
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="w-4 h-4 text-white" />
        </div>
      </button>

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ""; }} />

      <Dialog open={open} onOpenChange={v => { if (!v) { setPreview(null); stopCamera(); } setOpen(v); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile Photo</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4">
            {cameraOpen ? (
              <div className="space-y-3 w-full">
                <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-xl aspect-square object-cover" />
                <div className="flex gap-2 justify-center">
                  <Button onClick={capture}><Camera className="w-4 h-4 mr-2" /> Capture</Button>
                  <Button variant="outline" onClick={stopCamera}>Cancel</Button>
                </div>
              </div>
            ) : preview ? (
              <div className="space-y-3 flex flex-col items-center">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary/20">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={upload} disabled={uploading}>
                    <Check className="w-4 h-4 mr-2" /> {uploading ? "Uploading..." : "Confirm"}
                  </Button>
                  <Button variant="outline" onClick={() => setPreview(null)}>
                    <X className="w-4 h-4 mr-2" /> Retake
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 w-full">
                <div className="w-32 h-32 rounded-full mx-auto overflow-hidden border-4 border-primary/10">
                  {currentUrl || user?.avatar ? (
                    <img src={currentUrl || user?.avatar} alt="Current" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                      {initials}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => fileRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" /> Upload Photo
                  </Button>
                  <Button variant="outline" onClick={startCamera}>
                    <Camera className="w-4 h-4 mr-2" /> Take Photo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AvatarUpload;
