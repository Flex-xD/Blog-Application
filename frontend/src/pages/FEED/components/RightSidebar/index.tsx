import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface RightSidebarProps {
  trendingTopics: { id: string; name: string; postCount: string }[];
}

const RightSidebar: React.FC<RightSidebarProps> = ({ trendingTopics }) => {

  return (
    <div className="space-y-4">

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Trending Topics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <p className="font-medium text-primary text-base">{topic.name}</p>
              <p className="text-sm text-muted-foreground">
                {topic.postCount} posts this week
              </p>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default RightSidebar;