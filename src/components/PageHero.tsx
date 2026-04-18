import { motion } from "framer-motion";
import { ChevronRight, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export interface PageHeroStat {
  value: string;
  label: string;
  icon?: LucideIcon;
}

export interface PageHeroAction {
  label: string;
  to?: string;
  href?: string;
  onClick?: () => void;
  variant?: "accent" | "hero-outline";
}

interface PageHeroProps {
  badge?: string;
  badgeIcon?: LucideIcon;
  title: React.ReactNode;
  highlight?: string;
  description: string;
  backgroundImage?: string;
  breadcrumbs?: { label: string; to?: string }[];
  stats?: PageHeroStat[];
  primaryAction?: PageHeroAction;
  secondaryAction?: PageHeroAction;
}

const renderAction = (action: PageHeroAction, key: string) => {
  const variant = action.variant ?? "accent";
  const inner = (
    <Button variant={variant} size="lg" className="min-w-[180px]">
      {action.label}
      <ChevronRight className="w-4 h-4" />
    </Button>
  );
  if (action.to) return <Link key={key} to={action.to}>{inner}</Link>;
  if (action.href) return <a key={key} href={action.href} target="_blank" rel="noreferrer">{inner}</a>;
  return <button key={key} onClick={action.onClick} className="contents">{inner}</button>;
};

const PageHero = ({
  badge,
  badgeIcon: BadgeIcon,
  title,
  highlight,
  description,
  backgroundImage,
  breadcrumbs,
  stats,
  primaryAction,
  secondaryAction,
}: PageHeroProps) => {
  return (
    <section className="relative overflow-hidden pt-28 md:pt-32 pb-16 md:pb-24 isolate">
      {/* Background image layer */}
      {backgroundImage && (
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
          aria-hidden="true"
        />
      )}
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: backgroundImage
            ? "linear-gradient(135deg, hsla(205, 82%, 12%, 0.92) 0%, hsla(205, 60%, 22%, 0.78) 55%, hsla(168, 76%, 35%, 0.55) 100%)"
            : "linear-gradient(135deg, hsl(205, 82%, 18%) 0%, hsl(205, 70%, 25%) 55%, hsl(168, 60%, 30%) 100%)",
        }}
        aria-hidden="true"
      />
      {/* Decorative blobs */}
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-accent/20 blur-[100px] -z-10" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-secondary/20 blur-[120px] -z-10" aria-hidden="true" />

      <div className="container relative">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-primary-foreground/70">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-accent transition-colors">{crumb.label}</Link>
                ) : (
                  <span className="text-primary-foreground">{crumb.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
              </span>
            ))}
          </nav>
        )}

        <div className="max-w-3xl">
          {badge && (
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/15 text-accent text-xs font-semibold tracking-wide uppercase rounded-full border border-accent/30 backdrop-blur-sm mb-5"
            >
              {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5" />}
              {badge}
            </motion.span>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-[1.1]"
          >
            {title}
            {highlight && (
              <>
                {" "}
                <span className="text-gradient-accent">{highlight}</span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-primary-foreground/80 max-w-2xl leading-relaxed"
          >
            {description}
          </motion.p>

          {(primaryAction || secondaryAction) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              {primaryAction && renderAction(primaryAction, "primary")}
              {secondaryAction && renderAction({ ...secondaryAction, variant: secondaryAction.variant ?? "hero-outline" }, "secondary")}
            </motion.div>
          )}
        </div>

        {stats && stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl"
          >
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl bg-primary-foreground/8 border border-primary-foreground/15 backdrop-blur-md p-4 md:p-5 hover:bg-primary-foreground/12 transition-colors"
                >
                  {Icon && (
                    <div className="w-9 h-9 rounded-lg bg-accent/20 text-accent flex items-center justify-center mb-3">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                  )}
                  <div className="text-2xl md:text-3xl font-display font-bold text-primary-foreground">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-primary-foreground/70 mt-1">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PageHero;
