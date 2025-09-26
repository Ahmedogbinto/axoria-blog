import Link from "next/link"


export default async function page({params}) {

  const {userId} = await params


  const posts = [
    {
      "_id": "68d43717dd941e5d6c39c915",
      "title": "Article imagee avec auteur",
      "markdownArticle": "Article imagee avec auteur",
      "markdownHTMLResult": "<p>Article imagee avec auteur</p>\n",
      "author": {
          "_id": "68bf7c13e4dd5d29651ad75c",
          "userName": "AhmedO",
          "normalizedUserName": "ahmedo"
      },
      "coverImageUrl": "https://ReplicationAxoria.b-cdn.net/24a0e49b-3d7b-4ba8-8577-2a99891633ed_emmet-thumb.jpg",
      "tags": [
          {
              "_id": "68b2646d0a372d7edd3592f5",
              "name": "react",
              "slug": "react"
          }
      ],
      "createdAt": "2025-09-24T18:23:19.573Z",
      "updatedAt": "2025-09-24T18:23:19.573Z",
      "slug": "Article-imagee-avec-auteur",
      "__v": 0
    }
  ]

 

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
              className="mr-auto underline underline-offset-2 text-violet-600">
                {post.title}
              </Link>

              <button>Delete</button>

              <Link 
              href={`/dashboard/edit/${post.slug}`}
              className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded mr-2">
                Edit
              </Link>
            </li>
          ))
        ): (
          <li> You don't created any articles yet</li>
        )}

      </ul>
    </main>
  )
}