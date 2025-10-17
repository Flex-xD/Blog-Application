import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Flame, Hash, Sparkles, Loader2, AlertCircle, ArrowUp, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import useTrendingTopics from "@/customHooks/TrendingTopicsFetching";

interface TrendingTopic {
  id: string;
  name: string;
  postCount: number;
  growth?: number;
}

interface RightSidebarProps {
  variant?: "feed" | "social";
  className?: string;
}

const TrendingSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className="flex items-start gap-4 p-3 rounded-lg animate-pulse"
      >
        <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full mt-1" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-5 bg-muted rounded w-20" />
            <div className="h-4 bg-muted rounded w-16" />
          </div>
          <div className="h-4 bg-muted rounded w-32" />
        </div>
      </div>
    ))}
  </div>
);

const ErrorState: React.FC<{ variant?: "feed" | "social" }> = ({ variant = "feed" }) => (
  <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
    <AlertCircle className="w-8 h-8 mb-2 text-destructive" />
    <p className="text-sm font-medium">
      {variant === "social" ? "Failed to load trends" : "Failed to load trending topics"}
    </p>
    <p className="text-xs mt-1">
      {variant === "social" ? "Try refreshing the page" : "Please try again later"}
    </p>
  </div>
);

const TrendingRank: React.FC<{ rank: number; variant?: "feed" | "social" }> = ({ rank, variant = "feed" }) => {
  const getRankConfig = (position: number) => {
    switch (position) {
      case 0:
        return {
          bg: "bg-gradient-to-br from-orange-500 to-red-500",
          border: "border-orange-200",
          icon: <Flame className="w-3 h-3" />
        };
      case 1:
        return {
          bg: "bg-gradient-to-br from-purple-500 to-blue-500",
          border: "border-purple-200",
          icon: <TrendingUp className="w-3 h-3" />
        };
      case 2:
        return {
          bg: "bg-gradient-to-br from-green-500 to-emerald-500",
          border: "border-green-200",
          icon: <Sparkles className="w-3 h-3" />
        };
      default:
        return {
          bg: variant === "social" ? "bg-gradient-to-br from-gray-100 to-gray-200" : "bg-gradient-to-br from-gray-100 to-gray-200",
          border: "border-gray-200",
          icon: <Hash className="w-3 h-3" />
        };
    }
  };

  const config = getRankConfig(rank);

  return (
    <div
      className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2",
        config.bg,
        config.border
      )}
    >
      {rank <= 2 ? config.icon : rank + 1}
    </div>
  );
};

const GrowthIndicator: React.FC<{ growth?: number; variant?: "feed" | "social" }> = ({ growth, variant = "feed" }) => {
  if (!growth) return null;

  const isPositive = growth > 0;
  
  return (
    <div className={cn(
      "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
      isPositive 
        ? "bg-green-50 text-green-700" 
        : "bg-red-50 text-red-700"
    )}>
      <ArrowUp className={cn(
        "w-3 h-3",
        !isPositive && "rotate-180"
      )} />
      {Math.abs(growth)}%
    </div>
  );
};

const PostCount: React.FC<{ count: number; variant?: "feed" | "social" }> = ({ count, variant = "feed" }) => {
  const formatCount = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <div className={cn(
        "w-1.5 h-1.5 rounded-full",
        variant === "social" ? "bg-purple-500" : "bg-blue-500"
      )} />
      <span>{formatCount(count)} posts</span>
    </div>
  );
};

const TrendingTopicItem: React.FC<{ 
  topic: TrendingTopic; 
  rank: number; 
  index: number;
  variant?: "feed" | "social";
}> = ({ topic, rank, index, variant = "feed" }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ scale: 1.02, x: 4 }}
    className="group"
  >
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border border-transparent",
      variant === "social" 
        ? "hover:bg-purple-50/50 hover:border-purple-100" 
        : "hover:bg-accent/50 hover:border-accent"
    )}>
      <TrendingRank rank={rank} variant={variant} />
      
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn(
            "font-semibold text-sm line-clamp-2 leading-tight",
            variant === "social" 
              ? "text-gray-900 group-hover:text-purple-700" 
              : "text-foreground group-hover:text-primary"
          )}>
            #{topic.name}
          </h3>
          <GrowthIndicator growth={topic.growth} variant={variant} />
        </div>
        
        <div className="flex items-center justify-between">
          <PostCount count={topic.postCount} variant={variant} />
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs",
              variant === "social"
                ? "bg-purple-50 text-purple-700 hover:bg-purple-50"
                : "bg-blue-50 text-blue-700 hover:bg-blue-50"
            )}
          >
            {variant === "social" ? "Hot" : "Trending"}
          </Badge>
        </div>
      </div>
    </div>
  </motion.div>
);

const RightSidebar: React.FC<RightSidebarProps> = ({ variant = "feed", className }) => {
  const { data, isLoading, isError } = useTrendingTopics();
  
  const trendingTopics: TrendingTopic[] = data?.data || [];

  const getHeaderConfig = () => {
    if (variant === "social") {
      return {
        title: "Trending in Social",
        description: "What people are talking about",
        icon: <Users className="w-4 h-4 text-white" />,
        iconBg: "bg-gradient-to-r from-purple-500 to-pink-500",
        badge: "Social",
        badgeColor: "bg-pink-50 text-pink-700"
      };
    }
    
    return {
      title: "Trending Topics",
      description: "What's happening right now",
      icon: <Flame className="w-4 h-4 text-white" />,
      iconBg: "bg-gradient-to-r from-orange-500 to-red-500",
      badge: "Live",
      badgeColor: "bg-orange-50 text-orange-700"
    };
  };

  const headerConfig = getHeaderConfig();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Sticky Container */}
      <div className="sticky top-6 space-y-6">
        {/* Trending Topics Card */}
        <Card className={cn(
          "shadow-sm border-0",
          variant === "social" 
            ? "bg-gradient-to-br from-purple-50/50 to-pink-50/50 backdrop-blur-sm" 
            : "bg-background/60 backdrop-blur-sm"
        )}>
          <CardHeader className={cn(
            "pb-4 border-b",
            variant === "social" ? "border-purple-100" : "border-border"
          )}>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <div className={cn("p-1.5 rounded-lg", headerConfig.iconBg)}>
                {headerConfig.icon}
              </div>
              {headerConfig.title}
              <Badge variant="secondary" className={cn("ml-2 text-xs", headerConfig.badgeColor)}>
                {headerConfig.badge}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {headerConfig.description}
            </p>
          </CardHeader>
          
          <CardContent className="p-0">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4"
                >
                  <TrendingSkeleton />
                </motion.div>
              ) : isError ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ErrorState variant={variant} />
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "divide-y",
                    variant === "social" ? "divide-purple-100/50" : "divide-border/50"
                  )}
                >
                  {trendingTopics.map((topic, index) => (
                    <TrendingTopicItem
                      key={topic.id}
                      topic={topic}
                      rank={index}
                      index={index}
                      variant={variant}
                    />
                  ))}
                  
                  {trendingTopics.length === 0 && (
                    <div className="p-6 text-center text-muted-foreground">
                      <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium">
                        {variant === "social" ? "No trends in social yet" : "No trends yet"}
                      </p>
                      <p className="text-xs mt-1">
                        {variant === "social" 
                          ? "Be the first to start a conversation" 
                          : "Check back later for trending topics"
                        }
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Additional Info Card */}
        <Card className={cn(
          "shadow-sm border-0",
          variant === "social"
            ? "bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20"
            : "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                variant === "social"
                  ? "bg-purple-100 dark:bg-purple-900/30"
                  : "bg-blue-100 dark:bg-blue-900/30"
              )}>
                <Sparkles className={cn(
                  "w-4 h-4",
                  variant === "social"
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-blue-600 dark:text-blue-400"
                )} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {variant === "social" 
                    ? "Discover new conversations" 
                    : "Trends update every 5 minutes"
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {variant === "social"
                    ? "Join trending discussions in your network"
                    : "Based on real-time engagement"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RightSidebar;