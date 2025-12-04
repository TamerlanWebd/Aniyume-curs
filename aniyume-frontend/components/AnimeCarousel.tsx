'use client';

import Slider, { Settings } from "react-slick";
import { useState, CSSProperties, MouseEventHandler, useEffect } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { fetchTrendingAnime } from "@/lib/api/animeApi";
import { Anime } from "@/lib/api/types";

interface AnimeItem {
  id: number;
  src: string;
  alt: string;
}

interface ArrowProps {
  className?: string;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

function PrevArrow({ onClick }: ArrowProps) {
  return (
    <div
      className="absolute left-[-60px] top-1/2 -translate-y-1/2 cursor-pointer z-20 hover:scale-125 transition-transform"
      onClick={onClick}
    >
      <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </div>
  );
}

function NextArrow({ onClick }: ArrowProps) {
  return (
    <div
      className="absolute right-[-60px] top-1/2 -translate-y-1/2 cursor-pointer z-20 hover:scale-125 transition-transform"
      onClick={onClick}
    >
      <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </div>
  );
}

export default function AnimeCarousel() {
  const [current, setCurrent] = useState<number>(0);
  const [animeList, setAnimeList] = useState<AnimeItem[]>([]);

  useEffect(() => {
    const loadAnime = async () => {
      try {
        console.log('🔄 Fetching trending anime...');
        const response = await fetchTrendingAnime();
        console.log('📦 Response:', response);
        console.log('📊 Response data:', response.data);

        const data = response.data;
        if (Array.isArray(data) && data.length > 0) {
          console.log(`✅ Found ${data.length} anime items`);
          const items = data.map((anime: Anime) => {
            console.log('Anime item:', anime);
            return {
              id: anime.id,
              src: anime.cover_image || anime.banner_image || '/images/anime.jpg',
              alt: anime.title_romaji || anime.title_english || 'Anime'
            };
          });
          console.log('🎨 Mapped items:', items);
          setAnimeList(items);
        } else {
          console.error('❌ Data is not an array or is empty:', data);
        }
      } catch (error) {
        console.error("❌ Failed to fetch trending anime", error);
      }
    };
    loadAnime();
  }, []);

  if (animeList.length === 0) {
    return null; // or loading state
  }

  const settings: Settings = {
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "0px",
    slidesToShow: Math.min(5, animeList.length),
    speed: 800,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: false,
    cssEase: "ease-out",
    focusOnSelect: true,
    beforeChange: (oldIndex: number, newIndex: number) => setCurrent(newIndex),
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, animeList.length),
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  const getSlideStyles = (index: number): CSSProperties => {
    const totalItems = animeList.length;

    let distance = Math.abs(current - index);
    if (distance > totalItems / 2) {
      distance = totalItems - distance;
    }

    const leftNeighborIndex = (current - 1 + totalItems) % totalItems;
    const rightNeighborIndex = (current + 1) % totalItems;

    let scale = 1;
    let opacity = 1;
    let zIndex = 1;
    let filter = 'none';
    let xOffset = 0;

    if (distance === 0) {
      scale = 1.3;
      zIndex = 10;
      opacity = 1;
      filter = 'brightness(1.1)';
      xOffset = 0;
    } else if (index === leftNeighborIndex) {
      scale = 0.95;
      zIndex = 5;
      opacity = 1;
      xOffset = -50;
    } else if (index === rightNeighborIndex) {
      scale = 0.95;
      zIndex = 5;
      opacity = 1;
      xOffset = 50;
    } else {
      scale = 0.65;
      zIndex = 1;
      opacity = 0.6;
      xOffset = 0;
    }

    return {
      transform: `translateX(${xOffset}px) scale(${scale})`,
      opacity: opacity,
      zIndex: zIndex,
      filter: filter,
      transition: 'all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)',
    };
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto mt-24 px-16">
      <Slider {...settings}>
        {animeList.map((anime, index) => {
          const styles = getSlideStyles(index);

          return (
            <div key={anime.id} className="py-16 px-2 outline-none">
              <div
                className="mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl relative"
                style={{
                  ...styles,
                  width: '100%',
                  maxWidth: '300px',
                  aspectRatio: '3/4',
                }}
              >
                <img
                  src={anime.src}
                  alt={anime.alt}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
}