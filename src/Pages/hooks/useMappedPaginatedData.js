import React from "react";
import { devLogError } from "../../util_funcs/reusables";

const DEFAULT_PAGE_SIZE = 5;

function useMappedPaginatedData(props) {
  const { fetch, defaultFetchExtra, defaultPageSize, manual } = props;
  const [isInitialized, setInitializedState] = React.useState(manual);
  const [initializing, setInitializing] = React.useState(false);
  const [loadingPagesMap, setLoadingPagesMap] = React.useState({});

  // Maps page number to data. If the data mapped to a page is undefined,
  // then it's not fetched yet.
  const [data, setData] = React.useState({});
  const [errors, setErrors] = React.useState({});
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(
    defaultPageSize >= 0 ? defaultPageSize : DEFAULT_PAGE_SIZE
  );
  const [total, setTotal] = React.useState(0);
  const [fetchExtra, setFetchExtra] = React.useState(defaultFetchExtra || {});
  let totalPages = Math.ceil(total / pageSize);
  totalPages = totalPages < 0 ? 0 : totalPages;

  const getDataForPage = React.useCallback(
    async (pageNumber) => {
      setLoadingPagesMap({
        ...loadingPagesMap,
        [pageNumber]: true,
      });

      setErrors({
        ...errors,
        [pageNumber]: "",
      });

      try {
        const fetchResult = await fetch({
          fetchExtra,
          pageNumber,
          pageSize,
        });

        if (!total) {
          setTotal(fetchResult.size);
        }

        setData({ ...data, [pageNumber]: fetchResult.data });
      } catch (error) {
        devLogError(error);
        setErrors({
          ...errors,
          [pageNumber]: error?.message || "Error loading data",
        });
      }

      setLoadingPagesMap({
        ...loadingPagesMap,
        [pageNumber]: false,
      });
    },
    [errors, data, loadingPagesMap, fetchExtra, fetch, pageSize]
  );

  const onNavigate = React.useCallback(
    (pageNumber) => {
      if (pageNumber === page) {
        // Current page, no need to navigate
        return;
      }

      setPage(pageNumber);

      if (data[pageNumber]) {
        // Page data loaded already
        return;
      }

      getDataForPage(pageNumber);
    },
    [page, data, getDataForPage]
  );

  const getPageItems = React.useCallback(
    (pageNumber) => {
      return data[pageNumber] || [];
    },
    [data, pageSize]
  );

  const clear = React.useCallback(() => {
    setErrors({});
    setLoadingPagesMap({});
    setPage(0);
    setTotal(0);
    setData({});
    setInitializedState(false);
  }, []);

  const externalSetFetchExtra = React.useCallback(
    (incomingFetchExtra, reload = false) => {
      setFetchExtra(incomingFetchExtra);

      if (reload) {
        clear();
      }
    },
    [clear]
  );

  React.useEffect(() => {
    if (!isInitialized) {
      setInitializing(true);
      setInitializedState(true);
      setPage(1);
      getDataForPage(1);
      setInitializing(false);
    }
  }, [isInitialized, getDataForPage]);

  const dataArr = React.useMemo(() => Object.values(data), [data]);

  const result = {
    loadingPagesMap,
    page,
    total,
    pageSize,
    isInitialized,
    initializing,
    fetchExtra,
    totalPages,
    setInitializing,
    setPageSize,
    getDataForPage,
    onNavigate,
    getPageItems,
    clear,
    data: dataArr,
    pageErrorsMap: errors,
    setFetchExtra: externalSetFetchExtra,
  };

  return result;
}

export default useMappedPaginatedData;
