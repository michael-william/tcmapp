import { StatCard } from '@/components/atoms/StatCard';

/**
 * ProgressStatsSection - Displays migration progress statistics in a grid of cards
 *
 * @param {number} completed - Number of completed tasks
 * @param {number} total - Total number of tasks
 * @param {number} percentage - Completion percentage
 * @param {string} className - Optional additional CSS classes
 */
export const ProgressStatsSection = ({
  completed,
  total,
  percentage,
  className = '',
}) => {
  const remaining = total - completed;

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      <StatCard label="Total Tasks" value={total} />
      <StatCard label="Completed" value={completed} />
      <StatCard label="Remaining" value={remaining} />
      <StatCard label="Progress" value={`${percentage}%`} />
    </div>
  );
};
