import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../utils/constants'

export function useMaterials(sessionId = null) {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const fetchMaterials = useCallback(async () => {
    if (!sessionId) {
      setMaterials([])
      return
    }
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('learning_materials')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError
      setMaterials(data || [])
    } catch (err) {
      console.error('Error fetching materials:', err)
      setError('Gagal memuat materi pembelajaran.')
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchMaterials()
  }, [fetchMaterials])

  const uploadFile = async (file, sessionId) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return { url: null, name: null, error: 'Tipe file tidak didukung.' }
    }
    if (file.size > MAX_FILE_SIZE) {
      return { url: null, name: null, error: 'Ukuran file melebihi batas 10MB.' }
    }

    try {
      const ext = file.name.split('.').pop()
      const fileName = `${sessionId}/${Date.now()}-${file.name}`

      const { data, error: uploadError } = await supabase.storage
        .from('learning-materials')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('learning-materials')
        .getPublicUrl(data.path)

      return { url: urlData.publicUrl, name: file.name, error: null }
    } catch (err) {
      console.error('Error uploading file:', err)
      return { url: null, name: null, error: 'Gagal mengupload file.' }
    }
  }

  const addMaterial = async (materialData, file = null) => {
    try {
      let fileUrl = null
      let fileName = null

      if (file) {
        const uploadResult = await uploadFile(file, materialData.session_id)
        if (uploadResult.error) {
          return { data: null, error: uploadResult.error }
        }
        fileUrl = uploadResult.url
        fileName = uploadResult.name
      }

      const { data, error } = await supabase
        .from('learning_materials')
        .insert([{ ...materialData, file_url: fileUrl, file_name: fileName }])
        .select()
        .single()

      if (error) throw error
      await fetchMaterials()
      return { data, error: null }
    } catch (err) {
      console.error('Error adding material:', err)
      return { data: null, error: 'Gagal menambahkan materi.' }
    }
  }

  const updateMaterial = async (id, materialData, newFile = null) => {
    try {
      let updateData = { ...materialData }

      if (newFile) {
        const uploadResult = await uploadFile(newFile, materialData.session_id)
        if (uploadResult.error) {
          return { data: null, error: uploadResult.error }
        }
        updateData.file_url = uploadResult.url
        updateData.file_name = uploadResult.name
      }

      const { data, error } = await supabase
        .from('learning_materials')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      await fetchMaterials()
      return { data, error: null }
    } catch (err) {
      console.error('Error updating material:', err)
      return { data: null, error: 'Gagal memperbarui materi.' }
    }
  }

  const deleteMaterial = async (id) => {
    try {
      // Cek apakah ada file yang perlu dihapus dari storage
      const material = materials.find(m => m.id === id)
      if (material?.file_url) {
        // Extract path dari URL
        const urlParts = material.file_url.split('/learning-materials/')
        if (urlParts.length > 1) {
          await supabase.storage
            .from('learning-materials')
            .remove([urlParts[1]])
        }
      }

      const { error } = await supabase
        .from('learning_materials')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchMaterials()
      return { error: null }
    } catch (err) {
      console.error('Error deleting material:', err)
      return { error: 'Gagal menghapus materi.' }
    }
  }

  const deleteFile = async (materialId) => {
    try {
      const material = materials.find(m => m.id === materialId)
      if (!material?.file_url) return { error: 'File tidak ditemukan.' }

      const urlParts = material.file_url.split('/learning-materials/')
      if (urlParts.length > 1) {
        await supabase.storage
          .from('learning-materials')
          .remove([urlParts[1]])
      }

      const { error } = await supabase
        .from('learning_materials')
        .update({ file_url: null, file_name: null })
        .eq('id', materialId)

      if (error) throw error
      await fetchMaterials()
      return { error: null }
    } catch (err) {
      console.error('Error deleting file:', err)
      return { error: 'Gagal menghapus file.' }
    }
  }

  return {
    materials,
    loading,
    error,
    uploadProgress,
    refetch: fetchMaterials,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    deleteFile,
  }
}
