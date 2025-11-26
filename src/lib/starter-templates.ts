export interface StarterTemplate {
  id: string;
  name: string;
  topic: string;
  platform: string;
  description: string;
  category: string;
  example: string;
}

export const starterTemplates: StarterTemplate[] = [
  // Marketing & Promotion
  {
    id: "product-launch-twitter",
    name: "Product Launch",
    topic: "Exciting product launch announcement with key features and early bird offer",
    platform: "twitter",
    description: "Perfect for announcing new products with urgency",
    category: "Marketing",
    example: "🚀 Launching our newest product! Get 20% off for early adopters.",
  },
  {
    id: "flash-sale-instagram",
    name: "Flash Sale",
    topic: "24-hour flash sale with discount code and limited availability",
    platform: "instagram",
    description: "Create urgency with time-limited offers",
    category: "Marketing",
    example: "⚡ 24-hour flash sale! Use code FLASH20 for 20% off.",
  },
  {
    id: "webinar-linkedin",
    name: "Webinar Announcement",
    topic: "Professional webinar invitation with registration link and speaker credentials",
    platform: "linkedin",
    description: "Promote events to professional audiences",
    category: "Marketing",
    example: "Join our expert webinar on industry trends. Register now!",
  },

  // Educational Content
  {
    id: "tips-twitter",
    name: "Quick Tips Thread",
    topic: "5 actionable tips for beginners with examples",
    platform: "twitter",
    description: "Share bite-sized advice in thread format",
    category: "Educational",
    example: "5 tips to boost productivity:\n1. Start with the hardest task\n2. Use time blocking\n...",
  },
  {
    id: "howto-linkedin",
    name: "How-To Guide",
    topic: "Step-by-step guide to solving a common problem in your industry",
    platform: "linkedin",
    description: "Establish thought leadership with detailed guides",
    category: "Educational",
    example: "How to optimize your workflow in 5 steps...",
  },
  {
    id: "tutorial-instagram",
    name: "Quick Tutorial",
    topic: "Visual tutorial with numbered steps and clear outcome",
    platform: "instagram",
    description: "Teach something visual with clear steps",
    category: "Educational",
    example: "Tutorial: Create stunning designs in 3 simple steps ✨",
  },

  // Engagement & Community
  {
    id: "poll-twitter",
    name: "Engaging Poll",
    topic: "Fun poll about preferences in your niche with 4 interesting options",
    platform: "twitter",
    description: "Boost engagement with interactive polls",
    category: "Engagement",
    example: "What's your go-to productivity tool? 📊",
  },
  {
    id: "question-linkedin",
    name: "Discussion Starter",
    topic: "Thought-provoking question about current industry trends",
    platform: "linkedin",
    description: "Start meaningful conversations",
    category: "Engagement",
    example: "What's the biggest challenge in remote work? Let's discuss.",
  },
  {
    id: "caption-instagram",
    name: "Story Caption",
    topic: "Behind-the-scenes story with emotional connection and call-to-action",
    platform: "instagram",
    description: "Share authentic moments with your audience",
    category: "Engagement",
    example: "Behind the scenes of our creative process 🎨 What are you working on?",
  },

  // Inspirational & Motivational
  {
    id: "quote-instagram",
    name: "Motivational Quote",
    topic: "Inspirational quote about perseverance with personal commentary",
    platform: "instagram",
    description: "Inspire your audience with powerful words",
    category: "Inspirational",
    example: "\"Success is not final, failure is not fatal...\" 💪",
  },
  {
    id: "success-linkedin",
    name: "Success Story",
    topic: "Client success story with specific results and lessons learned",
    platform: "linkedin",
    description: "Showcase achievements and build credibility",
    category: "Inspirational",
    example: "How we helped Client X achieve 200% growth in 6 months...",
  },
  {
    id: "motivation-twitter",
    name: "Monday Motivation",
    topic: "Motivational message for starting the week with energy and purpose",
    platform: "twitter",
    description: "Energize your audience for the week ahead",
    category: "Inspirational",
    example: "New week, new opportunities! What's your goal for this week? 🎯",
  },

  // News & Updates
  {
    id: "milestone-linkedin",
    name: "Company Milestone",
    topic: "Celebrating company achievement with gratitude to team and customers",
    platform: "linkedin",
    description: "Share important company news professionally",
    category: "Updates",
    example: "Proud to announce we've reached 10,000 customers! 🎉",
  },
  {
    id: "update-twitter",
    name: "Product Update",
    topic: "New feature announcement with benefits and screenshot",
    platform: "twitter",
    description: "Keep users informed about improvements",
    category: "Updates",
    example: "New feature alert! 🚀 Now you can...",
  },
  {
    id: "team-instagram",
    name: "Team Spotlight",
    topic: "Introduce team member with fun facts and role description",
    platform: "instagram",
    description: "Humanize your brand with team stories",
    category: "Updates",
    example: "Meet Sarah, our creative director! ✨ Fun fact: She's a coffee enthusiast.",
  },

  // Seasonal & Trending
  {
    id: "holiday-instagram",
    name: "Holiday Greetings",
    topic: "Warm holiday wishes with special offer and festive emojis",
    platform: "instagram",
    description: "Connect during special occasions",
    category: "Seasonal",
    example: "Happy holidays from our team! 🎄 Special gift inside...",
  },
  {
    id: "trend-twitter",
    name: "Trending Topic",
    topic: "Commentary on trending topic in your industry with unique perspective",
    platform: "twitter",
    description: "Join relevant conversations",
    category: "Seasonal",
    example: "Thoughts on today's industry news: Here's what it means for you...",
  },
  {
    id: "recap-linkedin",
    name: "Year in Review",
    topic: "Annual recap with key achievements, statistics, and future goals",
    platform: "linkedin",
    description: "Reflect on accomplishments",
    category: "Seasonal",
    example: "2024 Year in Review: Our journey, achievements, and what's next...",
  },
];

export const categories = [
  { value: "all", label: "All Templates" },
  { value: "Marketing", label: "Marketing & Promotion" },
  { value: "Educational", label: "Educational" },
  { value: "Engagement", label: "Engagement & Community" },
  { value: "Inspirational", label: "Inspirational" },
  { value: "Updates", label: "News & Updates" },
  { value: "Seasonal", label: "Seasonal & Trending" },
];
