import { useRouter } from "next/router";
import { store } from "../redux/store";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = store.getState().user.accessToken;
  const privateRoutes = ["/interests"];
  const pathname = usePathname();
  useEffect(() => {
    if (accessToken === null) {
      if (privateRoutes.includes(pathname)) {
        void router.push("/login");
      }
    } else {
      void router.push("/interests");
    }
  }, [accessToken]);
  return <Provider store={store}>{children}</Provider>;
}
