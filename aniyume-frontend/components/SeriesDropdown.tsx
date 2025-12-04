'use client';
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

interface SeriesDropdownProps {
  series: string[];
  onSelect?: (item: string) => void;
}

export default function SeriesDropdown({ series, onSelect }: SeriesDropdownProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(series[0] || "Выберите серию");

  const chooseSeries = (item: string) => {
    setSelected(item);
    setOpen(false);
    if (onSelect) onSelect(item);
  };

  return (
    <div className="relative w-64">
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center justify-between
                   shadow-sm hover:shadow-md transition-all duration-200"
      >
        <span className="text-gray-700">{selected}</span>
        <FaChevronDown className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-2 shadow-lg
                        overflow-hidden max-h-60 overflow-y-auto animate-fadeIn">
          {series.map((item, idx) => (
            <li
              key={idx}
              onClick={() => chooseSeries(item)}
              className="px-4 py-2 cursor-pointer hover:bg-[#2EC4B6] hover:text-white transition-colors"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
