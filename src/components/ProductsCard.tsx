import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowUpDown,
  Tag,
} from 'lucide-react';
import { Product } from '../types';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { Modal } from './common/Modal';
import { Badge } from './common/Badge';
import { EmptyState } from './common/EmptyState';

export interface ProductsCardProps {
  products: Product[];
  onAddProduct: (data: Omit<Product, 'id'>) => Promise<any>;
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<any>;
  onDeleteProduct: (id: string) => Promise<any>;
  onRequestDelete: (product: Product) => void;
}

export const ProductsCard: React.FC<ProductsCardProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onRequestDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState<'all' | 'inStock' | 'lowStock'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<string | number>('');
  const [purchasePrice, setPurchasePrice] = useState<string | number>('');
  const [salePrice, setSalePrice] = useState<string | number>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName('');
    setQuantity('');
    setPurchasePrice('');
    setSalePrice('');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setQuantity(p.quantity);
    setPurchasePrice(p.purchasePrice);
    setSalePrice(p.salePrice);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Product name is required');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, {
          name: name.trim(),
          quantity: Number(quantity) || 0,
          purchasePrice: Number(purchasePrice) || 0,
          salePrice: Number(salePrice) || 0,
        });
      } else {
        await onAddProduct({
          name: name.trim(),
          quantity: Number(quantity) || 0,
          purchasePrice: Number(purchasePrice) || 0,
          salePrice: Number(salePrice) || 0,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (filterStock === 'lowStock') return p.quantity < 50;
      if (filterStock === 'inStock') return p.quantity >= 50;
      return true;
    });
  }, [products, searchTerm, filterStock]);

  return (
    <section id="products-section" className="space-y-6">
      {/* Main Table / List Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>Products & Inventory</span>
              <Badge variant="neutral" size="sm">
                {filteredProducts.length} Items
              </Badge>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live stock levels with purchase costs and sales pricing stored in MongoDB
            </p>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button
              variant="primary"
              onClick={handleOpenCreate}
              leftIcon={<Plus className="w-4 h-4" />}
              className="text-xs sm:text-sm"
            >
              Add New Product
            </Button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="bg-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setFilterStock('all')}
              className={`px-3 py-2 text-xs transition-all rounded-xl ${
                filterStock === 'all'
                  ? 'bg-[#1e40af] text-white font-bold border-2 border-[#03132e] shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 font-medium'
              }`}
            >
              All Stock
            </button>
            <button
              type="button"
              onClick={() => setFilterStock('lowStock')}
              className={`px-3 py-2 text-xs transition-all rounded-xl ${
                filterStock === 'lowStock'
                  ? 'bg-rose-600 text-white font-bold border-2 border-rose-950 shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 font-medium'
              }`}
            >
              Low Stock (&lt;50)
            </button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/60 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-5">Product Name</th>
                <th className="py-3.5 px-5 text-right">In Stock Qty</th>
                <th className="py-3.5 px-5 text-right">Purchase Price</th>
                <th className="py-3.5 px-5 text-right">Sale Price</th>
                <th className="py-3.5 px-5 text-right">Margin / Unit</th>
                <th className="py-3.5 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-xs sm:text-sm">
              {filteredProducts.map((p) => {
                const margin = p.salePrice - p.purchasePrice;
                const hasStock = p.quantity > 0;
                const isLowStock = hasStock && p.quantity < 50;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-950 flex items-center justify-center font-bold text-xs shrink-0">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900">{p.name}</span>
                          <span className="block text-[11px] text-slate-400">ID: {p.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right font-medium">
                      <div className="inline-flex items-center space-x-1.5">
                        {hasStock ? (
                          <span className="font-bold text-slate-900">
                            {p.quantity.toLocaleString()}
                          </span>
                        ) : (
                          <span className="font-semibold text-rose-600">no stock</span>
                        )}
                        {isLowStock && (
                          <Badge variant="danger" size="sm">
                            Low
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right text-slate-600 font-mono">
                      Rs. {p.purchasePrice.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-blue-950 font-mono">
                      Rs. {p.salePrice.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono">
                      <span className={margin >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-600'}>
                        Rs. {margin.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit product"
                          aria-label={`Edit ${p.name}`}
                          className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onRequestDelete(p)}
                          title="Delete product"
                          aria-label={`Delete ${p.name}`}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Card List (Optimized for Mobile Screens) */}
        <div className="md:hidden divide-y divide-slate-200">
          {filteredProducts.map((p) => {
            const margin = p.salePrice - p.purchasePrice;
            const hasStock = p.quantity > 0;

            return (
              <div key={p.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-950 flex items-center justify-center font-bold text-sm">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{p.name}</h4>
                      <span className="text-[10px] text-slate-400">ID: {p.id}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                      aria-label="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRequestDelete(p)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Stock Qty</span>
                    <span className={`font-bold ${hasStock ? 'text-slate-900' : 'text-rose-600'}`}>
                      {hasStock ? p.quantity.toLocaleString() : 'no stock'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Sale Price</span>
                    <span className="font-bold text-blue-950">Rs. {p.salePrice}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Purchase Price</span>
                    <span className={`font-bold ${margin >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      Rs. 
                      {p.purchasePrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <EmptyState
            title="No Products Found"
            description={
              searchTerm
                ? `No products match "${searchTerm}". Try resetting your filter.`
                : 'Your product catalog is currently empty. Click below to add your first product.'
            }
            actionLabel={searchTerm ? 'Clear Search' : 'Add First Product'}
            onAction={searchTerm ? () => setSearchTerm('') : handleOpenCreate}
            className="m-4"
          />
        )}
      </div>

      {/* Product Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        description={
          editingProduct
            ? 'Update stock counts and pricing parameters'
            : 'Fill in product details to add to inventory stock'
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {formError}
            </div>
          )}

          <Input
            label="Product Name"
            required
            placeholder="e.g. Mango Ice Cream Tub 1L"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<Tag className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Stock Quantity"
              type="number"
              min="0"
              required
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <Input
              label="Purchase Cost (Rs.)"
              type="number"
              min="0"
              required
              placeholder="0"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
            />
            <Input
              label="Sale Price (Rs.)"
              type="number"
              min="0"
              required
              placeholder="0"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
            />
          </div>

          <div className="mt-6 flex justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
};
