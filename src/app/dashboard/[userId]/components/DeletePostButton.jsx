"use client"
import { deletePost } from "@/lib/serverActions/blog/postServerActions"

export default function DeletePostButton({id}) {


  return (
  <button
        onClick={()=> deletePost(id)}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 min-w-20 rounded mr-2">
        Delete
  </button>
  )
}