import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Key, Check, AlertCircle, Sparkles, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
}

export const ApiKeyInput = ({ apiKey, onApiKeyChange }: ApiKeyInputProps) => {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateApiKey = async (key: string): Promise<boolean> => {
    try {
      // First try to list models to validate the API key
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Check if we have access to any Gemini models
        const hasGeminiModels = data.models?.some((model: any) => 
          model.name?.includes('gemini')
        );
        return hasGeminiModels;
      }
      
      return false;
    } catch (error) {
      console.error('API validation error:', error);
      return false;
    }
  };

  const handleSaveApiKey = async () => {
    if (!tempApiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your API Key",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    
    try {
      const isValid = await validateApiKey(tempApiKey.trim());
      
      if (isValid) {
        onApiKeyChange(tempApiKey.trim());
        toast({
          title: "Success! 🎉",
          description: "Gemini API Key is valid and ready to use",
        });
      } else {
        toast({
          title: "API Key ไม่ถูกต้อง",
          description: "ไม่สามารถเชื่อมต่อกับ Gemini API ได้ กรุณาตรวจสอบว่า API Key ถูกต้องและเปิดใช้งาน Gemini API แล้ว",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถตรวจสอบ API Key ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearApiKey = () => {
    setTempApiKey("");
    onApiKeyChange("");
    toast({
      title: "API Key Removed",
      description: "You can enter a new API Key",
    });
  };

  const providerInfo = {
    name: "Google Gemini",
    icon: <Sparkles className="h-5 w-5 text-blue-600" />,
    placeholder: "AIzaSy...",
    description: "ใส่ Gemini API Key สำหรับแปลงเสียงเป็นข้อความ (ระบบใช้ Whisper + Gemini โดยอัตโนมัติ)",
    keyGuide: "รับ API Key ฟรีจาก Google AI Studio (aistudio.google.com)"
  };

  return (
    <Card className="w-full shadow-custom-lg border-2 border-primary/20 bg-gradient-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <Key className="h-6 w-6 text-primary" />
          API Configuration
        </CardTitle>
        <CardDescription className="text-base">
          ใส่ Gemini API Key ของคุณเพื่อเริ่มใช้งานระบบแปลงเสียงเป็นข้อความ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">


        {/* API Key Input */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {providerInfo.icon}
            <Label htmlFor="apiKey" className="text-base font-semibold">{providerInfo.name} API Key</Label>
          </div>
          
          <div className="space-y-2">
            <div className="flex gap-3">
              <Input
                id="apiKey"
                type="password"
                placeholder={`ใส่ ${providerInfo.name} API Key... (${providerInfo.placeholder})`}
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="font-mono text-lg h-12 border-2 border-primary/20 focus:border-primary/40"
              />
              {apiKey ? (
                <Button 
                  onClick={handleClearApiKey}
                  variant="outline" 
                  size="lg"
                  className="shrink-0 h-12 px-4 border-2 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <AlertCircle className="h-5 w-5 mr-2" />
                  ลบ
                </Button>
              ) : (
                <Button 
                  onClick={handleSaveApiKey}
                  disabled={!tempApiKey.trim() || isValidating}
                  size="lg"
                  className="shrink-0 h-12 px-6 bg-gradient-primary hover:opacity-90 text-white font-semibold"
                >
                  {isValidating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      กำลังตรวจสอบ...
                    </div>
                  ) : (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      ตรวจสอบ & บันทึก
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">
              {providerInfo.keyGuide}
            </p>
          </div>
        </div>
        
        {/* Status */}
        {apiKey ? (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-success/20 to-success/10 text-success rounded-xl border-2 border-success/30">
            <Check className="h-6 w-6" />
            <div>
              <div className="font-semibold text-lg">{providerInfo.name} พร้อมใช้งาน</div>
              <div className="text-sm opacity-80">คุณสามารถอัปโหลดไฟล์เสียงได้แล้ว</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-warning/20 to-warning/10 text-warning rounded-xl border-2 border-warning/30">
            <AlertCircle className="h-6 w-6" />
            <div>
              <div className="font-semibold text-lg">รอการตั้งค่า API Key</div>
              <div className="text-sm opacity-80">กรุณาใส่ API Key เพื่อเริ่มใช้งาน</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};