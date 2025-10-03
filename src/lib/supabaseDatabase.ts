import { supabase } from './supabase'

// 타입 정의
export interface Store {
  id: string
  name: string
  address: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  price: number
  category: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  store_id: string
  total_amount: number
  status: string
  order_date: string
  created_at: string
  updated_at: string
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

// 매장 서비스
export const storeService = {
  async getAll(): Promise<Store[]> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('created_at')

    if (error) {
      console.error('Error fetching stores:', error)
      throw error
    }

    return data || []
  },

  async getById(id: string): Promise<Store | null> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      console.error('Error fetching store:', error)
      throw error
    }

    return data
  },

  async update(id: string, updates: Partial<Store>): Promise<Store | null> {
    const { data, error } = await supabase
      .from('stores')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating store:', error)
      throw error
    }

    return data
  }
}

// 상품 서비스
export const productService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching products:', error)
      throw error
    }

    return data || []
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      throw error
    }

    return data
  },

  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      throw error
    }

    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }
}

// 주문 서비스
export const orderService = {
  // 매장별 주문 목록 조회
  async getByStore(storeId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      throw error
    }

    return data || []
  },

  // 주문 상세 조회 (주문 항목 포함)
  async getById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      console.error('Error fetching order:', error)
      throw error
    }

    return data
  },

  // 주문 항목 조회
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at')

    if (error) {
      console.error('Error fetching order items:', error)
      throw error
    }

    return data || []
  },

  // 새 주문 생성
  async create(storeId: string, items: CreateOrderItem[]): Promise<Order> {
    // 총액 계산
    const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0)

    // 주문 생성
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        store_id: storeId,
        total_amount: totalAmount,
        status: 'completed'
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      throw orderError
    }

    // 주문 항목 생성
    const orderItems = items.map(item => ({
      ...item,
      order_id: order.id
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      throw itemsError
    }

    return order
  },

  // 주문 삭제
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting order:', error)
      throw error
    }
  },

  // 주문에 새 항목 추가
  async addItemToOrder(orderId: string, newItem: CreateOrderItem): Promise<void> {
    // 새 주문 항목 추가
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        ...newItem,
        order_id: orderId
      })

    if (itemError) {
      console.error('Error adding item to order:', itemError)
      throw itemError
    }

    // 주문 총액 재계산
    const items = await this.getOrderItems(orderId)
    const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0)

    // 주문 총액 업데이트
    const { error: updateError } = await supabase
      .from('orders')
      .update({ total_amount: totalAmount })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order total:', updateError)
      throw updateError
    }
  },

  // 주문 항목 수정
  async updateOrderItem(itemId: string, updates: Partial<OrderItem>): Promise<void> {
    const { error } = await supabase
      .from('order_items')
      .update(updates)
      .eq('id', itemId)

    if (error) {
      console.error('Error updating order item:', error)
      throw error
    }

    // 총액 재계산이 필요한 경우
    if (updates.quantity || updates.unit_price || updates.total_price) {
      const { data: item } = await supabase
        .from('order_items')
        .select('order_id')
        .eq('id', itemId)
        .single()

      if (item) {
        const items = await this.getOrderItems(item.order_id)
        const totalAmount = items.reduce((sum, orderItem) => sum + orderItem.total_price, 0)

        await supabase
          .from('orders')
          .update({ total_amount: totalAmount })
          .eq('id', item.order_id)
      }
    }
  },

  // 주문 항목 삭제
  async deleteOrderItem(itemId: string): Promise<void> {
    // 주문 ID 먼저 가져오기
    const { data: item } = await supabase
      .from('order_items')
      .select('order_id')
      .eq('id', itemId)
      .single()

    // 항목 삭제
    const { error } = await supabase
      .from('order_items')
      .delete()
      .eq('id', itemId)

    if (error) {
      console.error('Error deleting order item:', error)
      throw error
    }

    // 총액 재계산
    if (item) {
      const items = await this.getOrderItems(item.order_id)
      const totalAmount = items.reduce((sum, orderItem) => sum + orderItem.total_price, 0)

      await supabase
        .from('orders')
        .update({ total_amount: totalAmount })
        .eq('id', item.order_id)
    }
  },

  // 오늘 주문 요약
  async getTodaysSummary(storeId: string) {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('orders')
      .select('total_amount, status')
      .eq('store_id', storeId)
      .eq('order_date', today)

    if (error) {
      console.error('Error fetching today summary:', error)
      throw error
    }

    const totalOrders = data.length
    const totalRevenue = data.reduce((sum, order) => sum + order.total_amount, 0)

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    }
  },

  // 일별 통계 (한 달치)
  async getDailyStats(storeId: string) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const startDate = thirtyDaysAgo.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('orders')
      .select('order_date, total_amount')
      .eq('store_id', storeId)
      .gte('order_date', startDate)
      .order('order_date')

    if (error) {
      console.error('Error fetching daily stats:', error)
      throw error
    }

    // 날짜별 주문량 집계
    const dailyStats = data.reduce((acc, order) => {
      const date = order.order_date
      if (!acc[date]) {
        acc[date] = { date, orders: 0, revenue: 0 }
      }
      acc[date].orders += 1
      acc[date].revenue += order.total_amount
      return acc
    }, {} as Record<string, { date: string; orders: number; revenue: number }>)

    return Object.values(dailyStats)
  }
}

// 카테고리 분류 함수 (기존과 동일)
export const getCategoryFromName = (name: string): string => {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('치킨') || lowerName.includes('윙') || lowerName.includes('닭')) return '치킨'
  if (lowerName.includes('너겟') || lowerName.includes('볼') || lowerName.includes('감자')) return '사이드'
  if (lowerName.includes('콜라') || lowerName.includes('사이다') || lowerName.includes('음료') || lowerName.includes('주스')) return '음료'
  if (lowerName.includes('김가루') || lowerName.includes('치킨소금') || lowerName.includes('향취고추') || lowerName.includes('마늘') || lowerName.includes('시즈닝')) return '토핑'
  return '기타'
}