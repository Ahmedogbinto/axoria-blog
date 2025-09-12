"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Router from "next/navigation";
import { logOut } from "@/lib/serverActions/session/sessionServerActions";

export default function NavbarDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  async function handleLogout() {
    await logOut();
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (!dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    }
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={toggleDropdown} className="flex">
        <Image src="/icons/user.svg" alt="" width={24} height={24} />
      </button>
      {isOpen && (
        <ul className="absolute right-0 top-10 w-[250px] border-b border-x border-zinc-300">
          <li className="bg-slate-50 hover:bg-slate-200 border-b border-slate-400">
            <Link
              onClick={closeDropdown}
              href="/dashboard"
              className="block p-4"
            >
              Dashboard
            </Link>
          </li>
          <li className="bg-slate-50 hover:bg-slate-200">
            <button onClick={handleLogout} className="w-full p-4 text-left">
              sign out
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
