import React from "react";
import logo from "../assets/logo.png";

function Sidebar({ open, setUser, user }) {

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const logout = () => {
    if (setUser) setUser(null);
  };

  return (

    <div
      className={`fixed top-0 left-0 h-screen bg-[#111827] border-r border-blue-500/20 
      transition-all duration-300 flex flex-col
      ${open ? "w-56 p-6" : "w-0 p-0 overflow-hidden"}`}
    >

      {/* Brand */}
      <div className="flex items-center gap-3 mb-10">

        <img src={logo} alt="logo" className="w-10 h-10 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]" />

        <div className="flex flex-col">
          <p className="text-blue-400 font-bold leading-tight">AI Ops <span className="text-white text-sm">Enterprise Intelligence</span></p>
          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">Autonomous Multi-Agent Decision Platform</p>
        </div>

      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-3">

        <button onClick={() => scrollToSection("kpi")} className="sidebar-btn">
          Dashboard
        </button>

        <button onClick={() => scrollToSection("trend")} className="sidebar-btn">
          Analytics
        </button>

        {/* Only analyst/admin */}
        {(user?.role === "analyst" || user?.role === "admin") && (
          <button onClick={() => scrollToSection("agents")} className="sidebar-btn">
            AI Agents
          </button>
        )}

        <button onClick={() => scrollToSection("activity")} className="sidebar-btn">
          Activity
        </button>

        {/* Only analyst/admin */}
        {(user?.role === "analyst" || user?.role === "admin") && (
          <button onClick={() => scrollToSection("incidents")} className="sidebar-btn">
            Incidents
          </button>
        )}

        <button onClick={() => scrollToSection("results")} className="sidebar-btn">
          Results
        </button>

        {/* Admin future feature */}
        {user?.role === "admin" && (
          <button onClick={() => scrollToSection("users")} className="sidebar-btn">
            User Management
          </button>
        )}

      </div>

      {/* Logout */}
      <div className="mt-auto pt-6">

        <button
          onClick={logout}
          className="sidebar-btn text-red-400 hover:text-red-300"
        >
          Logout
        </button>

      </div>

    </div>

  );
}

export default Sidebar;