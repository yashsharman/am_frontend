import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, Sparkles, AlertCircle, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import type { AxiosError } from 'axios';

interface ApiErrorState {
  status?: number;
  statusText?: string;
  detail: string;
  endpoint?: string;
  rawJson?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { loginAsync, isLoggingIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiError, setApiError] = useState<ApiErrorState | null>(null);
  const [showRawDetails, setShowRawDetails] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    try {
      await loginAsync({ email, password });
      navigate('/');
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ detail?: string | Array<{ msg?: string }> }>;
      const status = axiosErr.response?.status;
      const statusText = axiosErr.response?.statusText;
      const responseData = axiosErr.response?.data;
      
      let detail = 'Authentication failed. Please verify your credentials.';
      if (responseData?.detail) {
        if (typeof responseData.detail === 'string') {
          detail = responseData.detail;
        } else if (Array.isArray(responseData.detail)) {
          detail = responseData.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        } else {
          detail = JSON.stringify(responseData.detail);
        }
      } else if (axiosErr.message === 'Network Error') {
        detail = 'Cannot connect to backend server. Please verify backend status and CORS headers.';
      } else if (axiosErr.message) {
        detail = axiosErr.message;
      }

      const fullUrl = axiosErr.config
        ? `${axiosErr.config.baseURL || ''}${axiosErr.config.url || ''}`
        : undefined;

      setApiError({
        status,
        statusText,
        detail,
        endpoint: fullUrl,
        rawJson: responseData ? JSON.stringify(responseData, null, 2) : undefined,
      });
    }
  };

  const handleDemoFill = (pass: string = 'admin123') => {
    setEmail('admin@aftermiles.com');
    setPassword(pass);
    setApiError(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-neo-bg font-sans selection:bg-neo-yellow selection:text-neo-black text-white">
      <div className="w-full max-w-sm space-y-4">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="h-12 w-12 rounded-xl bg-neo-purple border-2 border-white/20 shadow-brutal flex items-center justify-center mx-auto text-white">
            <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white mt-2">
            Aftermiles Admin
          </h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Gate Check-in & Pass Management Deck
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-2 border-white/15 shadow-brutal rounded-xl bg-[#171622] text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white">Staff Sign In</CardTitle>
            <CardDescription className="text-xs font-bold text-gray-400">
              Enter staff or administrator credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Detailed API Error Alert */}
            {apiError && (
              <div className="rounded-xl border-2 border-neo-peach/40 bg-rose-950/40 p-3.5 text-xs text-rose-200 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-neo-peach stroke-[3] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-rose-300 uppercase">
                        {apiError.status ? `HTTP ${apiError.status}` : 'Connection Error'}
                      </span>
                      {apiError.statusText && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-neo-peach text-white rounded font-black uppercase">
                          {apiError.statusText}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-bold text-rose-200 leading-snug">
                      {apiError.detail}
                    </p>
                  </div>
                </div>

                {/* Endpoint info */}
                {apiError.endpoint && (
                  <div className="flex items-center gap-1.5 text-[11px] text-rose-300 pt-1 border-t border-rose-900 truncate font-mono">
                    <Globe className="h-3 w-3 shrink-0" />
                    <span className="truncate">{apiError.endpoint}</span>
                  </div>
                )}

                {/* Collapsible raw API response */}
                {apiError.rawJson && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowRawDetails(!showRawDetails)}
                      className="flex items-center gap-1 text-[11px] font-black uppercase text-rose-300 hover:underline mt-1 cursor-pointer"
                    >
                      {showRawDetails ? (
                        <>
                          <ChevronUp className="h-3 w-3" /> Hide API payload
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" /> View API response JSON
                        </>
                      )}
                    </button>
                    {showRawDetails && (
                      <pre className="mt-1.5 p-2 bg-[#0e0d15] text-neo-lime rounded-lg text-[10px] font-mono border-2 border-white/20 overflow-x-auto max-h-36 whitespace-pre-wrap">
                        {apiError.rawJson}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="font-black text-xs uppercase tracking-wider text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aftermiles.com"
                  required
                  autoComplete="email"
                  className="mt-1 bg-[#0e0d15] text-white"
                />
              </div>

              <div>
                <Label htmlFor="password" className="font-black text-xs uppercase tracking-wider text-gray-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="mt-1 bg-[#0e0d15] text-white"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-neo-purple text-white border-2 border-white/20 shadow-brutal hover:bg-indigo-600"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In to Control Deck'
                )}
              </Button>
            </form>

            {/* Quick Test Demo Fill Helper */}
            <div className="pt-3 border-t-2 border-white/10 space-y-2 text-center">
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                Quick-fill default credentials:
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleDemoFill('admin123')}
                  className="inline-flex items-center gap-1 text-[11px] text-neo-black font-black uppercase py-1 px-2.5 rounded-md bg-neo-yellow border-2 border-neo-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  <Sparkles className="h-3 w-3 stroke-[2.5]" />
                  admin123
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('admin123456')}
                  className="inline-flex items-center gap-1 text-[11px] text-neo-black font-black uppercase py-1 px-2.5 rounded-md bg-neo-lime border-2 border-neo-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  admin123456
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
