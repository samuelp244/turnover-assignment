import { useAppSelector } from "npm/redux/hooks";
import { api } from "npm/utils/api";
import { hideEmail } from "npm/utils/comman";
import React, { type ChangeEvent, useRef, useState } from "react";

const Verify = () => {
  const userSliceData = useAppSelector((state) => state.user);
  const [otp, setOtp] = useState<string[]>(Array(8).fill(""));
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number,
  ): void => {
    const newOtp = [...otp];
    newOtp[index] = e.target.value;
    setOtp(newOtp);

    if (e.target.value !== "" && inputRefs.current[index + 1] != null) {
      inputRefs?.current[index + 1]?.focus();
    }
  };
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ): void => {
    if (
      e.key === "Backspace" &&
      !e.currentTarget.value &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleInputClick = (index: number): void => {
    const emptyIndex = otp.findIndex((digit) => digit === "");
    if (emptyIndex !== -1 && inputRefs.current[emptyIndex]) {
      inputRefs.current[emptyIndex]?.focus();
    }
  };
  const submitOTP = api.auth.verifyOTP.useMutation({
    onSuccess: () => {
      console.log("verified");
    },
  });
  const handleSubmit = () => {
    try {
      if (userSliceData.userId !== null) {
        const joinedOTP = parseInt(otp.join(""));
        submitOTP.mutate({
          userId: userSliceData.userId,
          otp: joinedOTP,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-center ">
      <div className="flex min-w-[576px] flex-col items-center justify-center rounded-xl border-2 border-[#C1C1C1] p-10">
        <h1 className="mb-10 text-3xl font-semibold text-black">
          Verify your email
        </h1>
        <p className="text-base font-normal">{`Enter the 8 digit code you have received on ${hideEmail(userSliceData.email ?? "")}`}</p>
        <div className="my-10 flex justify-center">
          {Array.from({ length: 8 }).map((_, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              className="mx-1 h-14 w-12 rounded-md border border-gray-300 text-center text-2xl font-semibold text-gray-600 focus:border-blue-500 focus:outline-none"
              value={otp[index]}
              onChange={(e) => {
                handleChange(e, index);
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                handleKeyDown(e, index);
              }}
              ref={(el) => {
                inputRefs.current[index] = el!;
              }}
              onClick={() => {
                handleInputClick(index);
              }}
            />
          ))}
        </div>
        <button
          onClick={handleSubmit}
          className="mt-4 w-full rounded-md bg-black p-3 text-white"
        >
          {false ? "submitting..." : "VERIFY"}
        </button>
      </div>
    </main>
  );
};

export default Verify;
