"use client";

import React from "react";

import { useState, useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, X, Shield } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogOverlay,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MapViewProps {
  location: { lat: number; lng: number };
  onCardStateChange?: (isOpen: boolean) => void;
}

interface SafetyData {
  id: string;
  lat: number;
  lng: number;
  score: number;
  comment: string;
  createdAt: string;
  createdBy: {
    name: string;
    isVerified: boolean;
  };
}

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem'
};

export function MapView({ location, onCardStateChange }: MapViewProps) {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [safetyData, setSafetyData] = useState<SafetyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<any | null>(null);
  const [showRatingCard, setShowRatingCard] = useState(false);
  const [ratingInput, setRatingInput] = useState({ score: 5, comment: "" });
  const [selectedSafetyData, setSelectedSafetyData] = useState<SafetyData | null>(null);
  const [showSafetyDetails, setShowSafetyDetails] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  })

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null)
  }, [])

  // Load safety data (Mock data for now)
  React.useEffect(() => {
    const loadSafetyData = async () => {
      try {
        // In a real app, this would fetch from an API
        const mockData: SafetyData[] = [
          {
            id: "safety-1",
            lat: location.lat + 0.003,
            lng: location.lng + 0.002,
            score: 9,
            comment: "Well-lit area with regular police patrols. Safe for walking even at night.",
            createdAt: "2023-05-15T14:30:00Z",
            createdBy: {
              name: "Priya S.",
              isVerified: true,
            },
          },
          {
            id: "safety-2",
            lat: location.lat - 0.002,
            lng: location.lng + 0.004,
            score: 3,
            comment: "Poorly lit street with few people around. Avoid at night.",
            createdAt: "2023-05-10T18:45:00Z",
            createdBy: {
              name: "Anjali K.",
              isVerified: true,
            },
          },
          {
            id: "safety-3",
            lat: location.lat + 0.005,
            lng: location.lng - 0.003,
            score: 7,
            comment: "Busy market area. Safe during day, moderate caution at night.",
            createdAt: "2023-05-12T10:15:00Z",
            createdBy: {
              name: "Meera R.",
              isVerified: false,
            },
          },
        ];

        setSafetyData(mockData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading safety data:", error);
      }
    };

    loadSafetyData();
  }, [location]);

  const getSafetyColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 5) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSafetyText = (score: number) => {
    if (score >= 8) return "Safe";
    if (score >= 5) return "Moderate";
    return "Unsafe";
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (showRatingCard || showSafetyDetails) return;

    const lat = e.latLng?.lat();
    const lng = e.latLng?.lng();

    if (lat && lng) {
      setSelectedMarker({ lat, lng });
      setRatingInput({ score: 5, comment: "" });
      setShowRatingCard(true);
      onCardStateChange?.(true);
    }
  };

  const handleMarkerClick = (safetyPoint: SafetyData) => {
    setSelectedSafetyData(safetyPoint);
    setShowSafetyDetails(true);
    onCardStateChange?.(true);
  };

  const handleSaveRating = () => {
    if (!selectedMarker) return;

    const newSafetyData: SafetyData = {
      id: `safety-${Date.now()}`,
      lat: selectedMarker.lat,
      lng: selectedMarker.lng,
      score: ratingInput.score,
      comment: ratingInput.comment,
      createdAt: new Date().toISOString(),
      createdBy: {
        name: "You",
        isVerified: true,
      },
    };

    setSafetyData((prev) => [...prev, newSafetyData]);
    setShowRatingCard(false);
    setSelectedMarker(null);
    onCardStateChange?.(false);

    toast({
      title: "Safety Rating Saved",
      description: "Thank you for contributing to community safety.",
    });
  };

  const handleRatingDialogOpenChange = (open: boolean) => {
    if (!open) {
      if (ratingInput.comment.trim() !== "" || ratingInput.score !== 5) {
        if (!confirm("Discard your safety rating?")) {
          return;
        }
      }
      setShowRatingCard(false);
      setSelectedMarker(null);
      onCardStateChange?.(false);
    }
  };

  const handleSafetyDetailsOpenChange = (open: boolean) => {
    if (!open) {
      setShowSafetyDetails(false);
      setSelectedSafetyData(null);
      onCardStateChange?.(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full rounded-xl relative bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
        <MapPin className="h-8 w-8 text-primary animate-pulse" />
        <span className="ml-2">Loading map...</span>
      </div>
    );
  }

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={location}
      zoom={15}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
    >
      {safetyData.map((point) => (
        <Marker
          key={point.id}
          position={{ lat: point.lat, lng: point.lng }}
          onClick={() => handleMarkerClick(point)}
        />
      ))}
       {selectedMarker && (
        <Marker
          position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
        />
      )}
      <></>

       {/* Safety Legend */}
       <div className="absolute top-2 right-2 bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70 p-2 rounded-md text-xs">
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
          <span>Safe</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
          <span>Moderate</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
          <span>Unsafe</span>
        </div>
      </div>

      {/* Rating Card Dialog */}
      <Dialog open={showRatingCard} onOpenChange={handleRatingDialogOpenChange}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Rate this location</span>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Safety Rating: {ratingInput.score}/10</span>
                <span className="text-sm font-medium">{getSafetyText(ratingInput.score)}</span>
              </div>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[ratingInput.score]}
                onValueChange={(value) => setRatingInput((prev) => ({ ...prev, score: value[0] }))}
              />
            </div>

            <div>
              <label className="text-sm block mb-1">Comments</label>
              <Textarea
                placeholder="Share your experience about this location..."
                value={ratingInput.comment}
                onChange={(e) => setRatingInput((prev) => ({ ...prev, comment: e.target.value }))}
                className="h-24"
              />
            </div>

            <Button onClick={handleSaveRating} className="w-full">
              Save Rating
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Safety Details Dialog */}
      <Dialog open={showSafetyDetails} onOpenChange={handleSafetyDetailsOpenChange}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              {/* Title with color indicator */}
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full ${selectedSafetyData ? getSafetyColor(selectedSafetyData.score) : 'bg-gray-400'} mr-2`}></div>
                <h3 className="font-medium">{selectedSafetyData ? getSafetyText(selectedSafetyData.score) : ''} Area</h3>
              </div>
              {/* Close button */}
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </DialogTitle>
          </DialogHeader>

          {/* Details Content */}
          {selectedSafetyData && (
            <div className="space-y-3 pt-4">
              {/* Rating Bar */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Safety Rating</span>
                  <span className="text-sm font-medium">{selectedSafetyData.score}/10</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getSafetyColor(selectedSafetyData.score)}`}
                    style={{ width: `${selectedSafetyData.score * 10}%` }}
                  ></div>
                </div>
              </div>

              {/* Comment */}
              <div>
                <p className="text-sm whitespace-pre-wrap">{selectedSafetyData.comment}</p>
              </div>

              {/* Footer with user info */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback>{selectedSafetyData.createdBy.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{selectedSafetyData.createdBy.name}</span>
                </div>
                {selectedSafetyData.createdBy.isVerified && (
                  <div className="flex items-center text-xs text-green-500">
                    <Shield className="h-3 w-3 mr-1" />
                    <span>Verified</span>
                  </div>
                )}
              </div>

              {/* Date */}
              <div className="text-xs text-gray-500">
                {new Date(selectedSafetyData.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Coordinates */}
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70 p-2 rounded-md text-xs">
        Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
      </div>
    </GoogleMap>
  ) : <></>
}
