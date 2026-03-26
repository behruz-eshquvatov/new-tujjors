import { Menu, Search, ShoppingCart, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { formatCount } from '../lib/format'

export const ALL_CATEGORIES = 'All'
export const ALL_SUBCATEGORIES = 'All'

const normalizeApiUrl = (value) => {
  if (!value) {
    return ''
  }

  return value.endsWith('/') ? value : `${value}/`
}

const FALLBACK_CATEGORY_TREE = [
  {
    name: 'Smartphones',
    count: 0,
  },
  {
    name: 'Accessories',
    count: 0,
  },
  {
    name: 'Gadgets',
    count: 0,
  },
]

const apiUrl = normalizeApiUrl('https://villobuhara.salesdoc.io/api/v2/')
const filialIdRaw = 0
const login = 'villobuhara'
const password = 'vilo3878'
const userId = 'd0_67'
const token = ''

const hasLoginAuth = Boolean(login && password)
const hasDirectAuth = Boolean(userId && token)
let authSession = hasDirectAuth ? { userId, token } : null

const ensureConfigured = () => {
  if (!apiUrl) {
    throw new Error('Sales Doctor API URL is missing.')
  }

  if (!hasLoginAuth && !hasDirectAuth) {
    throw new Error('Sales Doctor auth is missing.')
  }
}

const getFilialPayload = () => {
  if (!filialIdRaw) {
    return null
  }

  const normalizedFilialId = Number.isNaN(Number(filialIdRaw))
    ? filialIdRaw
    : Number(filialIdRaw)

  return {
    filial_id: normalizedFilialId,
  }
}

const extractAuth = (value) => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const nextUserId =
    value.userId ||
    value.user_id ||
    value.userid ||
    value.id ||
    value.auth?.userId ||
    value.auth?.user_id
  const nextToken = value.token || value.auth?.token

  if (!nextUserId || !nextToken) {
    return null
  }

  return {
    userId: nextUserId,
    token: nextToken,
  }
}

const updateAuthSession = (payload) => {
  const nextAuth =
    extractAuth(payload?.result) ||
    extractAuth(payload?.data) ||
    extractAuth(payload?.auth) ||
    extractAuth(payload)

  if (nextAuth) {
    authSession = nextAuth
  }

  return authSession
}

const createFetchError = (error, method) => {
  if (error instanceof TypeError) {
    return new Error(`Sales Doctor ${method} failed to fetch.`)
  }

  return error
}

const callSalesDoctor = async ({ method, params, includeFilial = true, authOverride }) => {
  ensureConfigured()

  const auth = authOverride || authSession

  if (!auth) {
    throw new Error('Sales Doctor auth is not ready yet.')
  }

  const payload = {
    method,
    auth,
  }

  const filial = includeFilial ? getFilialPayload() : null

  if (filial) {
    payload.filial = filial
  }

  if (params) {
    payload.params = params
  }

  let response

  try {
    response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    throw createFetchError(error, method)
  }
  console.log(response);
  
  const result = await response.json().catch(() => null)

  if (!response.ok || !result || result.status === false) {
    throw new Error(result?.error?.message || `Sales Doctor ${method} failed.`)
  }

  updateAuthSession(result)
  return result
}

const getAuth = async (forceRefresh = false) => {
  if (!forceRefresh && authSession?.userId && authSession?.token) {
    return authSession
  }

  if (hasLoginAuth) {
    const result = await callSalesDoctor({
      method: 'login',
      authOverride: { login, password },
      includeFilial: false,
    })

    return (
      updateAuthSession(result?.result) ||
      updateAuthSession(result) || {
        userId: '',
        token: '',
      }
    )
  }

  authSession = {
    userId,
    token,
  }

  return authSession
}

const resolveCategoryName = (item) =>
  item?.name || item?.categoryName || item?.productCategoryName || item?.title || ''

const buildCategoryList = (categories, products = []) => {
  const productCounts = products.reduce((accumulator, product) => {
    const categoryName = product?.category

    if (!categoryName) {
      return accumulator
    }

    accumulator[categoryName] = (accumulator[categoryName] || 0) + 1

    return accumulator
  }, {})

  const mappedCategories = categories
    .map((category) => {
      const categoryName = resolveCategoryName(category)

      if (!categoryName) {
        return null
      }

      return {
        name: categoryName,
        count: productCounts[categoryName] || 0,
      }
    })
    .filter(Boolean)

  if (mappedCategories.length > 0) {
    return mappedCategories
  }

  return FALLBACK_CATEGORY_TREE.map((category) => ({
    ...category,
    count: productCounts[category.name] || 0,
  }))
}

const StoreHeader = ({
  products = [],
  search,
  onSearchChange,
  totalItems,
  onOpenCart,
  selectedCategory,
  selectedSubCategory,
  onSelectAllCategories,
  onSelectCategory,
  onSelectSubCategory,
}) => {
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const [categoryList, setCategoryList] = useState(() => buildCategoryList([], products))
  const categoryTriggerRef = useRef(null)
  const categoryDrawerRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const loadCategories = async () => {
      try {
        await getAuth()

        const categoriesResult = await callSalesDoctor({
          method: 'getProductCategory',
          params: {
            page: 1,
            limit: 100,
          },
        })

        const categories = Array.isArray(categoriesResult?.result?.productCategory)
          ? categoriesResult.result.productCategory
          : []

        if (!cancelled) {
          setCategoryList(buildCategoryList(categories, products))
        }
      } catch (error) {
        console.warn(error.message || 'Sales Doctor category request failed.')

        if (!cancelled) {
          setCategoryList(buildCategoryList([], products))
        }
      }
    }

    loadCategories()

    return () => {
      cancelled = true
    }
  }, [products])

  useEffect(() => {
    if (!categoryMenuOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      const clickedTrigger = categoryTriggerRef.current?.contains(event.target)
      const clickedDrawer = categoryDrawerRef.current?.contains(event.target)

      if (!clickedTrigger && !clickedDrawer) {
        setCategoryMenuOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setCategoryMenuOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [categoryMenuOpen])

  const toggleCategoryMenu = () => {
    setCategoryMenuOpen((current) => !current)
  }

  const handleSelectAllCategories = () => {
    onSelectAllCategories()
    setCategoryMenuOpen(false)
  }

  const handleSelectCategory = (category) => {
    onSelectCategory(category)
    setCategoryMenuOpen(false)
  }

  const totalCategoryCount = categoryList.reduce((sum, category) => sum + (category.count || 0), 0)

  return (
    <>
      <header className="shrink-0 border-b border-app-border bg-app-surface">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 py-4 md:flex-nowrap">
          <div ref={categoryTriggerRef} className="w-full md:w-auto">
            <button
              type="button"
              onClick={toggleCategoryMenu}
              aria-label="Open categories"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-app-surface text-app-text"
            >
              <Menu size={18} />
            </button>
          </div>

          <label className="relative w-full md:flex-1">
            <span className="sr-only">Qidirish</span>
            <Search
              size={18}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-app-text-soft"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Nomi yoki bar kod"
              className="w-full rounded-2xl border border-app-border bg-app-surface-muted py-3 pr-4 pl-11 text-sm text-app-text"
            />
          </label>

          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-2 rounded-2xl bg-app-accent px-4 py-3 text-sm font-bold text-app-accent-contrast"
          >
            <ShoppingCart size={18} />
            <span>Savat {totalItems > 0 ? `(${formatCount(totalItems)})` : ''}</span>
          </button>
        </div>
      </header>

      {categoryMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/35">
          <div className="flex h-full">
            <aside
              ref={categoryDrawerRef}
              className="flex h-full w-full max-w-sm flex-col border-r border-app-border bg-app-surface shadow-soft"
            >
              <div className="flex items-start justify-between gap-3 border-b border-app-border px-5 py-4">
                <div>
                  <p className="text-sm font-extrabold text-app-text">Kategoriyalar</p>
                  <p className="mt-1 text-xs text-app-text-soft">Sales Doctor category menu</p>
                </div>

                <button
                  type="button"
                  onClick={() => setCategoryMenuOpen(false)}
                  className="rounded-full border border-app-border p-2 text-app-text-soft"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <button
                  type="button"
                  onClick={handleSelectAllCategories}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    selectedCategory === ALL_CATEGORIES
                      ? 'border-app-accent bg-app-accent text-app-accent-contrast shadow-soft'
                      : 'border-app-border bg-app-surface-muted text-app-text'
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span>
                      <span className="block text-sm font-bold">Barchasi</span>
                      <span
                        className={`mt-1 block text-xs ${
                          selectedCategory === ALL_CATEGORIES
                            ? 'text-app-accent-contrast/80'
                            : 'text-app-text-soft'
                        }`}
                      >
                        Barcha kategoriyalar
                      </span>
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        selectedCategory === ALL_CATEGORIES
                          ? 'bg-white/20 text-app-accent-contrast'
                          : 'bg-app-surface text-app-text-soft'
                      }`}
                    >
                      {formatCount(totalCategoryCount)}
                    </span>
                  </span>
                </button>

                <div className="mt-3 space-y-2">
                  {categoryList.map((category) => {
                    const isCategoryActive =
                      selectedCategory === category.name &&
                      selectedSubCategory === ALL_SUBCATEGORIES

                    return (
                      <div
                        key={category.name}
                        className="rounded-2xl border border-app-border bg-app-surface-muted"
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectCategory(category.name)}
                          className={`w-full rounded-2xl px-4 py-4 text-left transition ${
                            isCategoryActive
                              ? 'bg-app-accent text-app-accent-contrast shadow-soft'
                              : 'text-app-text hover:bg-app-surface'
                          }`}
                        >
                          <span className="flex items-center justify-between gap-3">
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-bold">
                                {category.name}
                              </span>
                              <span
                                className={`mt-1 block text-xs ${
                                  isCategoryActive
                                    ? 'text-app-accent-contrast/80'
                                    : 'text-app-text-soft'
                                }`}
                              >
                                Sales Doctor category
                              </span>
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                isCategoryActive
                                  ? 'bg-white/20 text-app-accent-contrast'
                                  : 'bg-app-surface text-app-text-soft'
                              }`}
                            >
                              {formatCount(category.count)}
                            </span>
                          </span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </aside>

            <button
              type="button"
              onClick={() => setCategoryMenuOpen(false)}
              className="hidden flex-1 md:block"
              aria-label="Close categories"
            />
          </div>
        </div>
      )}
    </>
  )
}

export default StoreHeader
