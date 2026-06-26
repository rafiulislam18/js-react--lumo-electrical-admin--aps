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

// ── Shared modal shell ─────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[7vh] pb-[4vh] bg-black/60 animate-fade">
    <div
      className="w-full max-w-md max-h-[90%] flex flex-col bg-panel border border-line rounded-card shadow-[0_30px_80px_-20px_rgba(0,0,0,.87)] overflow-hidden animate-pop"
    >
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line">
        <div className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
          <Layers size={17} />
        </div>
        <h3 className="flex-1 min-w-0 font-mono font-semibold text-sm tracking-[.08em] uppercase text-body">{title}</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel border border-line text-dim hover:text-body hover:border-line2 transition"
        >
          <X size={15} />
        </button>
      </div>
      <div className="overflow-y-auto flex-1">{children}</div>
    </div>
  </div>
);

// ── Category row ───────────────────────────────────────────────────────────
const CategoryRow = ({
  node,
  depth = 0,
  expandedIds,
  categories,
  onToggleExpand,
  onEdit,
  onDelete,
  findParentId,
}: {
  node: CategoryNode;
  depth?: number;
  expandedIds: Set<number>;
  categories: CategoryNode[];
  onToggleExpand: (id: number) => void;
  onEdit: (node: CategoryNode, parentId: number | null) => void;
  onDelete: (id: number, name: string) => void;
  findParentId: (nodes: CategoryNode[], targetId: number, parentId?: number | null) => number | null | undefined;
}) => {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const parentId = findParentId(categories, node.id) ?? null;

  return (
    <>
      <div
        className={`group relative flex items-center gap-3 rounded-lg border border-line transition-colors hover:border-line2 ${
          depth === 0 ? 'bg-panel px-4 py-3' : 'bg-panel2 px-3 py-2.5'
        }`}
        style={{ marginLeft: depth > 0 ? `${depth * 1.5}rem` : undefined }}
      >
        {depth > 0 && (
          <div className="pointer-events-none absolute -left-5 top-1/2 h-px w-4 bg-line" />
        )}

        {/* Expand toggle */}
        <div className="flex-shrink-0 w-7 flex items-center justify-center">
          {hasChildren ? (
            <button
              onClick={() => onToggleExpand(node.id)}
              className="p-0.5 rounded-md text-dim hover:text-accent hover:bg-accent/10 transition-colors"
            >
              <ChevronRight
                size={15}
                className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>
          ) : (
            <div className="w-4 h-px bg-line mx-auto" />
          )}
        </div>

        {/* Icon */}
        <div
          className={`flex-shrink-0 rounded-[7px] p-1.5 border ${
            depth === 0
              ? hasChildren ? 'bg-accent/[.13] border-accent/[.26]' : 'bg-pos/[.13] border-pos/[.26]'
              : 'bg-panel border-line'
          }`}
        >
          {hasChildren ? (
            isExpanded
              ? <FolderOpen size={14} className={depth === 0 ? 'text-accent' : 'text-dim'} />
              : <Folder size={14} className={depth === 0 ? 'text-accent' : 'text-dim'} />
          ) : (
            <Tag size={14} className={depth === 0 ? 'text-pos' : 'text-dim'} />
          )}
        </div>

        {/* Name + slug */}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold truncate ${depth === 0 ? 'text-body text-sm' : 'text-dim text-xs'}`}>
            {node.name}
          </p>
          <p className="font-mono text-[10.5px] tracking-[.08em] text-mute truncate">{node.slug}</p>
        </div>

        {/* Type badge */}
        <div className="hidden sm:block flex-shrink-0">
          {hasChildren ? (
            <span className="inline-flex items-center gap-[5px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] whitespace-nowrap px-2 py-[3px] rounded-[5px] text-accent bg-accent/[.13] border border-accent/[.28]">
              <Layers size={9} />Parent
            </span>
          ) : (
            <span className="inline-flex items-center gap-[5px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] whitespace-nowrap px-2 py-[3px] rounded-[5px] text-pos bg-pos/[.13] border border-pos/[.28]">
              <Tag size={9} />Leaf
            </span>
          )}
        </div>

        {/* Children count */}
        {hasChildren && (
          <div className="hidden sm:flex flex-shrink-0">
            <span className="px-1.5 py-0.5 rounded bg-panel2 border border-line font-mono text-[10.5px] font-semibold text-dim">
              {node.children.length} sub
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={() => onEdit(node, parentId)}
            className="p-1.5 text-accent bg-accent/[.13] rounded-[7px] border border-accent/[.26] hover:bg-accent/25 transition-colors"
            title="Edit category"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(node.id, node.name)}
            className="p-1.5 text-neg bg-transparent rounded-[7px] border border-neg/30 hover:bg-neg/10 transition-colors"
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
            className="absolute top-0 bottom-0 w-px bg-line"
            style={{ left: `${depth * 1.5 + 1.25}rem` }}
          />
          <div className="mt-1.5 space-y-1.5">
            {node.children.map((child) => (
              <CategoryRow
                key={child.id}
                node={child}
                depth={depth + 1}
                expandedIds={expandedIds}
                categories={categories}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
                findParentId={findParentId}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

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

  return (
    <>
      {/* Header — terminal status bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-[18px]">
        <div className="flex items-center gap-[11px]">
          <span className="w-[7px] h-[7px] rounded-full bg-pos shadow-[0_0_8px_#5fcf80]" />
          <h1 className="m-0 font-mono text-base font-semibold tracking-[.12em] uppercase text-body">Categories</h1>
          <span className="font-mono text-[11.5px] text-mute tracking-[.04em]">// taxonomy</span>
        </div>
      </div>

      {/* Stats — fixed at load time, unaffected by search */}
      <div className="grid grid-cols-3 gap-3 mb-6 lg:mb-8">
        <div className="bg-panel border border-line rounded-card px-4 py-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="rounded-[7px] bg-accent/[.13] border border-accent/[.26] p-2">
              <Layers size={16} className="text-accent" />
            </div>
            <span className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute">Total</span>
          </div>
          <p className="font-mono text-[26px] font-semibold text-body tracking-[-.02em] leading-none">{stats.total}</p>
          <p className="mt-2 font-mono text-[11px] text-mute">categories</p>
        </div>
        <div className="bg-panel border border-line rounded-card px-4 py-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="rounded-[7px] bg-info/[.13] border border-info/[.26] p-2">
              <FolderOpen size={16} className="text-info" />
            </div>
            <span className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute">Parents</span>
          </div>
          <p className="font-mono text-[26px] font-semibold text-body tracking-[-.02em] leading-none">{stats.parents}</p>
          <p className="mt-2 font-mono text-[11px] text-mute">with sub-categories</p>
        </div>
        <div className="bg-panel border border-line rounded-card px-4 py-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="rounded-[7px] bg-pos/[.13] border border-pos/[.26] p-2">
              <Tag size={16} className="text-pos" />
            </div>
            <span className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute">Leaves</span>
          </div>
          <p className="font-mono text-[26px] font-semibold text-body tracking-[-.02em] leading-none">{stats.leaves}</p>
          <p className="mt-2 font-mono text-[11px] text-mute">leaf categories</p>
        </div>
      </div>

      {/* Search and Add */}
      <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative flex items-center">
          <Search className="absolute left-2.5 text-mute pointer-events-none" size={14} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-panel border border-line rounded-[7px] pl-8 pr-3 py-2 text-[12.5px] text-body outline-none focus:border-accent/50 placeholder:text-mute transition-colors"
          />
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-[7px] px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] bg-accent text-accent-ink border border-accent hover:brightness-110 transition whitespace-nowrap"
        >
          <Plus size={14} />
          Add Category
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-neg/10 border border-neg/30 rounded-card">
          <AlertCircle className="w-5 h-5 text-neg flex-shrink-0" />
          <p className="text-sm text-neg">{error}</p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader className="w-6 h-6 text-accent animate-spin mb-3" />
          <p className="font-mono text-xs text-mute uppercase tracking-[.1em]">Loading categories…</p>
        </div>
      ) : visibleCategories.length === 0 ? (
        <div className="text-center py-[54px] text-mute">
          <Layers size={30} className="mx-auto opacity-50" />
          <p className="mt-3 text-[13.5px] font-semibold text-dim">No categories found</p>
          {searchTerm && <p className="mt-1 text-xs">Try adjusting your search</p>}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute">
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
                className="font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] text-accent hover:brightness-110 transition-colors"
              >
                Expand all
              </button>
              <span className="text-mute">·</span>
              <button
                onClick={() => setExpandedIds(new Set())}
                className="font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] text-dim hover:text-body transition-colors"
              >
                Collapse all
              </button>
            </div>
          </div>

          {visibleCategories.map((cat) => (
            <div key={cat.id} className="space-y-1.5">
              <CategoryRow
                node={cat}
                depth={0}
                expandedIds={expandedIds}
                categories={categories}
                onToggleExpand={toggleExpand}
                onEdit={openEdit}
                onDelete={(id, name) => setDeleteConfirm({ id, name })}
                findParentId={findParentId}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {modal && (
        <Modal title={modal.mode === 'create' ? 'Add Category' : 'Edit Category'} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Form error */}
            {formError && (
              <div className="flex items-start gap-2.5 p-3 bg-neg/10 border border-neg/30 rounded-[7px]">
                <AlertCircle size={15} className="text-neg flex-shrink-0 mt-0.5" />
                <p className="text-xs text-neg">{formError}</p>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[10.5px] tracking-[.12em] uppercase text-mute">
                Name <span className="text-neg">*</span>
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Circuit Breakers"
                required
                className="w-full bg-panel2 border border-line rounded-[7px] px-3 py-2 text-[12.5px] text-body outline-none focus:border-accent/50 placeholder:text-mute transition-colors"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[10.5px] tracking-[.12em] uppercase text-mute">
                Slug
                <span className="ml-1.5 normal-case tracking-normal text-[10px]">(auto-generated, or edit manually)</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="circuit-breakers"
                className="w-full bg-panel2 border border-line rounded-[7px] px-3 py-2 text-[12.5px] text-body font-mono outline-none focus:border-accent/50 placeholder:text-mute transition-colors"
              />
            </div>

            {/* Parent category */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[10.5px] tracking-[.12em] uppercase text-mute">
                Parent Category
                <span className="ml-1.5 normal-case tracking-normal text-[10px]">(leave empty for root)</span>
              </label>
              <select
                value={formData.parent ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, parent: e.target.value ? Number(e.target.value) : null }))}
                className="w-full bg-panel2 border border-line rounded-[7px] px-3 py-2 text-[12.5px] text-body outline-none focus:border-accent/50 transition-colors"
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
                className="flex-1 inline-flex items-center justify-center gap-[7px] px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] bg-panel text-dim border border-line hover:border-line2 hover:text-body transition whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading || !formData.name.trim()}
                className="flex-1 inline-flex items-center justify-center gap-[7px] px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] bg-accent text-accent-ink border border-accent hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition whitespace-nowrap"
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
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[7vh] pb-[4vh] bg-black/60 animate-fade">
          <div className="w-full max-w-sm bg-panel border border-line rounded-card shadow-[0_30px_80px_-20px_rgba(0,0,0,.87)] overflow-hidden animate-pop">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line">
              <div className="w-9 h-9 rounded-lg bg-neg/15 text-neg flex items-center justify-center shrink-0">
                <Trash2 size={17} />
              </div>
              <h3 className="font-mono font-semibold text-sm tracking-[.08em] uppercase text-body">Delete Category</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-dim mb-5">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-body">"{deleteConfirm.name}"</span>?
                <span className="block mt-1 text-xs text-mute">
                  Categories with products or sub-categories cannot be deleted.
                </span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 inline-flex items-center justify-center gap-[7px] px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] bg-panel text-dim border border-line hover:border-line2 hover:text-body transition whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 inline-flex items-center justify-center gap-[7px] px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] bg-neg/15 text-neg border border-neg/30 hover:bg-neg/25 disabled:opacity-50 disabled:cursor-not-allowed transition whitespace-nowrap"
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
