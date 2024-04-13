import { type AppType } from "next/app";
import { Inter } from "next/font/google";

import { api } from "npm/utils/api";

import "npm/styles/globals.css";
import { Providers } from "npm/redux/provider";

import { usePathname } from "next/navigation";
import PrivateRoute from "npm/components/auth/Private";
import Header from "npm/components/header";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});
const MyApp: AppType = ({ Component, pageProps }) => {
  const privateRoutes = ["/interests"];
  const pathname = usePathname();

  const GetLayout = () => {
    if (privateRoutes.includes(pathname)) {
      return (
        <PrivateRoute>
          <Component {...pageProps} />
        </PrivateRoute>
      );
    }
    return <Component {...pageProps} />;
  };
  console.log({ pathname });
  return (
    <main className={`font-sans ${inter.variable}`}>
      <Providers>
        <Header />
        <GetLayout />
      </Providers>
    </main>
  );
};

export default api.withTRPC(MyApp);
