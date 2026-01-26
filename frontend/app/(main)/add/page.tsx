"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createItem } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Loader2, Camera } from "lucide-react"; // MapPin removed, inside component now
import LocationSearch from "@/components/LocationSearch"; // Import new component
import Link from "next/link";

export default function AddPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [storeName, setStoreName] = useState("");
  const [storeType, setStoreType] = useState("department_store");

  // NEW LOCATION STATE
  const [locationName, setLocationName] = useState("");
  const [coords, setCoords] = useState<{lat: number | null, lng: number | null}>({ lat: null, lng: null });

  const [materials, setMaterials] = useState("");
  const [rating, setRating] = useState("5");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) return alert("Image and user required");

    setLoading(true);
    const formData = new FormData();

    formData.append("user_id", user.id.toString());
    formData.append("store_name", storeName);
    formData.append("store_type", storeType);

    // SEND EXACT COORDS
    formData.append("location_text", locationName);
    if (coords.lat!=null && coords.lng!=null) {
      formData.append("latitude", coords.lat.toString());
      formData.append("longitude", coords.lng.toString());
    }

    formData.append("materials_text", materials);
    formData.append("rating", rating);
    formData.append("notes", notes);
    formData.append("image", file);

    try {
      await createItem(formData);
      router.push("/home");
    } catch (err) {
      alert("Error uploading item");
    } finally {
      setLoading(false);
    }
  };
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-50 to-white flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <p className="text-stone-600">Please log in to add items.</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-50 to-white">
    <div className="mx-auto w-full max-w-xl px-4 sm:px-6 pb-28 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
            Add New Piece
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Upload a photo, tag where you got it, and save.
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-3xl border border-stone-200 bg-white/80 shadow-sm backdrop-blur">
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
          {/* Photo */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Photo</label>

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                id="file-upload"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />

              <label
                htmlFor="file-upload"
                className={[
                  "group flex flex-col items-center justify-center w-full h-56 sm:h-64",
                  "rounded-2xl border-2 border-dashed transition",
                  file
                    ? "border-blue-400 bg-blue-50/60"
                    : "border-stone-200 hover:bg-stone-50",
                ].join(" ")}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={[
                      "flex h-12 w-12 items-center justify-center rounded-2xl",
                      file ? "bg-blue-100 text-blue-600" : "bg-stone-100 text-stone-500",
                    ].join(" ")}
                  >
                    <Camera className="h-6 w-6" />
                  </div>

                  {file ? (
                    <>
                      <p className="text-sm font-semibold text-blue-700">{file.name}</p>
                      <p className="text-xs text-blue-600/80">Tap to replace</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-stone-800">Tap to upload</p>
                      <p className="text-xs text-stone-500">JPG/PNG, up to ~10MB</p>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Store / Brand</label>
              <input
                type="text"
                placeholder="e.g., Brandy Melville"
                className="w-full rounded-2xl bg-stone-50 px-4 py-3 text-stone-900 placeholder:text-stone-400
                           border border-stone-200 outline-none focus:bg-white focus:ring-4 focus:ring-stone-200/60"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Location</label>
              <LocationSearch
                storeName={storeName} // <--- Pass the name here
                onSelect={(label, lat, lng) => {
                  setLocationName(label);
                  setCoords({ lat, lng });
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Material</label>
              <input
                type="text"
                placeholder="e.g., Cotton"
                className="w-full rounded-2xl bg-stone-50 px-4 py-3 text-stone-900 placeholder:text-stone-400
                           border border-stone-200 outline-none focus:bg-white focus:ring-4 focus:ring-stone-200/60"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Store Type</label>
              <select
                className="w-full rounded-2xl bg-stone-50 px-4 py-3 text-stone-900
                           border border-stone-200 outline-none focus:bg-white focus:ring-4 focus:ring-stone-200/60"
                value={storeType}
                onChange={(e) => setStoreType(e.target.value)}
              >
                <option value="department_store">Department Store</option>
                <option value="high_street_chain">High Street Chain</option>
                <option value="boutique">Boutique</option>
                <option value="thrift">Thrift</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Ranking</label>
              <div className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3 border border-stone-200">
                <input
                  type="range"
                  min="1"
                  max="10"
                  className="w-full accent-stone-900"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                />
                <span className="ml-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-white text-xs font-semibold">
                  {rating}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Notes</label>
              <textarea
                placeholder="Add notes about fit, price, vibe..."
                className="w-full rounded-2xl bg-stone-50 px-4 py-3 text-stone-900 placeholder:text-stone-400
                           border border-stone-200 outline-none focus:bg-white focus:ring-4 focus:ring-stone-200/60 min-h-[120px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-stone-900 text-white py-3.5 font-semibold
                         hover:bg-stone-800 active:scale-[0.99] transition
                         disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              Save
            </button>
          </div>
        </form>
      </div>

      {/* Small spacer to keep bottom nav from overlapping */}
      <div className="h-6" />
    </div>
  </div>
);
}
