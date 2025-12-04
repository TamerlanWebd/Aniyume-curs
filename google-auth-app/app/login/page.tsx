// app/login/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Ссылка для начала авторизации (чтобы получить свежий код)
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "512857196956-ajqmk34it9bp44bsrnf86m7fr2h8g9r0.apps.googleusercontent.com"
  }&redirect_uri=http://localhost:3000/login&response_type=code&scope=openid%20email%20profile`;

  useEffect(() => {
    if (code && !result) {
      exchangeCodeForToken(code);
    }
  }, [code]);

  const exchangeCodeForToken = async (authCode: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: authCode }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: "Failed to fetch" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-2xl mx-auto font-mono">
      <h1 className="text-2xl font-bold mb-4">Google Auth Exchange</h1>

      {!code && (
        <a
          href={googleAuthUrl}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-block"
        >
          Войти через Google (получить Code)
        </a>
      )}

      {loading && (
        <p className="mt-4 text-yellow-600">Обмен кода на токен...</p>
      )}

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Результат от Google:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm border border-gray-300">
            {JSON.stringify(result, null, 2)}
          </pre>

          {result.id_token && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
              <p className="font-bold text-green-800">ID Token получен!</p>
              <p className="break-all text-xs mt-2 text-gray-700">
                {result.id_token}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
