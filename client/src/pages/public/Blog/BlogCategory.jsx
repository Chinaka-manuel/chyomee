import { useParams, Link } from "react-router-dom";
import useBlog from "../../../hooks/useBlog";
import BlogCard from "../../../components/blog/BlogCard";

function BlogCategory() {
  const { slug } = useParams();
  const { allBlogs } = useBlog();

  // Match category by slugified version of category name
  const filtered = allBlogs.filter((b) => {
    const catSlug = (b.category || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return catSlug === slug;
  });

  if (filtered.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No articles found</h2>
          <p className="text-slate-500 mt-2">
            No articles were found for this category.
          </p>
          <Link to="/blog" className="inline-block mt-4 text-green-700">
            Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">{filtered[0].category}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((article) => (
            <BlogCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default BlogCategory;
