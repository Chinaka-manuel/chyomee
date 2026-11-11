import { Link } from "react-router-dom";
import { formatArticleDate } from "../../utils/formatDate";

function BlogCard({ article }) {
  return (
    <article className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition">
      {/* Image */}
      <div className="h-56 bg-green-100 overflow-hidden">
        {article.image ? (
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-green-700 font-semibold">
            chyomee Editorial
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-green-700">
            {article.category}
          </span>

          <span className="text-xs text-slate-500">{article.readTime}</span>
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-3">
          {article.title}
        </h2>

        <p className="text-slate-600 leading-6 mb-5">{article.excerpt}</p>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            {formatArticleDate(article.date)}
          </span>

          <Link
            to={`/blog/${article.slug}`}
            className="text-green-700 font-semibold hover:text-green-900"
          >
            Read Article →
          </Link>
        </div>
      </div>
    </article>
  );
}

export default BlogCard;
