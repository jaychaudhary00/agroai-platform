import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { RootState, AppDispatch, fetchProducts, addToCart } from '../store';

const CATS = ['all','seeds','fertilizers','pesticides','tools','plants','soil'];

export function MarketplacePage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { items: products, loading } = useSelector((s: RootState) => s.products);
  const { user } = useSelector((s: RootState) => s.auth);
  const { items: cartItems } = useSelector((s: RootState) => s.cart);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState('');

  // Sellers and admins cannot buy
  const canBuy = user?.role === 'farmer' || user?.role === 'homegrower';

  useEffect(() => {
    dispatch(fetchProducts({ category: cat !== 'all' ? cat : undefined, search: search || undefined, sort: sort || undefined }));
  }, [dispatch, cat, sort]);

  useEffect(() => {
    const t = setTimeout(() => {
      dispatch(fetchProducts({ category: cat !== 'all' ? cat : undefined, search: search || undefined }));
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const cartCount = cartItems.reduce((s: number, i: any) => s + i.quantity, 0);

  const handleAddToCart = (product: any) => {
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('marketplace.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('marketplace.subtitle')}</p>
        </div>
        {canBuy && cartCount > 0 && (
          <Link to="/checkout" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            🛒 {t('marketplace.cart')} ({cartCount})
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('marketplace.search')}
          className="flex-1 min-w-48 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <option value="">{t('marketplace.sortBy')}</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              cat === c ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-300'
            }`}>
            {c === 'all' ? t('marketplace.allCategories') : t(`marketplace.${c}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 animate-pulse">
              <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl mb-3" />
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="text-5xl mb-3 opacity-30">🛒</div>
          <p className="text-gray-400">{t('marketplace.noProducts')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product: any) => (
            <div key={product._id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow group">
              <Link to={`/marketplace/${product._id}`}>
                <div className="h-36 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <span className="text-4xl">{product.category === 'seeds' ? '🌱' : product.category === 'fertilizers' ? '🧪' : product.category === 'pesticides' ? '🌿' : product.category === 'tools' ? '🔧' : '📦'}</span>
                  )}
                </div>
              </Link>
              <div className="p-3">
                <Link to={`/marketplace/${product._id}`}>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 hover:text-green-600">{product.name}</h3>
                </Link>
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-yellow-400 text-xs">★</span>
                  <span className="text-xs text-gray-500">{product.rating?.toFixed(1) || '0.0'} ({product.totalReviews || 0})</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-base font-bold text-green-600">₹{product.price}</div>
                    <div className="text-xs text-gray-400">per {product.unit}</div>
                  </div>
                  {product.stock === 0 ? (
                    <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg">{t('marketplace.outOfStock')}</span>
                  ) : canBuy ? (
                    <button onClick={() => handleAddToCart(product)}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                      + {t('marketplace.addToCart')}
                    </button>
                  ) : (
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-lg">{t('marketplace.inStock')}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
