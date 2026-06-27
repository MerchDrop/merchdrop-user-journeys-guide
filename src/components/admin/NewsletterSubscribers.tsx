import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Mail, Download, Users } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

export default function NewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('newsletter_subscribers' as any)
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Could not load subscribers.', variant: 'destructive' });
    } else {
      setSubscribers((data as Subscriber[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('newsletter_subscribers' as any)
      .update({ is_active: !current })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update subscriber.', variant: 'destructive' });
    } else {
      setSubscribers(prev =>
        prev.map(s => (s.id === id ? { ...s, is_active: !current } : s))
      );
    }
  };

  const exportCSV = () => {
    const active = subscribers.filter(s => s.is_active);
    const csv = ['Email,Subscribed At', ...active.map(s => `${s.email},${s.subscribed_at}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const active = subscribers.filter(s => s.is_active).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Newsletter Subscribers
        </CardTitle>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{active} active</span>
          </div>
          <Button size="sm" variant="outline" onClick={exportCSV} disabled={active === 0}>
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>
        ) : subscribers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No subscribers yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {subscribers.map(sub => (
              <div key={sub.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{sub.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(sub.subscribed_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={sub.is_active ? 'default' : 'secondary'}>
                    {sub.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive(sub.id, sub.is_active)}
                    className="text-xs"
                  >
                    {sub.is_active ? 'Deactivate' : 'Reactivate'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
