"use client";

import { useState, useEffect, DragEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Upload,
  BarChart2,
  MessageCircle,
  Menu,
  User,
} from "lucide-react";

export default function UploadPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [profile, setProfile] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [endpointStatus, setEndpointStatus] = useState<
    { name: string; status: "idle" | "pending" | "success" | "error" }[]
  >([]);
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
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
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
    setEndpointStatus([
      { name: "OpenAI", status: "pending" },
      { name: "Claude", status: "pending" },
      { name: "Gemini", status: "pending" },
    ]);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("profile", JSON.stringify(profile));

    const endpoints = [
      { name: "OpenAI", url: "/api/analyze/openai" },
      { name: "Claude", url: "/api/analyze/claude" },
      { name: "Gemini", url: "/api/analyze/gemini" },
    ];

    const collectedAnalyses: any[] = [];

    await Promise.all(
      endpoints.map(async ({ name, url }) => {
        try {
          const res = await fetch(url, {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const error = await res.text();
            toast.error(`${name} error: ${error}`);
            setEndpointStatus((prev) =>
              prev.map((item) =>
                item.name === name ? { ...item, status: "error" } : item
              )
            );
            return;
          }

          const { analysis } = await res.json();
          collectedAnalyses.push(analysis);
          setEndpointStatus((prev) =>
            prev.map((item) =>
              item.name === name ? { ...item, status: "success" } : item
            )
          );
        } catch (err: any) {
          console.error(`❌ ${name} failed:`, err);
          toast.error(`${name} failed: ${err.message}`);
          setEndpointStatus((prev) =>
            prev.map((item) =>
              item.name === name ? { ...item, status: "error" } : item
            )
          );
        }
      })
    );

    if (collectedAnalyses.length === 0) {
      toast.error("No analysis received. Try again.");
      setLoading(false);
      return;
    }

    const id = collectedAnalyses[0]?.id || Date.now().toString();
    const newEntry = {
      id,
      date: new Date().toISOString(),
      chartImage: preview,
      profileSnapshot: profile,
      analyses: collectedAnalyses,
    };

    const existing = localStorage.getItem("tradingcoach_history");
    const history = existing ? JSON.parse(existing) : [];
    history.unshift(newEntry);
    localStorage.setItem("tradingcoach_history", JSON.stringify(history));

    setLoading(false);
    toast.success("Analysis complete!");
    router.push(`/history?id=${id}`);
  };

  return (
    <main className="max-w-md mx-auto px-4 py-16 text-center ">
      <h1 className="text-4xl font-extrabold text-[#00ff88] mb-6 flex items-center gap-2 font-orbitron justify-center">
        <Upload className="w-8 h-8 text-black" />
        Upload & Analyze
      </h1>
      <p className="text-gray-200 mb-8">
        <strong className="text-[#00ff88]">Upload a screenshot</strong> of your
        trading chart to get AI-driven analysis.
      </p>

      <div
        className={`transition-all duration-300 border-2 border-[#00ff88] rounded-xl p-8 bg-[#1a1a1a] cursor-pointer shadow-[0_0_10px_rgba(0,255,136,0.3)] neon-border ${
          dragActive ? "bg-[#00ff88]/10" : ""
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
          <div className="text-gray-200">
            Drag & drop your chart here or{" "}
            <span className="text-[#00ff88] font-medium underline cursor-pointer">
              browse
            </span>
          </div>
        </label>
      </div>

      {preview && (
        <div className="mt-8 mb-6">
          <img
            src={preview}
            alt="Preview Image"
            className="mx-auto max-w-full max-h-96 rounded-xl border border-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.3)] neon-border transition-all duration-300"
          />
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={loading || !image}
        className="mt-4 w-full bg-gradient-to-r from-[#00ff88] to-[#00cc70] text-black hover:bg-[#00ff88]/90 shadow-[0_0_10px_#00ff88] disabled:bg-gray-500 disabled:text-gray-300 disabled:shadow-none"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin mr-2 h-5 w-5 text-black"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Analyzing...
          </>
        ) : (
          "Analyze with AI"
        )}
      </Button>

      {endpointStatus.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold text-[#00ff88] text-center font-orbitron">
            Analysis Progress
          </h2>
          {endpointStatus.map(({ name, status }) => (
            <div
              key={name}
              className="bg-[#1a1a1a] border border-[#00ff88] rounded-lg p-4 shadow-[0_0_10px_rgba(0,255,136,0.3)] neon-border animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <span className="text-[#00ff88] font-orbitron font-semibold">
                  {name}
                </span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    status === "pending"
                      ? "bg-[#00ff88]/50 animate-pulse"
                      : status === "success"
                      ? "bg-[#00ff88] shadow-[0_0_10px_#00ff88]"
                      : "bg-[#ff3333] shadow-[0_0_10px_#ff3333]"
                  }`}
                >
                  {status === "success" && (
                    <svg
                      className="w-4 h-4 text-black"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {status === "error" && (
                    <svg
                      className="w-4 h-4 text-black"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
