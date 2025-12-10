import { NextRequest, NextResponse } from 'next/server';
import { getStoresByMallId, getStoreById } from '@/lib/mall-stores-data';

// GET /api/mall-stores?mallId=xxx
// Returns all stores for a specific mall
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mallId = searchParams.get('mallId');
    const storeId = searchParams.get('storeId');

    // If storeId is provided, return specific store
    if (storeId) {
      const store = getStoreById(storeId);
      
      if (!store) {
        return NextResponse.json(
          { error: 'Store not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        store,
      });
    }

    // If mallId is provided, return all stores for that mall
    if (mallId) {
      const stores = getStoresByMallId(mallId);

      return NextResponse.json({
        success: true,
        mallId,
        count: stores.length,
        stores,
      });
    }

    // If neither is provided, return error
    return NextResponse.json(
      { error: 'mallId or storeId parameter is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[MALL-STORES] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch mall stores',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

