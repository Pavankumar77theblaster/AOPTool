import useSWR from 'swr'
import { getWhitelist, addToWhitelist, removeFromWhitelist } from '@/lib/api'
import type { ScopeWhitelistEntry, ScopeWhitelistCreate } from '@/types/target'
import toast from 'react-hot-toast'

export function useWhitelist() {
  const { data, error, isLoading, mutate } = useSWR<ScopeWhitelistEntry[]>(
    'whitelist',
    getWhitelist,
    {
      revalidateOnFocus: false,
    }
  )

  const addEntry = async (entry: ScopeWhitelistCreate) => {
    try {
      const newEntry = await addToWhitelist(entry)
      mutate([...(data || []), newEntry], false)
      toast.success('Added to whitelist')
      return newEntry
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to whitelist')
      throw error
    }
  }

  const removeEntry = async (id: number) => {
    try {
      await removeFromWhitelist(id)
      mutate(
        data?.filter((e) => e.whitelist_id !== id),
        false
      )
      toast.success('Removed from whitelist')
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove from whitelist')
      throw error
    }
  }

  return {
    whitelist: data || [],
    isLoading,
    error,
    addEntry,
    removeEntry,
    refresh: mutate,
  }
}
