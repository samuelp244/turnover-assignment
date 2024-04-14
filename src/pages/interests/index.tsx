import { api } from "npm/utils/api";
import React, { useState, useEffect } from "react";
import { InfinitySpin } from "react-loader-spinner";
const Interests = () => {
  // const [userInterests, setUserInterests] = useState<{ interestId: string }[]>(
  //   [],
  // );
  const [interests, setInterests] = useState<
    { interestId: string; interestName: string; interestChecked: boolean }[]
  >([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const fetchedInterests = api.interests.fetchAllInterests.useQuery({
    pageNumber: page,
    pageSize: pageSize,
  });
  const {
    data: fetchedUserInterests,
    refetch,
    isFetching: isUserInterestsFetching,
  } = api.interests.fetchUserInterests.useQuery();

  useEffect(() => {
    if (fetchedInterests.data?.interests && fetchedUserInterests?.interests) {
      const modifiedInterests = fetchedInterests.data.interests.map((i) => ({
        interestId: i.id,
        interestName: i.name,
        interestChecked:
          fetchedUserInterests?.interests.filter((o) => o.interestId === i.id)
            .length > 0
            ? true
            : false,
      }));
      setInterests(modifiedInterests);
    }
    void refetch();
  }, [fetchedInterests.data]);

  const totalPages = Math.ceil(100 / pageSize);
  const addUserInterest = api.interests.addUserInterest.useMutation();
  const removeUserInterest = api.interests.deleteUserInterest.useMutation();
  const handleAddOrRemoveUserInterest = async (
    checked: boolean,
    interestId: string,
  ) => {
    if (checked) {
      addUserInterest.mutate({ interestId });
      await refetch();
    } else {
      const interestToRemove = fetchedUserInterests?.interests?.find(
        (o) => o.interestId === interestId,
      );
      if (fetchedUserInterests?.interests && interestToRemove)
        removeUserInterest.mutate({
          userInterestId: interestToRemove.id,
        });
    }
  };
  return (
    <main className="flex min-h-[90vh] flex-col items-center justify-center ">
      <div className="flex min-h-[476px] min-w-[576px] flex-col items-center justify-center rounded-xl border-2 border-[#C1C1C1] p-10">
        {fetchedInterests.isFetching ||
        isUserInterestsFetching ||
        addUserInterest.isPending ||
        removeUserInterest.isPending ? (
          <InfinitySpin
            // visible={true}
            width="200"
            color="#4fa94d"
            // ariaLabel="infinity-spin-loading"
          />
        ) : (
          <>
            <h1 className="mb-10 text-3xl font-semibold text-black">
              Please mark your interests!
            </h1>
            <p>We will keep you notified.</p>
            <div className="mt-6 flex w-full flex-col gap-y-4">
              <p className=" text-lg font-medium">My saved interests!</p>

              {interests?.map((interest) => {
                const { interestId, interestName, interestChecked } = interest;
                return (
                  <div key={interestId} className="flex gap-3">
                    <input
                      type="checkbox"
                      checked={interestChecked}
                      onChange={(e) => {
                        const tempInterests = interests.map((i) => {
                          if (i.interestId === interest.interestId) {
                            return { ...i, interestChecked: e.target.checked };
                          }
                          return i;
                        });
                        setInterests(tempInterests);
                        void handleAddOrRemoveUserInterest(
                          e.target.checked,
                          interestId,
                        );
                      }}
                    />
                    <label>{interestName}</label>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 w-full">
              <div className="flex justify-between px-10">
                {page > 1 && (
                  <button onClick={() => setPage(page - 1)}>{"<"}</button>
                )}
                {[...(Array(totalPages) as number[])].map((_, index) => {
                  const currentPage = index + 1;
                  if (currentPage === page) {
                    return (
                      <button key={index} className="font-bold" disabled>
                        {currentPage}
                      </button>
                    );
                  } else if (
                    currentPage === 1 ||
                    currentPage === totalPages ||
                    Math.abs(currentPage - page) <= 2 ||
                    (page < 3 && currentPage <= 5) ||
                    (page > totalPages - 3 && currentPage >= totalPages - 4)
                  ) {
                    return (
                      <button key={index} onClick={() => setPage(currentPage)}>
                        {currentPage}
                      </button>
                    );
                  } else if (
                    currentPage === totalPages - 1 &&
                    page < totalPages - 4
                  ) {
                    return <span key={index}>...</span>;
                  }
                  return null;
                })}
                {page < totalPages && (
                  <button onClick={() => setPage(page + 1)}>{">"}</button>
                )}
              </div>
            </div>

            <div>{/* <PopulateDb /> */}</div>
          </>
        )}
      </div>
    </main>
  );
};

export default Interests;
