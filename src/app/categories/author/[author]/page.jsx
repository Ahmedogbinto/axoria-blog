import BlogCard from "@/components/BlogCard";
import { getPostsByAuthor } from "@/lib/serverMethods/blog/postMethods";

export default async  function page({params}) {
    const {author} = await params;
    const postsData = await getPostsByAuthor(author);

    console.log(postsData)

  return (
    <main className="u-main-container u-padding-content-container">
        <h1 className="t-main-title">Posts from the {postsData.author.userName} </h1>
        
        <p className="t-main-subtitle">Every post from this author.</p>

        <p className="mr-4 text-md text-zinc-900">Latest articles</p>

        <ul className="u-articles-grid">
            {postsData.posts.length > 0 ? (
                postsData.posts.map(post => <BlogCard key={post._id} post={post} />)
            ) : (
                <li> There is no article written by this author. 🤖 </li>
            )}
        </ul>    
      
    </main>
  )
}