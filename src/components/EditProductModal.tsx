import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../lib/api';
import { X, Upload, Loader, AlertCircle, Plus, Check } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface SpecificationItem {
  key: string;
  value: string;
}

interface ProductFormData {
  name: string;
  price: string;
  old_price: string;
  description: string;
  category: string;
  badge: '' | 'Hot' | 'New' | 'Sale';
  image: File | null;
  stock_quantity: string;
  specifications: SpecificationItem[];
}

interface ProductDetail {
  id: number;
  name: string;
  price: string;
  old_price: string | null;
  description: string;
  category: { id: number; name: string; slug: string };
  badge: '' | 'Hot' | 'New' | 'Sale';
  image: string;
  stock_quantity: number;
  specifications: Record<string, string>;
}

interface EditProductModalProps {
  productId: number;
  onClose: () => void;
  onSaved: () => void;
}

const inputClass =
  'w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/60 text-white placeholder-slate-500 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400/60 focus:outline-none transition-all hover:border-slate-600';

const labelClass = 'block text-xs font-semibold text-slate-300 mb-1.5';

const EditProductModal: React.FC<EditProductModalProps> = ({ productId, onClose, onSaved }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: '',
    old_price: '',
    description: '',
    category: '',
    badge: '',
    image: null,
    stock_quantity: '',
    specifications: [{ key: '', value: '' }],
  });

  useEffect(() => {
    fetchCategoriesAndProduct();
  }, [productId]);

  const fetchCategoriesAndProduct = async () => {
    try {
      setLoading(true);

      const categoriesResponse = await authenticatedFetch('/categories/?leaf_only=true');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.results || categoriesData);
      }

      const productResponse = await authenticatedFetch(`/products/${productId}/`);
      if (!productResponse.ok) throw new Error('Failed to fetch product details');

      const productData: ProductDetail = await productResponse.json();
      const specifications = Object.entries(productData.specifications || {}).map(([key, value]) => ({
        key,
        value: String(value),
      }));

      setFormData({
        name: productData.name,
        price: productData.price,
        old_price: productData.old_price || '',
        description: productData.description,
        category: String(productData.category.id),
        badge: productData.badge,
        image: null,
        stock_quantity: String(productData.stock_quantity),
        specifications: specifications.length > 0 ? specifications : [{ key: '', value: '' }],
      });

      setImagePreview(productData.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }],
    }));
  };

  const handleRemoveSpecification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const handleSpecificationChange = (index: number, field: 'key' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) =>
        i === index ? { ...spec, [field]: value } : spec
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.price || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('price', formData.price);
      formDataObj.append('old_price', formData.old_price || '');
      formDataObj.append('description', formData.description);
      formDataObj.append('category', formData.category);
      formDataObj.append('badge', formData.badge);
      formDataObj.append('stock_quantity', formData.stock_quantity || '0');

      const specificationsObj = formData.specifications.reduce(
        (acc, spec) => {
          if (spec.key.trim()) acc[spec.key.trim()] = spec.value.trim();
          return acc;
        },
        {} as Record<string, string>
      );
      formDataObj.append('specifications', JSON.stringify(specificationsObj));

      if (formData.image) formDataObj.append('image', formData.image);

      const response = await authenticatedFetch(`/products/${productId}/`, {
        method: 'PUT',
        body: formDataObj,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || 'Failed to update product');
      }

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-slate-800/80 border border-slate-700/60 rounded-2xl shadow-2xl backdrop-blur">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

        {/* Header */}
        <div className="sticky top-0 bg-slate-800/95 backdrop-blur border-b border-slate-700/50 px-6 py-4 flex items-center justify-between gap-4 z-10">
          <div>
            <h2 className="text-lg font-bold text-white">Edit Product</h2>
            <p className="text-xs text-slate-400 mt-0.5">Update product information</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
              <p className="text-slate-400">Loading product...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-400/30 rounded-xl">
                  <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300 font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Image Upload */}
                <div>
                  <label className={labelClass}>Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="modal-image-input"
                  />
                  <label
                    htmlFor="modal-image-input"
                    className="group block w-32 h-32 cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-slate-700/60 hover:border-cyan-400/50 hover:bg-cyan-500/5 transition-all"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full flex-col items-center justify-center gap-2">
                        <span className="rounded-xl bg-slate-700/60 p-2.5 ring-1 ring-slate-600/40 group-hover:bg-cyan-500/10 group-hover:ring-cyan-400/20 transition-all">
                          <Upload size={16} className="text-slate-400 group-hover:text-cyan-300 transition-colors" />
                        </span>
                        <span className="text-[0.65rem] font-medium text-slate-400 text-center px-1">
                          Click to change
                        </span>
                      </span>
                    )}
                  </label>
                </div>

                <div className="h-px bg-slate-700/60" />

                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Product Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., LED Bulb 60W"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Category <span className="text-red-400">*</span></label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={inputClass}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Price (R) <span className="text-red-400">*</span></label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Original Price (R)</label>
                    <input
                      type="number"
                      name="old_price"
                      value={formData.old_price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description..."
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* Badge & Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Badge</label>
                    <select
                      name="badge"
                      value={formData.badge}
                      onChange={handleInputChange}
                      className={inputClass}
                    >
                      <option value="">None</option>
                      <option value="Hot">Hot</option>
                      <option value="New">New</option>
                      <option value="Sale">Sale</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Stock Quantity</label>
                    <input
                      type="number"
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="h-px bg-slate-700/60" />

                {/* Specifications */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-semibold text-slate-300">Specifications</label>
                    <button
                      type="button"
                      onClick={handleAddSpecification}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 rounded-lg hover:bg-cyan-500/20 ring-1 ring-cyan-400/20 transition-colors"
                    >
                      <Plus size={13} />
                      Add Row
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.specifications.map((spec, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Name (e.g., Voltage)"
                          value={spec.key}
                          onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                          className={inputClass}
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g., 220V)"
                          value={spec.value}
                          onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                          className={inputClass}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecification(index)}
                          className="flex-shrink-0 p-2.5 text-red-300 bg-red-500/15 rounded-xl hover:bg-red-500/25 transition-colors ring-1 ring-red-400/20"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2 border-t border-slate-700/60">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 bg-slate-700/60 text-slate-200 rounded-xl font-semibold hover:bg-slate-700 transition-colors border border-slate-600/60 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-cyan-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                  >
                    {submitting ? (
                      <>
                        <Loader size={14} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
