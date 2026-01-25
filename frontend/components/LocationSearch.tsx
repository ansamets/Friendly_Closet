"use client";
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface LocationResult {
  label: string;
  name: string;
  lat: number;
  lng: number;
}

interface Props {
  onSelect: (location: string, lat: number, lng: number) => void;
  storeName?: string; // Optional: helps us search for "Zara" if location is blank
}

export default function LocationSearch({ onSelect, storeName }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // SEARCH FUNCTION
  const performSearch = async (searchTerm: string, userLat?: number, userLng?: number) => {
    setLoading(true);
    try {
      let url = `/api/geocode?q=${encodeURIComponent(searchTerm)}`;

      // If we have GPS coords, append them to bias results
      const lat = userLat ?? userCoords?.lat;
      const lng = userLng ?? userCoords?.lng;
      if (lat && lng) {
        url += `&lat=${lat}&lon=${lng}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setResults(data.results || []);
      setIsOpen(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // HANDLE GPS CLICK
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });

        // If user already typed a query, re-run it with location bias
        if (query.trim().length >= 3) {
          performSearch(query, latitude, longitude);
        }
        setLoading(false);
      },
      (err) => {
        alert("Could not get location. Please type manually.");
        setLoading(false);
      }
    );
  };

  // Debounce Search for typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length < 3) return;
      performSearch(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Click Outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          placeholder={storeName ? `Find ${storeName} location...` : "Search City or Address..."}
          className="w-full pr-10 p-3 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-stone-200"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            // Reset coords if user starts typing manually
            onSelect(e.target.value, 0, 0);
          }}
        />

        {/* LOADER */}
        {loading && (
          <div className="absolute right-2 top-2">
            <Loader2 className="w-5 h-5 m-1.5 animate-spin text-muted" />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleUseCurrentLocation}
        className="mt-2 text-xs text-stone-500 hover:text-stone-700 underline underline-offset-4"
      >
        Use my location for better results
      </button>

      {/* DROPDOWN RESULTS */}
      {isOpen && results.length > 0 && (
        <ul className="relative w-full mt-2 bg-transparent rounded-xl border border-stone-200 max-h-60 overflow-y-auto">
          {results.map((item, idx) => (
            <li
              key={idx}
              onClick={() => {
                setQuery(item.label);
                setIsOpen(false);
                onSelect(item.label, item.lat, item.lng);
              }}
              className="p-3 hover:bg-stone-50/70 cursor-pointer border-b border-stone-100 last:border-0 flex items-start gap-2"
            >
              <div>
                <p className="text-sm font-medium text-primary">{item.name}</p>
                <p className="text-[10px] text-muted leading-tight">{item.label}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
