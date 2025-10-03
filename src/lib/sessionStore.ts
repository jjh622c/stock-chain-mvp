// 세션 기반 매장 선택 관리
const SELECTED_STORE_KEY = 'stockchain_selected_store'

export interface SelectedStore {
  id: string
  name: string
  address: string
}

export const sessionStore = {
  // 선택된 매장 저장
  setSelectedStore(store: SelectedStore) {
    sessionStorage.setItem(SELECTED_STORE_KEY, JSON.stringify(store))
  },

  // 선택된 매장 조회
  getSelectedStore(): SelectedStore | null {
    try {
      const stored = sessionStorage.getItem(SELECTED_STORE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  },

  // 매장 선택 해제
  clearSelectedStore() {
    sessionStorage.removeItem(SELECTED_STORE_KEY)
  },

  // 매장이 선택되었는지 확인
  hasSelectedStore(): boolean {
    return this.getSelectedStore() !== null
  }
}