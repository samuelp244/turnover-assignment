import type React from "react";
import { store } from "npm/redux/store";
// import Login from "./login";
import { useRouter } from "next/router";
import { useEffect } from "react";
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const accessToken = store.getState().user.accessToken;
  useEffect(() => {
    if (accessToken === null) {
      void router.push("/login");
    }
  }, [accessToken]);
  
  return children;
};

export default PrivateRoute;
