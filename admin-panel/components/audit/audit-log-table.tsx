'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export interface AuditLog {
    id: number;
    user_id: string;
    action: string;
    model_type: string;
    model_id: string;
    old_values: any;
    new_values: any;
    ip_address: string;
    created_at: string;
}

interface AuditLogTableProps {
    logs: AuditLog[];
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Changes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell>{format(new Date(log.created_at), 'HH:mm:ss')}</TableCell>
                            <TableCell>{log.user_id}</TableCell>
                            <TableCell>
                                <Badge variant={getVariant(log.action)}>
                                    {log.action.toUpperCase()}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <span className="text-xs text-muted-foreground">
                                    {log.model_type.split('\\').pop()} #{log.model_id}
                                </span>
                            </TableCell>
                            <TableCell className="max-w-[300px] truncate text-xs font-mono">
                                {JSON.stringify(log.new_values)}
                            </TableCell>
                        </TableRow>
                    ))}
                    {logs.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                No recent activity
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function getVariant(action: string): "default" | "destructive" | "secondary" | "outline" {
    switch (action) {
        case 'create': return 'default'; // Blue-ish usually
        case 'update': return 'secondary';
        case 'delete': return 'destructive';
        default: return 'outline';
    }
}
