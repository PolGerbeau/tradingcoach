"use client";

import { useState, useEffect, DragEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function UploadPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("tradingcoach_profile");
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1]; // remove data:image/png;base64,
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      const base64 = await fileToBase64(file);
      setBase64Image(base64);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      const base64 = await fileToBase64(file);
      setBase64Image(base64);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleUpload = async () => {
    if (!image) {
      toast.error("Please select an image first.");
      return;
    }

    if (image.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Max 5MB.");
      return;
    }

    setLoading(true);
    console.log("📤 Uploading image...");
    console.log("📸 Image file:", image);
    console.log("🧠 Profile:", profile);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("profile", JSON.stringify(profile));

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 20000); // 20s timeout

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        console.error("❌ Server error:", error);
        toast.error("Server error: " + (error?.error || res.statusText));
        setLoading(false);
        return;
      }

      const json = await res.json();
      console.log("📩 Response from server:", json);

      const { analyses } = json;

      if (!analyses || !Array.isArray(analyses)) {
        toast.error("Analysis failed. Please try again.");
        setLoading(false);
        return;
      }

      const id = analyses[0]?.id || Date.now().toString();
      const newEntry = {
        id,
        date: new Date().toISOString(),
        chartImage: preview,
        profileSnapshot: profile,
        analyses,
      };

      const existing = localStorage.getItem("tradingcoach_history");
      const history = existing ? JSON.parse(existing) : [];
      history.unshift(newEntry);
      localStorage.setItem("tradingcoach_history", JSON.stringify(history));

      setLoading(false);
      router.push(`/history?id=${id}`);
    } catch (err: any) {
      console.error("❌ Unexpected error:", err);
      if (err.name === "AbortError") {
        toast.error("Request timed out. Please try again.");
      } else {
        toast.error("Unexpected error: " + err.message);
      }
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto px-6 py-20 text-center">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">
        Upload & Analyze
      </h1>
      <p className="text-gray-600 mb-8">
        <strong>Upload a screenshot</strong> of your trading chart (e.g., from
        TradingView) to get personalized AI analysis from multiple LLMs, based
        on your trading profile and strategy.
      </p>

      <div
        className={`transition-all duration-300 border-2 rounded-2xl p-8 cursor-pointer ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDrag}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          id="upload-input"
        />
        <label htmlFor="upload-input" className="block w-full text-center">
          <div className="text-gray-500">
            Drag & drop your chart here or{" "}
            <span className="text-blue-600 font-medium underline cursor-pointer">
              browse
            </span>
          </div>
        </label>
      </div>

      {preview && (
        <div className="mt-8 mb-6">
          <img
            src={preview}
            alt="Preview"
            className="mx-auto max-w-full max-h-96 rounded-xl border shadow-md transition-all duration-300"
          />
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={loading || !image}
        className="mt-4 bg-black text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all"
      >
        {loading ? "Analyzing..." : "Analyze with AI"}
      </button>
    </main>
  );
}
