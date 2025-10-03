import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit, Trash2, Search, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { productService, Product } from "@/lib/supabaseDatabase";

const ProductManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProduct>({
    name: "",
    category: "",
    unit_price: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const productsData = await productService.getAll();
      setProducts(productsData);

      // 카테고리는 상품 데이터에서 추출
      const uniqueCategories = [...new Set(productsData.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "데이터 로드 실패",
        description: "상품 데이터를 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      unit_price: 0
    });
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.category || formData.unit_price <= 0) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 올바르게 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      await productService.create(formData);
      toast({
        title: "상품 추가 완료",
        description: `${formData.name}이(가) 추가되었습니다.`
      });
      setIsAddDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to add product:', error);
      toast({
        title: "상품 추가 실패",
        description: "상품 추가 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = async () => {
    if (!editingProduct || !formData.name || !formData.category || formData.unit_price <= 0) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 올바르게 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      await productService.update(editingProduct.id, formData);
      toast({
        title: "상품 수정 완료",
        description: `${formData.name}이(가) 수정되었습니다.`
      });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to update product:', error);
      toast({
        title: "상품 수정 실패",
        description: "상품 수정 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`정말로 "${product.name}"을(를) 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await productService.delete(product.id);
      toast({
        title: "상품 삭제 완료",
        description: `${product.name}이(가) 삭제되었습니다.`
      });
      loadData();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast({
        title: "상품 삭제 실패",
        description: "상품 삭제 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      unit_price: product.unit_price
    });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-muted-foreground">상품 데이터를 불러오는 중...</div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-foreground">상품 관리</h1>
            <p className="text-muted-foreground">상품을 추가, 수정, 삭제할 수 있습니다</p>
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>상품 검색 및 필터</CardTitle>
            <CardDescription>상품명으로 검색하거나 카테고리별로 필터링하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="search">상품명 검색</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="상품명을 입력하세요"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <Label>카테고리</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    상품 추가
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>새 상품 추가</DialogTitle>
                    <DialogDescription>
                      새로운 상품 정보를 입력하세요.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="add-name">상품명</Label>
                      <Input
                        id="add-name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="예: 양념목전지 6kg"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="add-category">카테고리</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                          <SelectItem value="육가공품">육가공품</SelectItem>
                          <SelectItem value="분말류/조미료">분말류/조미료</SelectItem>
                          <SelectItem value="소스류">소스류</SelectItem>
                          <SelectItem value="기타">기타</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="add-price">단가 (원)</Label>
                      <Input
                        id="add-price"
                        type="number"
                        value={formData.unit_price || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, unit_price: Number(e.target.value) }))}
                        placeholder="39500"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleAdd}>
                      추가
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>상품 목록</CardTitle>
                <CardDescription>
                  총 {filteredProducts.length}개 상품
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                검색 결과가 없습니다.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>상품명</TableHead>
                    <TableHead>카테고리</TableHead>
                    <TableHead>단가</TableHead>
                    <TableHead>등록일</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-primary">
                        {product.unit_price.toLocaleString()}원
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(product.created_at).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>상품 수정</DialogTitle>
              <DialogDescription>
                상품 정보를 수정하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">상품명</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="예: 양념목전지 6kg"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">카테고리</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="육가공품">육가공품</SelectItem>
                    <SelectItem value="분말류/조미료">분말류/조미료</SelectItem>
                    <SelectItem value="소스류">소스류</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">단가 (원)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.unit_price || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit_price: Number(e.target.value) }))}
                  placeholder="39500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleEdit}>
                수정
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProductManagement;