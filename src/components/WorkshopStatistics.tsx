import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface WorkshopStatisticsProps {
  checklistList: any[];
}

export const useWorkshopStatistics = (checklistList: any[]) => {
  const [showWorkshopReport, setShowWorkshopReport] = useState(false);
  const [expandedStatus, setExpandedStatus] = useState<{workshop: string, status: string} | null>(null);
  const [notifiedIssues, setNotifiedIssues] = useState<Set<string>>(new Set());

  const playNotificationSound = (type: 'critical' | 'warning') => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'critical') {
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else {
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  };

  useEffect(() => {
    checklistList.forEach(checklist => {
      checklist.items.forEach((item: any) => {
        const itemKey = `${checklist.id}-${item.id}`;
        if ((item.status === 'in_restriction' || item.status === 'in_stop') && !notifiedIssues.has(itemKey)) {
          const statusText = item.status === 'in_restriction' ? 'В ограничении' : 'В стопе';
          playNotificationSound('critical');
          toast.error(`${statusText}: ${item.text}`, {
            description: `Цех: ${checklist.workshop} | Чек-лист: ${checklist.name}`,
            duration: 8000,
          });
          setNotifiedIssues(prev => new Set(prev).add(itemKey));
        }
      });
    });
  }, [checklistList]);

  const getWorkshopStats = () => {
    const stats: any = {};
    checklistList.forEach(cl => {
      if (!stats[cl.workshop]) {
        stats[cl.workshop] = { 
          done: 0, 
          inRestriction: 0, 
          inStop: 0, 
          pending: 0,
          items: { done: [], inRestriction: [], inStop: [], pending: [] }
        };
      }
      cl.items.forEach((item: any) => {
        const itemWithChecklist = { ...item, checklistName: cl.name };
        if (item.status === 'done') {
          stats[cl.workshop].done++;
          stats[cl.workshop].items.done.push(itemWithChecklist);
        } else if (item.status === 'in_restriction') {
          stats[cl.workshop].inRestriction++;
          stats[cl.workshop].items.inRestriction.push(itemWithChecklist);
        } else if (item.status === 'in_stop') {
          stats[cl.workshop].inStop++;
          stats[cl.workshop].items.inStop.push(itemWithChecklist);
        } else {
          stats[cl.workshop].pending++;
          stats[cl.workshop].items.pending.push(itemWithChecklist);
        }
      });
    });
    return stats;
  };

  const workshopStats = getWorkshopStats();
  const totalIssues = Object.values(workshopStats).reduce((sum: number, ws: any) => 
    sum + ws.inRestriction + ws.inStop, 0
  );

  return {
    showWorkshopReport,
    setShowWorkshopReport,
    expandedStatus,
    setExpandedStatus,
    workshopStats,
    totalIssues
  };
};

interface WorkshopReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workshopStats: any;
  expandedStatus: {workshop: string, status: string} | null;
  setExpandedStatus: (status: {workshop: string, status: string} | null) => void;
}

export const WorkshopReportDialog = ({ 
  open, 
  onOpenChange, 
  workshopStats, 
  expandedStatus, 
  setExpandedStatus 
}: WorkshopReportDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="BarChart3" size={24} />
            Отчёт по цехам
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {Object.keys(workshopStats).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Нет данных по цехам
            </p>
          ) : (
            Object.entries(workshopStats).map(([workshop, stats]: [string, any]) => (
              <Card key={workshop}>
                <CardContent className="pt-6">
                  <h3 className="font-bold text-lg mb-4">{workshop}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { key: 'done', label: 'Выполнено', color: 'bg-green-500', icon: 'CheckCircle2' },
                      { key: 'pending', label: 'В работе', color: 'bg-blue-500', icon: 'Clock' },
                      { key: 'inRestriction', label: 'Ограничение', color: 'bg-orange-500', icon: 'AlertTriangle' },
                      { key: 'inStop', label: 'Стоп', color: 'bg-red-500', icon: 'XCircle' }
                    ].map(({ key, label, color, icon }) => (
                      <button
                        key={key}
                        onClick={() => {
                          const current = expandedStatus?.workshop === workshop && expandedStatus?.status === key;
                          setExpandedStatus(current ? null : { workshop, status: key });
                        }}
                        className="text-center p-4 rounded-lg border-2 border-border hover:border-primary transition-all"
                      >
                        <div className={`w-12 h-12 rounded-full ${color} mx-auto mb-2 flex items-center justify-center`}>
                          <Icon name={icon} size={24} className="text-white" />
                        </div>
                        <p className="text-2xl font-bold">{stats[key]}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </button>
                    ))}
                  </div>
                  {expandedStatus?.workshop === workshop && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        {expandedStatus.status === 'done' && 'Выполненные задачи'}
                        {expandedStatus.status === 'pending' && 'Задачи в работе'}
                        {expandedStatus.status === 'inRestriction' && 'Ограничения'}
                        {expandedStatus.status === 'inStop' && 'Стопы'}
                      </h4>
                      <ul className="space-y-2">
                        {stats.items[expandedStatus.status].map((item: any, idx: number) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <Badge variant="outline" className="mt-0.5">{item.checklistName}</Badge>
                            <span>{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
