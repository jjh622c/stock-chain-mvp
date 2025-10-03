// 로컬 스토리지 기반 데이터베이스 (개발/테스트용)
// 나중에 Supabase로 교체 예정

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

export interface Product {
  id: string
  name: string
  category: string
  unit_price: number
  created_at: string
  updated_at: string
}

export interface CreateProduct {
  name: string
  category: string
  unit_price: number
}

// 로컬 스토리지 키
const STORES_KEY = 'stockchain_stores'
const ORDERS_KEY = 'stockchain_orders'
const ORDER_ITEMS_KEY = 'stockchain_order_items'
const PRODUCTS_KEY = 'stockchain_products'

// 품목 템플릿 (실제 마켓봄 상품 데이터 기반)
const PRODUCT_TEMPLATES = [
  // 육가공품
  '양념목전지 6kg', '목살 1kg (목전지)', '삼겹살 1kg', '차돌박이 2.5kg', '항정살 1kg',
  '칼집요리비엔나 1kg', '스팸 클래식 1.81kg',

  // 분말류/조미료
  '소분파우더 1kg', '통파우더 11kg', '떡볶이 분말 11kg', '치킨파우더 1kg',
  '시나몬설탕 500g', '고춧가루 2.5kg', '마늘가루 1kg', '양파가루 1kg',
  '하얀설탕 15kg', '정제염 25kg', '미원 25kg', '다시다 25kg', '흑후추 1kg',

  // 소스류
  '요거트 소스 6.5kg', '크림어니언 소스 6.5kg', '핫칠리 소스 6.5kg',
  '간장 소스 7kg', '양념 소스 7kg', '마라 소스 6.5kg', '파채 소스 6.5kg',
  '스리라차마요 소스 6kg', '덮밥소스 6kg', '오쉐프 마요네즈 3.2kg',
  '오뚜기 케찹 3.3kg', '데리야끼소스 2kg',

  // 과채가공품/샐러드
  '콘샐러드 6kg', '양배추채 2kg', '김치볶음밥믹스 2.5kg', '파채 0.06kgx10',
  '양파채 0.06kgx10',

  // 즉석식품/떡류
  '김치볶음밥 10개', '떡볶이(분말포함) 10개', '떡볶이 떡(밀, 소) 4kgx4',
  '떡볶이 떡(쌀, 중) 1.5kgx10',

  // 냉동식품
  '밀크 모짜렐라 치즈볼 1.2kg', '냉동감자튀김 2.72kg', '해쉬브라운 1.28kg',
  '크리스피치킨 가라아게 1kg', '우유튀김 1kg', '김말이 튀김 1kg',
  '새우튀김 300g', '매콤오징어 튀김 1kg', '팝콘만두 1kg',

  // 농산물
  '깐양파 10kg', '세척당근 10kg', '청양고추 1kg', '레몬 슬라이스 0.5kg x 3',
  '라임 슬라이스 0.5kg x 3', '쌀 20kg', '밀가루 20kg',

  // 축산물/달걀
  '특란 30알x5', '깐메추리알 1kg', '깐메추리알 500g',

  // 유제품
  '눈꽃치즈 엔젤헤어 2kg', '체다 슬라이스치즈 1.8kg', '피자치즈 2.5kg',

  // 음료류
  '코카콜라 355mlx24', '코카콜라 제로 355mlx24', '펩시제로 355mlx24',
  '스프라이트 355mlx24', '진저에일 250mlx6', '생수 500ml 80개',

  // 주류
  '참이슬 360mlx30', '처음처럼 360mlx30', '진로 360mlx30', '새로 360mlx30',
  '테라생맥주', '카스맥주', '켈리맥주', '에반윌리엄스 위스키 750ml',

  // 시럽/음료재료
  '1883 레몬 시럽 1kg', '1883 라임 시럽 1kg', '스모키 얼그레이 시럽 1kg',
  '레몬주스 1L', '불맛 화유 500ml',

  // 일회용품
  '치킨트레이 중 200개', '치킨트레이 소 600개', '소스용기 75파이 2000개',
  '죽용기 중 200개', '니트릴 장갑 100개', '키친타월 250매',
  '화장지 30롤', '젓가락 1000개', '일회용수저 1500개',

  // 절임식품
  '치킨무 벌크 5kg', '치킨무 개별포장 170g x 60', '슬라이스단무지 1kg',
  '무말랭이무침 1kg', '슬라이스 김치 10kg', '스위트콘 3kg',

  // 액체조미료
  '진간장 13L', '맛술 18L', '양조식초 18L', '참기름 1.8L', '대두유 18L',
  '물엿 8kg', '우동다시육수 1.8L',

  // 토핑
  '김가루 1kg', '치킨소금 3gx200', '향취고추 452gx8', '튀긴마늘 후레이크 500g',
  '치즈 시즈닝 1kg', '버터갈릭 시즈닝 1kg', '핫칠리 시즈닝 1kg'
]

// 상품별 기본 단가 정보 (실제 마켓봄 데이터 기반)
const PRODUCT_PRICES: Record<string, number> = {
  // 육가공품
  '양념목전지 6kg': 39500,
  '목살 1kg (목전지)': 6250,
  '삼겹살 1kg': 10000,
  '차돌박이 2.5kg': 40000,
  '항정살 1kg': 14000,
  '칼집요리비엔나 1kg': 6050,
  '스팸 클래식 1.81kg': 20990,

  // 분말류/조미료
  '소분파우더 1kg': 2000,
  '통파우더 11kg': 18650,
  '떡볶이 분말 11kg': 90000,
  '치킨파우더 1kg': 12000,
  '시나몬설탕 500g': 5610,
  '고춧가루 2.5kg': 22980,
  '마늘가루 1kg': 11680,
  '양파가루 1kg': 12880,
  '하얀설탕 15kg': 21890,
  '정제염 25kg': 11800,
  '미원 25kg': 99450,
  '다시다 25kg': 145990,
  '흑후추 1kg': 88000,

  // 소스류
  '요거트 소스 6.5kg': 28000,
  '크림어니언 소스 6.5kg': 28000,
  '핫칠리 소스 6.5kg': 35300,
  '간장 소스 7kg': 26950,
  '양념 소스 7kg': 26180,
  '마라 소스 6.5kg': 32500,
  '파채 소스 6.5kg': 25000,
  '스리라차마요 소스 6kg': 32000,
  '덮밥소스 6kg': 30000,
  '오쉐프 마요네즈 3.2kg': 10877,
  '오뚜기 케찹 3.3kg': 6000,
  '데리야끼소스 2kg': 10940,

  // 과채가공품/샐러드
  '콘샐러드 6kg': 20000,
  '양배추채 2kg': 5000,
  '김치볶음밥믹스 2.5kg': 9000,
  '파채 0.06kgx10': 3000,
  '양파채 0.06kgx10': 3000,

  // 즉석식품/떡류
  '김치볶음밥 10개': 12500,
  '떡볶이(분말포함) 10개': 10600,
  '떡볶이 떡(밀, 소) 4kgx4': 28800,
  '떡볶이 떡(쌀, 중) 1.5kgx10': 31000,

  // 냉동식품
  '밀크 모짜렐라 치즈볼 1.2kg': 16000,
  '냉동감자튀김 2.72kg': 49830,
  '해쉬브라운 1.28kg': 8400,
  '크리스피치킨 가라아게 1kg': 9100,
  '우유튀김 1kg': 10980,
  '김말이 튀김 1kg': 6280,
  '새우튀김 300g': 3800,
  '매콤오징어 튀김 1kg': 12450,
  '팝콘만두 1kg': 5990,

  // 농산물
  '깐양파 10kg': 21990,
  '세척당근 10kg': 10850,
  '청양고추 1kg': 6540,
  '레몬 슬라이스 0.5kg x 3': 18900,
  '라임 슬라이스 0.5kg x 3': 12900,
  '쌀 20kg': 47000,
  '밀가루 20kg': 21100,

  // 축산물/달걀
  '특란 30알x5': 30000,
  '깐메추리알 1kg': 7880,
  '깐메추리알 500g': 5060,

  // 유제품
  '눈꽃치즈 엔젤헤어 2kg': 20900,
  '체다 슬라이스치즈 1.8kg': 17380,
  '피자치즈 2.5kg': 19900,

  // 음료류
  '코카콜라 355mlx24': 21070,
  '코카콜라 제로 355mlx24': 20560,
  '펩시제로 355mlx24': 16000,
  '스프라이트 355mlx24': 15000,
  '진저에일 250mlx6': 3000,
  '생수 500ml 80개': 15000,

  // 주류
  '참이슬 360mlx30': 40000,
  '처음처럼 360mlx30': 40000,
  '진로 360mlx30': 40000,
  '새로 360mlx30': 40000,
  '테라생맥주': 70000,
  '카스맥주': 50000,
  '켈리맥주': 50000,
  '에반윌리엄스 위스키 750ml': 31300,

  // 시럽/음료재료
  '1883 레몬 시럽 1kg': 16000,
  '1883 라임 시럽 1kg': 16000,
  '스모키 얼그레이 시럽 1kg': 15300,
  '레몬주스 1L': 4280,
  '불맛 화유 500ml': 8000,

  // 일회용품
  '치킨트레이 중 200개': 18480,
  '치킨트레이 소 600개': 43800,
  '소스용기 75파이 2000개': 70880,
  '죽용기 중 200개': 25600,
  '니트릴 장갑 100개': 4780,
  '키친타월 250매': 14490,
  '화장지 30롤': 13390,
  '젓가락 1000개': 22500,
  '일회용수저 1500개': 23900,

  // 절임식품
  '치킨무 벌크 5kg': 5750,
  '치킨무 개별포장 170g x 60': 17900,
  '슬라이스단무지 1kg': 3070,
  '무말랭이무침 1kg': 13280,
  '슬라이스 김치 10kg': 13480,
  '스위트콘 3kg': 3780,

  // 액체조미료
  '진간장 13L': 19600,
  '맛술 18L': 26500,
  '양조식초 18L': 14080,
  '참기름 1.8L': 17980,
  '대두유 18L': 37620,
  '물엿 8kg': 8530,
  '우동다시육수 1.8L': 6840,

  // 토핑
  '김가루 1kg': 23400,
  '치킨소금 3gx200': 2750,
  '향취고추 452gx8': 59100,
  '튀긴마늘 후레이크 500g': 7280,
  '치즈 시즈닝 1kg': 19100,
  '버터갈릭 시즈닝 1kg': 19100,
  '핫칠리 시즈닝 1kg': 13700
}

// 초기 데이터 생성
const initializeData = () => {
  if (!localStorage.getItem(STORES_KEY)) {
    const stores: Store[] = [
      {
        id: '1',
        name: '본점',
        address: '서울 강남구 테헤란로 123',
        manager_phone: '010-1234-5678',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: '2호점',
        address: '서울 마포구 홍대입구 456',
        manager_phone: '010-2345-6789',
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: '3호점',
        address: '서울 송파구 잠실동 789',
        manager_phone: '010-3456-7890',
        created_at: new Date().toISOString()
      }
    ]
    localStorage.setItem(STORES_KEY, JSON.stringify(stores))
  }

  if (!localStorage.getItem(ORDERS_KEY)) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify([]))
  }

  if (!localStorage.getItem(ORDER_ITEMS_KEY)) {
    localStorage.setItem(ORDER_ITEMS_KEY, JSON.stringify([]))
  }

  if (!localStorage.getItem(PRODUCTS_KEY)) {
    // 기본 상품 데이터 생성 (템플릿 기반)
    const defaultProducts: Product[] = Object.entries(PRODUCT_PRICES).map(([name, price], index) => ({
      id: generateId(),
      name,
      category: getCategoryFromName(name),
      unit_price: price,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts))
  }
}

// 헬퍼 함수들
const getFromStorage = <T>(key: string): T[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

const saveToStorage = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data))
}

const generateId = () => Math.random().toString(36).substr(2, 9)

const getCategoryFromName = (name: string): string => {
  if (name.includes('목전지') || name.includes('삼겹살') || name.includes('차돌박이') || name.includes('항정살') || name.includes('비엔나') || name.includes('스팸')) return '육가공품'
  if (name.includes('파우더') || name.includes('분말') || name.includes('설탕') || name.includes('염') || name.includes('미원') || name.includes('다시다') || name.includes('후추')) return '분말류/조미료'
  if (name.includes('소스') || name.includes('마요네즈') || name.includes('케찹')) return '소스류'
  if (name.includes('샐러드') || name.includes('양배추') || name.includes('김치') || name.includes('파채') || name.includes('양파채')) return '과채가공품/샐러드'
  if (name.includes('볶음밥') || name.includes('떡볶이') || name.includes('떡')) return '즉석식품/떡류'
  if (name.includes('치즈볼') || name.includes('감자튀김') || name.includes('해쉬브라운') || name.includes('치킨') || name.includes('튀김') || name.includes('만두')) return '냉동식품'
  if (name.includes('양파') || name.includes('당근') || name.includes('고추') || name.includes('레몬') || name.includes('라임') || name.includes('쌀') || name.includes('밀가루')) return '농산물'
  if (name.includes('특란') || name.includes('계란') || name.includes('메추리알')) return '축산물/달걀'
  if (name.includes('치즈') || name.includes('엔젤헤어')) return '유제품'
  if (name.includes('콜라') || name.includes('제로') || name.includes('펩시') || name.includes('스프라이트') || name.includes('진저에일') || name.includes('생수')) return '음료류'
  if (name.includes('참이슬') || name.includes('처음처럼') || name.includes('진로') || name.includes('새로') || name.includes('맥주') || name.includes('위스키')) return '주류'
  if (name.includes('시럽') || name.includes('레몬주스') || name.includes('화유')) return '시럽/음료재료'
  if (name.includes('트레이') || name.includes('용기') || name.includes('장갑') || name.includes('타월') || name.includes('화장지') || name.includes('젓가락') || name.includes('수저')) return '일회용품'
  if (name.includes('치킨무') || name.includes('단무지') || name.includes('무말랭이') || name.includes('김치') || name.includes('스위트콘')) return '절임식품'
  if (name.includes('간장') || name.includes('맛술') || name.includes('식초') || name.includes('참기름') || name.includes('대두유') || name.includes('물엿') || name.includes('육수')) return '액체조미료'
  if (name.includes('김가루') || name.includes('치킨소금') || name.includes('향취고추') || name.includes('마늘') || name.includes('시즈닝')) return '토핑'
  return '기타'
}

// 매장 서비스
export const storeService = {
  async getAll(): Promise<Store[]> {
    initializeData()
    return getFromStorage<Store>(STORES_KEY)
  },

  async getById(id: string): Promise<Store | null> {
    const stores = await this.getAll()
    return stores.find(store => store.id === id) || null
  },

  async update(id: string, updates: Partial<Store>): Promise<Store | null> {
    initializeData()
    const stores = getFromStorage<Store>(STORES_KEY)
    const storeIndex = stores.findIndex(store => store.id === id)

    if (storeIndex === -1) {
      return null
    }

    stores[storeIndex] = {
      ...stores[storeIndex],
      ...updates,
      updated_at: new Date().toISOString()
    }

    saveToStorage(STORES_KEY, stores)
    return stores[storeIndex]
  }
}

// 주문 서비스
export const orderService = {
  // 오늘 주문 요약
  async getTodaysSummary(storeId: string) {
    initializeData()
    const orders = getFromStorage<Order>(ORDERS_KEY)
    const today = new Date().toISOString().split('T')[0]

    const todayOrders = orders.filter(order =>
      order.store_id === storeId &&
      order.order_date.startsWith(today) &&
      order.status === 'completed'
    )

    const orderCount = todayOrders.length
    const totalAmount = todayOrders.reduce((sum, order) => sum + order.total_amount, 0)

    return { orderCount, totalAmount }
  },

  // 오늘 주문 상세 목록
  async getTodaysOrders(storeId: string) {
    initializeData()
    const orders = getFromStorage<Order>(ORDERS_KEY)
    const orderItems = getFromStorage<OrderItem>(ORDER_ITEMS_KEY)
    const today = new Date().toISOString().split('T')[0]

    const todayOrders = orders.filter(order =>
      order.store_id === storeId &&
      order.order_date.startsWith(today) &&
      order.status === 'completed'
    )

    // 각 주문에 상품들 연결
    return todayOrders.map(order => ({
      ...order,
      items: orderItems.filter(item => item.order_id === order.id)
    }))
  },

  // 월별 주문 조회
  async getByMonth(storeId: string, monthOffset: number = 0) {
    initializeData()
    const orders = getFromStorage<Order>(ORDERS_KEY)
    const orderItems = getFromStorage<OrderItem>(ORDER_ITEMS_KEY)

    const now = new Date()
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
    const nextMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 1)

    const monthOrders = orders.filter(order => {
      const orderDate = new Date(order.order_date)
      return order.store_id === storeId &&
             orderDate >= targetMonth &&
             orderDate < nextMonth
    })

    return monthOrders.map(order => ({
      ...order,
      items: orderItems.filter(item => item.order_id === order.id)
    })).sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
  },

  // 새 주문 생성
  async create(storeId: string, items: CreateOrderItem[]) {
    initializeData()
    const orders = getFromStorage<Order>(ORDERS_KEY)
    const orderItems = getFromStorage<OrderItem>(ORDER_ITEMS_KEY)

    const orderId = generateId()
    const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0)
    const now = new Date().toISOString()

    // 새 주문 생성
    const newOrder: Order = {
      id: orderId,
      store_id: storeId,
      total_amount: totalAmount,
      status: 'completed',
      order_date: now,
      created_at: now
    }

    // 주문 상품들 생성
    const newOrderItems: OrderItem[] = items.map(item => ({
      id: generateId(),
      order_id: orderId,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      created_at: now
    }))

    // 저장
    orders.push(newOrder)
    orderItems.push(...newOrderItems)

    saveToStorage(ORDERS_KEY, orders)
    saveToStorage(ORDER_ITEMS_KEY, orderItems)

    return {
      order: newOrder,
      items: newOrderItems
    }
  },

  // 일별 통계 (30일)
  async getDailyStats(storeId: string, days: number = 30) {
    initializeData()
    const orders = getFromStorage<Order>(ORDERS_KEY)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const recentOrders = orders.filter(order => {
      const orderDate = new Date(order.order_date)
      return order.store_id === storeId &&
             order.status === 'completed' &&
             orderDate >= startDate
    })

    // 날짜별로 그룹핑
    const dailyStats = recentOrders.reduce((acc, order) => {
      const date = order.order_date.split('T')[0]
      if (!acc[date]) {
        acc[date] = { date, orderCount: 0, totalAmount: 0 }
      }
      acc[date].orderCount++
      acc[date].totalAmount += order.total_amount
      return acc
    }, {} as Record<string, { date: string; orderCount: number; totalAmount: number }>)

    return Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date))
  },

  // 주문 상세 정보 조회 (개별 아이템 포함)
  async getOrderDetails(orderId: string) {
    initializeData()
    const orders = getFromStorage<Order>(ORDERS_KEY)
    const orderItems = getFromStorage<OrderItem>(ORDER_ITEMS_KEY)

    const order = orders.find(o => o.id === orderId)
    if (!order) {
      throw new Error('주문을 찾을 수 없습니다.')
    }

    const items = orderItems.filter(item => item.order_id === orderId)

    return {
      ...order,
      items
    }
  },

  // 개별 주문 아이템 취소
  async cancelOrderItem(itemId: string) {
    initializeData()
    const orderItems = getFromStorage<OrderItem>(ORDER_ITEMS_KEY)
    const orders = getFromStorage<Order>(ORDERS_KEY)

    const itemIndex = orderItems.findIndex(item => item.id === itemId)
    if (itemIndex === -1) {
      throw new Error('아이템을 찾을 수 없습니다.')
    }

    const item = orderItems[itemIndex]
    const order = orders.find(o => o.id === item.order_id)
    if (!order) {
      throw new Error('주문을 찾을 수 없습니다.')
    }

    // 아이템을 목록에서 제거
    orderItems.splice(itemIndex, 1)

    // 주문 총액 재계산
    const remainingItems = orderItems.filter(i => i.order_id === item.order_id)
    const newTotal = remainingItems.reduce((sum, i) => sum + i.total_price, 0)

    if (newTotal === 0) {
      // 모든 아이템이 취소되면 주문 자체를 취소
      order.status = 'cancelled'
      order.total_amount = 0
    } else {
      // 주문 총액 업데이트
      order.total_amount = newTotal
    }

    saveToStorage(ORDER_ITEMS_KEY, orderItems)
    saveToStorage(ORDERS_KEY, orders)

    return { success: true, newTotal, orderCancelled: newTotal === 0 }
  },

  // 개별 주문 아이템 수정
  async updateOrderItem(itemId: string, updates: { quantity?: number; unit_price?: number }) {
    initializeData()
    const orderItems = getFromStorage<OrderItem>(ORDER_ITEMS_KEY)
    const orders = getFromStorage<Order>(ORDERS_KEY)

    const itemIndex = orderItems.findIndex(item => item.id === itemId)
    if (itemIndex === -1) {
      throw new Error('아이템을 찾을 수 없습니다.')
    }

    const item = orderItems[itemIndex]
    const order = orders.find(o => o.id === item.order_id)
    if (!order) {
      throw new Error('주문을 찾을 수 없습니다.')
    }

    // 아이템 정보 업데이트
    if (updates.quantity !== undefined) {
      item.quantity = updates.quantity
    }
    if (updates.unit_price !== undefined) {
      item.unit_price = updates.unit_price
    }

    // 총 가격 재계산
    item.total_price = item.quantity * item.unit_price

    // 주문 총액 재계산
    const allOrderItems = orderItems.filter(i => i.order_id === item.order_id)
    const newTotal = allOrderItems.reduce((sum, i) => sum + i.total_price, 0)
    order.total_amount = newTotal

    saveToStorage(ORDER_ITEMS_KEY, orderItems)
    saveToStorage(ORDERS_KEY, orders)

    return { success: true, newTotal, updatedItem: item }
  },

  // 전체 주문 취소
  async cancelOrder(orderId: string) {
    initializeData()
    const orders = getFromStorage<Order>(ORDERS_KEY)

    const orderIndex = orders.findIndex(o => o.id === orderId)
    if (orderIndex === -1) {
      throw new Error('주문을 찾을 수 없습니다.')
    }

    orders[orderIndex].status = 'cancelled'
    saveToStorage(ORDERS_KEY, orders)

    return { success: true }
  },

  // 기존 주문에 새 항목 추가
  async addItemToOrder(orderId: string, newItem: CreateOrderItem) {
    initializeData()
    const orders = getFromStorage<Order>(ORDERS_KEY)
    const orderItems = getFromStorage<OrderItem>(ORDER_ITEMS_KEY)

    const order = orders.find(o => o.id === orderId)
    if (!order) {
      throw new Error('주문을 찾을 수 없습니다.')
    }

    // 새 주문 아이템 생성
    const orderItem: OrderItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      order_id: orderId,
      product_name: newItem.product_name,
      quantity: newItem.quantity,
      unit_price: newItem.unit_price,
      total_price: newItem.total_price,
      created_at: new Date().toISOString()
    }

    // 아이템 추가
    orderItems.push(orderItem)

    // 주문 총액 재계산
    const allOrderItems = orderItems.filter(item => item.order_id === orderId)
    const newTotal = allOrderItems.reduce((sum, item) => sum + item.total_price, 0)
    order.total_amount = newTotal

    saveToStorage(ORDER_ITEMS_KEY, orderItems)
    saveToStorage(ORDERS_KEY, orders)

    return { success: true, newTotal, addedItem: orderItem }
  }
}

// 상품 자동완성 서비스
export const productService = {
  async getProductNames(searchTerm: string = '', limit: number = 10) {
    initializeData()
    const orderItems = getFromStorage<OrderItem>(ORDER_ITEMS_KEY)

    // 기존 주문 상품명 + 템플릿 결합
    let allProductNames = [
      ...orderItems.map(item => item.product_name),
      ...PRODUCT_TEMPLATES
    ]

    if (searchTerm) {
      allProductNames = allProductNames.filter(name =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 중복 제거 및 정렬 (기존 주문 상품이 우선순위)
    const existingProducts = new Set(orderItems.map(item => item.product_name))
    const uniqueNames = [...new Set(allProductNames)]
      .sort((a, b) => {
        // 기존 주문 상품을 먼저 표시
        const aExists = existingProducts.has(a)
        const bExists = existingProducts.has(b)

        if (aExists && !bExists) return -1
        if (!aExists && bExists) return 1

        return a.localeCompare(b)
      })
      .slice(0, limit)

    return uniqueNames
  },

  async getProductPrice(productName: string): Promise<number | null> {
    // 미리 정의된 단가가 있으면 반환
    if (PRODUCT_PRICES[productName]) {
      return PRODUCT_PRICES[productName]
    }

    // 기존 주문에서 해당 상품의 최근 단가 조회
    initializeData()
    const orderItems = getFromStorage<OrderItem>(ORDER_ITEMS_KEY)

    const recentItem = orderItems
      .filter(item => item.product_name === productName)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

    return recentItem ? recentItem.unit_price : null
  }
}

// 상품 관리 서비스
export const productManagementService = {
  async getAll(): Promise<Product[]> {
    initializeData()
    return getFromStorage<Product>(PRODUCTS_KEY)
  },

  async getById(id: string): Promise<Product | null> {
    const products = await this.getAll()
    return products.find(product => product.id === id) || null
  },

  async create(productData: CreateProduct): Promise<Product> {
    initializeData()
    const products = getFromStorage<Product>(PRODUCTS_KEY)

    const newProduct: Product = {
      id: generateId(),
      name: productData.name,
      category: productData.category,
      unit_price: productData.unit_price,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    products.push(newProduct)
    saveToStorage(PRODUCTS_KEY, products)

    return newProduct
  },

  async update(id: string, productData: Partial<CreateProduct>): Promise<Product | null> {
    initializeData()
    const products = getFromStorage<Product>(PRODUCTS_KEY)

    const index = products.findIndex(product => product.id === id)
    if (index === -1) return null

    const updatedProduct = {
      ...products[index],
      ...productData,
      updated_at: new Date().toISOString()
    }

    products[index] = updatedProduct
    saveToStorage(PRODUCTS_KEY, products)

    return updatedProduct
  },

  async delete(id: string): Promise<boolean> {
    initializeData()
    const products = getFromStorage<Product>(PRODUCTS_KEY)

    const filteredProducts = products.filter(product => product.id !== id)
    if (filteredProducts.length === products.length) return false

    saveToStorage(PRODUCTS_KEY, filteredProducts)
    return true
  },

  async searchByName(searchTerm: string): Promise<Product[]> {
    const products = await this.getAll()
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  },

  async getByCategory(category: string): Promise<Product[]> {
    const products = await this.getAll()
    return products.filter(product => product.category === category)
  },

  async getCategories(): Promise<string[]> {
    const products = await this.getAll()
    const categories = [...new Set(products.map(product => product.category))]
    return categories.sort()
  }
}

// 초기화 함수 호출
initializeData()