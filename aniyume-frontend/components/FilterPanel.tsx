"use client";

interface FilterPanelProps {
    filters: {
        status: string;
        type: string;
        sort: string;
    };
    onChange: (key: string, value: string) => void;
}

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
    return (
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-800 rounded-lg">
            <select
                value={filters.status}
                onChange={(e) => onChange('status', e.target.value)}
                className="bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
                <option value="">Все статусы</option>
                <option value="FINISHED">Завершен</option>
                <option value="RELEASING">Выходит</option>
                <option value="NOT_YET_RELEASED">Анонс</option>
            </select>

            <select
                value={filters.type}
                onChange={(e) => onChange('type', e.target.value)}
                className="bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
                <option value="">Все типы</option>
                <option value="TV">TV Сериал</option>
                <option value="MOVIE">Фильм</option>
                <option value="OVA">OVA</option>
                <option value="ONA">ONA</option>
            </select>

            <select
                value={filters.sort}
                onChange={(e) => onChange('sort', e.target.value)}
                className="bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ml-auto"
            >
                <option value="popularity">По популярности</option>
                <option value="average_rating">По рейтингу</option>
                <option value="created_at">По дате добавления</option>
                <option value="aired_from">По дате выхода</option>
            </select>
        </div>
    );
}
