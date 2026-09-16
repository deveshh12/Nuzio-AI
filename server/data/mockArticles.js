const ago = (hours) => new Date(Date.now() - hours * 36e5);

export const mockArticles = [
  ['Anthropic ships Claude 4.5 with 2M-token memory and native tools.', 'The new model pushes long-context reasoning forward, with a focus on secure enterprise workflows.', 'The Verge', 'AI & Tech'],
  ['India’s AI startups are finding a new path to global customers.', 'Founders are pairing local insight with globally relevant infrastructure products.', 'YourStory', 'Startup'],
  ['Markets take a breather as investors weigh fresh inflation data.', 'Technology stocks held steady while investors watched policy signals closely.', 'Mint', 'Markets'],
  ['Scientists map a hidden ecosystem beneath Antarctic ice.', 'The discovery offers rare clues about life in extreme environments and climate history.', 'Nature', 'Science'],
  ['OpenAI unveils tools for building more reliable agents.', 'New evaluation and observability features aim to make agentic systems easier to deploy.', 'TechCrunch', 'AI & Tech'],
  ['Rupee moves narrowly ahead of the central bank’s policy update.', 'Traders expect a measured tone as growth and inflation signals diverge.', 'Economic Times', 'Markets'],
  ['A new telescope image reveals a nursery of young stars.', 'The striking view helps astronomers study how stellar systems first take shape.', 'NASA', 'Science'],
  ['Solo founders are using AI to launch faster than ever.', 'Automation is shrinking the gap between a sharp idea and a first product.', 'Fast Company', 'Startup'],
  ['Chipmakers race to make AI inference cheaper.', 'Efficiency, not just raw performance, is becoming the defining competitive edge.', 'Wired', 'AI & Tech'],
  ['Climate-tech investment shifts toward adaptation.', 'Investors see resilience infrastructure as a durable long-term opportunity.', 'Bloomberg', 'Markets'],
  ['University labs turn breakthrough materials into new batteries.', 'The chemistry could help create safer, longer-lasting energy storage.', 'Science Daily', 'Science'],
  ['India’s developer ecosystem builds for an AI-first future.', 'Open-source communities are helping teams learn and ship at an unusual pace.', 'The Hindu', 'AI & Tech'],
].map(([headline, summary, source, category], index) => ({ _id:`offline-${index+1}`, headline, summary, source, category, url:({
  'The Verge':'https://www.theverge.com/ai-artificial-intelligence', 'YourStory':'https://yourstory.com/', 'Mint':'https://www.livemint.com/market', 'Nature':'https://www.nature.com/news', 'TechCrunch':'https://techcrunch.com/category/artificial-intelligence/', 'Economic Times':'https://economictimes.indiatimes.com/markets', 'NASA':'https://science.nasa.gov/', 'Fast Company':'https://www.fastcompany.com/technology', 'Wired':'https://www.wired.com/tag/artificial-intelligence/', 'Bloomberg':'https://www.bloomberg.com/markets', 'Science Daily':'https://www.sciencedaily.com/news/matter_energy/', 'The Hindu':'https://www.thehindu.com/sci-tech/technology/'
})[source], publishedAt:ago(index), isOffline:true }));
