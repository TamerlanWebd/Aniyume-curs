// components/AnimeList.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';
import { fetchAnimeList } from '@/lib/api/animeApi';
import { Anime } from '@/lib/api/types';

interface AnimeItemProps {
  id: number;
  title: string;
  imageUrl: string;
  rating: string;
}

const AnimeItem: React.FC<AnimeItemProps> = ({
  id,
  title,
  imageUrl,
  rating,
}) => {
  return (
    <Link href={`/anime/${id}`}>
      <div
        className="
          relative group
          bg-white rounded-md overflow-hidden 
          border-gray-400 border
          transition-all duration-300
          hover:scale-[1.2] 
          hover:shadow-3xl 
          w-60 h-[400px] 
          flex flex-col
          cursor-pointer
        "
      >
        <div className="absolute top-2 left-2 bg-[#21D0B8] text-white text-xs font-bold px-2 py-1 rounded-full z-10 flex items-center">
          {rating} <FaStar className="ml-1 text-white text-[10px]" />
        </div>

        <div className="relative w-full h-[260px] grow">
          <Image src={imageUrl} alt={title} fill className="object-cover" />
        </div>

        <div className="bg-[#21D0B8] w-full py-2 px-2 text-center">
          <button className=" text-white border font-semibold w-full py-2 rounded-lg transition shadow-md text-sm">
            Смотреть онлайн
          </button>
        </div>
      </div>
    </Link>
  );
};

interface AnimeListProps {
  title: string;
}

const AnimeList: React.FC<AnimeListProps> = ({ title }) => {
  const [animeData, setAnimeData] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const loadAnime = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching anime list, page:', currentPage);
        const response = await fetchAnimeList({ page: currentPage, perPage: itemsPerPage });
        console.log('📦 AnimeList response:', response);
        console.log('📊 AnimeList data:', response.data);

        if (response.data) {
          if (response.data.data && Array.isArray(response.data.data)) {
            console.log(`✅ Found ${response.data.data.length} anime in list (paginated)`);
            setAnimeData(response.data.data);
          } else if (Array.isArray(response.data)) {
            console.log(`✅ Found ${response.data.length} anime in list (array)`);
            setAnimeData(response.data);
          } else {
            console.error('❌ Unexpected data structure:', response.data);
          }
        } else {
          console.error('❌ No data in response');
        }
      } catch (error) {
        console.error('❌ Failed to fetch anime:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAnime();
  }, [currentPage]);

  const totalPages = 6;

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-extrabold text-center mb-16 text-gray-800">{title}</h2>
        <div className="text-center">Загрузка...</div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-4xl font-extrabold text-center mb-16 text-gray-800">
        {title}
      </h2>

      <div className="grid grid-cols-5 gap-8 justify-items-center">
        {animeData.map((anime) => (
          <AnimeItem
            key={anime.id}
            id={anime.anilist_id}
            title={anime.title_romaji}
            imageUrl={anime.cover_image || anime.banner_image || '/images/anime1.jpg'}
            rating={(anime.average_score / 10).toFixed(1)}
          />
        ))}
      </div>

      <div className="flex justify-center mt-14 space-x-3 items-center">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-gray-600"
        >
          <FaChevronLeft size={16} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-4 py-2 rounded-lg text-base font-semibold transition ${currentPage === i + 1
              ? "bg-[#21D0B8] text-white shadow-md"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-gray-600"
        >
          <FaChevronRight size={16} />
        </button>
      </div>
    </section>
  );
};

export default AnimeList;