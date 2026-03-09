import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Clock3, Loader2, MessageSquareQuote, Search, Star, XCircle } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type ReviewRow = Tables<"reviews">;
type ReviewFilter = "all" | "pending" | "approved" | "rejected";

const statusTone: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-100 text-rose-700 border-rose-200",
};

const AdminReviews = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<ReviewFilter>("pending");
  const [search, setSearch] = useState("");
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [selectedReview, setSelectedReview] = useState<ReviewRow | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Failed to load reviews",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setReviews(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();

    const channel = supabase
      .channel("admin_reviews_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reviews" },
        () => {
          fetchReviews();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredReviews = useMemo(() => {
    const term = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesFilter = filter === "all" ? true : review.status === filter;
      const matchesSearch =
        term.length === 0 ||
        review.name.toLowerCase().includes(term) ||
        review.email.toLowerCase().includes(term) ||
        review.content.toLowerCase().includes(term) ||
        (review.role || "").toLowerCase().includes(term);

      return matchesFilter && matchesSearch;
    });
  }, [filter, reviews, search]);

  const stats = useMemo(
    () => ({
      total: reviews.length,
      pending: reviews.filter((review) => review.status === "pending").length,
      approved: reviews.filter((review) => review.status === "approved").length,
      rejected: reviews.filter((review) => review.status === "rejected").length,
    }),
    [reviews],
  );

  const openReview = (review: ReviewRow) => {
    setSelectedReview(review);
    setAdminNotes(review.admin_notes || "");
  };

  const updateStatus = async (status: "approved" | "rejected") => {
    if (!selectedReview) return;

    setSaving(true);

    const payload = {
      status,
      admin_notes: adminNotes.trim() || null,
      approved_at: status === "approved" ? new Date().toISOString() : null,
    };

    const { error } = await supabase
      .from("reviews")
      .update(payload)
      .eq("id", selectedReview.id);

    setSaving(false);

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: status === "approved" ? "Review approved" : "Review rejected",
      description:
        status === "approved"
          ? "This review will now appear on the homepage."
          : "This review will stay hidden from the homepage.",
    });

    setSelectedReview(null);
    setAdminNotes("");
    fetchReviews();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-[22px] font-bold tracking-tight text-foreground">Reviews</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review customer feedback, approve trusted reviews, and control what appears on the homepage.
            </p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, role, or message"
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border/60 shadow-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <MessageSquareQuote className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-foreground">{stats.rejected}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60 shadow-card">
          <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-lg">Moderation Queue</CardTitle>
              <CardDescription>Pending reviews stay hidden until you approve them.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["pending", "approved", "rejected", "all"] as ReviewFilter[]).map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={filter === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(value)}
                  className="capitalize"
                >
                  {value}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading reviews...
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/30 px-6 py-12 text-center">
                <p className="text-sm font-medium text-foreground">No reviews found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try another filter or wait for new customer submissions.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border bg-background p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-foreground">{review.name}</h3>
                          <Badge className={statusTone[review.status] || statusTone.pending}>{review.status}</Badge>
                          {review.role && <Badge variant="outline">{review.role}</Badge>}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{review.email}</p>
                        <div className="mt-3 flex gap-1">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={`h-4 w-4 ${index < review.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
                            />
                          ))}
                        </div>
                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{review.content}</p>
                        <p className="mt-3 text-xs text-muted-foreground">
                          Submitted {format(new Date(review.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        {review.status !== "approved" && (
                          <Button size="sm" onClick={() => openReview(review)}>
                            Review
                          </Button>
                        )}
                        {review.status === "approved" && (
                          <Button size="sm" variant="outline" onClick={() => openReview(review)}>
                            View Details
                          </Button>
                        )}
                        {review.status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-700"
                            onClick={() => openReview(review)}
                          >
                            {review.status === "pending" ? "Reject" : "Change Status"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedReview} onOpenChange={(open) => !open && setSelectedReview(null)}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Review Moderation</DialogTitle>
            <DialogDescription>
              Approve trusted feedback so it appears on the homepage, or reject it to keep it hidden.
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-5 py-2">
              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-foreground">{selectedReview.name}</p>
                  <Badge className={statusTone[selectedReview.status] || statusTone.pending}>{selectedReview.status}</Badge>
                  {selectedReview.role && <Badge variant="outline">{selectedReview.role}</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{selectedReview.email}</p>
                <div className="mt-3 flex gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${index < selectedReview.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{selectedReview.content}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(event) => setAdminNotes(event.target.value)}
                  placeholder="Optional notes for internal moderation records."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReview(null)}>
              Close
            </Button>
            <Button
              variant="outline"
              className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-700"
              onClick={() => updateStatus("rejected")}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject
            </Button>
            <Button onClick={() => updateStatus("approved")} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminReviews;
