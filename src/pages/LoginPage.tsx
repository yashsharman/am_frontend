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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-gray-50">
      <div className="w-full max-w-sm space-y-4">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto text-white shadow-md shadow-indigo-200">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Aftermiles Admin</h1>
          <p className="text-xs text-gray-500">Event Check-in & Pass Management PWA</p>
        </div>

        {/* Login Card */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-gray-900">Sign In</CardTitle>
            <CardDescription className="text-xs">
              Enter staff or administrator credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Detailed API Error Alert */}
            {apiError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-900 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-rose-950">
                        {apiError.status ? `HTTP ${apiError.status}` : 'Network / Connection Error'}
                      </span>
                      {apiError.statusText && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-rose-200/70 text-rose-800 rounded font-medium">
                          {apiError.statusText}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-medium text-rose-800 leading-snug">
                      {apiError.detail}
                    </p>
                  </div>
                </div>

                {/* Endpoint info */}
                {apiError.endpoint && (
                  <div className="flex items-center gap-1.5 text-[11px] text-rose-700/80 pt-1 border-t border-rose-200/60 truncate">
                    <Globe className="h-3 w-3 shrink-0" />
                    <span className="truncate font-mono">{apiError.endpoint}</span>
                  </div>
                )}

                {/* Collapsible raw API response */}
                {apiError.rawJson && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowRawDetails(!showRawDetails)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-rose-800 hover:text-rose-950 mt-1 cursor-pointer"
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
                      <pre className="mt-1.5 p-2 bg-rose-950 text-rose-100 rounded-lg text-[10px] font-mono overflow-x-auto max-h-36 whitespace-pre-wrap">
                        {apiError.rawJson}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aftermiles.com"
                  required
                  autoComplete="email"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In to Dashboard'
                )}
              </Button>
            </form>

            {/* Quick Test Demo Fill Helper */}
            <div className="pt-3 border-t border-gray-100 space-y-2 text-center">
              <p className="text-[11px] text-gray-500 font-medium">Quick-fill default credentials:</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleDemoFill('admin123')}
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-700 hover:text-indigo-900 font-medium py-1 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  admin123
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('admin123456')}
                  className="inline-flex items-center gap-1 text-[11px] text-gray-700 hover:text-gray-900 font-medium py-1 px-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
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
