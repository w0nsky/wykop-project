import { useEffect } from "react";
import Navbar from "../components/Navbar";
import PostGrid from "../components/PostGrid";

function Home() {
  useEffect(() => {
    document.title = "Super Blog";
  });
  return (
    <>
      <PostGrid />
    </>
  );
}
export default Home;
