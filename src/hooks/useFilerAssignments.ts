
import { useState, useEffect, useCallback } from 'react';
import { fetchFilerAssignments, fetchFilerCompletedAssignments } from '@/lib/api';
import { Patent } from '@/lib/types';
import { toast } from 'sonner';

const CACHE_KEY_PENDING = 'patent_filer_pending';
const CACHE_KEY_COMPLETED = 'patent_filer_completed';
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes in milliseconds

interface UseFilerAssignmentsReturn {
  pending: Patent[];
  completed: Patent[];
  loading: boolean;
  lastUpdated: Date | null;
  refreshData: (showLoading?: boolean) => Promise<void>;
}

export function useFilerAssignments(userName: string | undefined): UseFilerAssignmentsReturn {
  const [pending, setPending] = useState<Patent[]>([]);
  const [completed, setCompleted] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadCachedData = useCallback(() => {
    try {
      // Try to load from cache first
      const pendingCacheString = localStorage.getItem(CACHE_KEY_PENDING);
      const completedCacheString = localStorage.getItem(CACHE_KEY_COMPLETED);
      const pendingTimestampString = localStorage.getItem(`${CACHE_KEY_PENDING}_timestamp`);
      const completedTimestampString = localStorage.getItem(`${CACHE_KEY_COMPLETED}_timestamp`);
      
      const pendingTimestamp = pendingTimestampString ? parseInt(pendingTimestampString) : 0;
      const completedTimestamp = completedTimestampString ? parseInt(completedTimestampString) : 0;
      const now = Date.now();
      
      // Check if cache is still valid (not expired)
      const isPendingValid = now - pendingTimestamp < CACHE_EXPIRATION;
      const isCompletedValid = now - completedTimestamp < CACHE_EXPIRATION;
      
      // Set cached data if valid
      if (pendingCacheString && isPendingValid) {
        const pendingCache = JSON.parse(pendingCacheString);
        setPending(pendingCache);
        setLastUpdated(new Date(pendingTimestamp));
      }
      
      if (completedCacheString && isCompletedValid) {
        const completedCache = JSON.parse(completedCacheString);
        setCompleted(completedCache);
        if (!lastUpdated && !pendingCacheString) {
          setLastUpdated(new Date(completedTimestamp));
        }
      }
      
      // Return whether we could use cache for everything
      return isPendingValid && isCompletedValid && pendingCacheString && completedCacheString;
    } catch (error) {
      console.error('Error loading cached data:', error);
      return false;
    }
  }, [lastUpdated]);
  
  // Fetch data from API and update cache
  const fetchData = useCallback(async (showLoading = true) => {
    if (!userName) return;
    
    try {
      if (showLoading) setLoading(true);
      
      // Fetch data in parallel using Promise.all
      const [pendingAssignments, completedAssignments] = await Promise.all([
        fetchFilerAssignments(userName),
        fetchFilerCompletedAssignments(userName)
      ]);
      
      // Update state
      setPending(pendingAssignments);
      setCompleted(completedAssignments);
      setLastUpdated(new Date());
      
      // Cache the data with timestamp
      localStorage.setItem(CACHE_KEY_PENDING, JSON.stringify(pendingAssignments));
      localStorage.setItem(CACHE_KEY_COMPLETED, JSON.stringify(completedAssignments));
      localStorage.setItem(`${CACHE_KEY_PENDING}_timestamp`, Date.now().toString());
      localStorage.setItem(`${CACHE_KEY_COMPLETED}_timestamp`, Date.now().toString());
      
      if (showLoading) {
        setInitialLoadDone(true);
      }
    } catch (error) {
      console.error('Error loading filer assignments:', error);
      toast.error('Failed to load assignment data');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [userName]);
  
  // Initial load - try cache first, then API
  useEffect(() => {
    if (!userName || initialLoadDone) return;
    
    const usedCache = loadCachedData();
    
    if (usedCache) {
      // If we used cache successfully, set loading to false and then refresh in background
      setLoading(false);
      setInitialLoadDone(true);
      fetchData(false); // Silent refresh in background without showing loading state
    } else {
      // If no cache or expired, fetch from API with loading state
      fetchData(true);
    }
  }, [userName, fetchData, initialLoadDone, loadCachedData]);

  return {
    pending,
    completed,
    loading,
    lastUpdated,
    refreshData: fetchData
  };
}
