import BlogCard from "../../../components/blog/BlogCard";
import useBlog from "../../../hooks/useBlog";
import ScrollReveal from "../../../components/ui/ScrollReveal";

function Blog() {
  const {
    blogs,
    categories,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
  } = useBlog();

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <ScrollReveal as="section" className="bg-green-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <p className="text-green-200 font-semibold mb-3">
            chyomee journal
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mb-5">Our Blog</h1>

          <p className="max-w-2xl mx-auto text-green-100 text-lg">
            Discover outfit inspiration, practical style advice, care tips, and
            stories from chyomee.
          </p>
        </div>
      </ScrollReveal>

      {/* Blog Section */}
      <ScrollReveal as="section" className="max-w-7xl mx-auto px-6 py-12">
        {/* Search + Categories */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between mb-10">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === category
                    ? "bg-green-700 text-white"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-green-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="w-full lg:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search articles..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
        </div>

        {/* Results */}
        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, index) => (
              <ScrollReveal as="div" key={blog.id} delay={index * 0.06}>
                <BlogCard article={blog} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              No articles found
            </h2>

            <p className="text-slate-500">
              Try another search term or category.
            </p>
          </div>
        )}
      </ScrollReveal>
    </main>
  );
}

export default Blog;
