
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const CreateToolCTA: React.FC = () => {
  return (
    <div className="mt-16 text-center">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Create Your Own MCP Tool
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Share your custom tools with the community and help extend the capabilities of AI applications worldwide.
        </p>
        <Button size="lg" className="font-semibold">
          <Plus className="w-5 h-5 mr-2" />
          Create Tool
        </Button>
      </div>
    </div>
  );
};
