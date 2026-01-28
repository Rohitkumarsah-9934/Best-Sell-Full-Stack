import { IoSearch } from "react-icons/io5";
import { TypeAnimation } from "react-type-animation";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useMobile from "../hooks/UseMobile";
import { FaArrowLeft } from "react-icons/fa";

function Search() {
  const navigate = useNavigate();
  const location = useLocation();

  const [ismobile] = useMobile();

  const params = useLocation();
  const searchText = params.search.slice(3);
  const isSearchPage = location.pathname === "/search";

  function redirectToSearchPage() {
    navigate("/search");
  }

  const handleOnChange = (e) => {
    const value = e.target.value;
    const url = `/search?q=${value}`;
    navigate(url);
  };

  return (
    <div className="w-full  min-w-75 lg:min-w-105 h-11 lg:h-12 rounded-lg border overflow-hidden flex items-center text-neutral-500 bg-slate-50 group focus-within:border-yellow-400 ">
      <div>
        {ismobile && isSearchPage ? (
          <Link
            to={"/"}
            className="flex justify-center items-center h-full p-3 group-focus-within:text-yellow-400 cursor-pointer"
          >
            <FaArrowLeft size={22} />
          </Link>
        ) : (
          <button className="flex justify-center items-center h-full p-3 group-focus-within:text-yellow-400">
            <IoSearch size={22} />
          </button>
        )}
      </div>

      <div className="w-full h-full">
        {!isSearchPage ? (
          <div
            onClick={redirectToSearchPage}
            className="w-full h-full  flex items-center"
          >
            <TypeAnimation
              sequence={[
                // Same substring at the start will only be typed out once, initially
                'search "milk"',
                1000, // wait 1s before replacing "Mice" with "Hamsters"
                'search "bread"',
                1000,
                'search "chocolate"',
                1000,
                'search "cookies"',
                1000,
                'search "eggs"',
                1000,
                'search "butter"',
                1000,
                'search "cheese"',
                1000,
                'search "yogurt"',
                1000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </div>
        ) : (
          <div className="w-full h-full">
            <input
              type="text"
              placeholder="Search for atta dal and more."
              autoFocus
              defaultValue={searchText}
              className="bg-transparent w-full h-full outline-none"
              onChange={handleOnChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
