/**
 * Resource Utilization Component
 * Displays CPU and Memory usage with circular gauges
 */

import { useState, useEffect } from 'react';

interface ResourceData {
  cpu: number;
  memory: number;
}

const ResourceUtilization: React.FC = () => {
  const [resources, setResources] = useState<ResourceData>({
    cpu: 0,
    memory: 0
  });

  // Simulate resource data (replace with real API call)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate fluctuating resource usage
      setResources({
        cpu: Math.floor(Math.random() * 40 + 30), // 30-70%
        memory: Math.floor(Math.random() * 30 + 50) // 50-80%
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getColorClass = (percentage: number) => {
    if (percentage >= 90) return 'text-danger-500';
    if (percentage >= 70) return 'text-warning-500';
    return 'text-success-500';
  };

  const getStrokeColor = (percentage: number) => {
    if (percentage >= 90) return '#ef4444'; // danger-500
    if (percentage >= 70) return '#f59e0b'; // warning-500
    return '#22c55e'; // success-500
  };

  const renderCircularGauge = (
    percentage: number,
    label: string,
    icon: string
  ) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="relative w-28 h-28">
          {/* Background circle */}
          <svg className="transform -rotate-90 w-28 h-28">
            <circle
              cx="56"
              cy="56"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-dark-border"
            />
            {/* Progress circle */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              stroke={getStrokeColor(percentage)}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xs text-dark-muted mb-0.5">{icon}</div>
            <div className={`text-xl font-bold ${getColorClass(percentage)}`}>
              {percentage}%
            </div>
          </div>
        </div>

        {/* Label */}
        <div className="text-sm font-medium text-dark-text">{label}</div>
      </div>
    );
  };

  return (
    <div className="h-full flex items-center justify-around px-4">
      {renderCircularGauge(resources.cpu, 'CPU Usage', '🔥')}
      {renderCircularGauge(resources.memory, 'Memory', '💾')}
    </div>
  );
};

export default ResourceUtilization;
