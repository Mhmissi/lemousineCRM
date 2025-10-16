import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook for safely loading Firebase data with proper cleanup
 * Prevents AbortError when components unmount during Firebase requests
 */
export const useFirebaseData = (dataLoader, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isMountedRef = useRef(true)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await dataLoader()
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setData(result)
      }
    } catch (err) {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setError(err)
      }
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, dependencies)

  useEffect(() => {
    loadData()
    
    // Cleanup function
    return () => {
      isMountedRef.current = false
    }
  }, [loadData])

  return { data, loading, error, refetch: loadData }
}

/**
 * Custom hook for loading multiple Firebase collections safely
 */
export const useMultipleFirebaseData = (dataLoaders, dependencies = []) => {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isMountedRef = useRef(true)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const results = await Promise.all(dataLoaders.map(loader => loader()))
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        const dataObject = {}
        dataLoaders.forEach((loader, index) => {
          const key = loader.name || `data${index}`
          dataObject[key] = results[index]
        })
        setData(dataObject)
      }
    } catch (err) {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setError(err)
      }
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, dependencies)

  useEffect(() => {
    loadData()
    
    // Cleanup function
    return () => {
      isMountedRef.current = false
    }
  }, [loadData])

  return { data, loading, error, refetch: loadData }
}

