'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Anime } from '@/lib/api';
import { useEffect } from 'react';

const animeSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z.string().min(1, 'Slug is required'),
    genre: z.string().min(1, 'Genre is required'),
    description: z.string().min(1, 'Description is required'),
    image_url: z.string().url('Must be a valid URL'),
});

type AnimeFormValues = z.infer<typeof animeSchema>;

interface AnimeFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Anime | null;
    onSubmit: (data: AnimeFormValues) => void;
    isLoading?: boolean;
}

export function AnimeForm({ open, onOpenChange, initialData, onSubmit, isLoading }: AnimeFormProps) {
    const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<AnimeFormValues>({
        resolver: zodResolver(animeSchema),
        defaultValues: {
            title: '',
            slug: '',
            genre: '',
            description: '',
            image_url: '',
        },
    });

    // Watch title field to auto-generate slug
    const titleValue = watch('title');

    // Auto-generate slug from title when creating new anime
    useEffect(() => {
        if (!initialData && titleValue) {
            // Transliteration map for Cyrillic to Latin
            const translitMap: Record<string, string> = {
                'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z',
                'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
                'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
                'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
                'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z',
                'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R',
                'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
                'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
            };

            const generatedSlug = titleValue
                .split('')
                .map(char => translitMap[char] || char) // Transliterate Cyrillic
                .join('')
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '') // Remove special characters (now safe for Latin)
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
                .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

            setValue('slug', generatedSlug);
        }
    }, [titleValue, initialData, setValue]);

    useEffect(() => {
        if (initialData) {
            setValue('title', initialData.title);
            setValue('slug', initialData.slug);
            setValue('genre', initialData.genre);
            setValue('description', initialData.description);
            setValue('image_url', initialData.image_url);
        } else {
            reset({
                title: '',
                slug: '',
                genre: '',
                description: '',
                image_url: '',
            });
        }
    }, [initialData, setValue, reset, open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Anime' : 'Create Anime'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="title" className="text-sm font-medium">Title</label>
                        <Input id="title" {...register('title')} />
                        {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="slug" className="text-sm font-medium">Slug</label>
                        <Input id="slug" {...register('slug')} readOnly={!initialData} />
                        {!initialData && <span className="text-xs text-muted-foreground">Auto-generated from title</span>}
                        {errors.slug && <span className="text-xs text-red-500">{errors.slug.message}</span>}
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="genre" className="text-sm font-medium">Genre</label>
                        <Input id="genre" {...register('genre')} />
                        {errors.genre && <span className="text-xs text-red-500">{errors.genre.message}</span>}
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="description" className="text-sm font-medium">Description</label>
                        <Input id="description" {...register('description')} />
                        {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="image_url" className="text-sm font-medium">Image URL</label>
                        <Input id="image_url" {...register('image_url')} />
                        {errors.image_url && <span className="text-xs text-red-500">{errors.image_url.message}</span>}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
