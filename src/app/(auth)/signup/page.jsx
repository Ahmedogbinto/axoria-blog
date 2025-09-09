"use client"

import { useRef } from "react";
import { register } from "@/lib/serverActions/session/sessionServerActions";
import { useRouter } from "next/navigation";

export default function page() {

  const serverValidationText = useRef();
  const submitButtonRef = useRef();
  const router = useRouter();

  async function handleSubmit(e) {         // async parce qu'on va await à l'interieur
    e.preventDefault()

    serverValidationText.current.classList.add("hidden");
    serverValidationText.current.classList.textContent = "";
    submitButtonRef.current.textContent = "saving User..."
    submitButtonRef.current.disabled = true

    try {

      const result = await register(new FormData(e.target));

      if (result.success) {
        submitButtonRef.current.textContent = "User created ✅";

        let countdown = 3;
        serverValidationText.current.classList.remove("hidden");
        serverValidationText.current.textContent = `Redirecting in ${countdown}...`;

        const interval = setInterval(() => {
          countdown -= 1;
          serverValidationText.current.textContent = `Redirecting in ${countdown}...`;

          if (countdown === 0) {
            clearInterval(interval);
            router.push(`signin`);
          }
        }, 1000);
      }
    } catch (error) {
      serverValidationText.current.textContent = "Submit";
      submitButtonRef.current.textContent = `${error.message}`;
      submitButtonRef.current.disabled = false;
    }
  }


  return (
    <form 
    onSubmit={handleSubmit}
    className="max-w-md mx-auto mt-36 ">
   
      <label 
        htmlFor="userName"
        className="f-label"
        >
          Name or pseudo
      </label>
      <input 
        className="f-auth-input"
        type="text"
        id="userName"
        name="userName"
        placeholder="Name or pseudo"
        required
      />

      <label 
        htmlFor="email"
        className="f-label"
        >
          E- mail
      </label>
      <input 
        className="f-auth-input"
        type="email"
        id="email"
        name="email"
        placeholder="E-mail"
        required
      />

      <label 
        htmlFor="password"
        className="f-label"
        >
          Password
      </label>
      <input 
        className="f-auth-input"
        type="password"
        id="password"
        name="password"
        placeholder="Your password"
        required
      />

      <label 
        htmlFor="passwordRepeat"
        className="f-label"
        >
          Confirm password
      </label>
      <input 
        className="f-auth-input"
        type="text"
        id="passwordRepeat"
        name="passwordRepeat"
        placeholder="Confirm password"
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
      href="/signin">
        Already have an account? Log in
      </a>
      
    </form> 
  )
}