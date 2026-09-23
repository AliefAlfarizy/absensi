import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useStudents(filters = {}) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('students')
        .select('*')
        .order('name', { ascending: true })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.class) {
        query = query.eq('class', filters.class)
      }

      if (filters.search) {
        const s = `%${filters.search}%`
        query = query.or(
          `name.ilike.${s},parent_name.ilike.${s},whatsapp.ilike.${s},class.ilike.${s}`
        )
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setStudents(data || [])
    } catch (err) {
      console.error('Error fetching students:', err)
      setError('Gagal memuat data murid. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }, [filters.status, filters.class, filters.search])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const addStudent = async (studentData) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([studentData])
        .select()
        .single()

      if (error) throw error
      await fetchStudents()
      return { data, error: null }
    } catch (err) {
      console.error('Error adding student:', err)
      return { data: null, error: 'Gagal menambahkan murid.' }
    }
  }

  const updateStudent = async (id, studentData) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .update(studentData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      await fetchStudents()
      return { data, error: null }
    } catch (err) {
      console.error('Error updating student:', err)
      return { data: null, error: 'Gagal memperbarui data murid.' }
    }
  }

  const deleteStudent = async (id) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchStudents()
      return { error: null }
    } catch (err) {
      console.error('Error deleting student:', err)
      return { error: 'Gagal menghapus murid. Pastikan tidak ada sesi yang terkait.' }
    }
  }

  const getStudent = async (id) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      console.error('Error fetching student:', err)
      return { data: null, error: 'Gagal memuat data murid.' }
    }
  }

  return {
    students,
    loading,
    error,
    refetch: fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudent,
  }
}
