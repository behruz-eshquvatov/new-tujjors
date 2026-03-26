import 'dotenv/config'

const readEnv = (key, fallback = '') => {
  const value = process.env[key]
  return typeof value === 'string' ? value.trim() : fallback
}

const normalizeApiUrl = (value) => {
  if (!value) {
    return ''
  }

  return value.endsWith('/') ? value : `${value}/`
}

const apiUrl = normalizeApiUrl(readEnv('SD_API_URL'))
const filialIdRaw = readEnv('SD_FILIAL_ID', '0')
const login = readEnv('SD_LOGIN')
const password = readEnv('SD_PASSWORD')
const userId = readEnv('SD_USER_ID')
const token = readEnv('SD_TOKEN')

const hasLoginAuth = Boolean(login && password)
const hasDirectAuth = Boolean(userId && token)

const ensureConfigured = () => {
  if (!apiUrl) {
    throw new Error('SD_API_URL is missing.')
  }

  if (!hasLoginAuth && !hasDirectAuth) {
    throw new Error(
      'Sales Doctor auth is missing. Configure SD_LOGIN + SD_PASSWORD or SD_USER_ID + SD_TOKEN.',
    )
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

const callSalesDoctor = async ({ method, auth, params, includeFilial = true }) => {
  ensureConfigured()

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

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json().catch(() => null)

  if (!response.ok || !result || result.status === false) {
    throw new Error(result?.error?.message || `Sales Doctor ${method} failed.`)
  }

  return result
}

const getAuth = async () => {
  if (hasLoginAuth) {
    const result = await callSalesDoctor({
      method: 'login',
      auth: { login, password },
      includeFilial: false,
    })

    return result.result || {}
  }

  return {
    userId,
    token,
  }
}

const main = async () => {
  const auth = await getAuth()

  const [categoriesResult, subCategoriesResult] = await Promise.all([
    callSalesDoctor({
      method: 'getProductCategory',
      auth,
      params: {
        page: 1,
        limit: 100,
      },
    }),
    callSalesDoctor({
      method: 'getProductSubCategory',
      auth,
      params: {
        page: 1,
        limit: 100,
      },
    }).catch(() => ({
      result: {
        subCategory: [],
      },
    })),
  ])

  const categories = Array.isArray(categoriesResult?.result?.productCategory)
    ? categoriesResult.result.productCategory
    : []
  const subCategories = Array.isArray(subCategoriesResult?.result?.subCategory)
    ? subCategoriesResult.result.subCategory
    : []
  console.log('categories:')
  console.log(JSON.stringify(categories.map((c) => c.name), null, 2))
  console.log('subcategories:')
  console.log(JSON.stringify(subCategories, null, 2))
}

main().catch((error) => {
  console.error(error.message || 'Unknown error')
  process.exitCode = 1
})
