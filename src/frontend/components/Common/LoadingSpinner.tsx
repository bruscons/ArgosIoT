// components/Common/LoadingSpinner.tsx
// Componente de loading reutilizável

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-4',
};

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div 
        className={`${sizeClasses[size]} border-purple-600 border-t-transparent rounded-full animate-spin`} 
      />
      {text && <span className="text-gray-500 text-sm">{text}</span>}
    </div>
  );
}
