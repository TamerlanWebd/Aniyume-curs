'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

const webhookSchema = z.object({
    url: z.string().url('Must be a valid URL'),
    events: z.array(z.string()).min(1, 'Select at least one event'),
});

type WebhookFormValues = z.infer<typeof webhookSchema>;

interface WebhookFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: WebhookFormValues) => void;
    isLoading?: boolean;
}

const availableEvents = [
    { id: 'anime.created', label: 'Anime Created' },
    { id: 'anime.updated', label: 'Anime Updated' },
    { id: 'anime.deleted', label: 'Anime Deleted' },
];

export function WebhookForm({ open, onOpenChange, onSubmit, isLoading }: WebhookFormProps) {
    const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<WebhookFormValues>({
        resolver: zodResolver(webhookSchema),
        defaultValues: {
            url: '',
            events: [],
        },
    });

    const selectedEvents = watch('events');

    const toggleEvent = (eventId: string) => {
        const currentEvents = selectedEvents || [];
        if (currentEvents.includes(eventId)) {
            setValue('events', currentEvents.filter(e => e !== eventId));
        } else {
            setValue('events', [...currentEvents, eventId]);
        }
    };

    const handleFormSubmit = (data: WebhookFormValues) => {
        onSubmit(data);
        reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Register Webhook</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="url" className="text-sm font-medium">Webhook URL</label>
                        <Input
                            id="url"
                            placeholder="https://example.com/webhook"
                            {...register('url')}
                        />
                        {errors.url && <span className="text-xs text-red-500">{errors.url.message}</span>}
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Events</label>
                        <div className="space-y-2">
                            {availableEvents.map((event) => (
                                <div key={event.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={event.id}
                                        checked={selectedEvents?.includes(event.id)}
                                        onCheckedChange={() => toggleEvent(event.id)}
                                    />
                                    <label
                                        htmlFor={event.id}
                                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {event.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {errors.events && <span className="text-xs text-red-500">{errors.events.message}</span>}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Registering...' : 'Register Webhook'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
