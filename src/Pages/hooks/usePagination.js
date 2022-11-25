import React from "react";

const kDefaultPageSize = 5;

export default function usePagination({
  data,
  defaultPageSize = kDefaultPageSize,
}) {
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(
    defaultPageSize >= 0 ? defaultPageSize : kDefaultPageSize
  );
  const totalPages = Math.ceil(data.length / pageSize);
  const page = pageIndex + 1;

  const onNavigate = React.useCallback((nextPage) => {
    setPageIndex(nextPage - 1);
  }, []);

  const getPageItems = React.useCallback(
    (pageNumber) => {
      return data.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
    },
    [data, pageSize]
  );

  return {
    page,
    totalPages,
    setPageSize,
    getPageItems,
    onNavigate,
    total: data.length,
  };
}
