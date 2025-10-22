"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/navigation";
import { logOut, isPrivatePage } from "@/lib/serverActions/session/sessionServerActions";
import { useAuth } from "@/app/AuthContext";


export default function NavbarDropdown({userId}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef();

  const {setIsAuthenticated} = useAuth();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  async function handleLogout() {
    const result = await logOut();

    if (result.success) {
      setIsAuthenticated({
        loading: false,
        isConnected: false,
        userId: null
      })
       if(isPrivatePage(window.location.pathname)) {
        router.push("/signin")
      }
    } 
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
              href={`/dashboard/${userId}`}
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
