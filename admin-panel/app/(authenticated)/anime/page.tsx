'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, Anime } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimeForm } from '@/components/anime/anime-form';
import { Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnimePage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAnime, setEditingAnime] = useState<Anime | null>(null);

    const queryClient = useQueryClient();

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to first page on new search
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = useQuery({
        queryKey: ['anime', page, debouncedSearch],
        queryFn: async () => {
            const response = await apiService.getAnimeList(page, debouncedSearch);
            return response.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: apiService.createAnime,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['anime'] });
            toast.success('Anime created successfully');
            setIsFormOpen(false);
        },
        onError: () => {
            toast.error('Failed to create anime');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Anime> }) => apiService.updateAnime(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['anime'] });
            toast.success('Anime updated successfully');
            setIsFormOpen(false);
            setEditingAnime(null);
        },
        onError: () => {
            toast.error('Failed to update anime');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: apiService.deleteAnime,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['anime'] });
            toast.success('Anime deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete anime');
        },
    });

    const handleSubmit = (values: any) => {
        // Transform data to match backend expectations
        const transformedData = {
            title: values.title,
            genre: values.genre,
            description: values.description,
            imageUrl: values.image_url, // Backend expects camelCase
            // slug is not sent to backend - it's auto-generated there or not used
        };

        if (editingAnime) {
            updateMutation.mutate({ id: editingAnime.id, data: transformedData });
        } else {
            createMutation.mutate(transformedData);
        }
    };

    const handleEdit = (anime: Anime) => {
        setEditingAnime(anime);
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this anime?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleCreate = () => {
        setEditingAnime(null);
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Anime Management</h1>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Add Anime
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search anime..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Genre</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.data?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                            No anime found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.data?.map((anime) => (
                                        <TableRow key={anime.id}>
                                            <TableCell className="font-medium">{anime.title}</TableCell>
                                            <TableCell>{anime.genre}</TableCell>
                                            <TableCell>{anime.slug}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(anime)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(anime.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}

                    {/* Pagination controls could go here */}
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1 || isLoading}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!data?.meta || page >= (data.meta.last_page || 1) || isLoading}
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <AnimeForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={editingAnime}
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}
