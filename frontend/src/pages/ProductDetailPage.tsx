import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { AppDispatch, addToCart } from '../store';
import { productAPI, api } from '../services/api';

export function ProductDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      productAPI.getOne(id),
      api.get(`/reviews/product/${id}`).catch(() => ({ data: { data: [] } })),
    ])
      .then(([productRes, reviewsRes]) => {
        setProduct(productRes.data.data);
        setReviews(reviewsRes.data.data);
      })
      .catch(() => toast.error('Failed to load product'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-64" />
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
            <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="text-5xl mb-3">🔍</div>
        <p className="text-gray-500 dark:text-gray-400">Product not found</p>
        <button
          onClick={() => navigate('/marketplace')}
          className="text-sm text-green-600 hover:underline mt-2"
        >
          Back to marketplace
        </button>
      </div>
    );
  }

  const CATEGORY_EMOJIS: Record<string, string> = {
    seeds: '🌱', fertilizers: '🧪', pesticides: '🌿',
    tools: '🔧', plants: '🪴', soil: '🌍',
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 flex items-center gap-1 transition-colors"
      >
        ← Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Image */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div
            className="h-72 bg-gray-50 dark:bg-gray-800 flex items-center justify-center cursor-zoom-in"
            onClick={() => product.images?.length > 0 && setLightboxOpen(true)}
          >
            {product.images?.[activeImage] ? (
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-7xl">{CATEGORY_EMOJIS[product.category] || '📦'}</span>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 p-3">
              {product.images.map((img: string, i: number) => (
                <img
                  key={i}
                  src={img}
                  alt={`${product.name} ${i + 1}`}
                  onClick={() => setActiveImage(i)}
                  className={`w-14 h-14 object-cover rounded-lg border-2 cursor-pointer transition-colors ${
                    i === activeImage ? 'border-green-500' : 'border-transparent hover:border-green-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
          <div>
            <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full capitalize">
              {product.category}
            </span>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-2 leading-snug">
              {product.name}
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${i < Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'}`}
                >
                  ★
                </span>
              ))}
              <span className="text-xs text-gray-400">
                ({product.totalReviews} review{product.totalReviews !== 1 ? 's' : ''})
              </span>
            </div>
          </div>

          <div>
            <span className="text-3xl font-bold text-green-600">
              ₹{product.price?.toLocaleString()}
            </span>
            <span className="text-sm text-gray-400 ml-1">/ {product.unit}</span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-white font-medium"
              >
                −
              </button>
              <span className="px-4 py-2.5 text-sm font-medium dark:text-white border-x border-gray-200 dark:border-gray-700">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-white font-medium"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              🛒 Add to cart
            </button>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Stock available:{' '}
            <span className={product.stock > 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
              {product.stock > 0 ? `${product.stock} ${product.unit}` : 'Out of stock'}
            </span>
          </div>

          {product.sellerId?.isVerified && (
            <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-xl">
              <span>✓</span>
              <span>
                Verified seller · <strong>{product.sellerId?.businessName}</strong> · {product.sellerId?.state}
              </span>
            </div>
          )}

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            Customer reviews ({reviews.length})
          </h2>
          <div className="space-y-4">
            {reviews.map((r: any) => (
              <div
                key={r._id}
                className="border-b border-gray-50 dark:border-gray-800 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-xs font-semibold text-green-700 dark:text-green-400">
                    {r.userId?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {r.userId?.name}
                    </span>
                    {r.isVerifiedPurchase && (
                      <span className="ml-2 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-full">
                        ✓ Verified purchase
                      </span>
                    )}
                  </div>
                  <div className="flex ml-auto">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-xs ${i < r.rating ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed ml-10">
                  {r.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Lightbox / Slideshow */}
      {lightboxOpen && product.images?.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white text-3xl leading-none hover:text-gray-300"
          >
            ×
          </button>

          {product.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImage((i: number) => (i - 1 + product.images.length) % product.images.length);
              }}
              className="absolute left-2 sm:left-6 text-white text-4xl px-3 py-2 hover:text-gray-300"
            >
              ‹
            </button>
          )}

          <img
            src={product.images[activeImage]}
            alt={`${product.name} ${activeImage + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[95vw] max-h-[85vh] object-contain"
          />

          {product.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImage((i: number) => (i + 1) % product.images.length);
              }}
              className="absolute right-2 sm:right-6 text-white text-4xl px-3 py-2 hover:text-gray-300"
            >
              ›
            </button>
          )}

          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 text-white text-sm">
              {activeImage + 1} / {product.images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}