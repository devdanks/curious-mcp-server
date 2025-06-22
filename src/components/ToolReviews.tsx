
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { db } from '@/lib/supabase';

interface ToolReviewsProps {
  toolId: string;
}

export const ToolReviews: React.FC<ToolReviewsProps> = ({ toolId }) => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['tool-reviews', toolId],
    queryFn: async () => {
      const { data, error } = await db.getToolReviews(toolId);
      if (error) throw error;
      return data || [];
    },
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Reviews ({reviews?.length || 0})
        </CardTitle>
        <Button variant="outline" size="sm">
          Write Review
        </Button>
      </CardHeader>
      <CardContent>
        {!reviews || reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No reviews yet. Be the first to review this tool!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={review.user_profiles?.avatar_url || ''} />
                    <AvatarFallback>
                      {(review.user_profiles?.display_name || review.user_profiles?.username || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">
                        {review.user_profiles?.display_name || review.user_profiles?.username || 'Anonymous'}
                      </span>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating || 0)}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at || '').toLocaleDateString()}
                      </span>
                    </div>
                    
                    {review.title && (
                      <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                    )}
                    
                    {review.comment && (
                      <p className="text-gray-600">{review.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
