'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MallStore, getActiveOffersCount, getFeaturedOffer, getDaysRemaining } from '@/lib/mall-stores-data';

interface MallStoreDirectoryProps {
  mallId: string;
  mallName: string;
  onBack: () => void;
  onViewOffers: (storeId: string, storeName: string) => void;
}

export default function MallStoreDirectory({
  mallId,
  mallName,
  onBack,
  onViewOffers,
}: MallStoreDirectoryProps) {
  const [stores, setStores] = useState<MallStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchStores();
  }, [mallId]);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/mall-stores?mallId=${mallId}`);
      const data = await response.json();

      if (data.success) {
        setStores(data.stores);
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique floors and categories
  const floors = ['all', ...Array.from(new Set(stores.map(s => s.floor)))];
  const categories = ['all', ...Array.from(new Set(stores.map(s => s.category)))];

  // Filter stores
  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFloor = selectedFloor === 'all' || store.floor === selectedFloor;
    const matchesCategory = selectedCategory === 'all' || store.category === selectedCategory;
    return matchesSearch && matchesFloor && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-subtle-light dark:text-subtle-dark">Loading stores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-md frosted-glass border border-white/30 dark:border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-teal-500"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-500">store</span>
              {mallName}
            </h2>
            <p className="text-sm text-subtle-light dark:text-subtle-dark mt-1">
              {stores.length} stores • {stores.filter(s => getActiveOffersCount(s) > 0).length} stores with active offers
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">
            search
          </span>
          <Input
            type="text"
            placeholder="Search stores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-md frosted-glass border border-white/30 dark:border-white/10">
        <div className="space-y-3">
          {/* Floor Filter */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Floor</label>
            <div className="flex flex-wrap gap-2">
              {floors.map(floor => (
                <Button
                  key={floor}
                  variant={selectedFloor === floor ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFloor(floor)}
                  className={selectedFloor === floor ? 'bg-teal-500 hover:bg-teal-600' : ''}
                >
                  {floor === 'all' ? 'All Floors' : floor}
                </Button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 'bg-teal-500 hover:bg-teal-600' : ''}
                >
                  {category === 'all' ? 'All Categories' : category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Store List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {filteredStores.length} {filteredStores.length === 1 ? 'Store' : 'Stores'} Found
        </h3>

        {filteredStores.length === 0 ? (
          <div className="text-center py-12 bg-card-light dark:bg-card-dark rounded-xl border border-white/30 dark:border-white/10">
            <span className="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4">
              store_mall_directory
            </span>
            <p className="text-subtle-light dark:text-subtle-dark">
              No stores found matching your criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredStores.map(store => {
              const activeOffersCount = getActiveOffersCount(store);
              const featuredOffer = getFeaturedOffer(store);

              return (
                <div
                  key={store.id}
                  className="bg-card-light dark:bg-card-dark rounded-xl p-5 shadow-md frosted-glass border border-white/30 dark:border-white/10 hover:shadow-lg transition-shadow"
                >
                  {/* Store Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-bold text-lg">{store.name}</h4>
                        {store.isNew && (
                          <Badge className="bg-green-600 hover:bg-green-700 text-white text-xs border-0">
                            🆕 NEW
                          </Badge>
                        )}
                        {store.isTrending && (
                          <Badge className="bg-orange-600 hover:bg-orange-700 text-white text-xs border-0">
                            🔥 TRENDING
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-subtle-light dark:text-subtle-dark">
                        <span className="material-symbols-outlined text-sm">category</span>
                        <span>{store.category}</span>
                      </div>
                    </div>
                    {store.rating && (
                      <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-lg">
                        <span className="material-symbols-outlined text-amber-500 text-sm">star</span>
                        <span className="font-semibold text-amber-500">{store.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Store Details */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-teal-500 text-sm">location_on</span>
                      <span className="text-subtle-light dark:text-subtle-dark">
                        {store.floor} • {store.location}
                      </span>
                    </div>
                    {store.openingHours && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-teal-500 text-sm">schedule</span>
                        <span className="text-subtle-light dark:text-subtle-dark">{store.openingHours}</span>
                      </div>
                    )}
                    {store.description && (
                      <p className="text-sm text-subtle-light dark:text-subtle-dark mt-2">
                        {store.description}
                      </p>
                    )}
                  </div>

                  {/* Featured Offer Preview */}
                  {featuredOffer && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-amber-500 text-lg">local_offer</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-amber-600 dark:text-amber-400 text-sm">
                              {featuredOffer.title}
                            </span>
                            {featuredOffer.discountText && (
                              <Badge className="bg-amber-600 text-white text-xs border-0">
                                {featuredOffer.discountText}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-subtle-light dark:text-subtle-dark line-clamp-2">
                            {featuredOffer.description}
                          </p>
                          {featuredOffer.validUntil && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                              Expires in {getDaysRemaining(featuredOffer.validUntil)} days
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {activeOffersCount > 0 && (
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 min-w-[140px] bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                        onClick={() => {
                          console.log('[MallStoreDirectory] View Offers clicked:', { storeId: store.id, storeName: store.name, offersCount: activeOffersCount });
                          onViewOffers(store.id, store.name);
                        }}
                      >
                        <span className="material-symbols-outlined text-base mr-1">local_offer</span>
                        View {activeOffersCount} {activeOffersCount === 1 ? 'Offer' : 'Offers'}
                      </Button>
                    )}
                    {store.phone && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-[100px] text-teal-500 border-teal-500 hover:bg-teal-500/10"
                        onClick={() => window.open(`tel:${store.phone}`, '_self')}
                      >
                        <span className="material-symbols-outlined text-base mr-1">call</span>
                        Call
                      </Button>
                    )}
                    {store.website && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-[100px] text-blue-500 border-blue-500 hover:bg-blue-500/10"
                        onClick={() => window.open(store.website, '_blank')}
                      >
                        <span className="material-symbols-outlined text-base mr-1">language</span>
                        Website
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

