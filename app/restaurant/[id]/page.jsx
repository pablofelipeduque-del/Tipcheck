"use client";
import { useParams, useRouter } from "next/navigation";

const allPlaces = [
  { id: "the-rustic-table", name: "The Rustic Table", category: "Restaurants", rating: 4.8, tipScore: 8, address: "123 Main St, Pensacola FL 32501", reviews: 342, phone: "(850) 555-0101", hours: "Mon-Sun 11am - 10pm", tip: "Fair tipping culture. Staff never pressures customers.", priceRange: "$$", about: "A cozy neighborhood restaurant serving farm-to-table American cuisine. Known for their warm hospitality and relaxed atmosphere.", tipBreakdown: { pressure: 8, transparency: 9, fairness: 8, takeoutExperience: 7 }, recentReviews: [{ author: "Maria G.", text: "Never felt pressured to tip. Loved the experience!", rating: 5 }, { author: "James T.", text: "Great food, staff was super friendly and no awkward tip screen.", rating: 5 }, { author: "Sandra K.", text: "Comfortable tipping experience. Will come back!", rating: 4 }] },
  { id: "morning-bloom-bakery", name: "Morning Bloom Bakery", category: "Bakeries", rating: 4.9, tipScore: 9, address: "456 Oak Ave, Pensacola FL 32502", reviews: 215, phone: "(850) 555-0202", hours: "Mon-Sat 7am - 3pm", tip: "Tip jar only. Zero pressure. Great vibes.", priceRange: "$", about: "A charming local bakery known for its fresh pastries, artisan breads, and amazing coffee.", tipBreakdown: { pressure: 10, transparency: 9, fairness: 9, takeoutExperience: 9 }, recentReviews: [{ author: "Carlos M.", text: "Best bakery in town and no guilt when you just grab a coffee.", rating: 5 }, { author: "Linda H.", text: "Simple tip jar, totally voluntary. Love this place.", rating: 5 }, { author: "Tom B.", text: "Refreshing to just pay and go without the awkward tablet flip.", rating: 4 }] },
  { id: "urban-grind-coffee", name: "Urban Grind Coffee", category: "Coffee", rating: 4.5, tipScore: 3, address: "789 Pine Rd, Pensacola FL 32501", reviews: 198, phone: "(850) 555-0303", hours: "Mon-Fri 6am - 6pm", tip: "Tablet flipped aggressively. Feels uncomfortable for quick orders.", priceRange: "$", about: "Trendy coffee shop with great espresso drinks. However, the tipping experience has drawn consistent complaints.", tipBreakdown: { pressure: 2, transparency: 4, fairness: 3, takeoutExperience: 2 }, recentReviews: [{ author: "Rachel P.", text: "Love the coffee but the tip screen is turned to face you before you even see the total.", rating: 3 }, { author: "Mike S.", text: "Felt really pressured even just picking up a drip coffee.", rating: 2 }, { author: "Anna L.", text: "Good drinks, but the tipping situation is uncomfortable.", rating: 3 }] },
  { id: "bella-napoli", name: "Bella Napoli", category: "Pizza", rating: 4.7, tipScore: 7, address: "321 Elm St, Pensacola FL 32503", reviews: 410, phone: "(850) 555-0404", hours: "Mon-Sun 12pm - 11pm", tip: "Reasonable. No pressure on takeout orders.", priceRange: "$$", about: "Authentic Neapolitan pizza made in a wood-fired oven. Family owned and operated since 2005.", tipBreakdown: { pressure: 7, transparency: 7, fairness: 7, takeoutExperience: 8 }, recentReviews: [{ author: "David R.", text: "Pickup orders have a tip option but nobody watches or pressures you.", rating: 5 }, { author: "Elena V.", text: "Fair tipping, great pizza. What more do you need?", rating: 5 }, { author: "Chris N.", text: "Decent experience overall, staff is chill about tips.", rating: 4 }] },
  { id: "sakura-sushi-bar", name: "Sakura Sushi Bar", category: "Sushi", rating: 4.6, tipScore: 6, address: "555 Beach Blvd, Pensacola FL 32502", reviews: 287, phone: "(850) 555-0505", hours: "Tue-Sun 12pm - 10pm", tip: "Standard tipping expected. No pressure though.", priceRange: "$$$", about: "Fresh and creative sushi in a relaxed beachside setting.", tipBreakdown: { pressure: 6, transparency: 6, fairness: 6, takeoutExperience: 5 }, recentReviews: [{ author: "Amy K.", text: "Great sushi, tipping felt normal and not forced.", rating: 4 }, { author: "Brian L.", text: "No issues with tipping here. Staff is professional.", rating: 4 }, { author: "Jess M.", text: "Solid experience all around.", rating: 5 }] },
  { id: "golden-crust-bakery", name: "Golden Crust Bakery", category: "Bakeries", rating: 4.7, tipScore: 8, address: "900 Garden St, Pensacola FL 32501", reviews: 163, phone: "(850) 555-0606", hours: "Mon-Sat 7am - 4pm", tip: "Friendly staff. Tip box on counter, totally optional.", priceRange: "$", about: "Beloved neighborhood bakery with homemade breads and pastries baked fresh every morning.", tipBreakdown: { pressure: 9, transparency: 8, fairness: 8, takeoutExperience: 9 }, recentReviews: [{ author: "Paul T.", text: "Love that tipping is completely your choice here.", rating: 5 }, { author: "Diana S.", text: "Old school tip jar only. Refreshing!", rating: 5 }, { author: "Mark R.", text: "Great pastries, zero tip pressure.", rating: 4 }] },
];

function MiniMeter({ score, label }) {
  const color = score >= 7 ? "bg-emerald-500" : score >= 4 ? "bg-amber-400" : "bg-red-500";
  const textColor = score >= 7 ? "text-emerald-400" : score >= 4 ? "text-amber-400" : "text-red-400";
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className={textColor}>{score}/10</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${score * 10}%` }} />
      </div>
    </div>
  );
}

export default function RestaurantPage() {
  const { id } = useParams();
  const router = useRouter();
  const place = allPlaces.find((p) => p.id === id);

  if (!place) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">🍽️</p>
        <p className="text-xl font-bold">Place not found</p>
        <button onClick={() => router.push("/")} className="mt-4 text-amber-400 hover:underline">← Back to search</button>
      </div>
    </main>
  );

  const overallColor = place.tipScore >= 7 ? "text-emerald-400" : place.tipScore >= 4 ? "text-amber-400" : "text-red-400";
  const overallLabel = place.tipScore >= 7 ? "Friendly" : place.tipScore >= 4 ? "Moderate" : "Pressured";

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💸</span>
          <span className="text-xl font-bold tracking-tight">Tip<span className="text-amber-400">Check</span></span>
        </div>
        <button onClick={() => router.push("/")} className="text-gray-400 hover:text-white text-sm transition">← Back to Search</button>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-2">
          <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full">{place.category}</span>
        </div>
        <div className="flex justify-between items-start flex-wrap gap-4 mb-2">
          <h1 className="text-3xl font-extrabold">{place.name}</h1>
          <span className="text-amber-400 text-xl font-bold">⭐ {place.rating}</span>
        </div>
        <p className="text-gray-400 mb-1">📍 {place.address}</p>
        <p className="text-gray-400 mb-1">📞 {place.phone}</p>
        <p className="text-gray-400 mb-6">🕐 {place.hours} · {place.priceRange}</p>
        <p className="text-gray-300 mb-8">{place.about}</p>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Tipping Culture Score</h2>
            <span className={`text-2xl font-extrabold ${overallColor}`}>{place.tipScore}/10 · {overallLabel}</span>
          </div>
          <MiniMeter score={place.tipBreakdown.pressure} label="No Pressure" />
          <MiniMeter score={place.tipBreakdown.transparency} label="Transparency" />
          <MiniMeter score={place.tipBreakdown.fairness} label="Fairness" />
          <MiniMeter score={place.tipBreakdown.takeoutExperience} label="Takeout Experience" />
          <p className="text-gray-400 text-sm mt-4 italic">"{place.tip}"</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Recent Reviews</h2>
          {place.recentReviews.map((review, i) => (
            <div key={i} className="mb-4 pb-4 border-b border-gray-800 last:border-0 last:mb-0 last:pb-0">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold">{review.author}</span>
                <span className="text-amber-400">{"⭐".repeat(review.rating)}</span>
              </div>
              <p className="text-gray-400 text-sm">"{review.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}