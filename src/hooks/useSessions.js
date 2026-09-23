import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSessions(filters = {}) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('sessions')
        .select(`
          *,
          students (id, name, class),
          learning_materials (id, title, description, file_url, file_name),
          replacement:sessions!original_session_id (id, session_date, start_time, end_time, status)
        `)
        .order('session_date', { ascending: false })
        .order('start_time', { ascending: false })

      if (filters.studentId) {
        query = query.eq('student_id', filters.studentId)
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.dateFrom) {
        query = query.gte('session_date', filters.dateFrom)
      }

      if (filters.dateTo) {
        query = query.lte('session_date', filters.dateTo)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setSessions(data || [])
    } catch (err) {
      console.error('Error fetching sessions:', err)
      setError('Gagal memuat data sesi. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }, [filters.studentId, filters.status, filters.dateFrom, filters.dateTo])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const addSession = async (sessionData) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert([sessionData])
        .select(`*, students (id, name, class)`)
        .single()

      if (error) throw error
      await fetchSessions()
      return { data, error: null }
    } catch (err) {
      console.error('Error adding session:', err)
      return { data: null, error: 'Gagal menambahkan sesi.' }
    }
  }

  const updateSession = async (id, sessionData) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update(sessionData)
        .eq('id', id)
        .select(`*, students (id, name, class)`)
        .single()

      if (error) throw error
      await fetchSessions()
      return { data, error: null }
    } catch (err) {
      console.error('Error updating session:', err)
      return { data: null, error: 'Gagal memperbarui sesi.' }
    }
  }

  const deleteSession = async (id) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchSessions()
      return { error: null }
    } catch (err) {
      console.error('Error deleting session:', err)
      return { error: 'Gagal menghapus sesi.' }
    }
  }

  const rescheduleSession = async (originalSessionId, newSessionData) => {
    try {
      // 1. Update status sesi lama → reschedule
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ status: 'reschedule' })
        .eq('id', originalSessionId)

      if (updateError) throw updateError

      // 2. Buat sesi pengganti baru
      const { data, error: insertError } = await supabase
        .from('sessions')
        .insert([{
          ...newSessionData,
          session_type: 'replacement',
          original_session_id: originalSessionId,
          status: 'pengganti',
        }])
        .select(`*, students (id, name, class)`)
        .single()

      if (insertError) throw insertError

      await fetchSessions()
      return { data, error: null }
    } catch (err) {
      console.error('Error rescheduling session:', err)
      return { data: null, error: 'Gagal menjadwalkan ulang sesi.' }
    }
  }

  const getSessionWithDetails = async (id) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          students (id, name, parent_name, whatsapp, class),
          learning_materials (*),
          original_session:sessions!original_session_id (id, session_date, start_time, end_time, status)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      console.error('Error fetching session details:', err)
      return { data: null, error: 'Gagal memuat detail sesi.' }
    }
  }

  return {
    sessions,
    loading,
    error,
    refetch: fetchSessions,
    addSession,
    updateSession,
    deleteSession,
    rescheduleSession,
    getSessionWithDetails,
  }
}
