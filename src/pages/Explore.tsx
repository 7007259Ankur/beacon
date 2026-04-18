import { Input } from "@/components/ui/input";
import { Search as SearchIcon, TrendingUp, Users, Flame } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const MOCK_CATEGORIES = ["Architecture", "Digital Art", "Nature", "Tech", "Street Photography", "Design", "Minimalism"];

const MOCK_EXPLORE_POSTS = Array.from({ length: 12 }).map((_, i) => ({
  id: `exp-${i}`,
  image: `https://picsum.photos/seed/exp${i}/600/600`,
  likes: Math.floor(Math.random() * 10000)
}));

export function ExplorePage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-serif">Explore</h1>
        <div className="relative w-full max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search communities, people..." 
            className="pl-10 rounded-full h-11 bg-white border-slate-200 focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-8 pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2>Trending Topics</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {MOCK_CATEGORIES.map(cat => (
                <Badge key={cat} variant="secondary" className="px-4 py-1.5 rounded-full bg-white border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-lg">
              <Flame className="w-5 h-5 text-orange-500" />
              <h2>Popular right now</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
              {MOCK_EXPLORE_POSTS.map(post => (
                <div key={post.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-200 cursor-pointer">
                  <img src={post.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-5 h-5 fill-current" />
                      {post.likes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
