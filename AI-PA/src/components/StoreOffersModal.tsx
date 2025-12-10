'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MallStore, StoreOffer, isOfferValid, getDaysRemaining } from '@/lib/mall-stores-data';

interface StoreOffersModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  storeName: string;
}

export default function StoreOffersModal({
  isOpen,
  onClose,
  storeId,
  storeName,
}: StoreOffersModalProps) {
  const [store, setStore] = useState<MallStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && storeId) {
      fetchStoreOffers();
    } else if (!isOpen) {
      // Reset state when modal closes
      setStore(null);
      setLoading(true);
      setCopiedCode(null);
    }
  }, [isOpen, storeId]);

  const fetchStoreOffers = async () => {
    setLoading(true);
    setStore(null); // Reset store data before fetching
    try {
      const response = await fetch(`/api/mall-stores?storeId=${storeId}`);
      const data = await response.json();

      console.log('[StoreOffersModal] API Response:', data); // Debug log

      if (data.success && data.store) {
        setStore(data.store);
        console.log('[StoreOffersModal] Store loaded:', data.store.name, 'Offers:', data.store.offers.length); // Debug log
      } else {
        console.error('[StoreOffersModal] Invalid API response:', data);
      }
    } catch (error) {
      console.error('[StoreOffersModal] Failed to fetch store offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getOfferCategoryColor = (category: StoreOffer['category']) => {
    const colors = {
      discount: 'bg-blue-500',
      bogo: 'bg-green-500',
      seasonal: 'bg-purple-500',
      clearance: 'bg-red-500',
      new_arrival: 'bg-pink-500',
      exclusive: 'bg-amber-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  const getOfferCategoryLabel = (category: StoreOffer['category']) => {
    const labels = {
      discount: 'Discount',
      bogo: 'BOGO',
      seasonal: 'Seasonal',
      clearance: 'Clearance',
      new_arrival: 'New Arrival',
      exclusive: 'Exclusive',
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
              <p className="text-subtle-light dark:text-subtle-dark">Loading offers...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!store) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4">
              error
            </span>
            <p className="text-subtle-light dark:text-subtle-dark">Store not found</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const activeOffers = store.offers.filter(isOfferValid);
  const expiredOffers = store.offers.filter(offer => !isOfferValid(offer));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <span className="material-symbols-outlined text-amber-500">local_offer</span>
            {storeName} - Offers & Deals
          </DialogTitle>
          <p className="text-sm text-subtle-light dark:text-subtle-dark mt-2">
            {activeOffers.length} active {activeOffers.length === 1 ? 'offer' : 'offers'}
            {expiredOffers.length > 0 && ` • ${expiredOffers.length} expired`}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Active Offers */}
          {activeOffers.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Active Offers
              </h3>
              {activeOffers.map(offer => (
                <div
                  key={offer.id}
                  className="bg-card-light dark:bg-card-dark rounded-xl p-5 border-2 border-amber-500/30 shadow-md"
                >
                  {/* Offer Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-bold text-lg">{offer.title}</h4>
                        <Badge className={`${getOfferCategoryColor(offer.category)} text-white text-xs border-0`}>
                          {getOfferCategoryLabel(offer.category)}
                        </Badge>
                        {offer.isFeatured && (
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs border-0">
                            ⭐ FEATURED
                          </Badge>
                        )}
                      </div>
                      {offer.discountText && (
                        <div className="inline-flex items-center gap-1 bg-amber-500/20 px-3 py-1 rounded-full mb-2">
                          <span className="material-symbols-outlined text-amber-500 text-sm">sell</span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            {offer.discountText}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Offer Description */}
                  <p className="text-default-light dark:text-default-dark mb-4">
                    {offer.description}
                  </p>

                  {/* Offer Code */}
                  {offer.offerCode && (
                    <div className="bg-background-light/50 dark:bg-background-dark/50 rounded-lg p-3 mb-4 border border-dashed border-amber-500/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-subtle-light dark:text-subtle-dark mb-1">Promo Code</p>
                          <p className="font-mono font-bold text-lg text-amber-600 dark:text-amber-400">
                            {offer.offerCode}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyCode(offer.offerCode!)}
                          className="text-teal-500 border-teal-500 hover:bg-teal-500/10"
                        >
                          <span className="material-symbols-outlined text-base mr-1">
                            {copiedCode === offer.offerCode ? 'check' : 'content_copy'}
                          </span>
                          {copiedCode === offer.offerCode ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Validity */}
                  <div className="flex items-center gap-2 mb-4 text-sm">
                    <span className="material-symbols-outlined text-green-500 text-sm">schedule</span>
                    <span className="text-subtle-light dark:text-subtle-dark">
                      Valid until {new Date(offer.validUntil).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {getDaysRemaining(offer.validUntil)} days left
                    </Badge>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="bg-background-light/30 dark:bg-background-dark/30 rounded-lg p-4">
                    <h5 className="font-semibold text-sm mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">info</span>
                      Terms & Conditions
                    </h5>
                    <ul className="space-y-1 text-xs text-subtle-light dark:text-subtle-dark">
                      {offer.termsAndConditions.map((term, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-teal-500 mt-0.5">•</span>
                          <span>{term}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Redeem Button */}
                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
                    onClick={() => {
                      // In a real app, this would navigate to the store or activate the offer
                      alert(`Offer "${offer.title}" is ready to use! Show this at the store.`);
                    }}
                  >
                    <span className="material-symbols-outlined text-base mr-2">redeem</span>
                    Redeem Offer
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-card-light dark:bg-card-dark rounded-xl border border-white/30 dark:border-white/10">
              <span className="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4">
                local_offer
              </span>
              <p className="text-subtle-light dark:text-subtle-dark">No active offers available</p>
            </div>
          )}

          {/* Expired Offers (Optional) */}
          {expiredOffers.length > 0 && (
            <div className="space-y-4 mt-6">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-subtle-light dark:text-subtle-dark">
                <span className="material-symbols-outlined">history</span>
                Expired Offers
              </h3>
              {expiredOffers.map(offer => (
                <div
                  key={offer.id}
                  className="bg-card-light/50 dark:bg-card-dark/50 rounded-xl p-4 border border-white/20 dark:border-white/10 opacity-60"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{offer.title}</h4>
                      <p className="text-xs text-subtle-light dark:text-subtle-dark line-clamp-2">
                        {offer.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      Expired
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

