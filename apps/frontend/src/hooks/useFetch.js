import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Gọi API + quản lý loading/error/data.
 * @param {Function} fetcher - Hàm trả Promise (VD: () => adminCoreService.getStudents({ keyword }))
 * @param {Array} deps - Dependency cho useEffect
 * @param {Object} options - { skip: boolean } bỏ qua gọi khi chưa đủ điều kiện
 */
export function useFetch(fetcher, deps = [], options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(!options.skip)
  const [error, setError] = useState(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetcherRef.current()
      setData(res)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (options.skip) {
      setLoading(false)
      return
    }
    run()
  }, [run, options.skip, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: run }
}