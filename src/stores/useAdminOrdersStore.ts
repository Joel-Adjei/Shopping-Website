import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { AdminOrder } from '../types'

type AdminOrdersState = {
  orders: AdminOrder[]
  message: string
  fetchOrders: () => Promise<void>
  clear: () => void
}

export const useAdminOrdersStore = create<AdminOrdersState>()((set) => ({
  orders: [],
  message: '',

  fetchOrders: async () => {
    if (!supabase) return
    const { data, error } = await supabase
      .from('orders')
      .select('id,order_number,total,order_status,created_at')
      .order('created_at', { ascending: false })
      .limit(30)

    if (error) {
      set({
        message:
          'Could not load orders. Confirm the signed-in user has the admin role and database policies are installed.',
      })
      return
    }
    set({
      message: '',
      orders: (data ?? []).map((order) => ({ ...order, total: Number(order.total) })) as AdminOrder[],
    })
  },

  clear: () => set({ orders: [], message: '' }),
}))
