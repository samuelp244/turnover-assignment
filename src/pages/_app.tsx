import { type AppType } from "next/app";
import { Inter } from "next/font/google";
import { api } from "npm/utils/api";
import "npm/styles/globals.css";
import Header from "npm/components/header";
import { useEffect } from "react";
import { Providers } from "npm/utils/provider";
import { store } from "npm/redux/store";
import jwt from "jsonwebtoken";
import {
  addAccessToken,
  addUserData,
  type userDataPayload,
} from "npm/redux/userSlice";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});
const MyApp: AppType = ({ Component, pageProps }) => {
  const refresh = api.auth.renewAccessToken.useMutation({
    onSuccess: (response) => {
      if (response.success && response.data?.accessToken) {
        store.dispatch(
          addAccessToken({ accessToken: response.data.accessToken }),
        );
        const payload = jwt.decode(
          response.data.accessToken,
        ) as userDataPayload;
        store.dispatch(addUserData(payload));
      }
    },
  });
  // if cookie exists new accessToken will be fetched
  useEffect(() => {
    try {
       refresh.mutate();
    } catch (error) {}
  }, []);
  
  return (
    <main className={`font-sans ${inter.variable}`}>
      <Providers>
        <Header />
        <Component {...pageProps} />
      </Providers>
    </main>
  );
};

export default api.withTRPC(MyApp);
