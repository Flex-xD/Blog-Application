import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { IUser } from '@/types';

interface RightSidebarProps {
  suggestedUsers?: IUser[]; 
  trendingTopics: { id: string; name: string; postCount: string }[];
}

const RightSidebar: React.FC<RightSidebarProps> = ({ suggestedUsers, trendingTopics }) => {

  return (
    <div className="space-y-4">
      {suggestedUsers?.length ? suggestedUsers?.map((user, index) => (
        <motion.div
          key={user._id || `user-${index}`}
          whileHover={{ y: -2 }}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.profilePicture?.url} alt={user.username} />
              <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-base">{user.username}</p>
              <p className="text-sm text-muted-foreground">
                @{user.username} · {user.followers.length} followers
              </p>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            className="gap-1 text-sm"
            aria-label={`Follow ${user.username}`}
          >
            Follow
          </Button>
        </motion.div>
      )):(
        <p className="text-muted-foreground">No suggested users available.</p>
      )}

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