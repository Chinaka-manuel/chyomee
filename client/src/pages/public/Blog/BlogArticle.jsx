import { useParams, Link } from "react-router-dom";
import useBlog from "../../../hooks/useBlog";
import { formatArticleDate } from "../../../utils/formatDate";

function BlogArticle() {
  const { slug } = useParams();
  const { getBlogBySlug } = useBlog();

  const article = getBlogBySlug(slug);

  if (!article) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Article not found</h2>
          <p className="text-slate-500 mt-2">
            The requested article could not be located.
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
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-6 text-sm text-green-700">{article.category}</div>

        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

        <div className="flex items-center justify-between text-sm text-slate-500 mb-8">
          <span>{article.author}</span>
          <span>{formatArticleDate(article.date)}</span>
        </div>

        {article.image && (
          <div className="mb-8">
            <img
              src={article.image}
              alt={article.title}
              className="w-full rounded-lg object-cover"
            />
          </div>
        )}

        <div className="prose max-w-none text-slate-700">{article.content}</div>
      </section>
    </main>
  );
}

export default BlogArticle;
