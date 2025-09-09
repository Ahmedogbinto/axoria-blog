"use client"


import { useRef } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/serverActions/session/sessionServerActions";

export default function page() {

  const serverValidationText = useRef();
  const submitButtonRef = useRef();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    serverValidationText.current.textContent = ""
    submitButtonRef.current.disabled = true

    try {
      const result = await login (new FormData(e.target))

      if (result.success) {
        router.push("/")
      }

    }catch (error) {
     console.error("Error during login:", error);
     submitButtonRef.current.disabled = false;
     submitButtonRef.current.textContent = error.message
    }

  }

  return (
     <form
     onSubmit={handleSubmit}
     className="max-w-md mx-auto mt-36"
     >
      <label
        htmlFor="userName"
        className="f-label"
      >
        Your pseudo
      </label>
      <input 
        className="f-auth-input"
        type="text"
        id="userName"
        name="userName"
        placeholder="Your pseudo"
        required
      />

      <label 
        htmlFor="password"
        className="f-label"
        >
        Your password
      </label>
      <input 
        className="f-auth-input !mb-2"
        type="password"
        id="password"
        name="password"
        placeholder="Your password"
        required
      />

      <button
      ref={submitButtonRef}
      className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 mt-14 mb-10 rounded border-none"
      >
        Submit
      </button>
   
      <p
        ref={serverValidationText}
        className=" text-center mb-10 hidden"
      >
        Les potentiels erreurs
      </p>
      <a 
      className="mb-5 underline text-blue-600 block text-center"
      href="/signup">
        You don't have an account, Sign up
      </a>


     </form>
  )
}