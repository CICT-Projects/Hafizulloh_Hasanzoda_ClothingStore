import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';
import { Product, Order, Category } from '../types';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [editingProductImage, setEditingProductImage] = useState<File | null>(null);

  useEffect(() => {
    if (user?.role === 'Admin') {
      loadProducts();
      loadOrders();
      loadCategories();
    }
  }, [user]);

  const loadProducts = () => {
    axios.get('http://localhost:5255/api/admin/products').then(response => setProducts((response.data || []).filter((p: Product) => !p.isDeleted)));
  };

  const loadOrders = () => {
    axios.get('http://localhost:5255/api/admin/orders').then(response => setOrders(response.data));
  };

  const loadCategories = () => {
    axios.get('http://localhost:5255/api/admin/categories').then(response => setCategories(response.data));
  };

  const addProduct = async () => {
    let imageUrl = newProduct.imageUrl;
    if (newProductImage) {
      const formData = new FormData();
      formData.append('file', newProductImage);
      const uploadRes = await axios.post('http://localhost:5255/api/admin/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      imageUrl = uploadRes.data.url;
    }
    const productToAdd = { ...newProduct, imageUrl };
    await axios.post('http://localhost:5255/api/admin/products', productToAdd);
    loadProducts();
    setNewProduct({});
    setNewProductImage(null);
  };

  const deleteProduct = (id: number) => {
    axios.delete(`http://localhost:5255/api/admin/products/${id}`).then(() => loadProducts());
  };

  const updateProduct = async (id: number, updatedProduct: Partial<Product>) => {
    let imageUrl = updatedProduct.imageUrl;
    if (editingProductImage) {
      const formData = new FormData();
      formData.append('file', editingProductImage);
      const uploadRes = await axios.post('http://localhost:5255/api/admin/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      imageUrl = uploadRes.data.url;
    }
    const productToUpdate = { ...updatedProduct, imageUrl };
    await axios.put(`http://localhost:5255/api/admin/products/${id}`, productToUpdate);
    loadProducts();
    setEditingProduct(null);
    setEditingProductImage(null);
  };

  const updateOrderStatus = (id: number, status: string) => {
    axios.patch(`http://localhost:5255/api/admin/orders/${id}/status`, { status }).then(loadOrders);
  };

  if (user?.role !== 'Admin') return <div>Access denied</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      <div className="mb-8">
        <h2 className="text-2xl mb-4">Products</h2>
        <div className="mb-4">
          <input placeholder="Name" value={newProduct.name || ''} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
          <input placeholder="Description" value={newProduct.description || ''} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
          <input placeholder="Price" type="number" value={newProduct.price || ''} onChange={e => setNewProduct({ ...newProduct, price: +e.target.value })} />
          <select value={newProduct.categoryId || ''} onChange={e => setNewProduct({ ...newProduct, categoryId: +e.target.value })}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input placeholder="Size" value={newProduct.size || ''} onChange={e => setNewProduct({ ...newProduct, size: e.target.value })} />
          <input placeholder="Color" value={newProduct.color || ''} onChange={e => setNewProduct({ ...newProduct, color: e.target.value })} />
          <input placeholder="Stock" type="number" value={newProduct.stock || ''} onChange={e => setNewProduct({ ...newProduct, stock: +e.target.value })} />
          <input type="file" accept="image/*" onChange={e => setNewProductImage(e.target.files?.[0] || null)} />
          <button onClick={addProduct} className="bg-blue-600 text-white px-4 py-2">Add Product</button>
        </div>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">Description</th>
              <th className="py-2">Price</th>
              <th className="py-2">Size</th>
              <th className="py-2">Color</th>
              <th className="py-2">Stock</th>
              <th className="py-2">Image</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t">
                <td className="py-2 px-4">{p.name}</td>
                <td className="py-2 px-4">{p.description}</td>
                <td className="py-2 px-4">${p.price}</td>
                <td className="py-2 px-4">{p.size}</td>
                <td className="py-2 px-4">{p.color}</td>
                <td className="py-2 px-4">{p.stock}</td>
                <td className="py-2 px-4"><img src={p.imageUrl ? p.imageUrl : ''} alt={p.name} className="w-16 h-16 object-cover" /></td>
                <td className="py-2 px-4">
                  <button onClick={() => setEditingProduct(p)} className="bg-yellow-600 text-white px-2 py-1 mr-2">Edit</button>
                  <button onClick={() => deleteProduct(p.id)} className="bg-red-600 text-white px-2 py-1">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editingProduct && (
          <div className="mt-4">
            <h3>Edit Product</h3>
            <input placeholder="Name" value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} />
            <input placeholder="Description" value={editingProduct.description} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} />
            <input placeholder="Price" type="number" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: +e.target.value })} />
            <select value={editingProduct.categoryId} onChange={e => setEditingProduct({ ...editingProduct, categoryId: +e.target.value })}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input placeholder="Size" value={editingProduct.size} onChange={e => setEditingProduct({ ...editingProduct, size: e.target.value })} />
            <input placeholder="Color" value={editingProduct.color} onChange={e => setEditingProduct({ ...editingProduct, color: e.target.value })} />
            <input placeholder="Stock" type="number" value={editingProduct.stock} onChange={e => setEditingProduct({ ...editingProduct, stock: +e.target.value })} />
            <input type="file" accept="image/*" onChange={e => setEditingProductImage(e.target.files?.[0] || null)} />
            <button onClick={() => { updateProduct(editingProduct.id, editingProduct); setEditingProduct(null); }} className="bg-green-600 text-white px-4 py-2 mr-2">Update</button>
            <button onClick={() => setEditingProduct(null)} className="bg-gray-600 text-white px-4 py-2">Cancel</button>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl mb-4">Orders</h2>
        <ul>
          {orders.map(o => (
            <li key={o.id}>
              Order #{o.id} by {o.user.email} - ${o.totalAmount} - {o.status}
              <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}>
                <option>Created</option>
                <option>Paid</option>
                <option>Shipped</option>
                <option>Delivered</option>
              </select>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Admin;