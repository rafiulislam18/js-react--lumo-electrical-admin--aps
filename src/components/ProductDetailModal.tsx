import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../lib/api';
import { X, Loader, AlertCircle, Star, TrendingUp, Package } from 'lucide-react';

interface ReviewItem {
  id: number;
  user: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface QuestionItem {
  id: number;
  question: string;
  answer: string | null;
  is_answered: boolean;
  asked_by: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  answered_at: string | null;
}


interface ProductDetail {
  id: number;
  name: string;
  description: string;
  price: string;
  old_price: string | null;
  image: string;
  category: {
    id: number;
    name: string;
  };
  avg_rating: number;
  total_reviews: number;
  in_stock: boolean;
  stock_quantity: number;
  sold_count: number;
  badge: 'Hot' | 'New' | 'Sale' | '';
  discount_percentage: number;
  created_at: string;
  updated_at: string;
  specifications: Record<string, string>;
  reviews: ReviewItem[];
  questions: QuestionItem[];
}

interface ProductDetailModalProps {
  productId: number;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ productId, onClose }) => {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProductDetail();
  }, [productId]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authenticatedFetch(`/products/${productId}/`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch product'}`);
      }
      const data = await response.json();
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'Hot':
        return 'bg-gradient-to-br from-red-500 to-pink-600 text-white';
      case 'New':
        return 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white';
      case 'Sale':
        return 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-auto bg-slate-800/80 border border-slate-700/60 rounded-2xl shadow-2xl backdrop-blur">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

        {/* Header */}
        <div className="sticky top-0 bg-slate-800/95 backdrop-blur border-b border-slate-700/50 p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white truncate">Product Details</h2>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
              <p className="text-slate-400">Loading product details...</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-400/30 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          ) : product ? (
            <div className="space-y-6">
              {/* Image + Quick Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Image */}
                <div className="flex items-start">
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-900/60 border border-slate-700/40">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.badge && (
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded ${getBadgeStyle(product.badge)}`}>
                          {product.badge}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="flex flex-col gap-4">
                  {/* Name & Category */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1">{product.category.name}</p>
                    <h3 className="text-2xl font-bold text-white mb-2">{product.name}</h3>
                  </div>

                  {/* Rating & Sold */}
                  <div className="flex items-center gap-4">
                    {product.avg_rating > 0 ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/15 ring-1 ring-amber-400/20">
                        <Star size={16} className="fill-amber-400 text-amber-400" />
                        <div>
                          <p className="font-bold text-amber-300">{product.avg_rating}</p>
                          <p className="text-xs text-amber-300/70">({product.total_reviews} reviews)</p>
                        </div>
                      </div>
                    ) : (
                      <div className="px-3 py-2 text-slate-400 text-sm">No reviews yet</div>
                    )}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-500/15 ring-1 ring-sky-400/20">
                      <TrendingUp size={16} className="text-sky-400" />
                      <div>
                        <p className="font-bold text-sky-300">{product.sold_count}</p>
                        <p className="text-xs text-sky-300/70">Sold</p>
                      </div>
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="rounded-lg border border-slate-700/40 bg-slate-700/20 p-3">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Stock Status</p>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${product.in_stock ? 'text-emerald-400' : 'text-red-400'}`}>
                        {product.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <span className="text-sm text-slate-400">{product.stock_quantity} units</span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="rounded-lg border border-slate-700/40 bg-slate-700/20 p-3">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Price</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-cyan-300">R{product.price}</span>
                      {product.old_price && (
                        <span className="text-lg line-through text-slate-500">R{product.old_price}</span>
                      )}
                      {product.discount_percentage > 0 && (
                        <span className="text-sm font-bold text-rose-400">-{Math.round(product.discount_percentage)}%</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-xl border border-slate-700/40 bg-slate-700/20 p-4">
                <h3 className="text-sm font-bold text-white mb-3">Description</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{product.description}</p>
              </div>

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="rounded-xl border border-slate-700/40 bg-slate-700/20 p-4">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Package size={16} className="text-emerald-300" />
                    Specifications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2 p-2 rounded bg-slate-800/60">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-500 mb-0.5">{key}</p>
                          <p className="text-sm text-slate-200 break-words">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {product.reviews && product.reviews.length > 0 && (
                <div className="rounded-xl border border-slate-700/40 bg-slate-700/20 p-4">
                  <h3 className="text-sm font-bold text-white mb-4">Recent Reviews</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {product.reviews.map((review) => (
                      <div key={review.id} className="p-3 bg-slate-800/60 rounded border border-slate-700/40">
                        <div className="flex items-start justify-between mb-1.5">
                          <p className="font-semibold text-white text-sm">{review.user}</p>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mb-1">{formatDate(review.created_at)}</p>
                        <p className="text-sm text-slate-300">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions & Answers */}
              {product.questions && product.questions.length > 0 && (
                <div className="rounded-xl border border-slate-700/40 bg-slate-700/20 p-4">
                  <h3 className="text-sm font-bold text-white mb-4">Questions & Answers</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {product.questions.map((question) => (
                      <div key={question.id} className="p-3 bg-slate-800/60 rounded border border-slate-700/40">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-white text-sm">{question.asked_by.first_name} {question.asked_by.last_name}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            question.is_answered
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'bg-amber-500/15 text-amber-300'
                          }`}>
                            {question.is_answered ? 'Answered' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 mb-2"><strong>Q:</strong> {question.question}</p>
                        {question.answer ? (
                          <p className="text-sm text-slate-300 pl-3 border-l-2 border-cyan-400/30"><strong>A:</strong> {question.answer}</p>
                        ) : (
                          <p className="text-sm text-slate-400 italic">No answer yet</p>
                        )}
                        <p className="text-xs text-slate-500 mt-2">{formatDate(question.created_at)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs text-slate-500 space-y-1 p-3 rounded bg-slate-800/40">
                <p>Created: {formatDate(product.created_at)}</p>
                <p>Last Updated: {formatDate(product.updated_at)}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
