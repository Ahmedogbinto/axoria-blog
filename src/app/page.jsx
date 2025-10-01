import { connectToBD } from "@/lib/utils/db/connectToDB";
import Link from "next/link";
import { getPosts } from "@/lib/serverMethods/blog/postMethods";
import BlogCard from "@/components/BlogCard";


export default async function Home() {
  await connectToBD()

  const posts = await getPosts()
  console.log("Real Pots:", posts)

  return (
    <div className="u-main-container u-padding-content-container">
      <h1 className="t-main-title">Stay up to day with AXORIA</h1>
      <p className="t-main-subtitle">Tech news and useful knowledge</p>

      <p className="text-md text-zinc-900">Latest articles</p>
      <ul className="u-articles-grid ">
        {posts.map((post, id) => (
          <BlogCard post={post}
          key={id}
          />
        ))}
      </ul>
    </div>
  );
}
