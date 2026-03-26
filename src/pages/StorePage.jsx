import { useDeferredValue, useEffect, useState } from 'react'
import CartDrawer from '../components/CartDrawer'
import Pagination from '../components/Pagination'
import ProductCard from '../components/ProductCard'
import StoreHeader, {
  ALL_CATEGORIES,
  ALL_SUBCATEGORIES,
} from '../components/StoreHeader.jsx'
import { formatCount } from '../lib/format'
import { submitOrder } from '../lib/salesDoctor'

const ITEMS_PER_PAGE = 6
const EMPTY_FORM = {
  customerName: '',
  customerPhone: '',
  note: '',
}
const SAMPLE_PRODUCTS = [
  {
    id: 'sample-01',
    name: 'iPhone 15 Pro Max 256GB',
    code: 'PHONE-001',
    barcode: '100000000001',
    price: 18990000,
    image: 'https://picsum.photos/seed/store-01/800/600',
    category: 'Smartphones',
    subCategory: 'Flagship',
  },
  {
    id: 'sample-02',
    name: 'Samsung Galaxy S24 Ultra',
    code: 'PHONE-002',
    barcode: '100000000002',
    price: 17490000,
    image: 'https://picsum.photos/seed/store-02/800/600',
    category: 'Smartphones',
    subCategory: 'Flagship',
  },
  {
    id: 'sample-03',
    name: 'Xiaomi Redmi Note 13',
    code: 'PHONE-003',
    barcode: '100000000003',
    price: 4299000,
    image: 'https://picsum.photos/seed/store-03/800/600',
    category: 'Smartphones',
    subCategory: 'Midrange',
  },
  {
    id: 'sample-04',
    name: 'Tecno Spark 20',
    code: 'PHONE-004',
    barcode: '100000000004',
    price: 2199000,
    image: 'https://picsum.photos/seed/store-04/800/600',
    category: 'Smartphones',
    subCategory: 'Budget',
  },
  {
    id: 'sample-05',
    name: 'Baseus Clear Case',
    code: 'CASE-001',
    barcode: '100000000005',
    price: 149000,
    image: 'https://picsum.photos/seed/store-05/800/600',
    category: 'Accessories',
    subCategory: 'Cases',
  },
  {
    id: 'sample-06',
    name: 'Silicone MagSafe Case',
    code: 'CASE-002',
    barcode: '100000000006',
    price: 199000,
    image: 'https://picsum.photos/seed/store-06/800/600',
    category: 'Accessories',
    subCategory: 'Cases',
  },
  {
    id: 'sample-07',
    name: 'Apple 20W Charger',
    code: 'CHARGE-001',
    barcode: '100000000007',
    price: 329000,
    image: 'https://picsum.photos/seed/store-07/800/600',
    category: 'Accessories',
    subCategory: 'Chargers',
  },
  {
    id: 'sample-08',
    name: 'Anker Nano Fast Charger',
    code: 'CHARGE-002',
    barcode: '100000000008',
    price: 289000,
    image: 'https://picsum.photos/seed/store-08/800/600',
    category: 'Accessories',
    subCategory: 'Chargers',
  },
  {
    id: 'sample-09',
    name: 'USB-C to USB-C Cable 1m',
    code: 'CABLE-001',
    barcode: '100000000009',
    price: 79000,
    image: 'https://picsum.photos/seed/store-09/800/600',
    category: 'Accessories',
    subCategory: 'Cables',
  },
  {
    id: 'sample-10',
    name: 'Lightning Cable 2m',
    code: 'CABLE-002',
    barcode: '100000000010',
    price: 99000,
    image: 'https://picsum.photos/seed/store-10/800/600',
    category: 'Accessories',
    subCategory: 'Cables',
  },
  {
    id: 'sample-11',
    name: 'Apple Watch Series 9',
    code: 'WEAR-001',
    barcode: '100000000011',
    price: 5999000,
    image: 'https://picsum.photos/seed/store-11/800/600',
    category: 'Gadgets',
    subCategory: 'Wearables',
  },
  {
    id: 'sample-12',
    name: 'Huawei Watch GT 4',
    code: 'WEAR-002',
    barcode: '100000000012',
    price: 3299000,
    image: 'https://picsum.photos/seed/store-12/800/600',
    category: 'Gadgets',
    subCategory: 'Wearables',
  },
  {
    id: 'sample-13',
    name: 'AirPods Pro 2',
    code: 'AUDIO-001',
    barcode: '100000000013',
    price: 3199000,
    image: 'https://picsum.photos/seed/store-13/800/600',
    category: 'Gadgets',
    subCategory: 'Audio',
  },
  {
    id: 'sample-14',
    name: 'JBL Tune 770NC',
    code: 'AUDIO-002',
    barcode: '100000000014',
    price: 1899000,
    image: 'https://picsum.photos/seed/store-14/800/600',
    category: 'Gadgets',
    subCategory: 'Audio',
  },
  {
    id: 'sample-15',
    name: 'Mi Smart Home Hub',
    code: 'HOME-001',
    barcode: '100000000015',
    price: 899000,
    image: 'https://picsum.photos/seed/store-15/800/600',
    category: 'Gadgets',
    subCategory: 'Smart Home',
  },
  {
    id: 'sample-16',
    name: 'Smart LED Bulb',
    code: 'HOME-002',
    barcode: '100000000016',
    price: 129000,
    image: 'https://picsum.photos/seed/store-16/800/600',
    category: 'Gadgets',
    subCategory: 'Smart Home',
  },
  {
    id: 'sample-17',
    name: 'Nothing Phone 2a',
    code: 'PHONE-005',
    barcode: '100000000017',
    price: 5899000,
    image: 'https://picsum.photos/seed/store-17/800/600',
    category: 'Smartphones',
    subCategory: 'Midrange',
  },
  {
    id: 'sample-18',
    name: 'Infinix Hot 40i',
    code: 'PHONE-006',
    barcode: '100000000018',
    price: 1999000,
    image: 'https://picsum.photos/seed/store-18/800/600',
    category: 'Smartphones',
    subCategory: 'Budget',
  },
  {
    id: 'sample-19',
    name: 'Spigen Armor Case',
    code: 'CASE-003',
    barcode: '100000000019',
    price: 169000,
    image: 'https://picsum.photos/seed/store-19/800/600',
    category: 'Accessories',
    subCategory: 'Cases',
  },
  {
    id: 'sample-20',
    name: 'Marshall Minor IV',
    code: 'AUDIO-003',
    barcode: '100000000020',
    price: 2299000,
    image: 'https://picsum.photos/seed/store-20/800/600',
    category: 'Gadgets',
    subCategory: 'Audio',
  },
]

const ToneClasses = {
  info: 'border-app-border bg-app-surface text-app-text',
  success: 'border-app-accent bg-app-accent-soft text-app-text',
  error: 'border-app-danger bg-app-danger-soft text-app-danger',
}

const clampQuantity = (value) => {
  const parsed = Number.parseInt(value, 10)

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1
  }

  return parsed
}

const LoadingGrid = () => (
  <div className="grid h-full min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
      <div
        key={index}
        className="card-radius h-[24rem] animate-pulse border border-app-border bg-app-surface"
      />
    ))}
  </div>
)

const EmptyGrid = ({ searchTerm }) => (
  <div className="card-radius flex h-full min-h-0 flex-col items-center justify-center border border-dashed border-app-border bg-app-surface p-8 text-center">
    <h2 className="text-2xl font-extrabold text-app-text">Mahsulot topilmadi</h2>
    <p className="mt-3 max-w-md text-sm leading-6 text-app-text-soft">
      {searchTerm
        ? `"${searchTerm}" bo'yicha natija chiqmagan.`
        : "Hozircha ko'rsatish uchun mahsulot yo'q."}
    </p>
  </div>
)

const StorePage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES)
  const [selectedSubCategory, setSelectedSubCategory] = useState(ALL_SUBCATEGORIES)
  const [page, setPage] = useState(1)
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [quantityEditor, setQuantityEditor] = useState({
    productId: null,
    quantity: '1',
  })
  const [customerForm, setCustomerForm] = useState(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState(null)

  const deferredSearch = useDeferredValue(search.trim().toLowerCase())

  useEffect(() => {
    setProducts(SAMPLE_PRODUCTS)
    setStatus({
      tone: 'info',
      text: "StorePage hozir sample 20 ta karta bilan ishlayapti.",
    })
    setLoading(false)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [deferredSearch, selectedCategory, selectedSubCategory])

  const selectedFilterLabel =
    selectedCategory === ALL_CATEGORIES
      ? "Barcha bo'limlar"
      : selectedSubCategory !== ALL_SUBCATEGORIES
        ? `${selectedCategory} / ${selectedSubCategory}`
        : selectedCategory

  const filteredProducts = products.filter((product) => {
    if (selectedCategory !== ALL_CATEGORIES && product.category !== selectedCategory) {
      return false
    }

    if (
      selectedSubCategory !== ALL_SUBCATEGORIES &&
      product.subCategory !== selectedSubCategory
    ) {
      return false
    }

    if (!deferredSearch) {
      return true
    }

    const haystack = `${product.name} ${product.code} ${product.barcode || ''}`.toLowerCase()
    return haystack.includes(deferredSearch)
  })

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const currentProducts = filteredProducts.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  )
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const selectAllCategories = () => {
    setSelectedCategory(ALL_CATEGORIES)
    setSelectedSubCategory(ALL_SUBCATEGORIES)
  }

  const selectCategory = (category) => {
    setSelectedCategory(category)
    setSelectedSubCategory(ALL_SUBCATEGORIES)
  }

  const selectSubCategory = (category, subCategory) => {
    setSelectedCategory(category)
    setSelectedSubCategory(subCategory)
  }

  const openQuantityEditor = (product) => {
    const existingItem = cart.find((item) => item.id === product.id)

    setQuantityEditor({
      productId: product.id,
      quantity: String(existingItem?.quantity || 1),
    })
  }

  const closeQuantityEditor = () =>
    setQuantityEditor({
      productId: null,
      quantity: '1',
    })

  const updateCartItem = (product, nextQuantity, options = {}) => {
    const { announce = false } = options
    const quantity = clampQuantity(nextQuantity)

    setCart((currentCart) => {
      const nextItem = {
        ...product,
        quantity,
      }

      const existingIndex = currentCart.findIndex((item) => item.id === product.id)

      if (existingIndex === -1) {
        return [...currentCart, nextItem]
      }

      const copy = [...currentCart]
      copy[existingIndex] = nextItem
      return copy
    })

    if (announce) {
      setStatus({
        tone: 'success',
        text: `${product.name} savatga ${quantity} ta qilib saqlandi.`,
      })
    }
  }

  const changeEditorQuantity = (value) => {
    setQuantityEditor((currentEditor) => ({
      ...currentEditor,
      quantity: value,
    }))
  }

  const adjustEditorQuantity = (step) => {
    setQuantityEditor((currentEditor) => ({
      ...currentEditor,
      quantity: String(Math.max(1, clampQuantity(currentEditor.quantity) + step)),
    }))
  }

  const saveEditorQuantity = (product) => {
    updateCartItem(product, quantityEditor.quantity, { announce: true })
    closeQuantityEditor()
  }

  const removeFromCart = (productId) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId))

    setQuantityEditor((currentEditor) =>
      currentEditor.productId === productId
        ? {
          productId: null,
          quantity: '1',
        }
        : currentEditor,
    )
  }

  const adjustCartItemQuantity = (product, step) => {
    const currentQuantity = cart.find((item) => item.id === product.id)?.quantity || 1
    updateCartItem(product, Math.max(1, currentQuantity + step))
  }

  const updateCartItemQuantity = (product, nextQuantity) => {
    updateCartItem(product, nextQuantity)
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const result = await submitOrder({
        cart,
        ...customerForm,
      })

      setCart([])
      setCartOpen(false)
      closeQuantityEditor()
      setCustomerForm(EMPTY_FORM)
      setStatus({
        tone: 'success',
        text: result?.demo
          ? "Demo rejimida buyurtma mahalliy saqlandi."
          : 'Buyurtma serverga yuborildi.',
      })
    } catch (error) {
      setStatus({
        tone: 'error',
        text: error.message || 'Buyurtmani yuborishda xatolik yuz berdi.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col overflow-hidden bg-app-bg">
      <StoreHeader
        products={products}
        search={search}
        onSearchChange={setSearch}
        totalItems={totalItems}
        onOpenCart={() => setCartOpen(true)}
        selectedCategory={selectedCategory}
        selectedSubCategory={selectedSubCategory}
        onSelectAllCategories={selectAllCategories}
        onSelectCategory={selectCategory}
        onSelectSubCategory={selectSubCategory}
      />

      <section className="mx-auto flex w-full max-w-7xl min-h-0 flex-1 flex-col overflow-hidden px-4 py-4">
        {status && (
          <div
            className={`card-radius mb-4 shrink-0 border px-4 py-3 text-sm font-medium ${ToneClasses[status.tone]}`}
          >
            {status.text}
          </div>
        )}

        <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-app-text">
              {formatCount(filteredProducts.length)} ta mahsulot
            </p>
            <p className="text-sm text-app-text-soft">{selectedFilterLabel}</p>
          </div>
        </div>

        {loading ? (
          <LoadingGrid />
        ) : filteredProducts.length === 0 ? (
          <EmptyGrid searchTerm={search} />
        ) : (
          <>
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {currentProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantityInCart={cart.find((item) => item.id === product.id)?.quantity || 0}
                  isEditorOpen={quantityEditor.productId === product.id}
                  editorQuantity={
                    quantityEditor.productId === product.id ? quantityEditor.quantity : '1'
                  }
                  onOpenEditor={openQuantityEditor}
                  onCloseEditor={closeQuantityEditor}
                  onChangeEditorQuantity={changeEditorQuantity}
                  onAdjustEditorQuantity={adjustEditorQuantity}
                  onSaveQuantity={saveEditorQuantity}
                  onRemoveFromCart={removeFromCart}
                />
              ))}

              {Array.from({ length: Math.max(0, ITEMS_PER_PAGE - currentProducts.length) }).map(
                (_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="card-radius hidden h-[24rem] border border-dashed border-app-border bg-app-surface/50 lg:block"
                    aria-hidden="true"
                  />
                ),
              )}
            </div>

            <div className="mt-4 shrink-0">
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </section>

      <CartDrawer
        isOpen={cartOpen}
        cart={cart}
        customerForm={customerForm}
        isSubmitting={isSubmitting}
        onClose={() => setCartOpen(false)}
        onAdjustItemQuantity={adjustCartItemQuantity}
        onRemoveItem={removeFromCart}
        onUpdateItemQuantity={updateCartItemQuantity}
        onFieldChange={(field, value) =>
          setCustomerForm((currentForm) => ({
            ...currentForm,
            [field]: value,
          }))
        }
        onSubmit={handleSubmit}
      />
    </main>
  )
}

export default StorePage
