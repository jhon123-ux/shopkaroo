'use client'

import { useState, useEffect } from 'react'
import { Check, X, Shield, UserPlus, Mail, ShieldAlert, MoreVertical, RefreshCw, Power, Trash2 } from 'lucide-react'
import useAdminAuthStore from '@/lib/adminAuthStore'
import api from '@/lib/api'

export default function TeamManagement() {
  const { admin, hasPermission } = useAdminAuthStore()
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [targetId, setTargetId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff' as any,
    is_active: true,
    permissions: {} as Record<string, boolean>
  })

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/team')
      setMembers(res.data.data || [])
    } catch (err) {
      showToast('Registry sync failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (admin) fetchMembers()
  }, [admin])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/api/admin/team/invite', formData)
      
      showToast('Invitation sent! Team member will receive an email to set their password.')
      setIsModalOpen(false)
      fetchMembers()
    } catch (err: any) {
      showToast(err.response?.data?.error || err.message, 'error')
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.patch(`/api/admin/team/${targetId}`, formData)
      
      showToast(`Registry updated for ${formData.name}`)
      setIsModalOpen(false)
      fetchMembers()
    } catch (err: any) {
      showToast(err.response?.data?.error || err.message, 'error')
    }
  }

  const handleResend = async (id: string) => {
    try {
      await api.post(`/api/admin/team/${id}/resend-invite`)
      showToast('Invitation link resent')
    } catch (err: any) {
      showToast(err.response?.data?.error || err.message, 'error')
    }
  }

  const openAddModal = () => {
    if (admin?.role !== 'superadmin') {
      showToast('Restricted: Superadmin authority required', 'error')
      return
    }
    setIsEditMode(false)
    setFormData({ name: '', email: '', role: 'staff', is_active: true, permissions: {} })
    setIsModalOpen(true)
  }

  const openEditModal = (member: any) => {
    if (admin?.role !== 'superadmin' && admin?.id !== member.id) {
      showToast('Restricted authority', 'error')
      return
    }
    setIsEditMode(true)
    setTargetId(member.id)
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      is_active: member.is_active,
      permissions: member.permissions || {}
    })
    setIsModalOpen(true)
  }

  return (
    <div className="relative font-body">
      {toast && (
        <div className={`fixed top-12 right-12 z-[100] px-6 py-4 shadow-2xl flex items-center gap-4 animate-slideUp text-white text-[12px] font-bold uppercase tracking-widest ${
          toast.type === 'success' ? 'bg-[#1C1410]' : 'bg-[#DC2626]'
        }`}>
          <span>{toast.type === 'success' ? <Check size={20} /> : <X size={20} />}</span>
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-end mb-12 text-left">
        <div>
          <p className="text-[#6B6058] text-[11px] font-bold uppercase tracking-[2px] opacity-40 mb-1">Internal Registry</p>
          <h2 className="text-[28px] font-bold font-heading text-[#1C1410] uppercase tracking-widest leading-none">Team Members</h2>
        </div>
        {admin?.role === 'superadmin' && (
          <button onClick={openAddModal} className="bg-[#1C1410] text-white px-8 py-4 font-bold uppercase tracking-[3px] text-[12px] hover:bg-[#33221b] transition-all shadow-xl active:scale-95 flex items-center gap-3">
            <UserPlus size={16} /> Invite Member
          </button>
        )}
      </div>

      <div className="bg-white border border-[#E8E2D9] overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF7F4] border-b border-[#E8E2D9]">
            <tr>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Identity</th>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Role</th>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Permissions</th>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Status</th>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Last Activity</th>
              <th className="px-8 py-5 text-left font-bold text-[10px] text-[#1C1410] uppercase tracking-[2px] opacity-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? Array(3).fill(0).map((_, i) => (
              <tr key={i} className="border-b border-[#FAF7F4] animate-pulse">
                <td colSpan={6} className="px-8 py-10 bg-gray-50/30" />
              </tr>
            )) : members.map(m => (
              <tr key={m.id} className="border-b border-[#FAF7F4] last:border-0 hover:bg-[#FAF7F4]/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#F2EDE6] border border-[#E8E2D9] flex items-center justify-center text-[#783A3A] font-bold">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[#1C1410] text-[14px]">{m.name}</p>
                      <p className="text-[10px] text-[#6B6058] font-bold opacity-40 uppercase tracking-widest">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-left">
                  <span className={`text-[9px] font-bold uppercase tracking-[2px] px-3 py-1 border ${
                    m.role === 'superadmin' ? 'bg-[#1C1410] text-white border-[#1C1410]' : 
                    m.role === 'manager' ? 'bg-[#F5E8E8] text-[#783A3A] border-[#783A3A]/20' : 
                    'bg-[#FAF7F4] text-[#6B6058] border-[#E8E2D9]'
                  }`}>
                    {m.role}
                  </span>
                </td>
                <td className="px-8 py-6 text-left">
                   <p className="text-[11px] text-[#6B6058] font-medium italic opacity-60">
                     {m.role === 'superadmin' ? 'Unrestricted Authority' : Object.keys(m.permissions || {}).filter(k => m.permissions[k]).length + ' keys granted'}
                   </p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${m.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{m.is_active ? 'Active' : 'Deactivated'}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-left">
                   <p className="text-[11px] text-[#6B6058] font-medium">
                     {m.last_login_at ? new Date(m.last_login_at).toLocaleDateString() : 'Never logged in'}
                   </p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex gap-4">
                    <button onClick={() => openEditModal(m)} className="p-2 border border-[#E8E2D9] text-[#1C1410] hover:bg-[#1C1410] hover:text-white transition-all">
                      <Shield size={14} />
                    </button>
                    {m.role !== 'superadmin' && !m.last_login_at && (
                      <button title="Resend Email" onClick={() => handleResend(m.id)} className="p-2 border border-[#E8E2D9] text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                        <RefreshCw size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmDeleteId(m.id)}
                      className="p-2 text-red-500 hover:bg-red-50 border border-red-200 hover:border-red-400 transition-all"
                      title="Delete member"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#1C1410]/60 z-50 overflow-y-auto flex items-center justify-center p-6 backdrop-blur-md text-left">
          <div className="bg-white max-w-2xl w-full p-10 md:p-14 shadow-2xl relative animate-slideUp">
            <div className="flex justify-between items-start mb-10 border-b border-[#FAF7F4] pb-6">
              <div>
                <p className="text-[#6B6058] text-[11px] font-bold uppercase tracking-[3px] opacity-40 mb-2">Member Configuration</p>
                <h2 className="font-heading font-bold text-[28px] text-[#1C1410] uppercase tracking-widest">{isEditMode ? 'Modify Access' : 'Invite New Authority'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#1C1410] text-3xl font-light hover:opacity-100 opacity-20 transition">&times;</button>
            </div>

            <form onSubmit={isEditMode ? handleUpdate : handleInvite} className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">Full Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[14px] focus:border-[#1C1410] outline-none font-body shadow-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">Email Address</label>
                  <input required disabled={isEditMode} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-[#D4CCC2] rounded-0 px-5 py-4 text-[14px] focus:border-[#1C1410] outline-none font-body shadow-sm disabled:opacity-40" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#1C1410] uppercase tracking-[2px] block mb-3 opacity-40">Designated Role</label>
                <div className="grid grid-cols-3 gap-4">
                  {['superadmin', 'manager', 'staff'].map(r => (
                    <button 
                      key={r}
                      type="button"
                      onClick={() => setFormData({...formData, role: r})}
                      className={`py-4 border text-[11px] font-bold uppercase tracking-[1px] transition-all ${
                        formData.role === r ? 'bg-[#1C1410] text-white border-[#1C1410]' : 'bg-white text-[#6B6058] border-[#E8E2D9] hover:border-[#1C1410]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#6B6058] mt-3 font-medium italic opacity-60">
                  {formData.role === 'superadmin' ? 'Full administrative control over all modules and staff.' : 
                   formData.role === 'manager' ? 'Can manage products, orders, and reviews. Limited staff management.' : 
                   'Can view dashboard, manage orders and basic inventory updates.'}
                </p>
              </div>

              <div className="flex items-center gap-4 py-4 border-t border-[#FAF7F4]">
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, is_active: !formData.is_active})} 
                  className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${formData.is_active ? 'bg-green-600' : 'bg-red-500'}`}
                >
                  <div className={`w-4 h-4 bg-white shadow-md rounded-full absolute top-1 transition-all ${formData.is_active ? 'left-7' : 'left-1'}`} />
                </button>
                <span className="text-[11px] font-bold uppercase tracking-[2px]">Account is {formData.is_active ? 'Active' : 'Suspended'}</span>
              </div>

              <div className="flex justify-end gap-6 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-[11px] font-bold uppercase tracking-[2px] opacity-40 hover:opacity-100">Cancel</button>
                <button type="submit" className="bg-[#1C1410] text-white px-12 py-4 font-bold uppercase tracking-[3px] text-[11px] shadow-2xl active:scale-95 transition-all">
                  {isEditMode ? 'Update Security Protocol' : 'Issue Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-[#1C1410]/60 z-50 flex items-center justify-center backdrop-blur-md">
          <div className="bg-white p-8 max-w-md w-full mx-4 border border-[#E8E2D9] shadow-2xl animate-slideUp text-left">
            <h3 className="text-[20px] font-bold font-heading text-[#1C1410] uppercase tracking-widest mb-2">Delete Team Member</h3>
            <p className="text-[#6B6058] text-[13px] mb-6 leading-relaxed">
              This will permanently remove this team member and revoke their access. 
              This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-6 py-3 border border-[#E8E2D9] text-[11px] font-bold uppercase tracking-[2px] text-[#6B6058] hover:bg-[#FAF7F4] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setDeletingId(confirmDeleteId)
                  try {
                    await api.delete(`/api/admin/team/${confirmDeleteId}`)
                    setMembers(prev => prev.filter(m => m.id !== confirmDeleteId))
                    showToast('Team member deleted successfully')
                  } catch (err: any) {
                    console.error('Delete failed:', err)
                    showToast(err.response?.data?.error || err.message, 'error')
                  } finally {
                    setDeletingId(null)
                    setConfirmDeleteId(null)
                  }
                }}
                disabled={deletingId === confirmDeleteId}
                className="px-6 py-3 bg-red-600 text-white text-[11px] font-bold uppercase tracking-[2px] shadow-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deletingId === confirmDeleteId ? 'Deleting...' : 'Delete Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
