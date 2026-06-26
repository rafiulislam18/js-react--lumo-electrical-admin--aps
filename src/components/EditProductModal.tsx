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
  'w-full bg-panel2 border border-line rounded-[7px] px-3 py-2 text-[12.5px] text-body outline-none focus:border-accent/50 placeholder:text-mute transition-colors';

const labelClass = 'block font-mono text-[10.5px] tracking-[.12em] uppercase text-mute mb-1.5';

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
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[7vh] pb-[4vh] bg-black/60 animate-fade">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90%] flex flex-col bg-panel border border-line rounded-card shadow-[0_30px_80px_-20px_rgba(0,0,0,.87)] overflow-hidden animate-pop"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line">
          <div className="flex-1 min-w-0">
            <span className="font-mono font-semibold text-sm tracking-[.08em] uppercase text-body">Edit Product</span>
            <div className="text-mute text-xs mt-0.5">Update product information</div>
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
              <p className="font-mono text-xs text-mute uppercase tracking-[.1em]">Loading product…</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-neg/10 border border-neg/30 rounded-card">
                  <AlertCircle size={15} className="text-neg flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-neg">{error}</p>
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
                    className="group block w-32 h-32 cursor-pointer overflow-hidden rounded-card border-2 border-dashed border-line bg-panel2 hover:border-accent/40 transition-colors"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full flex-col items-center justify-center gap-2">
                        <span className="rounded-lg bg-panel border border-line p-2.5 group-hover:border-accent/40 transition-colors">
                          <Upload size={16} className="text-mute group-hover:text-accent transition-colors" />
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[.08em] text-mute text-center px-1 group-hover:text-dim transition-colors">
                          Click to change
                        </span>
                      </span>
                    )}
                  </label>
                </div>

                <div className="h-px bg-line" />

                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Product Name <span className="text-neg">*</span></label>
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
                    <label className={labelClass}>Category <span className="text-neg">*</span></label>
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
                    <label className={labelClass}>Price (R) <span className="text-neg">*</span></label>
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

                <div className="h-px bg-line" />

                {/* Specifications */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute">Specifications</label>
                    <button
                      type="button"
                      onClick={handleAddSpecification}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-accent bg-accent/10 rounded-[7px] hover:bg-accent/20 border border-accent/[.28] transition-colors"
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
                          className="flex-shrink-0 w-8 self-stretch flex items-center justify-center text-neg bg-neg/10 rounded-[7px] hover:bg-neg/20 transition-colors border border-neg/[.28]"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-line">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 inline-flex items-center justify-center px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] bg-panel2 text-dim border border-line hover:border-line2 hover:text-body transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-[7px] px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] bg-accent text-accent-ink border border-accent hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
