// ============================================
// Sample Test Data
// ============================================
// Use this data to test the API

const sampleData = {
  // Sample user
  user: {
    username: 'johndoe',
    email: 'john@example.com',
    password: 'TestPassword123',
    confirmPassword: 'TestPassword123',
    firstName: 'John',
    lastName: 'Doe'
  },

  // Sample content for summarization
  articles: [
    {
      title: 'The Future of AI',
      content: `
        Artificial Intelligence is rapidly transforming every aspect of our society.
        From healthcare to finance, manufacturing to entertainment, AI applications
        are becoming increasingly sophisticated and ubiquitous.

        Machine learning algorithms can now analyze vast amounts of data and identify
        patterns that would be impossible for humans to detect. Natural language processing
        enables computers to understand and generate human-like text. Computer vision systems
        can recognize objects, faces, and scenes with accuracy that sometimes exceeds human
        capabilities.

        However, with these advancements come significant challenges. Concerns about privacy,
        job displacement, and algorithmic bias are at the forefront of discussions about AI's
        future. Researchers and policymakers are working together to establish ethical guidelines
        and regulatory frameworks to ensure AI is developed and deployed responsibly.

        The next decade will be crucial in shaping how AI integrates into our world. Whether
        we successfully navigate the challenges ahead will determine whether AI becomes a tool
        for widespread human flourishing or a source of significant disruption.
      `
    },
    {
      title: 'Climate Change Solutions',
      content: `
        Climate change represents one of the most pressing challenges of our time.
        Rising global temperatures, extreme weather events, and ecological disruption
        demand urgent action from individuals, governments, and corporations.

        Renewable energy technologies have become increasingly cost-effective. Solar panels,
        wind turbines, and battery storage systems are now competitive with fossil fuels
        in many regions. Electric vehicles are becoming mainstream, with major automakers
        committing to phase out internal combustion engines.

        Beyond energy, solutions include reforestation initiatives, sustainable agriculture practices,
        and circular economy principles. Carbon capture technology is advancing, though still expensive
        at scale. Education and awareness are equally important, as consumer choices drive market demand
        for sustainable products and services.

        International cooperation through agreements like the Paris Accord provides a framework
        for coordinated action. Individual countries are setting ambitious net-zero targets,
        though the challenge remains to achieve them while maintaining economic growth.

        Success will require a combination of technological innovation, policy changes, and shifts
        in consumer behavior. The transition to a sustainable future is both challenging and necessary.
      `
    },
    {
      title: 'Remote Work Benefits',
      content: `
        The COVID-19 pandemic accelerated a global shift toward remote work, proving that
        distributed teams can be highly productive. Many organizations discovered unexpected benefits
        to this new work arrangement.

        Productivity data shows that many remote workers accomplish more in fewer hours, free from
        office distractions. Employees report better work-life balance and reduced stress from commuting.
        Companies save money on office real estate, utilities, and facilities management.

        Remote work also opens opportunities for global talent acquisition. Organizations can hire
        the best candidates regardless of location, leading to more diverse and innovative teams.
        Employees gain flexibility to work during their most productive hours and in environments
        suited to their needs.

        However, challenges remain. Maintaining company culture, ensuring employee connection, and
        managing communication across time zones require deliberate effort. Some roles still benefit
        from in-person collaboration. Many companies are adopting hybrid models that combine remote
        and office work.

        The future of work is likely to be flexible, with organizations and employees negotiating
        arrangements that work for both parties. Success depends on clear communication, trust,
        and the right tools and policies.
      `
    }
  ],

  // Sample API responses
  apiResponse: {
    success: {
      status: 200,
      data: {
        _id: '507f1f77bcf86cd799439011',
        userId: '507f1f77bcf86cd799439010',
        title: 'The Future of AI',
        originalContent: 'Artificial Intelligence is...',
        contentType: 'text',
        wordCount: 245,
        summaries: {
          short: 'AI is transforming society with applications in healthcare and finance, but challenges like privacy and bias need to be addressed.',
          detailed: 'Full detailed summary...',
          bulletPoints: [
            'AI applications in healthcare, finance, and manufacturing',
            'Machine learning and NLP advancements',
            'Concerns about privacy and job displacement'
          ]
        },
        aiModel: 'openai',
        analysis: {
          topics: ['AI', 'Technology', 'Future'],
          keywords: ['artificial intelligence', 'machine learning', 'ethics'],
          sentiment: 'positive',
          language: 'en'
        },
        isBookmarked: false,
        createdAt: '2024-01-15T10:30:00Z'
      }
    }
  }
};

export default sampleData;
