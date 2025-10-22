import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar as CalendarIcon, TrendingUp, Package, DollarSign } from 'lucide-react';

interface CalendarEvent {
  date: Date;
  title: string;
  type: 'payout' | 'product' | 'milestone';
  description?: string;
}

interface CalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CalendarDialog({ open, onOpenChange }: CalendarDialogProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  // Sample events for demo
  const events: CalendarEvent[] = [
    {
      date: new Date(2025, 9, 15),
      title: 'Next Payout',
      type: 'payout',
      description: 'Monthly earnings payout'
    },
    {
      date: new Date(2025, 9, 20),
      title: 'Product Launch',
      type: 'product',
      description: 'New collection release'
    },
    {
      date: new Date(2025, 10, 1),
      title: 'Sales Milestone',
      type: 'milestone',
      description: '100 products sold'
    }
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'payout':
        return <DollarSign className="h-4 w-4" />;
      case 'product':
        return <Package className="h-4 w-4" />;
      case 'milestone':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'payout':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'product':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'milestone':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const selectedDateEvents = events.filter(event => 
    selectedDate && 
    event.date.toDateString() === selectedDate.toDateString()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl top-[5%] translate-y-0 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Event Calendar
          </DialogTitle>
          <DialogDescription>
            View your upcoming events, payouts, and milestones
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 overflow-y-auto flex-1 p-6">
          {/* Calendar */}
          <div className="flex flex-col items-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border pointer-events-auto"
              modifiers={{
                event: events.map(e => e.date)
              }}
              modifiersStyles={{
                event: {
                  fontWeight: 'bold',
                  textDecoration: 'underline'
                }
              }}
            />
          </div>

          {/* Events List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {selectedDate ? `Events on ${selectedDate.toLocaleDateString()}` : 'Select a date'}
            </h3>
            
            <ScrollArea className="h-[300px]">
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map((event, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getEventColor(event.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        {getEventIcon(event.type)}
                        <div className="flex-1">
                          <h4 className="font-semibold">{event.title}</h4>
                          {event.description && (
                            <p className="text-sm mt-1 opacity-80">{event.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No events scheduled for this date</p>
                </div>
              )}
            </ScrollArea>

            {/* Upcoming Events Summary */}
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">Upcoming Events</h4>
              <div className="space-y-2">
                {events.slice(0, 3).map((event, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getEventIcon(event.type)}
                      <span>{event.title}</span>
                    </div>
                    <Badge variant="outline">{event.date.toLocaleDateString()}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
