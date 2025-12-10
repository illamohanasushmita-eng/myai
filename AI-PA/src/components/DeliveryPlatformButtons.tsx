'use client';

import React from 'react';
import { deliveryPlatforms, type DeliveryPlatform } from '@/lib/food-delivery-platforms';

// Simplified platform interface for serialization (no functions)
interface SerializedPlatform {
  id: string;
  name: string;
  logo: string;
  color: string;
}

interface DeliveryPlatformButtonsProps {
  platforms: SerializedPlatform[]; // Changed from DeliveryPlatform[] to SerializedPlatform[]
  restaurantName: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  compact?: boolean;
}

export default function DeliveryPlatformButtons({
  platforms,
  restaurantName,
  address,
  latitude,
  longitude,
  city,
  compact = false,
}: DeliveryPlatformButtonsProps) {
  if (platforms.length === 0) {
    return (
      <div className="text-xs text-subtle-light dark:text-subtle-dark mt-2">
        🏪 Dine-in only • No delivery available
      </div>
    );
  }

  const handlePlatformClick = (serializedPlatform: SerializedPlatform) => {
    // Find the full platform object with methods from the deliveryPlatforms array
    const fullPlatform = deliveryPlatforms.find(p => p.id === serializedPlatform.id);

    if (!fullPlatform) {
      console.error(`[FOOD-DELIVERY] Platform not found: ${serializedPlatform.id}`);
      return;
    }

    const url = fullPlatform.generateUrl(restaurantName, address, latitude, longitude, city);
    console.log(`[FOOD-DELIVERY] Opening ${fullPlatform.name} for "${restaurantName}":`, url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => handlePlatformClick(platform)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: `${platform.color}15`,
              color: platform.color,
              border: `1px solid ${platform.color}40`,
            }}
            title={`Order on ${platform.name}`}
          >
            <span>{platform.logo}</span>
            <span>{platform.name}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="text-xs font-semibold text-default-light dark:text-default-dark flex items-center gap-1">
        <span className="material-symbols-outlined text-sm">delivery_dining</span>
        <span>Order Delivery:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => handlePlatformClick(platform)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
            style={{
              backgroundColor: `${platform.color}15`,
              color: platform.color,
              border: `1.5px solid ${platform.color}60`,
            }}
            title={`Order on ${platform.name}`}
          >
            <span className="text-lg">{platform.logo}</span>
            <span>Order on {platform.name}</span>
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </button>
        ))}
      </div>
      <div className="text-xs text-subtle-light dark:text-subtle-dark">
        💡 Click to open the restaurant on your preferred delivery platform
      </div>
    </div>
  );
}

