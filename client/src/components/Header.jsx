import React, {  useState } from "react";
import logo from "../assets/logo2.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Search from "./Search";
import { FaRegCircleUser } from "react-icons/fa6";
import useMobile from "../hooks/UseMobile";
import { TiShoppingCart } from "react-icons/ti";
import { useSelector } from "react-redux";
import { GoTriangleDown } from "react-icons/go";
import { RxTriangleUp } from "react-icons/rx";
import UserMenu from "./UserMenu";
import { useGlobalContext } from "../provider/GlobalProvider";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import DisplayCartItem from "./DisplayCartItem";

function Header() {
  const [isMobile] = useMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state?.user);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const cartItem = useSelector((state) => state.cartItem.cart);
  const [openCartSection, setOpenCartSection] = useState(false);

  const isSearchPage = location.pathname === "/search";
  const { totalPrice, totalQty } = useGlobalContext();

  const redirectToLogin = () => {
    navigate("/login");
  };


  const handleCloseUserMenu = () => {
    setOpenUserMenu(false);
  };
 

  const handleMobileUser = () => {
    if (!user?._id) {
      navigate("/login");
      return;
    }
    navigate("/user-menu-mobile");
  };

  return (
    <header className="h-24 lg:h-20 lg:shadow-md sticky top-0 z-40 flex flex-col justify-center gap-1 bg-white">
      {!(isSearchPage && isMobile) && (
        <div className="container mx-auto flex items-center px-2 justify-between">
          {/**logo */}
          <div className="h-full  rounded-2xl ">
            <Link to={"/"} className="h-full flex justify-center items-center">
              <img
                src={logo}
                width={270}
                height={50}
                alt="logo"
                className="hidden lg:block rounded-2xl "
              />
              <img
                src={logo}
                width={120}
                height={60}
                alt="logo"
                className="lg:hidden"
              />
            </Link>
          </div>
          {/**Search */}
          <div className="hidden lg:block">
            <Search />
          </div>
          {/**login and my cart */}
          <div>
            {/**user icons display in only mobile version**/}
            <button
              className=" text-neutral-600 lg:hidden"
              onClick={handleMobileUser}
            >
              <FaRegCircleUser size={28} />
            </button>
            {/**Desktop**/}
            <div className="hidden lg:flex  items-center gap-10">
              {user?._id ? (
                <div className="relative">
                  <div
                    onClick={() => setOpenUserMenu((preve) => !preve)}
                    className="flex select-none items-center gap-1 cursor-pointer"
                  >
                    <p className="font-semibold text-lg">Account</p>
                    {openUserMenu ? (
                      <RxTriangleUp size={25} />
                    ) : (
                      <GoTriangleDown size={25} />
                    )}
                  </div>
                  {openUserMenu && (
                    <div className="absolute right-0 h-2 top-12">
                      <div className="bg-white rounded p-4 min-w-52 lg:shadow-lg">
                        <UserMenu close={handleCloseUserMenu} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={redirectToLogin}
                  className="cursor-pointer text-lg px-2"
                >
                  Login
                </button>
              )}

              <button
                onClick={() => setOpenCartSection(true)}
                className="flex items-center gap-2 bg-green-800 hover:bg-green-700 px-3 py-2 rounded text-white cursor-pointer"
              >
                {/**Add to cart**/}
                <div className="animate-bounce items-center">
                  <TiShoppingCart size={30} />
                </div>
                <div className="font-semibold text-sm">
                  {cartItem[0] ? (
                    <div>
                      <p>{totalQty} Items</p>
                      <p>{DisplayPriceInRupees(totalPrice)}</p>
                    </div>
                  ) : (
                    <p>My Cart</p>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-2 lg:hidden ">
        {/**mobile search */}
        <Search />
      </div>

      {openCartSection && (
        <DisplayCartItem close={() => setOpenCartSection(false)} />
      )}
    </header>
  );
}

export default Header;
