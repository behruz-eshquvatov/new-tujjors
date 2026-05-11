import { ChevronDown, Menu, Search, ShoppingCart, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { formatCount } from '../lib/format'

export const ALL_CATEGORIES = 'All'
export const ALL_SUBCATEGORIES = 'All'
export const UNCATEGORIZED_SUBCATEGORY = '__uncategorized__'
const UNCATEGORIZED_SUBCATEGORY_LABEL = "Boshqa bo'limsiz"
 
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

const resolveCategoryName = (item) =>
  item?.name || item?.categoryName || item?.productCategoryName || item?.title || ''

const resolveCategoryId = (item) =>
  item?.id || item?.CS_id || item?.SD_id || item?.code_1C || resolveCategoryName(item)

const resolveSubCategoryName = (item) =>
  item?.name || item?.subCategoryName || item?.productSubCategoryName || item?.title || ''

const resolveSubCategoryId = (item) =>
  item?.id || item?.CS_id || item?.SD_id || item?.code_1C || resolveSubCategoryName(item)

const resolveSubCategoryParentName = (item) => {
  const parent = item?.category || item?.productCategory || item?.parentCategory

  if (typeof parent === 'string' || typeof parent === 'number') {
    return String(parent).trim()
  }

  return resolveCategoryName(parent)
}

const resolveSubCategoryParentId = (item) => {
  const parent = item?.category || item?.productCategory || item?.parentCategory

  if (typeof parent === 'string' || typeof parent === 'number') {
    return String(parent).trim()
  }

  return resolveCategoryId(parent)
}

const isVisibleCategory = (category) => {
  const active = typeof category?.active === 'string' ? category.active.trim().toUpperCase() : ''

  return !active || active === 'Y'
}

const resolveProductSortValue = (product) =>
  Number.isFinite(product?.sortId) ? product.sortId : Number.MAX_SAFE_INTEGER

const compareCatalogItems = (leftItem, rightItem) => {
  if (leftItem.sortOrder !== rightItem.sortOrder) {
    return leftItem.sortOrder - rightItem.sortOrder
  }

  return String(leftItem.name).localeCompare(String(rightItem.name))
}

const getSubCategorySortGroup = (subCategory) => {
  if (subCategory.value === UNCATEGORIZED_SUBCATEGORY) {
    return 1
  }

  return subCategory.count > 0 ? 0 : 2
}

const compareSubCategories = (leftItem, rightItem) => {
  const leftGroup = getSubCategorySortGroup(leftItem)
  const rightGroup = getSubCategorySortGroup(rightItem)

  if (leftGroup !== rightGroup) {
    return leftGroup - rightGroup
  }

  return compareCatalogItems(leftItem, rightItem)
}

const buildCategoryList = (categories, subCategories = [], products = []) => {
  const productCounts = products.reduce((accumulator, product) => {
    const categoryName = product?.category

    if (!categoryName) {
      return accumulator
    }

    accumulator[categoryName] = (accumulator[categoryName] || 0) + 1

    return accumulator
  }, {})
  const productSortOrders = products.reduce((accumulator, product) => {
    const categoryName = product?.category
    const sortValue = resolveProductSortValue(product)

    if (!categoryName) {
      return accumulator
    }

    accumulator[categoryName] = Math.min(
      accumulator[categoryName] ?? Number.MAX_SAFE_INTEGER,
      sortValue,
    )

    return accumulator
  }, {})
  const subCategoryStats = products.reduce((accumulator, product) => {
    const categoryName = product?.category
    const categoryId = product?.categoryId
    const subCategoryName = product?.subCategory

    if (!categoryName || !subCategoryName) {
      return accumulator
    }

    const key = `${categoryId || categoryName}::${subCategoryName}`
    const current = accumulator.get(key) || {
      categoryId,
      categoryName,
      name: subCategoryName,
      count: 0,
      sortOrder: Number.MAX_SAFE_INTEGER,
    }

    current.count += 1
    current.sortOrder = Math.min(current.sortOrder, resolveProductSortValue(product))
    accumulator.set(key, current)

    return accumulator
  }, new Map())

  const mappedCategoriesByName = new Map()
  const mappedCategoriesById = new Map()

  categories
    .filter(isVisibleCategory)
    .forEach((category) => {
      const categoryName = resolveCategoryName(category)
      const categoryId = resolveCategoryId(category)

      if (!categoryName) {
        return
      }

      if (mappedCategoriesByName.has(categoryName)) {
        return
      }

      mappedCategoriesByName.set(categoryName, {
        key: `${categoryId || categoryName}-${categoryName}`,
        name: categoryName,
        count: productCounts[categoryName] || 0,
        sortOrder: productSortOrders[categoryName] ?? Number.MAX_SAFE_INTEGER,
        subCategories: [],
      })

      mappedCategoriesById.set(categoryId || categoryName, mappedCategoriesByName.get(categoryName))
    })

  for (const subCategory of subCategories) {
    const subCategoryName = resolveSubCategoryName(subCategory)
    const categoryId = resolveSubCategoryParentId(subCategory)
    const categoryName = resolveSubCategoryParentName(subCategory)
    const category = mappedCategoriesById.get(categoryId) || mappedCategoriesByName.get(categoryName)

    if (!subCategoryName || !category) {
      continue
    }

    const stats =
      subCategoryStats.get(`${categoryId || categoryName}::${subCategoryName}`) ||
      subCategoryStats.get(`${category.name}::${subCategoryName}`)

    category.subCategories.push({
      key: `${resolveSubCategoryId(subCategory) || subCategoryName}-${categoryName}`,
      name: subCategoryName,
      count: stats?.count || 0,
      sortOrder: stats?.sortOrder ?? Number.MAX_SAFE_INTEGER,
    })
  }

  for (const subCategory of subCategoryStats.values()) {
    const category =
      mappedCategoriesById.get(subCategory.categoryId) ||
      mappedCategoriesByName.get(subCategory.categoryName)

    if (!category) {
      continue
    }

    if (category.subCategories.some((item) => item.name === subCategory.name)) {
      continue
    }

    category.subCategories.push({
      key: `${subCategory.categoryName}-${subCategory.name}`,
      name: subCategory.name,
      count: subCategory.count,
      sortOrder: subCategory.sortOrder,
    })
  }

  const mappedCategories = [...mappedCategoriesByName.values()]
    .map((category) => {
      const subCategoryProductCount = category.subCategories.reduce(
        (sum, subCategory) => sum + subCategory.count,
        0,
      )
      const uncategorizedCount = Math.max(0, category.count - subCategoryProductCount)
      const subCategoryList =
        uncategorizedCount > 0
          ? [
              ...category.subCategories,
              {
                key: `${category.name}-uncategorized`,
                name: UNCATEGORIZED_SUBCATEGORY_LABEL,
                value: UNCATEGORIZED_SUBCATEGORY,
                count: uncategorizedCount,
                sortOrder: Number.MAX_SAFE_INTEGER,
              },
            ]
          : category.subCategories

      return {
        ...category,
        subCategories: subCategoryList.sort(compareSubCategories),
      }
    })
    .sort(compareCatalogItems)

  if (mappedCategories.length > 0) {
    return mappedCategories
  }

  return FALLBACK_CATEGORY_TREE.map((category) => ({
    ...category,
    count: productCounts[category.name] || 0,
    sortOrder: productSortOrders[category.name] ?? Number.MAX_SAFE_INTEGER,
    subCategories: [],
  }))
}

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
  const [expandedCategoryKeys, setExpandedCategoryKeys] = useState(() => new Set())
  const categoryList = useMemo(
    () => buildCategoryList(categories, subCategories, products),
    [categories, subCategories, products],
  )
  const categoryTriggerRef = useRef(null)
  const categoryDrawerRef = useRef(null)

  useEffect(() => {
    console.info('[StoreHeader] category section data', {
      rawCategories: categories,
      rawSubCategories: subCategories,
      productsCount: products.length,
      visibleCategories: categoryList,
    })
  }, [categories, subCategories, products, categoryList])

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

  const handleSelectSubCategory = (category, subCategory) => {
    onSelectSubCategory(category, subCategory)
    setCategoryMenuOpen(false)
  }

  const toggleCategoryExpanded = (categoryKey) => {
    setExpandedCategoryKeys((currentKeys) => {
      const nextKeys = new Set(currentKeys)

      if (nextKeys.has(categoryKey)) {
        nextKeys.delete(categoryKey)
      } else {
        nextKeys.add(categoryKey)
      }

      return nextKeys
    })
  }

  const totalCategoryCount = categoryList.reduce((sum, category) => sum + (category.count || 0), 0)

  return (
    <>
      <header className="shrink-0 fixed top-0 z-20 right-0 left-0 border-b border-app-border bg-app-surface">
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
                  <p className="mt-1 text-xs text-app-text-soft">Statik katalog bo&apos;limlari</p>
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
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {formatCount(totalCategoryCount)}
                    </span>
                  </span>
                </button>

                <div className="mt-3 space-y-2">
                  {categoryList.map((category) => {
                    const categoryKey = category.key || category.name
                    const subCategoryListId = `subcategories-${categoryKey.replace(/\s+/g, '-')}`
                    const subCategoriesToRender =
                      category.subCategories.length > 0
                        ? category.subCategories
                        : category.count > 0
                          ? [
                              {
                                key: `${categoryKey}-uncategorized`,
                                name: UNCATEGORIZED_SUBCATEGORY_LABEL,
                                value: UNCATEGORIZED_SUBCATEGORY,
                                count: category.count,
                                sortOrder: Number.MAX_SAFE_INTEGER,
                              },
                            ]
                          : []
                    const hasSubCategories = subCategoriesToRender.length > 0
                    const isExpanded = expandedCategoryKeys.has(categoryKey)
                    const isCategoryActive =
                      selectedCategory === category.name &&
                      selectedSubCategory === ALL_SUBCATEGORIES

                    return (
                      <div
                        key={categoryKey}
                        className="rounded-2xl border border-app-border bg-app-surface-muted"
                      >
                        <div
                          className={`flex items-center gap-2 rounded-2xl p-2 transition ${
                            isCategoryActive
                              ? 'bg-app-accent text-app-accent-contrast shadow-soft'
                              : 'text-app-text'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectCategory(category.name)}
                            className={`min-w-0 flex-1 rounded-xl px-3 py-3 text-left transition ${
                              isCategoryActive ? 'hover:bg-white/10' : 'hover:bg-app-surface'
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
                                  Mahsulot kategoriyasi
                                </span>
                              </span>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  isCategoryActive
                                    ? 'bg-white/20 text-app-accent-contrast'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {formatCount(category.count)}
                              </span>
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleCategoryExpanded(categoryKey)}
                            disabled={!hasSubCategories}
                            aria-expanded={isExpanded}
                            aria-controls={subCategoryListId}
                            aria-label={`${isExpanded ? 'Close' : 'Open'} ${category.name} subcategories`}
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
                              isCategoryActive
                                ? 'bg-white/15 text-app-accent-contrast hover:bg-white/25'
                                : 'text-app-text-soft hover:bg-app-surface hover:text-app-text'
                            } ${hasSubCategories ? '' : 'cursor-not-allowed opacity-40'}`}
                          >
                            <ChevronDown
                              size={16}
                              className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>
                        </div>

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
                                  onClick={() =>
                                    handleSelectSubCategory(category.name, subCategoryValue)
                                  }
                                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                                    isSubCategoryActive
                                      ? 'bg-app-accent text-app-accent-contrast shadow-soft'
                                      : subCategory.count > 0
                                        ? 'text-app-text hover:bg-app-surface'
                                        : 'text-app-text-soft'
                                  }`}
                                >
                                  <span className="min-w-0 truncate font-thin">
                                    {subCategory.name}
                                  </span>
                                  <span
                                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                      isSubCategoryActive
                                        ? 'bg-white/20 text-app-accent-contrast'
                                        : subCategory.count > 0
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-gray-200 text-gray-500'
                                    }`}
                                  >
                                    {formatCount(subCategory.count)}
                                  </span>
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
