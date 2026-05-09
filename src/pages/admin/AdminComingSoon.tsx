import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface AdminComingSoonProps {
  title: string;
  description?: string;
}

const AdminComingSoon = ({ title, description }: AdminComingSoonProps) => {
  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">{title}</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">{description || "This module is under development."}</p>
        </div>
        <Card className="shadow-card rounded-xl border border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <Construction className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Coming Soon</h3>
            <p className="text-[13px] text-muted-foreground mt-2 max-w-md">
              The <strong>{title}</strong> module is currently being built. Check back soon for full functionality.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminComingSoon;
