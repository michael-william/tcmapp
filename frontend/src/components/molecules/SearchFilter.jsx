/**
 * SearchFilter Component
 *
 * Search and filter controls for questions.
 */

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { cn } from '@/lib/utils';

export const SearchFilter = ({
  searchTerm = '',
  onSearchChange,
  selectedSection = 'all',
  onSectionChange,
  selectedStatus = 'all',
  onStatusChange,
  sections = [],
  size = 'default',
  className,
}) => {
  return (
    <div className={cn('flex flex-col sm:flex-row gap-4', className)}>
      {/* Search input */}
      {/* <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-10"
        />
      </div> */}

      {/* Section filter */}
      {sections.length > 0 && (
        <Select value={selectedSection} onValueChange={onSectionChange}>
          <SelectTrigger
            variant="primary"
            className={cn(
              'w-full sm:w-[200px]',
              size === 'sm' ? 'h-8' : 'h-10'
            )}
          >
            <SelectValue placeholder="All sections" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            {sections.map((section) => (
              <SelectItem key={section} value={section}>
                {section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Status filter */}
      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger
          variant="primary"
          className={cn(
            'w-full sm:w-[180px]',
            size === 'sm' ? 'h-8' : 'h-10'
          )}
        >
          <SelectValue placeholder="All status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Questions</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
