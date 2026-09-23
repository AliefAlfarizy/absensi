import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useProgress(filters = {}) {
  const [progressList, setProgressList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('student_progress')
        .select(`*, students (id, name, class)`)
        .order('date', { ascending: false })

      if (filters.studentId) {
        query = query.eq('student_id', filters.studentId)
      }

      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom)
      }

      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setProgressList(data || [])
    } catch (err) {
      console.error('Error fetching progress:', err)
      setError('Gagal memuat data perkembangan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }, [filters.studentId, filters.category, filters.dateFrom, filters.dateTo])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  const addProgress = async (progressData) => {
    try {
      const { data, error } = await supabase
        .from('student_progress')
        .insert([progressData])
        .select(`*, students (id, name, class)`)
        .single()

      if (error) throw error
      await fetchProgress()
      return { data, error: null }
    } catch (err) {
      console.error('Error adding progress:', err)
      return { data: null, error: 'Gagal menambahkan data perkembangan.' }
    }
  }

  const updateProgress = async (id, progressData) => {
    try {
      const { data, error } = await supabase
        .from('student_progress')
        .update(progressData)
        .eq('id', id)
        .select(`*, students (id, name, class)`)
        .single()

      if (error) throw error
      await fetchProgress()
      return { data, error: null }
    } catch (err) {
      console.error('Error updating progress:', err)
      return { data: null, error: 'Gagal memperbarui data perkembangan.' }
    }
  }

  const deleteProgress = async (id) => {
    try {
      const { error } = await supabase
        .from('student_progress')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchProgress()
      return { error: null }
    } catch (err) {
      console.error('Error deleting progress:', err)
      return { error: 'Gagal menghapus data perkembangan.' }
    }
  }

  return {
    progressList,
    loading,
    error,
    refetch: fetchProgress,
    addProgress,
    updateProgress,
    deleteProgress,
  }
}
