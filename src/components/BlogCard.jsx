import Image from "next/image"
import Link from "next/link"

export default function BlogCard({post}) {
  return (
    <li 
        className="rounded-sm shadow-md hover:shadow-xl border hover:border-zinc-300">
            <Link href={`/article/${post.slug}`}>
                <Image
                    src={post.coverImageUrl}
                    width={340}
                    height={190}
                    alt={`Image de description de l'article: ${post.title}`}
                    className="w-full rounded-t-sm object-cover"
                />
            </Link>
        <div className="pt-5 px-5 pb-7">
            <div className="flex items-baseline gap-x-4 text-xs">
            <time dateTime={new Date().toISOString()} className="text-gray-500 text-sm">
                {new Date().toLocaleDateString("en-EN", {year:"numeric", month:"long", day:"numeric"})}
            </time>

            <Link href={`/categories/author/${post.author.normalizedUserName}`} 
                className="ml-auto text-base text-gray-700 hover:text-gray-600 whitespace-nowrap truncate"
            >
                {post.author?.userName || "Unknown Author"}
            </Link>

            </div>
            <Link href={`/article/${post.slug}`} className="inline-block mt-6 text-xl font-semibold text-zinc-800 hover:text-zinc-600">
                {post.title}
            </Link>
        </div>
        </li>
  )
}