/**
 * StatCard - A reusable card component for displaying statistics
 *
 * @param {string} label - The descriptive label for the stat
 * @param {number|string} value - The stat value to display
 * @param {string} className - Optional additional CSS classes
 */
export const StatCard = ({ label, value, className = '' }) => {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md p-6
        flex flex-col items-center justify-center
        transition-transform duration-200
        hover:-translate-y-0.5
        ${className}
      `}
    >
      <div className="text-3xl font-bold text-primary-dark mb-2">
        {value}
      </div>
      <div className="text-sm text-muted-foreground font-semibold text-center">
        {label}
      </div>
    </div>
  );
};
