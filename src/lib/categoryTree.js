export const ALL_CATEGORIES = 'All'
export const ALL_SUBCATEGORIES = 'All'
export const UNCATEGORIZED_SUBCATEGORY = '__uncategorized__'
export const UNCATEGORIZED_SUBCATEGORY_LABEL = "Boshqa bo'limsiz"

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

const createUncategorizedSubCategory = (category, count = category.count) => ({
  key: `${category.key || category.name}-uncategorized`,
  name: UNCATEGORIZED_SUBCATEGORY_LABEL,
  value: UNCATEGORIZED_SUBCATEGORY,
  count,
  sortOrder: Number.MAX_SAFE_INTEGER,
})

export const getCategoryKey = (category) => category.key || category.name

export const getRenderableSubCategories = (category) => {
  if (category.subCategories.length > 0) {
    return category.subCategories
  }

  if (category.count > 0) {
    return [createUncategorizedSubCategory(category)]
  }

  return []
}

export const buildCategoryList = (categories, subCategories = [], products = []) => {
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

      if (!categoryName || mappedCategoriesByName.has(categoryName)) {
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

    if (!category || category.subCategories.some((item) => item.name === subCategory.name)) {
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
          ? [...category.subCategories, createUncategorizedSubCategory(category, uncategorizedCount)]
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
