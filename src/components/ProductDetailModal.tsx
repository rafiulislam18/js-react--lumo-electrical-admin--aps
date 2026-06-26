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
        return 'text-neg border-neg/[.28]';
      case 'New':
        return 'text-info border-info/[.28]';
      case 'Sale':
        return 'text-accent border-accent/[.28]';
      default:
        return '';
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[7vh] pb-[4vh] bg-black/60 animate-fade">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90%] flex flex-col bg-panel border border-line rounded-card shadow-[0_30px_80px_-20px_rgba(0,0,0,.87)] overflow-hidden animate-pop"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line">
          <div className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
            <Package size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-mono font-semibold text-sm tracking-[.08em] uppercase text-body">Product Details</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel border border-line text-dim hover:text-body hover:border-line2 transition shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-6 h-6 text-accent animate-spin mb-3" />
              <p className="font-mono text-xs text-mute uppercase tracking-[.1em]">Loading product details…</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-4 bg-neg/10 border border-neg/30 rounded-card">
              <AlertCircle className="w-5 h-5 text-neg flex-shrink-0" />
              <p className="text-sm text-neg">{error}</p>
            </div>
          ) : product ? (
            <div className="space-y-5">
              {/* Image + Quick Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Image */}
                <div className="flex items-start">
                  <div className="relative w-full aspect-square rounded-card overflow-hidden bg-panel2 border border-line">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.badge && (
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] px-2 py-[3px] rounded-[5px] bg-bg/70 backdrop-blur border ${getBadgeStyle(product.badge)}`}>
                          {product.badge}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="flex flex-col gap-3.5">
                  {/* Name & Category */}
                  <div>
                    <p className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute mb-1">{product.category.name}</p>
                    <h3 className="text-xl font-bold text-body mb-1">{product.name}</h3>
                  </div>

                  {/* Rating & Sold */}
                  <div className="flex items-center gap-3">
                    {product.avg_rating > 0 ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warn/[.13] border border-warn/[.28]">
                        <Star size={16} className="fill-warn text-warn" />
                        <div>
                          <p className="font-mono font-bold text-warn leading-tight">{product.avg_rating}</p>
                          <p className="font-mono text-[10.5px] text-warn/70">({product.total_reviews} reviews)</p>
                        </div>
                      </div>
                    ) : (
                      <div className="px-3 py-2 text-mute text-sm italic">No reviews yet</div>
                    )}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-info/[.13] border border-info/[.28]">
                      <TrendingUp size={16} className="text-info" />
                      <div>
                        <p className="font-mono font-bold text-info leading-tight">{product.sold_count}</p>
                        <p className="font-mono text-[10.5px] text-info/70">Sold</p>
                      </div>
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="rounded-lg border border-line bg-panel2 p-3">
                    <p className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute mb-1.5">Stock Status</p>
                    <div className="flex items-center justify-between">
                      <span className={`font-mono font-bold text-sm ${product.in_stock ? 'text-pos' : 'text-neg'}`}>
                        {product.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <span className="font-mono text-xs text-dim">{product.stock_quantity} units</span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="rounded-lg border border-line bg-panel2 p-3">
                    <p className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute mb-1.5">Price</p>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-2xl font-bold text-accent tracking-[-.02em]">R{product.price}</span>
                      {product.old_price && (
                        <span className="font-mono text-base line-through text-mute">R{product.old_price}</span>
                      )}
                      {product.discount_percentage > 0 && (
                        <span className="font-mono text-sm font-bold text-neg">-{Math.round(product.discount_percentage)}%</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-card border border-line bg-panel2 p-4">
                <h3 className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-dim mb-3">Description</h3>
                <p className="text-sm text-dim leading-relaxed">{product.description}</p>
              </div>

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="rounded-card border border-line bg-panel2 p-4">
                  <h3 className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-dim mb-4 flex items-center gap-2">
                    <Package size={14} className="text-accent" />
                    Specifications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2 p-2.5 rounded-lg bg-panel border border-line">
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-[10.5px] tracking-[.08em] uppercase text-mute mb-0.5">{key}</p>
                          <p className="text-sm text-body break-words">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {product.reviews && product.reviews.length > 0 && (
                <div className="rounded-card border border-line bg-panel2 p-4">
                  <h3 className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-dim mb-4">Recent Reviews</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {product.reviews.map((review) => (
                      <div key={review.id} className="p-3 bg-panel rounded-lg border border-line">
                        <div className="flex items-start justify-between mb-1.5">
                          <p className="font-semibold text-body text-sm">{review.user}</p>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={i < review.rating ? 'fill-warn text-warn' : 'text-line'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="font-mono text-[11px] text-mute mb-1">{formatDate(review.created_at)}</p>
                        <p className="text-sm text-dim">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions & Answers */}
              {product.questions && product.questions.length > 0 && (
                <div className="rounded-card border border-line bg-panel2 p-4">
                  <h3 className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-dim mb-4">Questions & Answers</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {product.questions.map((question) => (
                      <div key={question.id} className="p-3 bg-panel rounded-lg border border-line">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-body text-sm">{question.asked_by.first_name} {question.asked_by.last_name}</p>
                          <span className={`inline-flex items-center gap-[5px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] whitespace-nowrap px-2 py-[3px] rounded-[5px] border ${
                            question.is_answered
                              ? 'text-pos bg-pos/[.13] border-pos/[.28]'
                              : 'text-warn bg-warn/[.13] border-warn/[.28]'
                          }`}>
                            {question.is_answered ? 'Answered' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-dim mb-2"><strong className="text-body">Q:</strong> {question.question}</p>
                        {question.answer ? (
                          <p className="text-sm text-dim pl-3 border-l-2 border-accent/40"><strong className="text-body">A:</strong> {question.answer}</p>
                        ) : (
                          <p className="text-sm text-mute italic">No answer yet</p>
                        )}
                        <p className="font-mono text-[11px] text-mute mt-2">{formatDate(question.created_at)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="font-mono text-[11px] text-mute space-y-1 p-3 rounded-lg bg-panel2 border border-line">
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
