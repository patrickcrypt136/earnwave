import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: "#0d0d0d", color: "#f5f5f5" }}>
      {/* Nav */}
      <nav className="px-6 py-4 flex justify-between items-center sticky top-0 z-10"
        style={{ background: "rgba(13,13,13,0.9)", borderBottom: "1px solid #2a2a2a", backdropFilter: "blur(10px)" }}>
        <h1 className="text-xl font-black"
          style={{ background: "linear-gradient(135deg, #f97316, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          EarnWave 🌊
        </h1>
        <Link href="/login"
          className="px-5 py-2 text-sm font-bold rounded-lg text-white transition-all"
          style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}>
          Login
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{ background: "#1a1200", color: "#eab308", border: "1px solid #3a2a00" }}>
            🌊 Earn Real Money Online
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            Share. Refer. <br />
            <span style={{ background: "linear-gradient(135deg, #f97316, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Get Paid.
            </span>
          </h2>
          <p className="text-lg mb-10" style={{ color: "#888" }}>
            EarnWave pays you real money for sharing posts on social media and referring friends. No skills needed — just post and earn.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="/login"
              className="px-8 py-4 text-sm font-bold rounded-lg text-white transition-all"
              style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}>
              Get Started →
            </Link>
            <a href="#how-it-works"
              className="px-8 py-4 text-sm font-bold rounded-lg transition-all"
              style={{ background: "#1a1a1a", color: "#888", border: "1px solid #2a2a2a" }}>
              How it Works
            </a>
          </div>
        </div>
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600"
            alt="Person earning money on phone"
            className="w-full rounded-3xl object-cover relative z-10"
            style={{ aspectRatio: "4/3" }}
          />
          {/* Floating card */}
          <div className="absolute bottom-4 left-4 rounded-2xl px-4 py-3 z-20"
            style={{ background: "rgba(13,13,13,0.95)", border: "1px solid #2a2a2a", backdropFilter: "blur(10px)" }}>
            <p className="text-xs font-bold" style={{ color: "#eab308" }}>+$1.00 earned</p>
            <p className="text-xs" style={{ color: "#666" }}>TikTok post approved ✓</p>
          </div>
          {/* Floating card 2 */}
          <div className="absolute top-4 right-4 rounded-2xl px-4 py-3 z-20"
            style={{ background: "rgba(13,13,13,0.95)", border: "1px solid #2a2a2a", backdropFilter: "blur(10px)" }}>
            <p className="text-xs font-bold" style={{ color: "#f97316" }}>$3.00 bonus</p>
            <p className="text-xs" style={{ color: "#666" }}>Welcome reward 🎁</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "$3", label: "Welcome Bonus" },
            { value: "$1", label: "Per Referral" },
            { value: "$1", label: "Per TikTok Post" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-5 rounded-2xl"
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
              <p className="text-3xl font-black mb-1"
                style={{ background: "linear-gradient(135deg, #f97316, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {stat.value}
              </p>
              <p className="text-xs" style={{ color: "#666" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-16"
        style={{ borderTop: "1px solid #2a2a2a" }}>
        <div className="text-center mb-12">
          <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#f97316" }}>Simple Process</p>
          <h3 className="text-3xl font-black">How EarnWave Works</h3>
        </div>

        {/* Step 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600"
            alt="Get invited"
            className="w-full rounded-3xl object-cover"
            style={{ aspectRatio: "4/3" }}
          />
          <div>
            <p className="text-5xl font-black mb-4"
              style={{ background: "linear-gradient(135deg, #f97316, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              01
            </p>
            <h4 className="text-2xl font-black mb-4">Get Invited</h4>
            <p className="text-lg leading-relaxed" style={{ color: "#888" }}>
              Get a referral link from someone already on EarnWave and a coupon code. Use both to create your account and get your $3 welcome bonus instantly.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div className="md:order-2">
            <img
              src="https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600"
              alt="Post on social media"
              className="w-full rounded-3xl object-cover"
              style={{ aspectRatio: "4/3" }}
            />
          </div>
          <div className="md:order-1">
            <p className="text-5xl font-black mb-4"
              style={{ background: "linear-gradient(135deg, #f97316, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              02
            </p>
            <h4 className="text-2xl font-black mb-4">Complete Daily Tasks</h4>
            <p className="text-lg leading-relaxed mb-6" style={{ color: "#888" }}>
              Every day you get tasks — post EarnWave content on WhatsApp, TikTok, Twitter and more. Submit your post link as proof and earn money when approved.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { platform: "📱 WhatsApp", amount: "$0.50" },
                { platform: "🎵 TikTok", amount: "$1.00" },
                { platform: "🐦 Twitter/X", amount: "$0.75" },
                { platform: "📘 Facebook", amount: "$0.50" },
              ].map((item) => (
                <div key={item.platform} className="p-3 rounded-xl flex justify-between items-center"
                  style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
                  <span className="text-xs">{item.platform}</span>
                  <span className="text-xs font-black" style={{ color: "#eab308" }}>{item.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <img
            src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600"
            alt="Get paid"
            className="w-full rounded-3xl object-cover"
            style={{ aspectRatio: "4/3" }}
          />
          <div>
            <p className="text-5xl font-black mb-4"
              style={{ background: "linear-gradient(135deg, #f97316, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              03
            </p>
            <h4 className="text-2xl font-black mb-4">Get Paid</h4>
            <p className="text-lg leading-relaxed" style={{ color: "#888" }}>
              Submit your bank details and get paid directly to your account. No delays, no stress. Real money, real fast.
            </p>
          </div>
        </div>
      </section>

      {/* Referral section */}
      <section className="max-w-6xl mx-auto px-6 py-16"
        style={{ borderTop: "1px solid #2a2a2a" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#f97316" }}>Referral Program</p>
            <h3 className="text-3xl font-black mb-6">Earn More by Referring Friends</h3>
            <p className="text-lg leading-relaxed mb-6" style={{ color: "#888" }}>
              Every person who joins EarnWave using your referral link earns you $1 instantly. The more you refer, the more you earn — with no limit.
            </p>
            <div className="p-5 rounded-2xl"
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
              <p className="text-sm font-bold mb-3">Your Referral Link</p>
              <div className="rounded-lg px-4 py-3 text-xs font-mono"
                style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", color: "#f97316" }}>
                earnwave.vercel.app/register?ref=YOURCODE
              </div>
              <p className="text-xs mt-3" style={{ color: "#666" }}>
                Share this link anywhere — WhatsApp, TikTok, Twitter, Instagram
              </p>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600"
            alt="Friends referring each other"
            className="w-full rounded-3xl object-cover"
            style={{ aspectRatio: "4/3" }}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center"
        style={{ background: "linear-gradient(135deg, #1a0a00, #0d0d0d)", borderTop: "1px solid #2a2a2a" }}>
        <h3 className="text-4xl font-black mb-4">Ready to Start Earning?</h3>
        <p className="mb-8 text-lg" style={{ color: "#888" }}>
          Get a referral link from a friend and join EarnWave today.
        </p>
        <Link href="/login"
          className="inline-block px-10 py-4 text-sm font-bold rounded-lg text-white transition-all"
          style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}>
          Join EarnWave →
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-xs"
        style={{ borderTop: "1px solid #2a2a2a", color: "#444" }}>
        © 2024 EarnWave. All Rights Reserved.
      </footer>
    </main>
  );
}