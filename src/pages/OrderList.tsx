import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ArrowLeft, Package, Download, Edit2, Trash2, AlertTriangle, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { orderService, productService, getCategoryFromName } from "@/lib/supabaseDatabase";
import { sessionStore, SelectedStore } from "@/lib/sessionStore";
import { useToast } from "@/hooks/use-toast";

interface OrderWithItems {
  id: string;
  store_id: string;
  total_amount: number;
  status: 'completed' | 'cancelled';
  order_date: string;
  created_at: string;
  items: {
    id: string;
    order_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
  }[];
}

const OrderList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState<SelectedStore | null>(null);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthOffset, setMonthOffset] = useState(0); // 0 = 이번달, 1 = 저번달, 2 = 2달전

  // 주문 상세 모달 관련 상태
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: string; quantity: number; unit_price: number } | null>(null);

  // 새 항목 추가 관련 상태
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [newItem, setNewItem] = useState({
    product_name: "",
    quantity: 1,
    unit_price: 0,
    total_price: 0
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // 세션에서 선택된 매장 조회
    const sessionSelectedStore = sessionStore.getSelectedStore();
    if (!sessionSelectedStore) {
      // 선택된 매장이 없으면 매장선택 페이지로 이동
      navigate('/');
      return;
    }
    setSelectedStore(sessionSelectedStore);
    setLoading(false);
  }, [navigate]);

  // 주문 목록 새로고침 함수
  const loadOrders = async () => {
    if (!selectedStore) return;

    try {
      const orderData = await orderService.getByMonth(selectedStore.id, monthOffset);

      // 각 주문의 항목도 함께 불러오기
      const ordersWithItems = await Promise.all(
        orderData.map(async (order) => {
          const items = await orderService.getOrderItems(order.id);
          return { ...order, items };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  useEffect(() => {
    if (selectedStore) {
      loadOrders();
    }
  }, [selectedStore, monthOffset]);

  // 주문 상세 정보 로드
  const loadOrderDetails = async (orderId: string) => {
    try {
      const result = await orderService.getOrderDetails(orderId);
      if (!result) {
        toast({
          title: "오류",
          description: "주문을 찾을 수 없습니다.",
          variant: "destructive"
        });
        return;
      }

      // getOrderDetails가 { order, items } 형태로 반환하므로 변환
      const orderWithItems: OrderWithItems = {
        ...result.order,
        items: result.items
      };

      setSelectedOrder(orderWithItems);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Failed to load order details:', error);
      toast({
        title: "오류",
        description: "주문 상세 정보를 불러올 수 없습니다.",
        variant: "destructive"
      });
    }
  };

  // 개별 아이템 취소
  const handleCancelItem = async (itemId: string) => {
    if (!selectedOrder) return;

    try {
      const result = await orderService.cancelOrderItem(itemId);

      // 주문이 완전히 취소된 경우
      if (result.orderCancelled) {
        toast({
          title: "주문 취소 완료",
          description: "모든 항목이 취소되어 주문이 취소되었습니다."
        });
        setIsDetailModalOpen(false);
      } else {
        toast({
          title: "항목 취소 완료",
          description: "선택한 항목이 취소되었습니다."
        });
        // 주문 상세 정보 새로고침
        await loadOrderDetails(selectedOrder.id);
      }

      // 주문 목록 새로고침
      await loadOrders();
    } catch (error) {
      console.error('Failed to cancel item:', error);
      toast({
        title: "취소 실패",
        description: "항목 취소 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  // 아이템 수정
  const handleUpdateItem = async (itemId: string, updates: { quantity?: number; unit_price?: number }) => {
    if (!selectedOrder) return;

    try {
      const result = await orderService.updateOrderItem(itemId, updates);

      toast({
        title: "수정 완료",
        description: "항목이 성공적으로 수정되었습니다."
      });

      // 주문 상세 정보 새로고침
      await loadOrderDetails(selectedOrder.id);

      // 주문 목록 새로고침
      await loadOrders();

      // 편집 모드 해제
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to update item:', error);
      toast({
        title: "수정 실패",
        description: "항목 수정 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  // 전체 주문 취소
  const handleCancelOrder = async (orderId: string) => {
    if (!selectedOrder) return;

    try {
      await orderService.cancelOrder(orderId);

      toast({
        title: "주문 취소 완료",
        description: "주문이 취소되었습니다."
      });

      setIsDetailModalOpen(false);

      // 주문 목록 새로고침
      await loadOrders();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast({
        title: "취소 실패",
        description: "주문 취소 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  // 목록에서 바로 주문 취소 (원클릭)
  const handleQuickCancelOrder = async (orderId: string) => {
    try {
      await orderService.cancelOrder(orderId);

      toast({
        title: "주문 취소 완료",
        description: "주문이 취소되었습니다."
      });

      // 주문 목록 새로고침
      await loadOrders();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast({
        title: "취소 실패",
        description: "주문 취소 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  // 주문 상태 토글
  const handleToggleOrderStatus = async (orderId: string, currentStatus: 'completed' | 'cancelled') => {
    try {
      const newStatus = currentStatus === 'completed' ? 'cancelled' : 'completed';
      await orderService.updateOrderStatus(orderId, newStatus);

      toast({
        title: "상태 변경 완료",
        description: `주문이 ${newStatus === 'completed' ? '완료' : '취소'} 상태로 변경되었습니다.`
      });

      // 주문 목록 새로고침
      await loadOrders();
    } catch (error) {
      console.error('Failed to toggle order status:', error);
      toast({
        title: "상태 변경 실패",
        description: "주문 상태 변경 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  // 새 항목 추가 관련 함수들
  const handleNewItemNameChange = async (value: string) => {
    setNewItem(prev => ({ ...prev, product_name: value }));

    if (value.length > 0) {
      try {
        const productNames = await productService.getProductNames(value, 5);
        setSuggestions(productNames);
        setShowSuggestions(productNames.length > 0);
      } catch (error) {
        console.error('Failed to fetch product suggestions:', error);
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const selectNewItemSuggestion = async (productName: string) => {
    const defaultPrice = await productService.getProductPrice(productName);

    setNewItem(prev => ({
      ...prev,
      product_name: productName,
      unit_price: defaultPrice || prev.unit_price,
      total_price: (defaultPrice || prev.unit_price) * prev.quantity
    }));
    setShowSuggestions(false);
  };

  const handleAddNewItem = async () => {
    if (!selectedOrder || !newItem.product_name || newItem.unit_price <= 0 || newItem.quantity <= 0) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 올바르게 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      // 기존 상품 목록에서 해당 상품 확인
      const existingProducts = await productService.getAll();
      const existingProduct = existingProducts.find(
        product => product.name.toLowerCase() === newItem.product_name.toLowerCase()
      );

      // 기존에 없는 상품이면 자동으로 등록
      if (!existingProduct) {
        const newProduct = {
          name: newItem.product_name,
          category: productService.getCategoryFromName(newItem.product_name),
          unit_price: newItem.unit_price,
          description: `주문 수정 시 자동 생성된 상품`
        };

        await productService.create(newProduct);

        toast({
          title: "새 상품 등록",
          description: `${newItem.product_name}이(가) 상품 목록에 자동으로 추가되었습니다.`
        });
      }

      // 주문에 새 항목 추가
      await orderService.addItemToOrder(selectedOrder.id, {
        product_name: newItem.product_name,
        quantity: newItem.quantity,
        unit_price: newItem.unit_price,
        total_price: newItem.unit_price * newItem.quantity
      });

      toast({
        title: "항목 추가 완료",
        description: "새 항목이 주문에 추가되었습니다."
      });

      // 새 항목 입력 폼 리셋
      setNewItem({
        product_name: "",
        quantity: 1,
        unit_price: 0,
        total_price: 0
      });
      setIsAddingNewItem(false);

      // 주문 상세 정보 새로고침
      await loadOrderDetails(selectedOrder.id);

      // 주문 목록 새로고침
      await loadOrders();
    } catch (error) {
      console.error('Failed to add new item:', error);
      toast({
        title: "추가 실패",
        description: "새 항목 추가 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  // 새 항목의 총액 계산 effect
  useEffect(() => {
    setNewItem(prev => ({
      ...prev,
      total_price: prev.unit_price * prev.quantity
    }));
  }, [newItem.unit_price, newItem.quantity]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-muted-foreground">매장 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (!selectedStore) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">매장을 먼저 선택해주세요</h2>
          <p className="text-muted-foreground mb-4">주문 목록을 조회하려면 매장을 선택해야 합니다.</p>
          <Button onClick={() => navigate('/')}>
            매장 선택하기
          </Button>
        </div>
      </div>
    );
  }
  const getMonthLabel = (offset: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() - offset);
    return format(date, "yyyy년 MM월", { locale: ko });
  };

  const exportToCSV = () => {
    if (orders.length === 0) {
      return;
    }

    // CSV 헤더
    const headers = [
      '주문번호',
      '주문일시',
      '품목명',
      '수량',
      '단가',
      '총액',
      '상태'
    ];

    // CSV 데이터 생성
    const csvData = [];
    csvData.push(headers.join(','));

    orders.forEach(order => {
      order.items.forEach(item => {
        const row = [
          `"${order.id}"`,
          `"${format(new Date(order.order_date), "yyyy-MM-dd HH:mm", { locale: ko })}"`,
          `"${item.product_name}"`,
          item.quantity,
          item.unit_price,
          item.total_price,
          `"${order.status === 'completed' ? '완료' : '취소'}"`
        ];
        csvData.push(row.join(','));
      });
    });

    // CSV 파일 다운로드
    const csvContent = csvData.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${selectedStore.name}_${getMonthLabel(monthOffset)}_주문목록.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">주문 목록</h1>
            <p className="text-muted-foreground">{selectedStore.name} - 주문 내역을 조회하세요</p>
          </div>
        </div>

        {/* Month Filter Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>기간 선택</CardTitle>
            <CardDescription>조회할 월을 선택하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={monthOffset === 0 ? "default" : "outline"}
                onClick={() => setMonthOffset(0)}
              >
                {getMonthLabel(0)} (이번 달)
              </Button>
              <Button
                variant={monthOffset === 1 ? "default" : "outline"}
                onClick={() => setMonthOffset(1)}
              >
                {getMonthLabel(1)} (저번 달)
              </Button>
              <Button
                variant={monthOffset === 2 ? "default" : "outline"}
                onClick={() => setMonthOffset(2)}
              >
                {getMonthLabel(2)} (2달 전)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{getMonthLabel(monthOffset)} 주문 내역</CardTitle>
                <CardDescription>
                  총 {orders.length}개 주문 • {orders.reduce((sum, order) => sum + order.total_amount, 0).toLocaleString()}원
                </CardDescription>
              </div>
              {orders.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCSV}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  CSV 내보내기
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {getMonthLabel(monthOffset)}에 주문이 없습니다.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>주문번호</TableHead>
                    <TableHead>주문일시</TableHead>
                    <TableHead>품목</TableHead>
                    <TableHead>총 금액</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="w-24">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <Button
                          variant="ghost"
                          className="p-0 h-auto font-medium hover:text-primary"
                          onClick={() => loadOrderDetails(order.id)}
                        >
                          #{order.id.slice(0, 8)}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {format(new Date(order.order_date), "MM월 dd일", { locale: ko })}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(order.order_date), "HH:mm", { locale: ko })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {order.items.slice(0, 2).map((item) => (
                            <div key={item.id} className="text-sm">
                              <span className="font-medium">{item.product_name}</span>
                              <span className="text-muted-foreground ml-2">
                                {item.quantity}개 × {item.unit_price.toLocaleString()}원
                              </span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-sm text-muted-foreground">
                              외 {order.items.length - 2}개 품목
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-primary">
                        {order.total_amount.toLocaleString()}원
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={order.status === "completed"}
                            onCheckedChange={() => handleToggleOrderStatus(order.id, order.status)}
                            id={`order-${order.id}`}
                          />
                          <label
                            htmlFor={`order-${order.id}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {order.status === "completed" ? "완료" : "미완료"}
                          </label>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.status === "completed" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickCancelOrder(order.id);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={() => navigate('/order')}>
                새 주문 등록
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                대시보드로 돌아가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 주문 상세 모달 */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              주문 상세 정보
            </DialogTitle>
            <DialogDescription>
              {selectedOrder && (
                <>
                  주문번호: #{selectedOrder.id.slice(0, 8)} •
                  {format(new Date(selectedOrder.order_date), "yyyy년 MM월 dd일 HH:mm", { locale: ko })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* 주문 요약 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">주문 요약</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">총 항목</Label>
                      <p className="font-medium">{selectedOrder.items.length}개</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">총 금액</Label>
                      <p className="font-medium text-primary">{selectedOrder.total_amount.toLocaleString()}원</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">상태</Label>
                      <div>
                        <Badge
                          variant={selectedOrder.status === "completed" ? "default" : "secondary"}
                          className={selectedOrder.status === "completed" ? "bg-green-500" : ""}
                        >
                          {selectedOrder.status === "completed" ? "완료" : "취소"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">주문일시</Label>
                      <p className="font-medium text-sm">
                        {format(new Date(selectedOrder.order_date), "MM/dd HH:mm", { locale: ko })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 주문 항목 목록 */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">주문 항목</CardTitle>
                    {selectedOrder.status === "completed" && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAddingNewItem(!isAddingNewItem)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          새 항목 추가
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelOrder(selectedOrder.id)}
                          className="flex items-center gap-2"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          전체 주문 취소
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-lg">{item.product_name}</h4>
                            <div className="text-sm text-muted-foreground mt-1">
                              등록일: {format(new Date(item.created_at), "yyyy-MM-dd HH:mm", { locale: ko })}
                            </div>
                          </div>
                          {selectedOrder.status === "completed" && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingItem({
                                  id: item.id,
                                  quantity: item.quantity,
                                  unit_price: item.unit_price
                                })}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {editingItem && editingItem.id === item.id ? (
                          // 편집 모드
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label htmlFor={`quantity-${item.id}`} className="text-sm">수량</Label>
                              <Input
                                id={`quantity-${item.id}`}
                                type="number"
                                min="1"
                                value={editingItem.quantity}
                                onChange={(e) => setEditingItem({
                                  ...editingItem,
                                  quantity: parseInt(e.target.value) || 1
                                })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`price-${item.id}`} className="text-sm">단가 (원)</Label>
                              <Input
                                id={`price-${item.id}`}
                                type="number"
                                min="0"
                                value={editingItem.unit_price}
                                onChange={(e) => setEditingItem({
                                  ...editingItem,
                                  unit_price: parseInt(e.target.value) || 0
                                })}
                                className="mt-1"
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleUpdateItem(item.id, {
                                  quantity: editingItem.quantity,
                                  unit_price: editingItem.unit_price
                                })}
                              >
                                저장
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingItem(null)}
                              >
                                취소
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // 보기 모드
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <Label className="text-muted-foreground">수량</Label>
                              <p className="font-medium">{item.quantity}개</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">단가</Label>
                              <p className="font-medium">{item.unit_price.toLocaleString()}원</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">총액</Label>
                              <p className="font-medium text-primary">{item.total_price.toLocaleString()}원</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">개당 평균</Label>
                              <p className="font-medium">{(item.total_price / item.quantity).toLocaleString()}원</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* 새 항목 추가 폼 */}
                    {isAddingNewItem && selectedOrder.status === "completed" && (
                      <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 bg-primary/5">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="font-medium text-lg">새 항목 추가</h5>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setIsAddingNewItem(false);
                                setNewItem({
                                  product_name: "",
                                  quantity: 1,
                                  unit_price: 0,
                                  total_price: 0
                                });
                                setShowSuggestions(false);
                              }}
                            >
                              ✕
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* 상품명 입력 */}
                            <div className="relative">
                              <Label htmlFor="new-product-name" className="text-sm">품목명</Label>
                              <Input
                                id="new-product-name"
                                value={newItem.product_name}
                                onChange={(e) => handleNewItemNameChange(e.target.value)}
                                placeholder="예: 김치"
                                className="mt-1"
                              />

                              {/* 자동완성 드롭다운 */}
                              {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-md shadow-lg">
                                  {suggestions.map((productName, index) => (
                                    <button
                                      key={index}
                                      className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                                      onClick={() => selectNewItemSuggestion(productName)}
                                    >
                                      <div className="font-medium">{productName}</div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* 수량 입력 */}
                            <div>
                              <Label htmlFor="new-quantity" className="text-sm">수량</Label>
                              <Input
                                id="new-quantity"
                                type="number"
                                min="1"
                                value={newItem.quantity}
                                onChange={(e) => setNewItem(prev => ({
                                  ...prev,
                                  quantity: parseInt(e.target.value) || 1
                                }))}
                                className="mt-1"
                              />
                            </div>

                            {/* 단가 입력 */}
                            <div>
                              <Label htmlFor="new-unit-price" className="text-sm">단가 (원)</Label>
                              <Input
                                id="new-unit-price"
                                type="number"
                                min="0"
                                value={newItem.unit_price || ""}
                                onChange={(e) => setNewItem(prev => ({
                                  ...prev,
                                  unit_price: parseInt(e.target.value) || 0
                                }))}
                                placeholder="15000"
                                className="mt-1"
                              />
                            </div>

                            {/* 총액 표시 */}
                            <div>
                              <Label className="text-sm">총 금액</Label>
                              <div className="mt-1 p-2 bg-muted rounded-md text-sm font-medium">
                                {newItem.total_price.toLocaleString()}원
                              </div>
                            </div>
                          </div>

                          {/* 추가 버튼 */}
                          <div className="flex justify-end gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setIsAddingNewItem(false);
                                setNewItem({
                                  product_name: "",
                                  quantity: 1,
                                  unit_price: 0,
                                  total_price: 0
                                });
                                setShowSuggestions(false);
                              }}
                            >
                              취소
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleAddNewItem}
                              className="flex items-center gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              항목 추가
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderList;