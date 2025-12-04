'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Webhook as WebhookIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { WebhookForm } from '@/components/webhooks/webhook-form';

export default function WebhooksPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['webhooks'],
        queryFn: async () => {
            const response = await apiService.getWebhooks();
            return response.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: apiService.createWebhook,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['webhooks'] });
            toast.success('Webhook created successfully');
            setIsFormOpen(false);
        },
        onError: () => {
            toast.error('Failed to create webhook');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: apiService.deleteWebhook,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['webhooks'] });
            toast.success('Webhook deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete webhook');
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
                    <p className="text-muted-foreground">Manage event notifications for your integrations.</p>
                </div>
                <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Register Webhook
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Webhooks</CardTitle>
                    <CardDescription>List of all registered endpoints receiving events.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>URL</TableHead>
                                    <TableHead>Events</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.data?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                            No webhooks registered.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.data?.map((webhook) => (
                                        <TableRow key={webhook.id}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <WebhookIcon className="h-4 w-4 text-muted-foreground" />
                                                {webhook.url}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {webhook.events.map(event => (
                                                        <Badge key={event} variant="outline" className="text-xs">{event}</Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={webhook.is_active ? "default" : "secondary"} className={webhook.is_active ? "bg-green-500 hover:bg-green-600" : ""}>
                                                    {webhook.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600"
                                                    onClick={() => {
                                                        if (confirm('Delete this webhook?')) deleteMutation.mutate(webhook.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <WebhookForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={(data) => createMutation.mutate(data)}
                isLoading={createMutation.isPending}
            />
        </div>
    );
}
