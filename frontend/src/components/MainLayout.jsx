import Header from "./Header.jsx";
import { Outlet } from "react-router-dom";

const MainLayout = ({ onSearch }) => {
  return (
    <>
      <Header/>
        <Outlet />
    </>
  );
};

export default MainLayout;
