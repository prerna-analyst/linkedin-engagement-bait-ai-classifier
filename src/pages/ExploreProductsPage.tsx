import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Product, Category, Store } from '../types/index.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { api } from '../services/api.ts';

interface ExploreProductsPageProps {
  initialQuery?: string;
  initialCategory?: string;
  navigate: (path: string) => void;
  onSetAlert: (product: Product) => void;
}

export const ExploreProductsPage: React.FC<ExploreProductsPageProps> = ({
  initialQuery = '',
  initialCategory = 'all',
  navigate,
  onSetAlert,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedStore, setSelectedStore] = useState('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Available brands computed dynamically
  const [allBrands, setAllBrands] = useState<string[]>([]);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, storeRes] = await Promise.all([api.getCategories(), api.getStores()]);
        setCategories(catRes.categories || []);
        setStores(storeRes.stores || []);
      } catch (err) {
        console.warn('Error fetching metadata:', err);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchFiltered() {
      setIsLoading(true);
      try {
        const res = await api.getProducts({
          query: query || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          brand: selectedBrand !== 'all' ? selectedBrand : undefined,
          store: selectedStore !== 'all' ? selectedStore : undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          sortBy,
          page,
          limit: 12,
        });

        if (isMounted) {
          setProducts(res.products || []);
          setTotalCount(res.total || 0);
          setTotalPages(res.totalPages || 1);

          // Extract unique brands
          const brands = Array.from(new Set(res.products.map((p) => p.brand))).filter(Boolean);
          setAllBrands((prev) => Array.from(new Set([...prev, ...brands])));
        }
      } catch (err) {
        console.warn('Error fetching products:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchFiltered();
    return () => {
      isMounted = false;
    };
  }, [query, selectedCategory, selectedBrand, selectedStore, minPrice, maxPrice, sortBy, page]);

  const handleResetFilters = () => {
    setQuery('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedStore('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Explore Verified Products
              </h1>
              <p className="text-xs text-[#A0A8B8] mt-1">
                Showing {totalCount} verified items across Amazon, Flipkart, Croma, and Reliance Digital.
              </p>
            </div>

            {/* Quick search input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A8B8]" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, model or brand..."
                className="w-full bg-[#141821] border border-[#283042] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-[#A0A8B8] focus:outline-none focus:border-[#FFD43B]"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A0A8B8] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Layout: Sidebar filters + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-6 bg-[#141821] border border-[#1C2230] rounded-2xl p-5 h-fit">
            <div className="flex items-center justify-between pb-3 border-b border-[#283042]">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#FFD43B]" /> Filter Catalog
              </span>
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-[#4F8CFF] hover:underline cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* Categories filter */}
            <div>
              <label className="block text-xs font-semibold text-white mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD43B]"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand filter */}
            <div>
              <label className="block text-xs font-semibold text-white mb-2">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD43B]"
              >
                <option value="all">All Brands</option>
                {allBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Store filter */}
            <div>
              <label className="block text-xs font-semibold text-white mb-2">Store Availability</label>
              <select
                value={selectedStore}
                onChange={(e) => {
                  setSelectedStore(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD43B]"
              >
                <option value="all">All Stores</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-xs font-semibold text-white mb-2">Price Range (₹ INR)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Min ₹"
                  className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD43B]"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Max ₹"
                  className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD43B]"
                />
              </div>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs font-semibold text-white mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD43B]"
              >
                <option value="newest">Newest Additions</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="discount">Biggest Discount (%)</option>
              </select>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="bg-[#141821] border border-[#1C2230] rounded-2xl p-4 h-80 animate-pulse flex flex-col justify-between"
                  >
                    <div className="w-full aspect-square bg-[#0B0D12] rounded-xl" />
                    <div className="h-4 bg-[#1C2230] rounded w-3/4 mt-4" />
                    <div className="h-4 bg-[#1C2230] rounded w-1/2 mt-2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-[#141821] border border-[#1C2230] rounded-3xl p-12 text-center">
                <Search className="w-12 h-12 text-[#A0A8B8] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No products match your criteria</h3>
                <p className="text-xs text-[#A0A8B8] max-w-sm mx-auto mb-6">
                  Try broadening your price range, clearing brand filters, or searching with another keyword.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FFD43B] text-black hover:bg-[#ffe066] transition cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenDetails={(id) => navigate(`/products/${id}`)}
                      onCompare={(id) => navigate(`/compare?product=${id}`)}
                      onSetAlert={onSetAlert}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-between border-t border-[#1C2230] pt-6">
                    <span className="text-xs text-[#A0A8B8]">
                      Page {page} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-xl bg-[#141821] border border-[#283042] text-[#A0A8B8] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-xl bg-[#141821] border border-[#283042] text-[#A0A8B8] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
