import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import ChatBot from "./chatbot/ChatBot";

const Layout: React.FC = () => (
  <div>
    <Header />
    <main>
      <Outlet />
    </main>
    <Footer />
    <ChatBot />
  </div>
);

export default Layout;
