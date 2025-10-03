import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, TrendingUp, Package2, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { orderService } from "@/lib/supabaseDatabase";
import { sessionStore, SelectedStore } from "@/lib/sessionStore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

interface DailyStats {
  date: string;
  orderCount: number;
  totalAmount: number;
}

const Statistics = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedStore, setSelectedStore] = useState<SelectedStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [todaysSummary, setTodaysSummary] = useState({ orderCount: 0, totalAmount: 0 });
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);

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
    if (selectedStore) {
      const loadStatistics = async () => {
        try {
          const [summary, stats] = await Promise.all([
            orderService.getTodaysSummary(selectedStore.id),
            orderService.getDailyStats(selectedStore.id, 30)
          ]);
          setTodaysSummary(summary);
          setDailyStats(stats);
        } catch (error) {
          console.error('Failed to load statistics:', error);
        }
      };
      loadStatistics();
    }
  }, [selectedStore]);

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
          <p className="text-muted-foreground mb-4">통계를 조회하려면 매장을 선택해야 합니다.</p>
          <Button onClick={() => navigate('/')}>
            매장 선택하기
          </Button>
        </div>
      </div>
    );
  }

  // Calculate monthly summary
  const currentMonth = new Date();
  const monthlyStats = dailyStats.filter(stat => {
    const statDate = new Date(stat.date);
    return statDate.getMonth() === currentMonth.getMonth() &&
           statDate.getFullYear() === currentMonth.getFullYear();
  });

  const monthlyTotal = monthlyStats.reduce((sum, stat) => sum + stat.totalAmount, 0);
  const monthlyOrders = monthlyStats.reduce((sum, stat) => sum + stat.orderCount, 0);
  const avgDaily = monthlyStats.length > 0 ? monthlyTotal / monthlyStats.length : 0;

  // Calculate weekly stats (last 7 days)
  const last7Days = dailyStats.slice(-7);
  const weeklyTotal = last7Days.reduce((sum, stat) => sum + stat.totalAmount, 0);
  const weeklyAvg = last7Days.length > 0 ? weeklyTotal / last7Days.length : 0;

  // Prepare chart data - format data for chart display
  const chartData = monthlyStats.map(stat => ({
    date: format(new Date(stat.date), "MM/dd", { locale: ko }),
    fullDate: stat.date,
    orderCount: stat.orderCount,
    totalAmount: stat.totalAmount,
    displayDate: format(new Date(stat.date), "MM월 dd일", { locale: ko })
  })).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.displayDate}</p>
          <p className="text-primary">주문 수: {data.orderCount}개</p>
          <p className="text-success">매출: {data.totalAmount.toLocaleString()}원</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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
            <h1 className="text-3xl font-bold text-foreground">주문 통계</h1>
            <p className="text-muted-foreground">{selectedStore.name} - 매출 및 주문 현황</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">오늘 매출</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {todaysSummary.totalAmount.toLocaleString()}원
              </div>
              <p className="text-xs text-muted-foreground">
                {todaysSummary.orderCount}개 주문
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">이번 주 평균</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weeklyAvg.toLocaleString()}원
              </div>
              <p className="text-xs text-muted-foreground">일 평균 매출</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">이번 달 총매출</CardTitle>
              <Package2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {monthlyTotal.toLocaleString()}원
              </div>
              <p className="text-xs text-success">
                {monthlyOrders}개 주문
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">월 평균</CardTitle>
              <Package2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {avgDaily.toLocaleString()}원
              </div>
              <p className="text-xs text-muted-foreground">일 평균 매출</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Orders Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                일별 주문량 추이
              </CardTitle>
              <CardDescription>
                이번 달 일별 주문 수 ({chartData.length}일 데이터)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  이번 달 주문 데이터가 없습니다.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="orderCount"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Daily Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                일별 매출 추이
              </CardTitle>
              <CardDescription>
                이번 달 일별 매출액 ({chartData.length}일 데이터)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  이번 달 매출 데이터가 없습니다.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="totalAmount"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Statistics */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>일별 주문 현황 (최근 30일)</CardTitle>
                <CardDescription>
                  총 {dailyStats.reduce((sum, stat) => sum + stat.orderCount, 0)}개 주문 •
                  {dailyStats.reduce((sum, stat) => sum + stat.totalAmount, 0).toLocaleString()}원
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {dailyStats.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      주문 데이터가 없습니다.
                    </div>
                  ) : (
                    dailyStats.slice().reverse().map((stat) => (
                      <div key={stat.date} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">
                              {format(new Date(stat.date), "MM월 dd일 (E)", { locale: ko })}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {stat.orderCount}개 주문
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {stat.totalAmount.toLocaleString()}원
                            </div>
                            {stat.orderCount > 0 && (
                              <Badge variant="outline" className="text-xs">
                                주문당 평균 {Math.round(stat.totalAmount / stat.orderCount).toLocaleString()}원
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary and Actions */}
          <div className="space-y-6">
            {/* Period Summary */}
            <Card>
              <CardHeader>
                <CardTitle>기간별 요약</CardTitle>
                <CardDescription>주요 지표 비교</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">오늘</span>
                    <span className="font-bold text-primary">
                      {todaysSummary.totalAmount.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">주간 평균</span>
                    <span className="font-bold">
                      {weeklyAvg.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">월간 총액</span>
                    <span className="font-bold text-success">
                      {monthlyTotal.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium">월간 평균</span>
                    <span className="font-bold">
                      {avgDaily.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>빠른 작업</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/order')}
                >
                  새 주문 등록
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/orders')}
                >
                  주문 목록 보기
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/')}
                >
                  매장선택으로 돌아가기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;