import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../utils/cn';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'indigo' | 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'gray';
  subtitle?: string;
  trend?: { value: number; label: string };
}

const colorMap = {
  indigo: { bg: 'bg-indigo-100', icon: 'text-indigo-600', value: 'text-indigo-700' },
  green: { bg: 'bg-green-100', icon: 'text-green-600', value: 'text-green-700' },
  amber: { bg: 'bg-amber-100', icon: 'text-amber-600', value: 'text-amber-700' },
  red: { bg: 'bg-red-100', icon: 'text-red-600', value: 'text-red-700' },
  blue: { bg: 'bg-blue-100', icon: 'text-blue-600', value: 'text-blue-700' },
  purple: { bg: 'bg-purple-100', icon: 'text-purple-600', value: 'text-purple-700' },
  gray: { bg: 'bg-gray-100', icon: 'text-gray-600', value: 'text-gray-700' },
};

export function MetricCard({ title, value, icon: Icon, color, subtitle, trend }: MetricCardProps) {
  const colors = colorMap[color];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <p className={cn('text-3xl font-bold mt-1', colors.value)}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
            {trend && (
              <p className={cn('text-xs mt-1 font-medium', trend.value >= 0 ? 'text-green-600' : 'text-red-600')}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
              </p>
            )}
          </div>
          <div className={cn('p-3 rounded-lg shrink-0 ml-4', colors.bg)}>
            <Icon className={cn('h-6 w-6', colors.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
