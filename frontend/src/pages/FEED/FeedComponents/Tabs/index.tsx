import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

interface FeedTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

/* No per-view overrides here: the shadcn Tabs default already uses bg-muted for the track
   and the background paper for the active state, which is exactly the quiet segmentation
   this view wants. The previous gray-100/white/shadow classes were a second, competing
   source of truth for the same two colors. */
function FeedTabs({ activeTab, setActiveTab }: FeedTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-3">
      <TabsList className="grid h-auto w-full grid-cols-3 p-1">
        <TabsTrigger value="for-you">For You</TabsTrigger>
        <TabsTrigger value="following">Following</TabsTrigger>
        <TabsTrigger value="trending">Trending</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export default React.memo(FeedTabs);