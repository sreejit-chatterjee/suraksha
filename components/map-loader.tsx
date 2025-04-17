"use client";

import { LoadScript } from "@react-google-maps/api";
import React from 'react';

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export function MapLoader({ children }: { children: React.ReactNode }) {
  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey}>
      {children}
    </LoadScript>
  );
}