import { useEffect, useState } from "react";

const useMobile = (breakpoint = 768) => {
  const getInitial = () =>
    typeof window !== "undefined" && window.innerWidth < breakpoint;

  const [isMobile, setIsMobile] = useState(getInitial);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint);
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);   // rerun if breakpoint changes

  return [isMobile];
};

export default useMobile;
