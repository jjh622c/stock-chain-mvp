import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Download, 
  LogOut,
  ChevronRight,
  Store,
  CreditCard
} from "lucide-react";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">설정</h1>
          <p className="text-muted-foreground">앱 설정을 관리하세요</p>
        </div>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              프로필
            </CardTitle>
            <CardDescription>계정 정보를 관리하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">사용자명</p>
                <p className="text-sm text-muted-foreground">admin@stockchain.com</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">현재 매장</p>
                <p className="text-sm text-muted-foreground">본점 (강남구)</p>
              </div>
              <Badge variant="outline">활성</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Store Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              매장 관리
            </CardTitle>
            <CardDescription>매장 설정을 관리하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-between">
              매장 정보 수정
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              매장 추가
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              알림 설정
            </CardTitle>
            <CardDescription>알림 및 푸시 설정을 관리하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications" className="flex flex-col gap-1">
                <span>푸시 알림</span>
                <span className="text-sm text-muted-foreground">주문 알림을 받습니다</span>
              </Label>
              <Switch id="push-notifications" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="flex flex-col gap-1">
                <span>이메일 알림</span>
                <span className="text-sm text-muted-foreground">주간 보고서를 받습니다</span>
              </Label>
              <Switch id="email-notifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              앱 설정
            </CardTitle>
            <CardDescription>앱 사용 환경을 설정하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex flex-col gap-1">
                <span>다크 모드</span>
                <span className="text-sm text-muted-foreground">어두운 테마를 사용합니다</span>
              </Label>
              <Switch id="dark-mode" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-backup" className="flex flex-col gap-1">
                <span>자동 백업</span>
                <span className="text-sm text-muted-foreground">데이터를 자동으로 백업합니다</span>
              </Label>
              <Switch id="auto-backup" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Data & Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              데이터 관리
            </CardTitle>
            <CardDescription>데이터 백업 및 복원을 관리하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-between">
              데이터 내보내기
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              백업 복원
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              보안
            </CardTitle>
            <CardDescription>계정 보안을 관리하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-between">
              비밀번호 변경
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              2단계 인증
              <Badge variant="secondary" className="ml-2">설정 안됨</Badge>
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>StockChain MVP v1.0.0</p>
          <p>© 2024 StockChain. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;