import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Loader, AlertCircle, Plus, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

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

const EditProduct: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
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

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchCategoriesAndProduct();
  }, [id]);

  const fetchCategoriesAndProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      // Fetch categories
      const categoriesResponse = await fetch(`${API_URL}/categories/?leaf_only=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.results || categoriesData);
      }

      // Fetch product details
      const productResponse = await fetch(`${API_URL}/products/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!productResponse.ok) {
        throw new Error('Failed to fetch product details');
      }

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
      const message = err instanceof Error ? err.message : 'Failed to load product';
      setError(message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
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

  const handleSpecificationChange = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
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
      const token = localStorage.getItem('access_token');
      const formDataObj = new FormData();

      formDataObj.append('name', formData.name);
      formDataObj.append('price', formData.price);
      formDataObj.append('old_price', formData.old_price || '');
      formDataObj.append('description', formData.description);
      formDataObj.append('category', formData.category);
      formDataObj.append('badge', formData.badge);
      formDataObj.append('stock_quantity', formData.stock_quantity || '0');

      // Convert specifications array to object format
      const specificationsObj = formData.specifications.reduce(
        (acc, spec) => {
          if (spec.key.trim()) {
            acc[spec.key.trim()] = spec.value.trim();
          }
          return acc;
        },
        {} as Record<string, string>
      );
      formDataObj.append('specifications', JSON.stringify(specificationsObj));

      if (formData.image) {
        formDataObj.append('image', formData.image);
      }

      const response = await fetch(`${API_URL}/products/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataObj,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || 'Failed to update product');
      }

      navigate('/products');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update product';
      setError(message);
      console.error('Update product error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          <ArrowLeft size={20} />
          Back to Products
        </button>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
          Edit Product
        </h1>
        <p className="text-sm sm:text-base text-gray-600 font-medium">
          Update product information
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Product Image
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-input"
              />
              <label
                htmlFor="image-input"
                className="flex items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-700">Click to upload image</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Product Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., LED Bulb 60W"
                className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Category <span className="text-red-600">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-sm"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Price (R) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Original Price (R)
              </label>
              <input
                type="number"
                name="old_price"
                value={formData.old_price}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description..."
              rows={4}
              className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-sm resize-none"
            />
          </div>

          {/* Badge and Stock Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Badge
              </label>
              <select
                name="badge"
                value={formData.badge}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-sm"
              >
                <option value="">None</option>
                <option value="Hot">Hot</option>
                <option value="New">New</option>
                <option value="Sale">Sale</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Specifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-900">
                Specifications
              </label>
              <button
                type="button"
                onClick={handleAddSpecification}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <input
                    type="text"
                    placeholder="Specification name (e.g., Voltage)"
                    value={spec.key}
                    onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g., 220V)"
                    value={spec.value}
                    onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecification(index)}
                    className="flex-shrink-0 p-2.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Product'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
