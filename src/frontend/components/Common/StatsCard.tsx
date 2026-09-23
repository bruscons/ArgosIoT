// components/Common/StatsCard.tsx
// Card de estatística reutilizável

'use client';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  color: 'green' | 'red' | 'purple' | 'blue' | 'yellow' | 'gray';
  icon?: React.ReactNode;
  loading?: boolean;
}

// Mapeamento de cores
const colorClasses = {
  green: {
    bg: 'bg-green-50',
    border: 'border-green-100',
    title: 'text-green-600',
    value: 'text-green-700',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-100',
    title: 'text-red-600',
    value: 'text-red-700',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    title: 'text-purple-600',
    value: 'text-purple-700',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    title: 'text-blue-600',
    value: 'text-blue-700',
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-100',
    title: 'text-yellow-600',
    value: 'text-yellow-700',
  },
  gray: {
    bg: 'bg-gray-50',
    border: 'border-gray-100',
    title: 'text-gray-600',
    value: 'text-gray-700',
  },
};

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  color, 
  icon,
  loading = false 
}: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div className={`p-4 ${colors.bg} rounded-lg border ${colors.border} transition-all hover:shadow-sm`}>
      <div className="flex items-center justify-between">
        <p className={`text-sm ${colors.title} font-medium`}>{title}</p>
        {icon && <span className={colors.title}>{icon}</span>}
      </div>
      
      {loading ? (
        <div className="mt-1 h-8 flex items-center">
          <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
        </div>
      ) : (
        <p className={`text-2xl font-bold ${colors.value} mt-1`}>{value}</p>
      )}
      
      {subtitle && (
        <p className={`text-xs ${colors.title} opacity-75 mt-1`}>{subtitle}</p>
      )}
    </div>
  );
}
