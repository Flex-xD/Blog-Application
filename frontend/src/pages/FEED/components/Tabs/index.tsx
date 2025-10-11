import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Users, TrendingUp } from "lucide-react";
import React from "react";

interface FeedTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

function FeedTabs({ activeTab, setActiveTab }: FeedTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
      <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 h-auto rounded-xl">
        <TabsTrigger
          value="for-you"
          className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <Home className="h-4 w-4 mr-2" />
          For You
        </TabsTrigger>
        <TabsTrigger
          value="following"
          className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <Users className="h-4 w-4 mr-2" />
          Following
        </TabsTrigger>
        <TabsTrigger
          value="trending"
          className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Trending
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export default React.memo(FeedTabs)
