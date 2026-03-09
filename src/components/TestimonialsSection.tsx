import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, MessageSquarePlus, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const defaultTestimonials = [
  {
    name: "Adaeze Okafor",
    role: "Nurse, Germany",
    text: "AtlastWave handled my entire Germany work permit process. From credential evaluation to visa approval, everything was seamless.",
    rating: "5",
  },
  {
    name: "Kwame Mensah",
    role: "Business Owner, Accra",
    text: "Their logistics team shipped 3 containers of goods from China to Ghana without a single issue. Real-time tracking and customs clearance were top-notch.",
    rating: "5",
  },
  {
    name: "Fatima Al-Rashid",
    role: "Tourist, Dubai",
    text: "Booked a family vacation through AtlastWave with flights, hotels, and tours all arranged perfectly.",
    rating: "5",
  },
  {
    name: "Daniel Eze",
    role: "Engineer, Canada",
    text: "I got my Canada LMIA work permit approved in record time. The team kept me updated at every step.",
    rating: "4",
  },
];

type ReviewRow = Tables<"reviews">;

const TestimonialsSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { testimonials: cmsTestimonials } = useSiteContent();
  const { user } = useAuth();
  const [approvedReviews, setApprovedReviews] = useState<ReviewRow[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    rating: "5",
    content: "",
  });

  useEffect(() => {
    const loadApprovedReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("status", "approved")
        .order("approved_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(8);

      if (!error) {
        setApprovedReviews(data || []);
      }

      setLoadingReviews(false);
    };

    loadApprovedReviews();

    const channel = supabase
      .channel("approved_reviews_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reviews" },
        () => {
          loadApprovedReviews();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!dialogOpen) return;

    setForm((current) => ({
      ...current,
      name: current.name || user?.fullName || "",
      email: current.email || user?.email || "",
    }));
  }, [dialogOpen, user]);

  const testimonials = useMemo(() => {
    const reviewTestimonials = approvedReviews.map((review) => ({
      name: review.name,
      role: review.role || "Verified Client",
      text: review.content,
      rating: String(review.rating),
    }));

    if (reviewTestimonials.length > 0) {
      return [...reviewTestimonials, ...cmsTestimonials].slice(0, 8);
    }

    if (cmsTestimonials.length > 0) {
      return cmsTestimonials;
    }

    return defaultTestimonials;
  }, [approvedReviews, cmsTestimonials]);

  const resetForm = () => {
    setForm({
      name: user?.fullName || "",
      email: user?.email || "",
      role: "",
      rating: "5",
      content: "",
    });
  };

  const handleOpenReview = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in before submitting a review.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    resetForm();
    setDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in before submitting a review.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!form.name.trim() || !form.email.trim() || !form.content.trim()) {
      toast({
        title: "Missing information",
        description: "Name, email, and review message are required.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role.trim() || null,
      rating: Number(form.rating),
      content: form.content.trim(),
      status: "pending",
    });

    setSubmitting(false);

    if (error) {
      toast({
        title: "Review not submitted",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Review submitted",
      description: "Your review is pending admin approval and will appear on the homepage once approved.",
    });
    setDialogOpen(false);
    resetForm();
  };

  return (
    <section className="bg-muted py-20 sm:py-24">
      <div className="container">
        <div className="mb-12 flex flex-col gap-6 sm:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div className="text-center lg:text-left">
            <span className="text-sm font-semibold uppercase tracking-widest text-accent">Testimonials</span>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-5xl">
              What Our <span className="text-gradient-accent">Clients</span> Say
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg lg:mx-0">
              Approved client feedback from travel, immigration, and logistics customers.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 lg:items-end">
            <Button onClick={handleOpenReview} className="min-w-[220px] gap-2">
              <MessageSquarePlus className="h-4 w-4" />
              Write a Review
            </Button>
            <p className="text-center text-sm text-muted-foreground lg:text-right">
              Reviews are checked by admin before they appear on the homepage.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {testimonials.map((testimonial, index) => {
            const rating = parseInt(testimonial.rating || "5", 10);

            return (
              <motion.div
                key={`${testimonial.name}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="flex flex-col rounded-xl border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-hover sm:p-6"
              >
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      className={`h-4 w-4 ${starIndex < rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">"{testimonial.text}"</p>
                <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{testimonial.name}</p>
                    {testimonial.role && <p className="text-xs text-muted-foreground">{testimonial.role}</p>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {loadingReviews && (
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading latest approved reviews...
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Share Your Experience</DialogTitle>
            <DialogDescription>
              Your review will be submitted for admin approval before it appears on the homepage.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="review-name">Full Name</Label>
                <Input
                  id="review-name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="review-email">Email Address</Label>
                <Input
                  id="review-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1.4fr_0.8fr]">
              <div className="space-y-2">
                <Label htmlFor="review-role">Role or Service Used</Label>
                <Input
                  id="review-role"
                  value={form.role}
                  onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                  placeholder="Tourist, Accra or Visa Assistance"
                />
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <Select value={form.rating} onValueChange={(value) => setForm((current) => ({ ...current, rating: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <SelectItem key={rating} value={String(rating)}>
                        {rating} Star{rating > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-content">Your Review</Label>
              <Textarea
                id="review-content"
                value={form.content}
                onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                placeholder="Tell us how AtlastWave Travel and Tour helped you."
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default TestimonialsSection;
