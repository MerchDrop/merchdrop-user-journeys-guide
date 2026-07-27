import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  User,
  Clock,
  Activity,
  FileText,
  Lock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>(demoLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const filteredLogs = logs.filter((log) => {
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performed_by.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesModule && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Audit & Security Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            Chronological audit log tracking admin actions, role grants, rate modifications, and payout approvals.
          </p>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Action Logs</p>
              <h3 className="text-2xl font-bold mt-2">{logs.length} Actions Recorded</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Activity className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Security Audits</p>
              <h3 className="text-2xl font-bold mt-2 text-green-600">Verified System</h3>
            </div>
            <div className="p-3 bg-green-500/10 rounded-xl text-green-600">
              <Lock className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Admin Sessions</p>
              <h3 className="text-2xl font-bold mt-2 text-blue-600">1 Online</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
              <User className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>System Activity Trail</CardTitle>
              <CardDescription>View detailed history of all administrative operations.</CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search admin, action..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>

              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-40 text-sm">
                  <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="payouts">Payouts</SelectItem>
                  <SelectItem value="promotions">Promotions</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="cms">CMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Performed By</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-4 px-4 text-xs font-mono text-muted-foreground">{log.timestamp}</td>
                    <td className="py-4 px-4 font-semibold text-foreground">{log.action}</td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="capitalize">
                        {log.module}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-primary font-medium">{log.performed_by}</td>
                    <td className="py-4 px-4 text-xs text-muted-foreground max-w-sm truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const demoLogs = [
  {
    id: 'log-1',
    timestamp: '2026-07-27 22:30:12',
    action: 'Updated Shipping Zone Rates',
    module: 'shipping',
    performed_by: 'admin@merchdrop.com',
    details: 'Updated Axis 1 delivery fee to ₦3,000 NGN',
  },
  {
    id: 'log-2',
    timestamp: '2026-07-27 21:15:40',
    action: 'Approved Creator Payout',
    module: 'payouts',
    performed_by: 'admin@merchdrop.com',
    details: 'Released payout of ₦85,000 to Blessing Okafor',
  },
  {
    id: 'log-3',
    timestamp: '2026-07-27 18:45:00',
    action: 'Created Promo Code',
    module: 'promotions',
    performed_by: 'admin@merchdrop.com',
    details: 'Created coupon WELCOME10 with 10% discount',
  },
  {
    id: 'log-4',
    timestamp: '2026-07-27 15:20:10',
    action: 'Updated Top Marquee Ticker',
    module: 'cms',
    performed_by: 'admin@merchdrop.com',
    details: 'Changed text to "SUMMER SCORCH MERCH OUT NOW!!!"',
  },
];
