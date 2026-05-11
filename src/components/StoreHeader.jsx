import { ChevronDown, Menu, Search, ShoppingCart, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ALL_CATEGORIES,
  ALL_SUBCATEGORIES,
  UNCATEGORIZED_SUBCATEGORY,
  buildCategoryList,
  getCategoryKey,
  getRenderableSubCategories,
} from '../lib/categoryTree'
import { formatCount } from '../lib/format'

export { ALL_CATEGORIES, ALL_SUBCATEGORIES, UNCATEGORIZED_SUBCATEGORY }

const safeDomId = (value) =>
  String(value)
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')

const CategoryCount = ({ count, active, muted = false }) => (
  <span
    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
      active
        ? 'bg-white/20 text-app-accent-contrast'
        : muted
          ? 'bg-gray-200 text-gray-500'
          : 'bg-emerald-100 text-emerald-800'
    }`}
  >
    {formatCount(count)}
  </span>
)

const StoreHeader = ({
  categories = [],
  subCategories = [],
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
  const [manualExpandedCategoryKeys, setManualExpandedCategoryKeys] = useState(null)
  const categoryTriggerRef = useRef(null)
  const categoryDrawerRef = useRef(null)
  const categoryList = useMemo(
    () => buildCategoryList(categories, subCategories, products),
    [categories, subCategories, products],
  )
  const defaultExpandedCategoryKeys = useMemo(
    () =>
      new Set(
        categoryList
          .filter((category) => getRenderableSubCategories(category).length > 0)
          .map(getCategoryKey),
      ),
    [categoryList],
  )
  const expandedCategoryKeys = manualExpandedCategoryKeys ?? defaultExpandedCategoryKeys
  const totalCategoryCount = categoryList.reduce((sum, category) => sum + (category.count || 0), 0)

  useEffect(() => {
    if (!categoryMenuOpen || !import.meta.env.DEV) {
      return
    }

    console.info('[StoreHeader] category section data', {
      rawCategories: categories,
      rawSubCategories: subCategories,
      productsCount: products.length,
      visibleCategories: categoryList,
    })
  }, [categories, categoryList, categoryMenuOpen, products, subCategories])

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

  const closeCategoryMenu = () => setCategoryMenuOpen(false)
  const toggleCategoryMenu = () => {
    if (!categoryMenuOpen) {
      setManualExpandedCategoryKeys(null)
    }

    setCategoryMenuOpen((current) => !current)
  }

  const selectAllCategories = () => {
    onSelectAllCategories()
    closeCategoryMenu()
  }

  const selectCategory = (category) => {
    onSelectCategory(category)
    closeCategoryMenu()
  }

  const selectSubCategory = (category, subCategory) => {
    onSelectSubCategory(category, subCategory)
    closeCategoryMenu()
  }

  const toggleCategoryExpanded = (categoryKey) => {
    setManualExpandedCategoryKeys((currentKeys) => {
      const nextKeys = new Set(currentKeys ?? defaultExpandedCategoryKeys)

      if (nextKeys.has(categoryKey)) {
        nextKeys.delete(categoryKey)
      } else {
        nextKeys.add(categoryKey)
      }

      return nextKeys
    })
  }

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-20 shrink-0 border-b border-app-border bg-app-surface">
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
                  <p className="mt-1 text-xs text-app-text-soft">Katalog bo&apos;limlari</p>
                </div>

                <button
                  type="button"
                  onClick={closeCategoryMenu}
                  className="rounded-full border border-app-border p-2 text-app-text-soft"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <button
                  type="button"
                  onClick={selectAllCategories}
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
                    <CategoryCount
                      count={totalCategoryCount}
                      active={selectedCategory === ALL_CATEGORIES}
                    />
                  </span>
                </button>

                <div className="mt-3 space-y-2">
                  {categoryList.map((category) => {
                    const categoryKey = getCategoryKey(category)
                    const subCategoriesToRender = getRenderableSubCategories(category)
                    const hasSubCategories = subCategoriesToRender.length > 0
                    const isExpanded = expandedCategoryKeys.has(categoryKey)
                    const isCategoryActive =
                      selectedCategory === category.name &&
                      selectedSubCategory === ALL_SUBCATEGORIES
                    const subCategoryListId = `subcategories-${safeDomId(categoryKey)}`

                    return (
                      <div
                        key={categoryKey}
                        className="rounded-2xl border border-app-border bg-app-surface-muted"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            hasSubCategories
                              ? toggleCategoryExpanded(categoryKey)
                              : selectCategory(category.name)
                          }
                          aria-expanded={hasSubCategories ? isExpanded : undefined}
                          aria-controls={hasSubCategories ? subCategoryListId : undefined}
                          className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left transition ${
                            isCategoryActive
                              ? 'bg-app-accent text-app-accent-contrast shadow-soft'
                              : 'text-app-text hover:bg-app-surface'
                          }`}
                        >
                          <span className="min-w-0 flex-1">
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
                              Mahsulot kategoriyasi
                            </span>
                          </span>
                          <CategoryCount count={category.count} active={isCategoryActive} />
                          {hasSubCategories && (
                            <ChevronDown
                              size={18}
                              className={`shrink-0 transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          )}
                        </button>

                        {hasSubCategories && isExpanded && (
                          <div
                            id={subCategoryListId}
                            className="space-y-1 border-t border-app-border px-2 py-2"
                          >
                            {subCategoriesToRender.map((subCategory) => {
                              const subCategoryValue = subCategory.value || subCategory.name
                              const isSubCategoryActive =
                                selectedCategory === category.name &&
                                selectedSubCategory === subCategoryValue

                              return (
                                <button
                                  key={subCategory.key || subCategory.name}
                                  type="button"
                                  onClick={() => selectSubCategory(category.name, subCategoryValue)}
                                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                                    isSubCategoryActive
                                      ? 'bg-app-accent text-app-accent-contrast shadow-soft'
                                      : subCategory.count > 0
                                        ? 'text-app-text hover:bg-app-surface'
                                        : 'text-app-text-soft'
                                  }`}
                                >
                                  <span className="min-w-0 truncate font-medium">
                                    {subCategory.name}
                                  </span>
                                  <CategoryCount
                                    count={subCategory.count}
                                    active={isSubCategoryActive}
                                    muted={subCategory.count <= 0}
                                  />
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </aside>

            <button
              type="button"
              onClick={closeCategoryMenu}
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
