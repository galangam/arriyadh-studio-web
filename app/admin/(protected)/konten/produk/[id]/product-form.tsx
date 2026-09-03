"use client";

import Image from "next/image";
import { useActionState, useState } from "react";

import {
  updateProduct,
  type ProductFormState,
} from "@/app/admin/(protected)/konten/produk/[id]/actions";
import type { AdminProduct } from "@/lib/products/admin-products";
import { adminProductSizes } from "@/lib/products/product-sizes";

const initialState: ProductFormState = {
  status: "idle",
  message: null,
  errors: {},
};

const fieldClassName =
  "mt-2 w-full rounded-md border border-outline-variant bg-surface-white px-4 py-3 text-admin-body text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function ProductForm({ product, imagePreviewUrl }: { product: AdminProduct; imagePreviewUrl: string | null }) {
  const updateCurrentProduct = updateProduct.bind(null, product.id);
  const [state, formAction, isPending] = useActionState(
    updateCurrentProduct,
    initialState,
  );
  const [isActive, setIsActive] = useState(product.is_active);
  const [selectedSizes, setSelectedSizes] = useState(product.available_sizes);

  function confirmDeactivation(event: React.FormEvent<HTMLFormElement>) {
    if (
      product.is_active &&
      !isActive &&
      !window.confirm(
        "Menonaktifkan produk akan menyembunyikannya dari halaman publik dan mencegah pesanan baru. Pesanan lama tetap tersimpan. Lanjutkan?",
      )
    ) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={confirmDeactivation} className="flex max-w-5xl flex-col gap-8">
      <section aria-labelledby="product-system-fields" className="order-3 space-y-5 border-t border-outline-variant pt-8">
        <div>
          <h2 id="product-system-fields" className="font-heading text-heading-xs text-primary">
            Informasi Sistem dan Harga
          </h2>
          <p className="mt-1.5 text-admin-body text-on-surface-variant">
            Slug, harga, dan varian bersifat read-only. Harga produk ditentukan oleh varian dan tidak dapat diubah dari CMS katalog.
          </p>
        </div>

        <dl className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <dt className="text-admin-label text-primary">ID</dt>
            <dd className="mt-2 break-all rounded-md bg-surface-container-low px-4 py-3 font-mono text-admin-caption text-on-surface-variant">{product.id}</dd>
          </div>
          <div>
            <dt className="text-admin-label text-primary">Slug</dt>
            <dd className="mt-2 break-words rounded-md bg-surface-container-low px-4 py-3 font-mono text-admin-body text-on-surface-variant">
              {product.slug}
            </dd>
          </div>
          <div>
            <dt className="text-admin-label text-primary">Harga Dasar Sistem</dt>
            <dd className="mt-2 rounded-md bg-surface-container-low px-4 py-3 text-admin-body text-on-surface-variant">
              {rupiah.format(product.price)}
            </dd>
          </div>
        </dl>

        <div className="overflow-x-auto overscroll-x-contain rounded-md border border-outline-variant" tabIndex={0} aria-label="Informasi harga varian, hanya baca dan dapat digulir horizontal">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="bg-surface-container-low">
              <tr className="border-b border-outline-variant">
                <th scope="col" className="px-4 py-3 text-admin-label text-primary">Material</th>
                <th scope="col" className="px-4 py-3 text-admin-label text-primary">Jenis Lengan</th>
                <th scope="col" className="px-4 py-3 text-admin-label text-primary">Harga Dasar</th>
                <th scope="col" className="px-4 py-3 text-admin-label text-primary">Tambahan Ukuran Besar</th>
                <th scope="col" className="px-4 py-3 text-admin-label text-primary">Status</th>
              </tr>
            </thead>
            <tbody>
              {product.variants.map((variant) => (
                <tr key={variant.id} className="border-b border-outline-variant last:border-b-0">
                  <td className="px-4 py-4 text-admin-body text-on-surface">{variant.material}</td>
                  <td className="px-4 py-4 text-admin-body text-on-surface-variant">{variant.sleeve_type || "—"}</td>
                  <td className="px-4 py-4 text-admin-body text-on-surface">{rupiah.format(variant.base_unit_price)}</td>
                  <td className="px-4 py-4 text-admin-body text-on-surface">{rupiah.format(variant.large_size_surcharge)}</td>
                  <td className="px-4 py-4 text-admin-body font-semibold text-on-surface-variant">{variant.is_active ? "Aktif" : "Nonaktif"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {product.variants.length === 0 ? (
            <p className="px-4 py-5 text-admin-body text-on-surface-variant">
              Produk ini belum memiliki varian. Harga dasar sistem tetap hanya dapat dilihat dari CMS.
            </p>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="product-editable-fields" className="order-1 space-y-6">
        <h2 id="product-editable-fields" className="font-heading text-heading-xs text-primary">
          Konten yang Dapat Diedit
        </h2>

        <div>
          <label htmlFor="name" className="text-admin-label text-primary">
            Nama Produk <span aria-hidden="true">*</span>
          </label>
          <input id="name" name="name" type="text" required maxLength={160} defaultValue={product.name} aria-invalid={Boolean(state.errors.name)} aria-describedby={state.errors.name ? "name-error" : undefined} className={fieldClassName} />
          {state.errors.name ? <p id="name-error" className="mt-1.5 text-admin-caption text-error">{state.errors.name}</p> : null}
        </div>

        <div>
          <label htmlFor="description" className="text-admin-label text-primary">
            Deskripsi
          </label>
          <textarea id="description" name="description" rows={5} maxLength={2000} defaultValue={product.description ?? ""} aria-invalid={Boolean(state.errors.description)} aria-describedby={state.errors.description ? "description-error" : undefined} className={fieldClassName} />
          {state.errors.description ? <p id="description-error" className="mt-1.5 text-admin-caption text-error">{state.errors.description}</p> : null}
        </div>

        <fieldset aria-describedby={state.errors.available_sizes ? "available-sizes-error" : undefined}>
          <legend className="text-admin-label text-primary">
            Ukuran Tersedia <span aria-hidden="true">*</span>
          </legend>
          <p className="mt-1.5 text-admin-caption text-on-surface-variant">Ukuran terpilih tersedia untuk checkout baru. Perubahan tidak mengubah pesanan lama.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {adminProductSizes.map((size) => (
              <label key={size} className={`flex min-h-11 min-w-20 items-center justify-center gap-2 rounded-md border px-4 py-2 text-admin-body font-semibold ${selectedSizes.includes(size) ? "border-primary/40 bg-surface-container-low text-primary" : "border-outline-variant bg-surface-white text-on-surface"}`}>
                <input name="available_sizes" type="checkbox" value={size} checked={selectedSizes.includes(size)} onChange={(event) => setSelectedSizes((current) => event.target.checked ? [...current, size] : current.filter((item) => item !== size))} className="size-4 accent-primary" />
                {size}
              </label>
            ))}
          </div>
          {state.errors.available_sizes ? <p id="available-sizes-error" className="mt-1.5 text-admin-caption text-error">{state.errors.available_sizes}</p> : null}
        </fieldset>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          <div>
            <p className="text-admin-label text-primary">Gambar produk saat ini</p>
            {imagePreviewUrl ? <Image src={imagePreviewUrl} alt={`Preview gambar produk ${product.name}`} width={576} height={360} className="mt-2 aspect-[8/5] w-full rounded-md border border-outline-variant object-cover" /> : <p className="mt-2 rounded-md border border-outline-variant bg-surface-container-low p-4 text-admin-body text-on-surface-variant">Belum ada gambar produk.</p>}
          </div>
          <div className="space-y-6">
          <div>
            <label htmlFor="image_url" className="text-admin-label text-primary">
              Nilai Gambar Produk
            </label>
            <input id="image_url" name="image_url" type="text" maxLength={2048} defaultValue={product.image_url ?? ""} aria-invalid={Boolean(state.errors.image_url)} aria-describedby={state.errors.image_url ? "image-url-error" : "image-url-help"} className={fieldClassName} />
            <p id="image-url-help" className="mt-1.5 text-admin-caption text-on-surface-variant">
              Nilai saat ini dipertahankan jika tidak diubah dan tidak ada upload baru.
            </p>
            {state.errors.image_url ? <p id="image-url-error" className="mt-1.5 text-admin-caption text-error">{state.errors.image_url}</p> : null}
          </div>
          <div>
            <label htmlFor="product_image" className="text-admin-label text-primary">
              Unggah Pengganti Gambar <span className="font-normal text-on-surface-variant">(opsional)</span>
            </label>
            <input id="product_image" name="product_image" type="file" accept="image/jpeg,image/png,image/webp" aria-invalid={Boolean(state.errors.product_image)} aria-describedby={state.errors.product_image ? "product-image-error" : "product-image-help"} className={`${fieldClassName} max-w-full file:mr-4 file:rounded-md file:border-0 file:bg-surface-container file:px-3 file:py-2 file:text-admin-label file:text-primary`} />
            <p id="product-image-help" className="mt-1.5 text-admin-caption text-on-surface-variant">
              JPEG, PNG, atau WebP. Maksimal 5 MiB. Kosongkan untuk mempertahankan gambar saat ini.
            </p>
            {state.errors.product_image ? <p id="product-image-error" className="mt-1.5 text-admin-caption text-error">{state.errors.product_image}</p> : null}
          </div>
          </div>
        </div>

        <div className="border-t border-outline-variant pt-8">
          <h3 className="font-heading text-admin-section text-primary">Pengaturan Publik</h3>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="sort_order" className="text-admin-label text-primary">
              Urutan Tampil <span aria-hidden="true">*</span>
            </label>
            <input id="sort_order" name="sort_order" type="number" inputMode="numeric" min={0} max={100000} step={1} required defaultValue={product.sort_order} aria-invalid={Boolean(state.errors.sort_order)} aria-describedby={state.errors.sort_order ? "sort-order-error" : "product-sort-help"} className={fieldClassName} />
            <p id="product-sort-help" className="mt-1.5 text-admin-caption text-on-surface-variant">Angka lebih kecil tampil lebih awal.</p>
            {state.errors.sort_order ? <p id="sort-order-error" className="mt-1.5 text-admin-caption text-error">{state.errors.sort_order}</p> : null}
          </div>

          <div>
            <span className="text-admin-label text-primary">Status Aktif</span>
            <label className="mt-2 flex min-h-12 items-center gap-3 border border-outline-variant bg-surface-white px-4 py-3 text-admin-body text-on-surface">
              <input name="is_active" type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="size-4 accent-primary" />
              {isActive ? "Aktif — tampil di halaman publik" : "Nonaktif — disembunyikan dari halaman publik"}
            </label>
            {product.is_active && !isActive ? <p className="mt-2 rounded-md border border-error/30 bg-error-container px-3 py-2 text-admin-caption text-on-error-container">Produk akan hilang dari katalog publik dan checkout baru akan diblokir. Pesanan lama tetap tersimpan.</p> : null}
          </div>
          </div>
        </div>
      </section>

      <div className="order-4 border-t border-outline-variant pt-6">
        <div aria-live="polite" aria-atomic="true" className="min-h-6">
          {state.message ? (
            <p className={state.status === "success" ? "text-admin-body text-success-green" : "text-admin-body text-error"}>
              {state.message}
            </p>
          ) : null}
        </div>
        <button type="submit" disabled={isPending} className="mt-4 min-h-12 w-full rounded-md bg-primary px-6 text-admin-label text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
          {isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}
