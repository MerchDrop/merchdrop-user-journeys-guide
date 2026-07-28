import React, { useState } from 'react';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Send,
  User,
  Mail,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function AdminSupport() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplyOpen, setIsReplyOpen] = useState(false);

  const handleSendReply = (newStatus: 'in_progress' | 'resolved') => {
    if (!selectedTicket) return;
    const updated = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: newStatus,
          replies: [
            ...(t.replies || []),
            { sender: 'Admin Support', message: replyMessage, sent_at: new Date().toISOString() },
          ],
        };
      }
      return t;
    });
    setTickets(updated);
    setIsReplyOpen(false);
    setReplyMessage('');
    toast({
      title: 'Reply Sent',
      description: `Response sent to ${selectedTicket.customer_email}. Status marked as ${newStatus}.`,
    });
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
    const matchesSearch =
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            Customer Support & Inquiries
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage contact requests, customer order inquiries, and send email replies.
          </p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Open Support Tickets</p>
              <h3 className="text-2xl font-bold mt-2 text-amber-600">
                {tickets.filter((t) => t.status === 'open').length} Open
              </h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <h3 className="text-2xl font-bold mt-2 text-blue-600">
                {tickets.filter((t) => t.status === 'in_progress').length} Tickets
              </h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resolved Tickets</p>
              <h3 className="text-2xl font-bold mt-2 text-green-600">
                {tickets.filter((t) => t.status === 'resolved').length} Resolved
              </h3>
            </div>
            <div className="p-3 bg-green-500/10 rounded-xl text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Customer Inquiries Inbox</CardTitle>
              <CardDescription>
                Respond to customer tickets and manage resolution workflow.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subject or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>

              <Tabs defaultValue="all" onValueChange={setSelectedStatus}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="open">Open</TabsTrigger>
                  <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                  <th className="py-3 px-4">Ticket #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-primary">#{ticket.id}</td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-foreground">{ticket.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{ticket.customer_email}</p>
                    </td>
                    <td className="py-4 px-4 font-medium text-foreground max-w-xs truncate">
                      {ticket.subject}
                    </td>
                    <td className="py-4 px-4 text-xs text-muted-foreground">{ticket.created_at}</td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          ticket.status === 'resolved'
                            ? 'default'
                            : ticket.status === 'in_progress'
                            ? 'secondary'
                            : 'outline'
                        }
                        className={
                          ticket.status === 'resolved'
                            ? 'bg-green-600'
                            : ticket.status === 'open'
                            ? 'border-amber-500 text-amber-600'
                            : ''
                        }
                      >
                        {ticket.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setIsReplyOpen(true);
                        }}
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1" /> Respond
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Details & Reply Modal */}
      <Dialog open={isReplyOpen} onOpenChange={setIsReplyOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ticket #{selectedTicket?.id} Details</DialogTitle>
            <DialogDescription>{selectedTicket?.subject}</DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-muted/40 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">{selectedTicket.customer_name}</span>
                  <span className="text-xs text-muted-foreground">{selectedTicket.customer_email}</span>
                </div>
                <p className="text-muted-foreground pt-1 border-t">{selectedTicket.message}</p>
              </div>

              {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Previous Replies</p>
                  {selectedTicket.replies.map((rep: any, idx: number) => (
                    <div key={idx} className="p-3 bg-primary/10 rounded-lg text-xs space-y-1">
                      <p className="font-bold text-primary">{rep.sender}</p>
                      <p>{rep.message}</p>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Textarea
                  rows={4}
                  placeholder="Type your response to customer..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => handleSendReply('in_progress')}
            >
              Send & Mark In Progress
            </Button>
            <Button onClick={() => handleSendReply('resolved')}>
              <CheckCircle2 className="h-4 w-4 mr-2" /> Send & Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
