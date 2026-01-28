import { Outlet } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import fetchUserDetails from "./utils/fethUserDetails";
import { useEffect } from "react";
import { setUserDetails } from "./store/userSlice";
import { useDispatch } from "react-redux";
import summaryApi from "./common/SummaryApi";
import Axios from "./utils/Axios";
import AxiosToastError from "./utils/AxiosToastError";
import {
  setAllCategory,
  setAllSubCategory,
  setLoadingCategory,
} from "./store/productSlice";
import GlobalProvider from "./provider/GlobalProvider";
import CartMobileLink from "./components/CartMobileLink";

function App() {
  const dispatch = useDispatch();

  const fetchUser = async () => {
    const userData = await fetchUserDetails();

    if (!userData) return; // ✅ safety check

    dispatch(setUserDetails(userData.data));
   
  };

  const fetchCategory = async () => {
    try {
      const response = await Axios({
        ...summaryApi.getCategory,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(setAllCategory(responseData.data));
        // setCategoryData(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      // setLoading(false);
    }
  };

  const fetchSubCategory = async () => {
    try {
      dispatch(setLoadingCategory());
      const response = await Axios({
        ...summaryApi.getSubCategory,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(
          setAllSubCategory(
            responseData.data.sort((a, b) => a.name.localeCompare(b.name)),
          ),
        );
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      dispatch(setLoadingCategory(false));
    }
  };

  useEffect(() => {
    fetchUser();
    fetchCategory();
    fetchSubCategory();
  });

  return (
    <GlobalProvider>
      <Header  />
      <main className="min-h-[78vh]">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
      {location.pathname !== "/checkout" && <CartMobileLink />}
    </GlobalProvider>
  );
}

export default App;
