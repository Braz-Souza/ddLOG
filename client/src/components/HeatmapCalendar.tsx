import React, { useState } from 'react';
import { format, startOfYear, eachDayOfInterval, endOfYear, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { HeatmapData } from '@shared/types';

interface HeatmapCalendarProps {
  data: HeatmapData[];
  year?: number;
}

interface TooltipData {
  date: string;
  count: number;
  level: number;
  x: number;
  y: number;
}

const levelColors = {
  0: 'bg-gray-100',
  1: 'bg-green-200', 
  2: 'bg-green-300',
  3: 'bg-green-500',
  4: 'bg-green-700'
};

const levelLabels = {
  0: 'Nenhuma tarefa',
  1: '1-25% concluído',
  2: '26-50% concluído', 
  3: '51-75% concluído',
  4: '76-100% concluído'
};

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ 
  data, 
  year = new Date().getFullYear() 
}) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 11, 31));
  const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

  const dataMap = new Map(data.map(item => [item.date, item]));

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  allDays.forEach((day, index) => {
    if (index === 0) {
      const dayOfWeek = getDay(day);
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push(new Date(0));
      }
    }

    currentWeek.push(day);

    if (currentWeek.length === 7 || index === allDays.length - 1) {
      if (currentWeek.length < 7) {
        while (currentWeek.length < 7) {
          currentWeek.push(new Date(0));
        }
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const handleMouseEnter = (date: Date, event: React.MouseEvent) => {
    if (date.getTime() === 0) return;

    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = dataMap.get(dateStr);
    const rect = event.currentTarget.getBoundingClientRect();
    
    setTooltip({
      date: dateStr,
      count: dayData?.count || 0,
      level: dayData?.level || 0,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const monthLabels = Array.from({ length: 12 }, (_, i) => 
    format(new Date(year, i), 'MMM', { locale: ptBR })
  );

  const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  return (
    <div className="relative">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Progresso em {year}
        </h3>
      </div>

      <div className="inline-block">
        <div className="mb-2 flex text-xs text-gray-500">
          <div className="w-8"></div>
          {monthLabels.map((month, index) => (
            <div
              key={index}
              className="flex-1 text-center"
              style={{ minWidth: `${100 / 12}%` }}
            >
              {month}
            </div>
          ))}
        </div>

        <div className="flex">
          <div className="flex flex-col text-xs text-gray-500 mr-2">
            {weekdayLabels.map((day, index) => (
              <div
                key={day}
                className="h-3 flex items-center"
                style={{ lineHeight: '12px' }}
              >
                {index % 2 === 1 ? day : ''}
              </div>
            ))}
          </div>

          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-rows-7 gap-1">
                {week.map((date, dayIndex) => {
                  if (date.getTime() === 0) {
                    return <div key={dayIndex} className="w-3 h-3"></div>;
                  }

                  const dateStr = format(date, 'yyyy-MM-dd');
                  const dayData = dataMap.get(dateStr);
                  const level = dayData?.level || 0;

                  return (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-gray-400 ${levelColors[level as keyof typeof levelColors]}`}
                      title={`${format(date, 'dd/MM/yyyy', { locale: ptBR })}: ${dayData?.count || 0}% concluído`}
                      onMouseEnter={(e) => handleMouseEnter(date, e)}
                      onMouseLeave={handleMouseLeave}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div>
            Menos
          </div>
          <div className="flex gap-1">
            {Object.entries(levelColors).map(([level, color]) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${color}`}
                title={levelLabels[Number(level) as keyof typeof levelLabels]}
              />
            ))}
          </div>
          <div>
            Mais
          </div>
        </div>
      </div>

      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs rounded py-2 px-3 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div className="font-medium">
            {format(new Date(tooltip.date), 'dd/MM/yyyy', { locale: ptBR })}
          </div>
          <div>
            {tooltip.count}% das tarefas concluídas
          </div>
          <div className="text-gray-300">
            {levelLabels[tooltip.level as keyof typeof levelLabels]}
          </div>
        </div>
      )}
    </div>
  );
};