import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Divider from "./Divider";
import Axios from "../utils/Axios";
import summaryApi from "../common/SummaryApi";
import { logout } from "../store/userSlice";
import { toast } from "react-hot-toast";
import AxiosToastError from "../utils/AxiosToastError";
import { BiLinkExternal } from "react-icons/bi";
import isAdmin from "../utils/isAdmin";

function UserMenu({ close }) {
  const user = useSelector((state) => state?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = async () => {
    //add logout functionality here
    try {
      const response = await Axios({
        ...summaryApi.logout,
      });
      if (response?.data?.success) {
        if (close) {
          close();
        }

        dispatch(logout());
        localStorage.clear();
        toast.success("Logout Successfully");
        navigate("/");
        window.location.reload();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const handleClose = () => {
    if (close) {
      close();
    }
  };

  return (
    <div>
      <div className="font-semibold">My Account</div>
      <div className="text-sm flex items-center gap-1">
        <span>
          {" "}
          {user?.name || user?.mobile}{" "}
          <span className="text-medium text-red-600">{user.role === "ADMIN" ? "admin" : ""}</span>{" "}
        </span>
        <Link
          onClick={handleClose}
          to={"/dashboard/profile"}
          className="hover:text-amber-500"
        >
          <BiLinkExternal size={15} />
        </Link>
      </div>
      <Divider />

      <div className="text-sm grid gap-2 mt-2">
        {isAdmin(user.role) && (
          <Link
            onClick={handleClose}
            to={"/dashboard/category"}
            className="px-2 hover:bg-orange-200 py-1"
          >
            Category
          </Link>
        )}

        {isAdmin(user.role) && (
          <Link
            onClick={handleClose}
            to={"/dashboard/subcategory"}
            className="px-2 hover:bg-orange-200 py-1"
          >
            Sub Category
          </Link>
        )}

        {isAdmin(user.role) && (
          <Link
            onClick={handleClose}
            to={"/dashboard/upload-product"}
            className="px-2 hover:bg-orange-200 py-1"
          >
            Upload Product
          </Link>
        )}

        {isAdmin(user.role) && (
          <Link
            onClick={handleClose}
            to={"/dashboard/product"}
            className="px-2 hover:bg-orange-200 py-1"
          >
            Product
          </Link>
        )}

        <Link
          onClick={handleClose}
          to={"/dashboard/myorders"}
          className="px-2 hover:bg-orange-200 py-1"
        >
          My Order
        </Link>
        <Link
          onClick={handleClose}
          to={"/dashboard/address"}
          className="px-2 hover:bg-orange-200 py-1"
        >
          Save Address
        </Link>
        <button
          onClick={handleLogout}
          className="text-left text-red-500 font-extralight cursor-pointer px-2"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

export default UserMenu;
