import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import iprPrefect from "../../../config/assets/img/ipr-perfect-rect.png";

const navItems = [
  {
    title: "Trademark & IP",
    link: "/trademark",
    submenu: [
      { title: "Trademark Registration", link: "/trademark/registration" },
      { title: "Trademark Search", link: "/trademark/search" },
      { title: "Respond to TM Objection", link: "/trademark/objection" },
      { title: "Well Known Trademark", link: "/trademark/well-known" },
      { title: "Trademark Watch", link: "/trademark/watch" },
      { title: "Trademark Renewal", link: "/trademark/renewal" },
      { title: "Trademark Assignment", link: "/trademark/assignment" },
      { title: "USA Trademark", link: "/trademark/usa" },
      { title: "Trademark Class Finder", link: "/trademark/class-finder" },
    ],
  },
  {
    title: "Copyright & Design",
    link: "/copyright",
    submenu: [
      { title: "Copyright Infringement", link: "/copyright/infringement" },
      { title: "Patent Infringement", link: "/patent/infringement" },
      { title: "Trademark Infringement", link: "/trademark/infringement" },
    ],
  },
  {
    title: "Patent",
    link: "/patent",
    submenu: [
      { title: "Indian Patent Search", link: "/patent/search" },
      { title: "Provisional Patent Application", link: "/patent/provisional" },
      { title: "Patent Registration", link: "/patent/registration" },
    ],
  },
  { title: "Consult an Expert", link: "/consulttoexpert" },
  { title: "Infringement", link: "/infringement" },
  { title: "About", link: "/about" },
  { title: "Contact", link: "/contact" },
  { title: "Blog", link: "/blog" },
];

export default function Navbar() {
  const navClass = ({ isActive }) =>
    `whitespace-nowrap text-xs lg:text-sm xl:text-base font-medium transition-colors duration-200 ${
      isActive ? 'text-yellow-500 font-semibold' : 'text-gray-700 hover:text-yellow-500'
    }`;

  const [activeMenu, setActiveMenu] = useState(null);

  return (
    <nav className="fixed top-0 left-0 w-full flex items-center justify-between px-3 lg:px-6 py-3 shadow-sm bg-white z-50">

      {/* Logo */}
      <Link to="/" className="flex items-center shrink-0">
        <img src={iprPrefect} className="w-[85px] lg:w-[100px] xl:w-[110px]" alt="Logo" />
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center gap-2 lg:gap-4 xl:gap-6">
        {navItems.map((item) => (
          <div
            key={item.title}
            onMouseEnter={() => setActiveMenu(item.title)}
            onMouseLeave={() => setActiveMenu(null)}
            className="relative py-1"
          >
            <NavLink to={item.link} className={navClass}>
              <span className="flex items-center gap-0.5 lg:gap-1">
                {item.title}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    activeMenu === item.title ? 'rotate-180' : ''
                  }`}
                />
              </span>
            </NavLink>

            {/* Dropdown Menu */}
            {item.submenu && activeMenu === item.title && (
              <div className="absolute top-full left-0 pt-2 w-64 lg:w-72 z-50">
                <div className="bg-white shadow-xl rounded-md p-3 border border-gray-100 max-h-[75vh] overflow-y-auto">
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.title}
                      to={subItem.link}
                      onClick={() => setActiveMenu(null)}
                      className="block py-2 px-3 rounded text-xs lg:text-sm text-gray-700 hover:bg-gray-50 hover:text-yellow-600 transition-colors"
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Login Button */}
      <div className="shrink-0">
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `whitespace-nowrap rounded-md border-2 px-3 lg:px-5 py-1.5 text-xs lg:text-sm xl:text-base font-medium transition-colors ${
              isActive
                ? 'border-yellow-500 bg-yellow-500 text-black'
                : 'border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-black'
            }`
          }
        >
          Login
        </NavLink>
      </div>
    </nav>
  );
}