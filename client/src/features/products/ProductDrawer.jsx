import { useEffect, useState } from 'react';
import clsx from 'clsx';
import Drawer from '../../components/Drawer.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import Textarea from '../../components/Textarea.jsx';
import Switch from '../../components/Switch.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { toast } from '../../components/Toast.jsx';
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from '../../api/products.js';
import ImageUploader from './ImageUploader.jsx';
import ChipInput from './ChipInput.jsx';
import StockMatrix from './StockMatrix.jsx';

export const CATEGORIES = ['dresses', 'shirts', 'shoes', 'handbags', 'accessories'];
const GENDERS = ['women', 'men', 'unisex'];
const SEASONS = ['all', 'summer', 'winter'];
const STYLES = ['casual', 'formal', 'party', 'eid'];
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const EMPTY = {
  name: '',
  category: 'dresses',
  gender: 'women',
  season: 'all',
  style: 'casual',
  price: '',
  discount: 0,
  description: '',
  sizes: [],
  colors: [],
  stock: [],
  images: [],
  rating: 0,
  isTrending: false,
  isActive: true,
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function ProductDrawer({ open, product, onClose }) {
  const isEdit = !!product;
  const [form, setForm] = useState(EMPTY);
  const [confirming, setConfirming] = useState(false);
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const remove = useDeleteProduct();

  useEffect(() => {
    if (open) setForm(product ? { ...EMPTY, ...product } : EMPTY);
  }, [open, product]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    if (!form.name.trim() || form.price === '' || Number(form.price) < 0) {
      toast('Name and a valid price are required', 'danger');
      return;
    }
    const body = {
      name: form.name.trim(),
      slug: product?.slug ?? slugify(form.name),
      category: form.category,
      gender: form.gender,
      season: form.season,
      style: form.style,
      price: Number(form.price),
      discount: Number(form.discount) || 0,
      description: form.description,
      sizes: form.sizes,
      colors: form.colors,
      stock: form.stock.map((r) => ({ size: r.size, color: r.color, qty: Number(r.qty) || 0 })),
      images: form.images,
      rating: Number(form.rating) || 0,
      isTrending: form.isTrending,
      isActive: form.isActive,
    };
    try {
      if (isEdit) {
        await update.mutateAsync({ id: product._id ?? product.id, ...body });
        toast('Product updated');
      } else {
        await create.mutateAsync(body);
        toast('Product created');
      }
      onClose();
    } catch (err) {
      toast(err.response?.data?.message ?? "Couldn't save product", 'danger');
    }
  }

  async function confirmDelete() {
    try {
      await remove.mutateAsync(product._id ?? product.id);
      toast('Product deleted');
      setConfirming(false);
      onClose();
    } catch {
      toast("Couldn't delete product", 'danger');
    }
  }

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        wide
        title={isEdit ? 'Edit product' : 'Add product'}
        testId="product-drawer"
        footer={
          <>
            {isEdit && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirming(true)}
                data-testid="product-delete"
                className="mr-auto"
              >
                Delete
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              loading={create.isPending || update.isPending}
              onClick={save}
              data-testid="product-save"
            >
              {isEdit ? 'Save changes' : 'Create product'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Black Embroidered Maxi"
            data-testid="field-name"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={form.category}
              options={CATEGORIES}
              onChange={(e) => set('category', e.target.value)}
              data-testid="field-category"
            />
            <Select
              label="Gender"
              value={form.gender}
              options={GENDERS}
              onChange={(e) => set('gender', e.target.value)}
              data-testid="field-gender"
            />
            <Select
              label="Season"
              value={form.season}
              options={SEASONS}
              onChange={(e) => set('season', e.target.value)}
              data-testid="field-season"
            />
            <Select
              label="Style"
              value={form.style}
              options={STYLES}
              onChange={(e) => set('style', e.target.value)}
              data-testid="field-style"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Price (Rs)"
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              data-testid="field-price"
            />
            <Input
              label="Discount %"
              type="number"
              min="0"
              max="100"
              value={form.discount}
              onChange={(e) => set('discount', e.target.value)}
              data-testid="field-discount"
            />
            <Input
              label="Rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={form.rating}
              onChange={(e) => set('rating', e.target.value)}
              data-testid="field-rating"
            />
          </div>
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Fabric, fit, occasion — the assistant quotes this."
            data-testid="field-description"
          />
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Sizes</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Sizes">
              {SIZE_OPTIONS.map((s) => {
                const active = form.sizes.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={active}
                    data-testid={`size-${s}`}
                    onClick={() =>
                      set('sizes', active ? form.sizes.filter((x) => x !== s) : [...form.sizes, s])
                    }
                    className={clsx(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                      active
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-line text-ink-soft hover:bg-surface-2 hover:text-ink'
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <ChipInput
            label="Colors"
            values={form.colors}
            onChange={(v) => set('colors', v)}
            placeholder="Type a color, press Enter"
            testId="field-colors"
          />
          <StockMatrix
            stock={form.stock}
            sizes={form.sizes}
            colors={form.colors}
            onChange={(v) => set('stock', v)}
          />
          <ImageUploader
            images={form.images}
            onChange={(updater) =>
              setForm((f) => ({
                ...f,
                images: typeof updater === 'function' ? updater(f.images) : updater,
              }))
            }
          />
          <div className="flex gap-6">
            <Switch
              label="Trending"
              checked={form.isTrending}
              onChange={(v) => set('isTrending', v)}
              data-testid="field-trending"
            />
            <Switch
              label="Active"
              checked={form.isActive}
              onChange={(v) => set('isActive', v)}
              data-testid="field-active"
            />
          </div>
        </div>
      </Drawer>
      <ConfirmDialog
        open={confirming}
        title="Delete this product?"
        description={`"${product?.name}" will be removed from the catalog and the assistant will stop recommending it.`}
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
