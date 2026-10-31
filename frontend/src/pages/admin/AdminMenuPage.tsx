import React, { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, CheckCircle2, XCircle, UtensilsCrossed, X, Image as ImageIcon } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { menuApi } from '../../services/api';

export const AdminMenuPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Form State
  const [categoryId, setCategoryId] = useState<number>(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(199);
  const [imageUrl, setImageUrl] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [prepTime, setPrepTime] = useState(15);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const fetchMenu = () => {
    menuApi.getMenu().then((res) => {
      setCategories(res.data);
      if (res.data.length > 0 && categoryId === 0) {
        setCategoryId(res.data[0].id);
      }
      setLoading(false);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const openAddItemModal = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setPrice(199);
    setImageUrl('');
    setIsVeg(true);
    setPrepTime(15);
    setShowItemModal(true);
  };

  const openEditItemModal = (item: any) => {
    setEditingItem(item);
    setCategoryId(item.category_id);
    setName(item.name);
    setDescription(item.description || '');
    setPrice(item.price);
    setImageUrl(item.image_url || '');
    setIsVeg(item.is_veg);
    setPrepTime(item.prep_time_mins || 15);
    setShowItemModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    const payload = {
      category_id: categoryId,
      name,
      description,
      price,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
      is_veg: isVeg,
      is_available: true,
      prep_time_mins: prepTime
    };

    if (editingItem) {
      menuApi.updateItem(editingItem.id, payload).then(() => {
        setShowItemModal(false);
        fetchMenu();
      }).catch(console.error);
    } else {
      menuApi.createItem(payload).then(() => {
        setShowItemModal(false);
        fetchMenu();
      }).catch(console.error);
    }
  };

  const handleToggleAvailability = (itemId: number) => {
    menuApi.toggleAvailability(itemId).then(() => {
      fetchMenu();
    }).catch(console.error);
  };

  const handleDeleteItem = (itemId: number) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      menuApi.deleteItem(itemId).then(() => {
        fetchMenu();
      }).catch(console.error);
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    menuApi.createCategory({ name: newCatName, display_order: categories.length + 1 }).then(() => {
      setShowCategoryModal(false);
      setNewCatName('');
      fetchMenu();
    }).catch(console.error);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-amber-200 shadow-sm">
          <div>
            <h1 className="font-serif text-2xl font-bold text-cafe-950">
              Menu Management
            </h1>
            <p className="text-xs text-cafe-600 mt-0.5">Add dishes, update prices, toggle availability, and edit menu categories.</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-amber-300 transition-colors"
            >
              + Add Category
            </button>
            <button
              onClick={openAddItemModal}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Food Item</span>
            </button>
          </div>
        </div>

        {/* Menu Items List */}
        {loading ? (
          <div className="py-12 text-center text-amber-700">Loading menu...</div>
        ) : (
          <div className="space-y-8">
            {categories.map((cat) => (
              <div key={cat.id} className="space-y-4">
                <h2 className="font-serif text-xl font-bold text-cafe-950 border-b border-amber-200 pb-2">
                  {cat.name} ({cat.items?.length || 0} Dishes)
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {cat.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl p-4 border-2 shadow-sm space-y-3 flex flex-col justify-between ${
                        item.is_available ? 'border-amber-200' : 'border-gray-200 opacity-60 bg-gray-50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="h-36 rounded-xl overflow-hidden relative">
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            VEG
                          </span>
                          <button
                            onClick={() => handleToggleAvailability(item.id)}
                            className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              item.is_available ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-rose-100 text-rose-900 border-rose-300'
                            }`}
                          >
                            {item.is_available ? 'In Stock' : 'Out of Stock'}
                          </button>
                        </div>

                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-cafe-950 text-base">{item.name}</h3>
                            <span className="font-bold text-amber-900 text-base">₹{item.price}</span>
                          </div>
                          <p className="text-xs text-cafe-600 line-clamp-2 mt-0.5">{item.description}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex gap-2">
                        <button
                          onClick={() => openEditItemModal(item)}
                          className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs py-2 rounded-lg border border-amber-300 flex items-center justify-center space-x-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ADD / EDIT ITEM MODAL */}
        {showItemModal && (
          <div className="fixed inset-0 z-50 bg-cafe-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleSaveItem} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-amber-200">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-serif text-lg font-bold text-cafe-950">
                  {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
                </h3>
                <button type="button" onClick={() => setShowItemModal(false)} className="p-1 text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-cafe-800 uppercase mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(parseInt(e.target.value))}
                  className="w-full bg-cafe-50 border border-amber-300 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-cafe-800 uppercase mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Veg Supreme Pizza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-cafe-50 border border-amber-300 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-cafe-800 uppercase mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-cafe-50 border border-amber-300 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cafe-800 uppercase mb-1">Prep Time (Mins)</label>
                  <input
                    type="number"
                    value={prepTime}
                    onChange={(e) => setPrepTime(parseInt(e.target.value) || 15)}
                    className="w-full bg-cafe-50 border border-amber-300 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-cafe-800 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Ingredients and taste description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-cafe-50 border border-amber-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-cafe-800 uppercase mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-cafe-50 border border-amber-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl text-xs shadow-md"
                >
                  Save Food Item
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ADD CATEGORY MODAL */}
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 bg-cafe-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleCreateCategory} className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-amber-200">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-serif text-lg font-bold text-cafe-950">Add Menu Category</h3>
                <button type="button" onClick={() => setShowCategoryModal(false)} className="p-1 text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-cafe-800 uppercase mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cold Coffees & Shakes"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-cafe-50 border border-amber-300 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl text-xs shadow-md"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
