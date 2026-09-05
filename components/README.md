# PointPro frontend architecture

The web app is Next.js + React + Tailwind CSS. Supabase is isolated in lib/supabase.ts.

For a native Android/iOS client, add an Expo React Native app with NativeWind and share business/data modules with the web app. Do not put Supabase service-role credentials in either client.