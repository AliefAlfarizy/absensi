import { useState } from 'react'
import { Settings as SettingsIcon, Database, Info, ExternalLink } from 'lucide-react'

export default function Settings() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '(belum dikonfigurasi)'
  const isConfigured = supabaseUrl !== 'your_supabase_project_url' && supabaseUrl !== '(belum dikonfigurasi)'

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="page-title">Pengaturan</h1>
        <p className="text-sm text-gray-500 mt-0.5">Konfigurasi aplikasi Bimbel Management System</p>
      </div>

      {/* Supabase Config */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-blue-600" />
          <h2 className="section-title">Konfigurasi Database</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Supabase URL</p>
              <p className="text-xs text-gray-500 mt-0.5 font-mono break-all">
                {isConfigured ? supabaseUrl : 'Belum dikonfigurasi'}
              </p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              isConfigured ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isConfigured ? 'Terhubung' : 'Belum dikonfigurasi'}
            </span>
          </div>

          {!isConfigured && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-2">
                <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800 space-y-1">
                  <p className="font-medium">Konfigurasi Supabase Diperlukan</p>
                  <p>Edit file <code className="bg-yellow-100 px-1 rounded">.env</code> di root project:</p>
                  <pre className="bg-yellow-100 rounded p-2 text-xs mt-2 overflow-x-auto">
{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhb...`}
                  </pre>
                  <p>Kemudian jalankan SQL schema di Supabase SQL Editor:</p>
                  <p className="font-mono text-xs bg-yellow-100 px-1 rounded">supabase-schema.sql</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Setup Guide */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-blue-600" />
          <h2 className="section-title">Panduan Setup</h2>
        </div>
        <ol className="space-y-3 text-sm text-gray-700">
          {[
            'Buat akun di supabase.com dan buat project baru.',
            'Pergi ke Settings → API dan salin Project URL serta anon/public key.',
            'Isi file .env dengan URL dan key tersebut.',
            'Pergi ke Supabase SQL Editor, copy seluruh isi supabase-schema.sql lalu jalankan.',
            'Di Supabase Storage, buat bucket baru bernama "learning-materials" dengan akses Public.',
            'Restart development server (npm run dev) setelah mengubah .env.',
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
                {i + 1}
              </span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
        <a
          href="https://supabase.com/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline mt-4"
        >
          Dokumentasi Supabase
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* About */}
      <div className="card p-5">
        <h2 className="section-title mb-3">Tentang Aplikasi</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><span className="text-gray-500">Versi:</span> 1.0.0</p>
          <p><span className="text-gray-500">Stack:</span> React 18 + Vite + Tailwind CSS + Supabase</p>
          <p><span className="text-gray-500">Database:</span> Supabase PostgreSQL</p>
          <p><span className="text-gray-500">Storage:</span> Supabase Storage</p>
        </div>
      </div>
    </div>
  )
}
