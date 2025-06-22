
import React from 'react';

interface ToolStatsProps {
  toolCount: number;
  isLoading: boolean;
}

export const ToolStats: React.FC<ToolStatsProps> = ({ toolCount, isLoading }) => {
  return (
    <div className="mb-6 text-sm text-gray-600">
      {isLoading ? (
        <div className="animate-pulse bg-gray-200 h-4 w-32 rounded" />
      ) : (
        `Showing ${toolCount} tool${toolCount !== 1 ? 's' : ''}`
      )}
    </div>
  );
};
