import { supabase } from './supabase'

// Types based on our schema
export interface Store {
  id: string
  name: string
  address: string
  manager_phone: string
  created_at: string
}

export interface Order {
  id: string
  store_id: string
  total_amount: number
  status: 'completed' | 'cancelled'
  order_date: string
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface CreateOrderItem {
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

// Store services
export const storeService = {
  async getAll() {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('name')

    if (error) throw error
    return data as Store[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Store
  }
}

// Order services
export const orderService = {
  // Get today's orders summary
  async getTodaysSummary(storeId: string) {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('store_id', storeId)
      .gte('order_date', `${today}T00:00:00`)
      .lt('order_date', `${today}T23:59:59`)
      .eq('status', 'completed')

    if (error) throw error

    const orderCount = data.length
    const totalAmount = data.reduce((sum, order) => sum + order.total_amount, 0)

    return { orderCount, totalAmount }
  },

  // Get orders by month
  async getByMonth(storeId: string, monthOffset: number = 0) {
    const now = new Date()
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
    const nextMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 1)

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('store_id', storeId)
      .gte('order_date', targetMonth.toISOString())
      .lt('order_date', nextMonth.toISOString())
      .order('order_date', { ascending: false })

    if (error) throw error
    return data
  },

  // Create new order with items
  async create(storeId: string, items: CreateOrderItem[]) {
    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0)

    // Create order first
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        store_id: storeId,
        total_amount: totalAmount,
        status: 'completed'
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = items.map(item => ({
      ...item,
      order_id: order.id
    }))

    const { data: createdItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select()

    if (itemsError) throw itemsError

    return {
      order,
      items: createdItems
    }
  },

  // Get daily stats for graph (30 days)
  async getDailyStats(storeId: string, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('orders')
      .select('order_date, total_amount')
      .eq('store_id', storeId)
      .eq('status', 'completed')
      .gte('order_date', startDate.toISOString())
      .order('order_date')

    if (error) throw error

    // Group by date
    const dailyStats = data.reduce((acc, order) => {
      const date = order.order_date.split('T')[0]
      if (!acc[date]) {
        acc[date] = { date, orderCount: 0, totalAmount: 0 }
      }
      acc[date].orderCount++
      acc[date].totalAmount += order.total_amount
      return acc
    }, {} as Record<string, { date: string; orderCount: number; totalAmount: number }>)

    return Object.values(dailyStats)
  }
}

// Product services for autocomplete
export const productService = {
  async getProductNames(searchTerm: string = '', limit: number = 10) {
    let query = supabase
      .from('order_items')
      .select('product_name')

    if (searchTerm) {
      query = query.ilike('product_name', `%${searchTerm}%`)
    }

    const { data, error } = await query
      .order('product_name')
      .limit(limit)

    if (error) throw error

    // Return unique product names
    const uniqueNames = [...new Set(data.map(item => item.product_name))]
    return uniqueNames
  }
}