import Link from "next/link"
import { getPostsFromUserID } from "@/lib/serverMethods/blog/postMethods"
import DeletePostButton from "./components/DeletePostButton"
import AppError from "@/lib/utils/errorHandle/customError"
import { connectToBD } from "@/lib/utils/db/connectToDB"



export default async function page({params}) {

  const {userId} = await params

   const posts = await getPostsFromUserID(userId)


  return (
    <main className="u-main-container u-padding-content-container">
      <h1 className="text-3xl mb-5">Dashboard - Your articles</h1>
      
      <ul>
        {posts.length > 0 ? (
          posts.map(post => (
            <li 
            key={post._id}
            className="flex items-center mb-2 bg-slate-50 py-2 pl-4"
            > 
              <Link href={`/article/${post.slug}`} 
              className="mr-auto underline underline-offset-2 text-lg text-violet-600">
                {post.title}
              </Link>

              <Link 
              href={`/dashboard/edit/${post._id}`}  // on utilise _id pour valider le caching de la page 
              className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 min-w-20 text-center rounded mr-2">
                Edit
              </Link>

              <>
                <DeletePostButton id={post._id.toString()} />
              </>

            </li>
          ))
        ): (
          <li> You don't created any articles yet</li>
        )}

      </ul>
    </main>
  )
}