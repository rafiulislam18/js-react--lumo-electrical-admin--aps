import React, { useState, useEffect, useCallback, useRef } from 'react';
import { authenticatedFetch, apiPost, apiPatch, apiDelete } from '../lib/api';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  Search,
  AlertCircle,
  Loader,
  ChevronRight,
  FolderOpen,
  Folder,
  Tag,
  X,
  Check,
} from 'lucide-react';

interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  is_leaf: boolean;
  children: CategoryNode[];
}

interface FlatCategory {
  id: number;
  name: string;
  slug: string;
  depth: number;
}

interface CategoryFormData {
  name: string;
  slug: string;
  parent: number | null;
}

interface CategoryModal {
  mode: 'create' | 'edit';
  category?: CategoryNode & { parentId?: number | null };
}

const Categories: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Stats are fixed at load time — not affected by search
  const [stats, setStats] = useState({ total: 0, parents: 0, leaves: 0 });

  // Modal state
  const [modal, setModal] = useState<CategoryModal | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({ name: '', slug: '', parent: null });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  // Delete state
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Focus name input when modal opens
  useEffect(() => {
    if (modal) setTimeout(() => nameInputRef.current?.focus(), 50);
  }, [modal]);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authenticatedFetch(`/categories/`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch categories'}`);
      }
      const data: CategoryNode[] = await response.json();
      setCategories(data);

      // Compute and lock stats
      const counted = countNodes(data);
      setStats(counted);

      // Auto-expand all parents on first load
      const parentIds = new Set<number>();
      data.forEach((cat) => {
        if (cat.children.length > 0) parentIds.add(cat.id);
      });
      setExpandedIds(parentIds);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load categories';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const countNodes = (nodes: CategoryNode[]): { total: number; parents: number; leaves: number } => {
    let total = 0, parents = 0, leaves = 0;
    const traverse = (list: CategoryNode[]) => {
      list.forEach((n) => {
        total++;
        if (n.children.length > 0) { parents++; traverse(n.children); }
        else leaves++;
      });
    };
    traverse(nodes);
    return { total, parents, leaves };
  };

  // Flatten tree for parent selector dropdown
  const flattenTree = (nodes: CategoryNode[], depth = 0): FlatCategory[] => {
    const result: FlatCategory[] = [];
    nodes.forEach((n) => {
      result.push({ id: n.id, name: n.name, slug: n.slug, depth });
      if (n.children.length > 0) result.push(...flattenTree(n.children, depth + 1));
    });
    return result;
  };

  const filterTree = (nodes: CategoryNode[], term: string): CategoryNode[] => {
    if (!term) return nodes;
    const lower = term.toLowerCase();
    const filter = (list: CategoryNode[]): CategoryNode[] =>
      list.reduce<CategoryNode[]>((acc, node) => {
        const filteredChildren = filter(node.children);
        if (node.name.toLowerCase().includes(lower) || filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren });
        }
        return acc;
      }, []);
    return filter(nodes);
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

  const openCreate = () => {
    setFormData({ name: '', slug: '', parent: null });
    setAutoSlug(true);
    setFormError(null);
    setModal({ mode: 'create' });
  };

  const openEdit = (node: CategoryNode, parentId: number | null) => {
    setFormData({ name: node.name, slug: node.slug, parent: parentId });
    setAutoSlug(false);
    setFormError(null);
    setModal({ mode: 'edit', category: { ...node, parentId } });
  };

  const closeModal = () => {
    setModal(null);
    setFormError(null);
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: autoSlug ? generateSlug(value) : prev.slug,
    }));
  };

  const handleSlugChange = (value: string) => {
    setAutoSlug(false);
    setFormData((prev) => ({ ...prev, slug: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
        parent: formData.parent ?? null,
      };

      if (modal?.mode === 'create') {
        await apiPost(`/categories/admin/create/`, payload);
      } else if (modal?.mode === 'edit' && modal.category) {
        await apiPatch(`/categories/admin/${modal.category.id}/`, payload);
      }

      closeModal();
      await fetchCategories();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await apiDelete(`/categories/admin/${deleteConfirm.id}/`);
      setDeleteConfirm(null);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category.');
      setDeleteConfirm(null);
    } finally {
      setDeleting(false);
    }
  };

  // Find the parent id of a node by searching the tree
  const findParentId = (nodes: CategoryNode[], targetId: number, parentId: number | null = null): number | null | undefined => {
    for (const node of nodes) {
      if (node.id === targetId) return parentId;
      const found = findParentId(node.children, targetId, node.id);
      if (found !== undefined) return found;
    }
    return undefined;
  };

  const visibleCategories = filterTree(categories, searchTerm);
  const flatCategories = flattenTree(categories);

  // ── Category row ───────────────────────────────────────────────────────────
  const CategoryRow = ({ node, depth = 0 }: { node: CategoryNode; depth?: number }) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const parentId = findParentId(categories, node.id) ?? null;

    return (
      <>
        <div
          className={`group relative flex items-center gap-3 rounded-xl border transition-all duration-200 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/5 hover:-translate-y-px ${
            depth === 0
              ? 'border-slate-700/60 bg-slate-800/40 backdrop-blur px-4 py-3'
              : 'border-slate-700/30 bg-slate-800/20 backdrop-blur px-3 py-2.5'
          }`}
          style={{ marginLeft: depth > 0 ? `${depth * 1.5}rem` : undefined }}
        >
          {depth > 0 && (
            <div className="pointer-events-none absolute -left-5 top-1/2 h-px w-4 bg-slate-600/50" />
          )}
          <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100 rounded-xl" />

          {/* Expand toggle */}
          <div className="flex-shrink-0 w-7 flex items-center justify-center">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(node.id)}
                className="p-0.5 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
              >
                <ChevronRight
                  size={15}
                  className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                />
              </button>
            ) : (
              <div className="w-4 h-px bg-slate-600/40 mx-auto" />
            )}
          </div>

          {/* Icon */}
          <div
            className={`flex-shrink-0 rounded-lg p-1.5 ring-1 ${
              depth === 0
                ? hasChildren ? 'bg-cyan-500/15 ring-cyan-400/20' : 'bg-emerald-500/15 ring-emerald-400/20'
                : 'bg-slate-700/60 ring-slate-600/30'
            }`}
          >
            {hasChildren ? (
              isExpanded
                ? <FolderOpen size={14} className={depth === 0 ? 'text-cyan-300' : 'text-slate-400'} />
                : <Folder size={14} className={depth === 0 ? 'text-cyan-300' : 'text-slate-400'} />
            ) : (
              <Tag size={14} className={depth === 0 ? 'text-emerald-300' : 'text-slate-400'} />
            )}
          </div>

          {/* Name + slug */}
          <div className="flex-1 min-w-0">
            <p className={`font-semibold truncate ${depth === 0 ? 'text-white text-sm' : 'text-slate-200 text-xs'}`}>
              {node.name}
            </p>
            <p className="text-[0.65rem] text-slate-500 truncate">{node.slug}</p>
          </div>

          {/* Type badge */}
          <div className="hidden sm:block flex-shrink-0">
            {hasChildren ? (
              <span className="inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/20">
                <Layers size={9} />Parent
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20">
                <Tag size={9} />Leaf
              </span>
            )}
          </div>

          {/* Children count */}
          {hasChildren && (
            <div className="hidden sm:flex flex-shrink-0">
              <span className="px-1.5 py-0.5 rounded bg-slate-700/60 ring-1 ring-slate-600/40 text-[0.65rem] font-semibold text-slate-300">
                {node.children.length} sub
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={() => openEdit(node, parentId)}
              className="p-1.5 text-cyan-300 bg-cyan-500/15 rounded-lg hover:bg-cyan-500/25 transition-colors ring-1 ring-cyan-400/20"
              title="Edit category"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => setDeleteConfirm({ id: node.id, name: node.name })}
              className="p-1.5 text-red-300 bg-red-500/15 rounded-lg hover:bg-red-500/25 transition-colors ring-1 ring-red-400/20"
              title="Delete category"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="relative">
            <div
              className="absolute top-0 bottom-0 w-px bg-slate-700/50"
              style={{ left: `${depth * 1.5 + 1.25}rem` }}
            />
            <div className="mt-1.5 space-y-1.5">
              {node.children.map((child) => (
                <CategoryRow key={child.id} node={child} depth={depth + 1} />
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  // ── Shared modal shell ─────────────────────────────────────────────────────
  const Modal = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-md bg-slate-800/80 border border-slate-700/60 rounded-2xl shadow-2xl backdrop-blur overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">
          Categories
        </h1>
        <p className="text-sm sm:text-base text-slate-400 font-medium">
          Organize and manage product categories.
        </p>
      </div>

      {/* Stats — fixed at load time, unaffected by search */}
      <div className="grid grid-cols-3 gap-3 mb-6 lg:mb-8">
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-cyan-500/15 blur-2xl" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-cyan-500/15 p-2 ring-1 ring-cyan-400/20">
              <Layers size={16} className="text-cyan-300" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Total</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">{stats.total}</p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">Categories</p>
        </div>
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-sky-400/40 hover:shadow-lg hover:shadow-sky-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-sky-500/15 blur-2xl" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-sky-500/15 p-2 ring-1 ring-sky-400/20">
              <FolderOpen size={16} className="text-sky-300" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Parents</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">{stats.parents}</p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">With Sub-categories</p>
        </div>
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-emerald-500/15 blur-2xl" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-emerald-500/15 p-2 ring-1 ring-emerald-400/20">
              <Tag size={16} className="text-emerald-300" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Leaves</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">{stats.leaves}</p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">Leaf Categories</p>
        </div>
      </div>

      {/* Search and Add */}
      <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-800/60 backdrop-blur rounded-xl border border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400/60 focus:outline-none transition-all text-sm"
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-cyan-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all whitespace-nowrap"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-400/30 rounded-xl backdrop-blur">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
          <p className="text-slate-400">Loading categories...</p>
        </div>
      ) : visibleCategories.length === 0 ? (
        <div className="text-center py-16">
          <Layers className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-300 text-lg">No categories found</p>
          {searchTerm && <p className="text-slate-500 text-sm mt-2">Try adjusting your search</p>}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 font-medium">
              {visibleCategories.length} root {visibleCategories.length === 1 ? 'category' : 'categories'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const allParentIds = new Set<number>();
                  const collect = (nodes: CategoryNode[]) =>
                    nodes.forEach((n) => { if (n.children.length > 0) { allParentIds.add(n.id); collect(n.children); } });
                  collect(categories);
                  setExpandedIds(allParentIds);
                }}
                className="text-[0.7rem] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Expand all
              </button>
              <span className="text-slate-600">·</span>
              <button
                onClick={() => setExpandedIds(new Set())}
                className="text-[0.7rem] font-semibold text-slate-400 hover:text-slate-300 transition-colors"
              >
                Collapse all
              </button>
            </div>
          </div>

          {visibleCategories.map((cat) => (
            <div key={cat.id} className="space-y-1.5">
              <CategoryRow node={cat} depth={0} />
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {modal && (
        <Modal title={modal.mode === 'create' ? 'Add Category' : 'Edit Category'}>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Form error */}
            {formError && (
              <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-400/30 rounded-xl">
                <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{formError}</p>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Circuit Breakers"
                required
                className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/60 text-white placeholder-slate-500 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400/60 focus:outline-none transition-all"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Slug
                <span className="ml-1.5 text-[0.65rem] font-normal text-slate-500">(auto-generated, or edit manually)</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="circuit-breakers"
                className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/60 text-slate-300 placeholder-slate-500 rounded-xl text-sm font-mono focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400/60 focus:outline-none transition-all"
              />
            </div>

            {/* Parent category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Parent Category
                <span className="ml-1.5 text-[0.65rem] font-normal text-slate-500">(leave empty for root)</span>
              </label>
              <select
                value={formData.parent ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, parent: e.target.value ? Number(e.target.value) : null }))}
                className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/60 text-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400/60 focus:outline-none transition-all"
              >
                <option value="">— None (Root category) —</option>
                {flatCategories
                  .filter((c) => modal.mode === 'edit' && modal.category ? c.id !== modal.category.id : true)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {'  '.repeat(c.depth)}{c.depth > 0 ? '└ ' : ''}{c.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 bg-slate-700/60 text-slate-200 rounded-xl font-semibold hover:bg-slate-700 transition-colors border border-slate-600/60 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading || !formData.name.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-cyan-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
              >
                {formLoading ? (
                  <><Loader size={14} className="animate-spin" /> Saving...</>
                ) : (
                  <><Check size={14} /> {modal.mode === 'create' ? 'Create' : 'Save Changes'}</>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-sm bg-slate-800/80 border border-slate-700/60 rounded-2xl shadow-2xl backdrop-blur overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/50 to-transparent" />
            <div className="px-6 py-5">
              <h3 className="text-base font-bold text-white mb-2">Delete Category</h3>
              <p className="text-sm text-slate-300 mb-5">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-white">"{deleteConfirm.name}"</span>?
                <span className="block mt-1 text-xs text-slate-500">
                  Categories with products or sub-categories cannot be deleted.
                </span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-700/60 text-slate-200 rounded-xl font-semibold hover:bg-slate-700 transition-colors border border-slate-600/60 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/80 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {deleting ? (
                    <><Loader size={14} className="animate-spin" /> Deleting...</>
                  ) : (
                    <><Trash2 size={14} /> Delete</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Categories;
