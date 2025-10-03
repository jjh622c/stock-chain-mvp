import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, MapPin, Edit, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { storeService, Store } from "@/lib/supabaseDatabase";
import { sessionStore, SelectedStore } from "@/lib/sessionStore";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<SelectedStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [editingStoreName, setEditingStoreName] = useState<string>("");
  const [editingStoreAddress, setEditingStoreAddress] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        // 매장 목록 조회
        const storeData = await storeService.getAll();
        setStores(storeData);

        // 세션에 저장된 매장 조회
        const sessionSelectedStore = sessionStore.getSelectedStore();
        setSelectedStore(sessionSelectedStore);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast({
          title: "데이터 로드 실패",
          description: "매장 정보를 불러오는데 실패했습니다.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [toast]);

  const handleStoreSelect = (store: Store) => {
    const selectedStoreData: SelectedStore = {
      id: store.id,
      name: store.name,
      address: store.address
    };

    // 세션에 매장 정보 저장
    sessionStore.setSelectedStore(selectedStoreData);
    setSelectedStore(selectedStoreData);

    toast({
      title: "매장 선택 완료",
      description: `${store.name}이(가) 선택되었습니다.`
    });
  };

  const handleStoreChange = () => {
    sessionStore.clearSelectedStore();
    setSelectedStore(null);
  };

  const handleEditStart = (store: Store) => {
    setEditingStoreId(store.id);
    setEditingStoreName(store.name);
    setEditingStoreAddress(store.address);
  };

  const handleEditCancel = () => {
    setEditingStoreId(null);
    setEditingStoreName("");
    setEditingStoreAddress("");
  };

  const handleEditSave = async (storeId: string) => {
    try {
      if (!editingStoreName.trim()) {
        toast({
          title: "입력 오류",
          description: "매장 이름을 입력해주세요.",
          variant: "destructive"
        });
        return;
      }

      if (!editingStoreAddress.trim()) {
        toast({
          title: "입력 오류",
          description: "매장 주소를 입력해주세요.",
          variant: "destructive"
        });
        return;
      }

      const updatedStore = await storeService.update(storeId, {
        name: editingStoreName.trim(),
        address: editingStoreAddress.trim()
      });

      if (updatedStore) {
        // 매장 목록 업데이트
        setStores(prev => prev.map(store =>
          store.id === storeId ? updatedStore : store
        ));

        // 현재 선택된 매장인 경우 세션 정보도 업데이트
        if (selectedStore && selectedStore.id === storeId) {
          const updatedSelectedStore = {
            ...selectedStore,
            name: updatedStore.name,
            address: updatedStore.address
          };
          sessionStore.setSelectedStore(updatedSelectedStore);
          setSelectedStore(updatedSelectedStore);
        }

        toast({
          title: "매장 수정 완료",
          description: `매장 정보가 성공적으로 변경되었습니다.`
        });
      }
    } catch (error) {
      console.error('Failed to update store:', error);
      toast({
        title: "매장 수정 실패",
        description: "매장 정보를 수정하는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setEditingStoreId(null);
      setEditingStoreName("");
      setEditingStoreAddress("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-muted-foreground">매장 정보를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">StockChain</h1>
          <p className="text-muted-foreground">
            {selectedStore ? "다른 매장을 선택하거나 메뉴를 이용하세요" : "매장을 선택하여 시작하세요"}
          </p>
        </div>

        {/* Current Selection */}
        {selectedStore && (
          <Card className="mb-6 border-primary bg-primary/5">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    현재 선택된 매장
                  </CardTitle>
                  <CardDescription className="mt-2">
                    <span className="font-medium text-lg text-foreground">{selectedStore.name}</span>
                    <br />
                    <span className="text-muted-foreground">{selectedStore.address}</span>
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={handleStoreChange}>
                  매장 변경
                </Button>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Quick Actions */}
        {selectedStore && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Button onClick={() => navigate('/order')} className="h-20 flex-col gap-2">
              <Package className="h-6 w-6" />
              <span>주문 등록</span>
            </Button>
            <Button variant="outline" onClick={() => navigate('/orders')} className="h-20 flex-col gap-2">
              <Package className="h-6 w-6" />
              <span>주문 목록</span>
            </Button>
            <Button variant="outline" onClick={() => navigate('/stats')} className="h-20 flex-col gap-2">
              <Package className="h-6 w-6" />
              <span>통계</span>
            </Button>
            <Button variant="outline" onClick={() => navigate('/products')} className="h-20 flex-col gap-2">
              <Package className="h-6 w-6" />
              <span>상품 관리</span>
            </Button>
          </div>
        )}

        {/* Store Selection */}
        <Card>
          <CardHeader>
            <CardTitle>{selectedStore ? "다른 매장 선택" : "매장 선택"}</CardTitle>
            <CardDescription>운영중인 매장 목록입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stores.map((store) => (
                <Card
                  key={store.id}
                  className={`hover:shadow-lg transition-shadow border-2 ${
                    selectedStore?.id === store.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary"
                  }`}
                >
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        {editingStoreId === store.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editingStoreName}
                              onChange={(e) => setEditingStoreName(e.target.value)}
                              placeholder="매장 이름"
                              className="text-center text-xl font-semibold"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleEditSave(store.id);
                                } else if (e.key === 'Escape') {
                                  handleEditCancel();
                                }
                              }}
                              autoFocus
                            />
                            <Input
                              value={editingStoreAddress}
                              onChange={(e) => setEditingStoreAddress(e.target.value)}
                              placeholder="매장 주소"
                              className="text-center text-sm"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleEditSave(store.id);
                                } else if (e.key === 'Escape') {
                                  handleEditCancel();
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <>
                            <CardTitle className="text-xl">{store.name}</CardTitle>
                            <CardDescription className="text-sm mt-1">{store.address}</CardDescription>
                          </>
                        )}
                      </div>
                      <div className="ml-2">
                        {editingStoreId === store.id ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditSave(store.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Save className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleEditCancel}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStart(store);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Package className="h-12 w-12 mx-auto text-primary mb-2" />
                    <Button
                      variant={selectedStore?.id === store.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStoreSelect(store)}
                      disabled={editingStoreId === store.id}
                    >
                      {selectedStore?.id === store.id ? "선택됨" : "매장 선택"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;