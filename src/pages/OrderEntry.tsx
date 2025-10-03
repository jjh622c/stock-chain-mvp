import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Minus, Save, List, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { orderService, productService, CreateOrderItem, getCategoryFromName } from "@/lib/supabaseDatabase";
import { sessionStore, SelectedStore } from "@/lib/sessionStore";

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const OrderEntry = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState<SelectedStore | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    product_name: "",
    quantity: 1,
    unit_price: 0,
    total_price: 0
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const nameInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    setCurrentItem(prev => ({
      ...prev,
      total_price: prev.unit_price * prev.quantity
    }));
  }, [currentItem.unit_price, currentItem.quantity]);

  const handleNameChange = async (value: string) => {
    setCurrentItem(prev => ({ ...prev, product_name: value }));

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

  const selectSuggestion = async (productName: string) => {
    // 선택된 상품의 기본 단가 조회
    const defaultPrice = await productService.getProductPrice(productName);

    setCurrentItem(prev => ({
      ...prev,
      product_name: productName,
      unit_price: defaultPrice || prev.unit_price
    }));
    setShowSuggestions(false);
  };

  const addItem = async () => {
    if (!currentItem.product_name || currentItem.unit_price <= 0 || currentItem.quantity <= 0) {
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
        product => product.name.toLowerCase() === currentItem.product_name.toLowerCase()
      );

      // 기존에 없는 상품이면 자동으로 등록
      if (!existingProduct) {
        const newProduct = {
          name: currentItem.product_name,
          category: getCategoryFromName(currentItem.product_name),
          unit_price: currentItem.unit_price,
          description: `주문 등록 시 자동 생성된 상품`
        };

        await productService.create(newProduct);

        toast({
          title: "새 상품 등록",
          description: `${currentItem.product_name}이(가) 상품 목록에 자동으로 추가되었습니다.`,
          variant: "default"
        });
      }

      const newItem: OrderItem = {
        id: Date.now(),
        product_name: currentItem.product_name,
        quantity: currentItem.quantity,
        unit_price: currentItem.unit_price,
        total_price: currentItem.unit_price * currentItem.quantity
      };

      setOrderItems(prev => [...prev, newItem]);
      setCurrentItem({
        product_name: "",
        quantity: 1,
        unit_price: 0,
        total_price: 0
      });

      toast({
        title: "품목 추가 완료",
        description: `${newItem.product_name}이(가) 주문 목록에 추가되었습니다.`
      });

      // Focus back to name input
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error('Failed to add item:', error);
      toast({
        title: "품목 추가 실패",
        description: "품목 추가 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const removeItem = (id: number) => {
    setOrderItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, change: number) => {
    setOrderItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + change);
          return {
            ...item,
            quantity: newQuantity,
            total_price: item.unit_price * newQuantity
          };
        }
        return item;
      })
    );
  };

  const saveOrder = async () => {
    if (orderItems.length === 0) {
      toast({
        title: "주문 오류",
        description: "주문할 품목을 추가해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedStore) {
      toast({
        title: "매장 선택 오류",
        description: "매장을 선택해주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      const createOrderItems: CreateOrderItem[] = orderItems.map(item => ({
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }));

      await orderService.create(selectedStore.id, createOrderItems);

      toast({
        title: "주문 저장 완료",
        description: `${orderItems.length}개 품목이 저장되었습니다.`
      });

      // Reset form
      setOrderItems([]);
      setCurrentItem({
        product_name: "",
        quantity: 1,
        unit_price: 0,
        total_price: 0
      });
      navigate('/');
    } catch (error) {
      console.error('Failed to save order:', error);
      toast({
        title: "주문 저장 실패",
        description: "주문 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + item.total_price, 0);

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
          <p className="text-muted-foreground mb-4">주문을 등록하려면 매장을 선택해야 합니다.</p>
          <Button onClick={() => navigate('/')}>
            매장 선택하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">주문 등록</h1>
            <p className="text-muted-foreground">{selectedStore.name} - 새로운 주문을 등록하세요</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/orders')}
            className="ml-auto"
          >
            <List className="h-4 w-4 mr-2" />
            주문 목록
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                품목 추가
              </CardTitle>
              <CardDescription>
                품목 정보를 입력하고 주문 목록에 추가하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Label htmlFor="name">품목명</Label>
                <Input
                  ref={nameInputRef}
                  id="name"
                  value={currentItem.product_name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="예: 김치"
                  className="mt-1"
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg">
                    {suggestions.map((productName, index) => (
                      <button
                        key={index}
                        className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                        onClick={() => selectSuggestion(productName)}
                      >
                        <div className="font-medium">{productName}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="unit_price">단가 (원)</Label>
                <Input
                  id="unit_price"
                  type="number"
                  value={currentItem.unit_price || ""}
                  onChange={(e) => setCurrentItem(prev => ({ ...prev, unit_price: Number(e.target.value) }))}
                  placeholder="15000"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="quantity">수량</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>총 금액</Label>
                <div className="mt-1 p-2 bg-muted rounded-md text-sm font-medium">
                  {currentItem.total_price.toLocaleString()}원
                </div>
              </div>

              <Button
                onClick={addItem}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                품목 추가
              </Button>
            </CardContent>
          </Card>

          {/* Order List */}
          <Card>
            <CardHeader>
              <CardTitle>주문 목록</CardTitle>
              <CardDescription>
                총 {orderItems.length}개 품목 • {totalAmount.toLocaleString()}원
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {orderItems.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    추가된 품목이 없습니다
                  </div>
                ) : (
                  orderItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                       <div>
                         <h4 className="font-medium">{item.product_name}</h4>
                         <div className="text-sm text-muted-foreground">
                           단가: {item.unit_price.toLocaleString()}원
                         </div>
                       </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-3 py-1 border rounded">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-medium">
                            총 {item.total_price.toLocaleString()}원
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {orderItems.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">합계</span>
                    <span className="text-lg font-bold text-primary">
                      {totalAmount.toLocaleString()}원
                    </span>
                  </div>
                  <Button
                    onClick={saveOrder}
                    className="w-full"
                    size="lg"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    주문 저장
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderEntry;