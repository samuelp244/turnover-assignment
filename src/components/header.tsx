import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "npm/redux/hooks";
import { resetUserSlice } from "npm/redux/userSlice";
import { api } from "npm/utils/api";
import React from "react";
import { IoIosSearch } from "react-icons/io";
import { LuShoppingCart } from "react-icons/lu";

const Header = () => {
  const user = useAppSelector((state) => state.user);
  const router = useRouter();
  const dispatch = useAppDispatch()
  const signOutUser = api.auth.signOut.useMutation({
    onSuccess: async (res) => {
      if (res.success) {
        dispatch(resetUserSlice())
        await router.push("/login");
      }
    },
  });

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full justify-end">
        <div className="flex gap-4 py-2 pr-2">
          {" "}
          <p className="text-[12px] font-normal">Help</p>
          <p className=" text-[12px] font-normal">Orders & Returns</p>{" "}
          <p className=" text-[12px] font-normal">
            Hi, {user.accessToken !== null ? user.name : "user"}
          </p>
        </div>
      </div>
      <div className="flex w-full justify-between px-10">
        <p className="text-4xl font-bold">ECOMMERCE</p>
        <div className="flex gap-8">
          <p className="m-auto font-semibold">Categories</p>{" "}
          <p className="m-auto font-semibold">Sale</p>{" "}
          <p className="m-auto  font-semibold">Clearance</p>{" "}
          <p className="m-auto font-semibold">New stock</p>{" "}
          <p className=" m-auto font-semibold">Trending</p>
        </div>
        <div className="ml-36 flex gap-8">
          <IoIosSearch size={20} className="m-auto" />
          <LuShoppingCart size={20} className="m-auto" />
          {user.accessToken !== null && (
            <button onClick={() => signOutUser.mutate()}>logout</button>
          )}
        </div>
      </div>
      <div>Get 10% off on business sign up</div>
    </div>
  );
};

export default Header;
