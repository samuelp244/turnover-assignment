import { useAppSelector } from "npm/redux/hooks";
import { api } from "npm/utils/api";
import { hideEmail } from "npm/utils/comman";
import React, { type ChangeEvent, useRef, useState } from "react";
import { faker } from "@faker-js/faker";

const PopulateDb = () => {
  function createRandomUser(): {
    interestId: string;
    interestName: string;
  } {
    return {
      interestId: faker.string.uuid(),
      interestName: faker.commerce.productName(),
    };
  }

  const USERS: {
    interestId: string;
    interestName: string;
  }[] = faker.helpers.multiple(createRandomUser, {
    count: 100,
  });
  const addData = api.interests.addInterestsToDB.useMutation({
    onSuccess: () => {
      //
    },
  });
  return (
    <div>
      <button
        onClick={() => {
          addData.mutate({ interests: USERS });
        }}
      >
        populate db
      </button>
    </div>
  );
};

export default PopulateDb;
