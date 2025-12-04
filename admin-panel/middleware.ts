import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Защищаем только /admin роуты
  if (pathname.startsWith("/admin")) {
    // Проверяем наличие токена в cookies или localStorage (на сервере нет доступа к localStorage!)
    // Sanctum токены лучше проверять на стороне клиента через API запрос

    // Пропускаем запрос дальше, проверка будет в useEffect на клиенте
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
