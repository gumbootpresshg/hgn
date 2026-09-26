import HomeUpcomingEvents from "@/components/HomeUpcomingEvents"
import HomePoll from "@/components/HomePoll"
import AdSlot from "@/components/AdSlot"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { smartExcerpt } from "@/lib/text"
import { isColumn, isLocalNews, isOpinion, isSports, sortArticlesNewest } from "@/lib/article-routing"
import { getArticleImage } from "@/lib/article-images"
import { formatFreshness, formatPublishingDate, getPublishingSettings, type PublishingSettings } from "@/lib/publishing-settings"

export const dynamic = "force-dynamic"
export const revalidate = 0

type FrontPageSettings = {
  lead_article_id?: string | null
  photo_url?: string | null
  photo_caption?: string | null
  photo_credit?: string | null
  photo_alt?: string | null
  related_article_id?: string | null
  display_starts_at?: string | null
  display_expires_at?: string | null
  is_active?: boolean | null
  video_is_active?: boolean | null
  video_url?: string | null
  video_title?: string | null
  video_description?: string | null
  video_starts_at?: string | null
  video_expires_at?: string | null
}

type Article = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  body?: string | null
  author_name?: string | null
  category?: string | null
  section?: string | null
  subcategory?: string | null
  column_name?: string | null
  type?: string | null
  vertical?: string | null
  image_url?: string | null
  image_alt?: string | null
  image_caption?: string | null
  image_credit?: string | null
  front_page_photo?: boolean | null
  published_at?: string | null
  featured?: boolean | null
  front_page_main?: boolean | null
}

function plainExcerpt(article: Article, length = 190) {
  return smartExcerpt(article.excerpt || article.body, length)
}

function articleDate(article: Article, settings: PublishingSettings) {
  return formatPublishingDate(article.published_at, settings)
}

function articleFreshness(article: Article, settings: PublishingSettings) {
  return formatFreshness(article.published_at, settings)
}

function youtubeEmbedUrl(value?: string | null) {
  if (!value) return null
  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, "").toLowerCase()
    let id = ""
    if (host === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] || ""
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") id = url.searchParams.get("v") || ""
      else {
        const parts = url.pathname.split("/").filter(Boolean)
        if (["embed", "live", "shorts"].includes(parts[0] || "")) id = parts[1] || ""
      }
    }
    return /^[a-zA-Z0-9_-]{6,32}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` : null
  } catch { return null }
}

function StoryMeta({ article, settings }: { article: Article; settings: PublishingSettings }) {
  const date = articleDate(article, settings)
  return <p className="mt-3 text-[11px] uppercase tracking-[0.08em] text-stone-500">By {article.author_name || "Haida Gwaii News"}{date ? ` · ${date}` : ""}</p>
}

export default async function Home() {
  const publishingSettings = await getPublishingSettings()
  const [{ data: frontPageSettings }, { data: mainStories }, { data: frontPagePhotos }, { data: featuredStories }, { data: latestStories }] = await Promise.all([
    supabase.from("front_page_settings").select("*").eq("id", "current").maybeSingle(),
    supabase.from("articles").select("*").eq("status", "published").eq("front_page_main", true).order("published_at", { ascending: false }).limit(1),
    supabase.from("articles").select("*").eq("status", "published").eq("front_page_photo", true).not("image_url", "is", null).order("published_at", { ascending: false }).limit(1),
    supabase.from("articles").select("*").eq("status", "published").eq("featured", true).order("published_at", { ascending: false }).limit(8),
    supabase.from("articles").select("*").eq("status", "published").order("published_at", { ascending: false }).limit(80),
  ])

  const settings = (frontPageSettings || null) as FrontPageSettings | null
  let managedLead = settings?.lead_article_id ? (latestStories || []).find((article: Article) => article.id === settings.lead_article_id) as Article | undefined : undefined
  if (settings?.lead_article_id && !managedLead) {
    const { data } = await supabase.from("articles").select("*").eq("id", settings.lead_article_id).eq("status", "published").maybeSingle()
    managedLead = (data || undefined) as Article | undefined
  }
  const main = (managedLead || mainStories?.[0] || latestStories?.[0]) as Article | undefined
  const now = Date.now()
  const photoInWindow = Boolean(
    settings?.is_active !== false &&
    (!settings?.display_starts_at || new Date(settings.display_starts_at).getTime() <= now) &&
    (!settings?.display_expires_at || new Date(settings.display_expires_at).getTime() >= now)
  )
  const videoInWindow = Boolean(
    settings?.video_is_active === true &&
    (!settings?.video_starts_at || new Date(settings.video_starts_at).getTime() <= now) &&
    (!settings?.video_expires_at || new Date(settings.video_expires_at).getTime() >= now)
  )
  const frontPageVideo = videoInWindow ? youtubeEmbedUrl(settings?.video_url) : null
  const frontPageVideoTitle = settings?.video_title || "Watch HGN Live"
  const frontPageVideoDescription = settings?.video_description || ""
  let managedRelatedArticle = settings?.related_article_id ? (latestStories || []).find((article: Article) => article.id === settings.related_article_id) as Article | undefined : undefined
  if (settings?.related_article_id && !managedRelatedArticle) {
    const { data } = await supabase.from("articles").select("*").eq("id", settings.related_article_id).eq("status", "published").maybeSingle()
    managedRelatedArticle = (data || undefined) as Article | undefined
  }
  const legacyFrontPagePhoto = (frontPagePhotos?.[0] || [main, ...(featuredStories || []), ...(latestStories || [])].find((article: Article | undefined) => article && getArticleImage(article))) as Article | undefined
  const frontPagePhoto = photoInWindow && settings?.photo_url ? managedRelatedArticle : legacyFrontPagePhoto
  const frontPageImage = photoInWindow && settings?.photo_url ? settings.photo_url : (legacyFrontPagePhoto ? getArticleImage(legacyFrontPagePhoto) : null)
  const frontPageCaption = photoInWindow && settings?.photo_url ? settings.photo_caption : legacyFrontPagePhoto?.image_caption
  const frontPageCredit = photoInWindow && settings?.photo_url ? settings.photo_credit : legacyFrontPagePhoto?.image_credit
  const frontPageAlt = photoInWindow && settings?.photo_url ? settings.photo_alt : legacyFrontPagePhoto?.image_alt
  const frontPageHref = managedRelatedArticle ? `/articles/${managedRelatedArticle.slug}` : null
  const chronological = sortArticlesNewest((latestStories || []) as Article[])
  const featured = sortArticlesNewest(((featuredStories || []) as Article[]).filter((a) => a.slug !== main?.slug))
  const secondary = featured.slice(0, 2)
  const opinion = chronological.find((article) => isOpinion(article) && article.slug !== main?.slug)

  // Desktop composition is de-duplicated by reserving each visible story as it is assigned.
  // Manual/prominent slots win first; Latest Headlines then takes the newest unused stories;
  // lower news sections are built only from what remains.
  const desktopUsed = new Set<string>()
  if (main?.slug) desktopUsed.add(main.slug)
  secondary.forEach((article) => desktopUsed.add(article.slug))
  if (opinion?.slug) desktopUsed.add(opinion.slug)

  const briefs = chronological.filter((article) => !desktopUsed.has(article.slug)).slice(0, 5)
  briefs.forEach((article) => desktopUsed.add(article.slug))

  const photoRailStories = secondary

  // Desktop should read like an edited newspaper, not a long local-news feed. Reserve
  // fresh Sports and Columns stories before filling the next local-news blocks so variety
  // appears immediately after the lead package, matching the stronger mobile rhythm.
  const desktopSports = chronological.filter((article) => isSports(article) && !desktopUsed.has(article.slug)).slice(0, 3)
  desktopSports.forEach((article) => desktopUsed.add(article.slug))
  const desktopColumns = chronological.filter((article) => isColumn(article) && !desktopUsed.has(article.slug)).slice(0, 3)
  desktopColumns.forEach((article) => desktopUsed.add(article.slug))

  const localRemaining = chronological.filter((article) => isLocalNews(article) && !desktopUsed.has(article.slug))
  const secondaryStripStories = localRemaining.slice(0, 2)
  secondaryStripStories.forEach((article) => desktopUsed.add(article.slug))
  const moreLocalStories = chronological
    .filter((article) => isLocalNews(article) && !desktopUsed.has(article.slug))
    .slice(0, 6)

  // Mobile has its own composition because the desktop feature rail is hidden there. Reserve
  // Opinion before building Latest so a story never appears in both sections on the same phone page.
  const mobileUsed = new Set<string>()
  if (main?.slug) mobileUsed.add(main.slug)
  if (opinion?.slug) mobileUsed.add(opinion.slug)

  const mobileLatest = chronological.filter((article) => !mobileUsed.has(article.slug)).slice(0, 4)
  mobileLatest.forEach((article) => mobileUsed.add(article.slug))
  const mobileNews = chronological.filter((article) => isLocalNews(article) && !mobileUsed.has(article.slug)).slice(0, 4)
  mobileNews.forEach((article) => mobileUsed.add(article.slug))
  const mobileSports = chronological.filter((article) => isSports(article) && !mobileUsed.has(article.slug)).slice(0, 3)
  mobileSports.forEach((article) => mobileUsed.add(article.slug))
  const mobileColumns = chronological.filter((article) => isColumn(article) && !mobileUsed.has(article.slug)).slice(0, 3)
  mobileColumns.forEach((article) => mobileUsed.add(article.slug))
  const mobileMoreNews = chronological.filter((article) => isLocalNews(article) && !mobileUsed.has(article.slug)).slice(0, 6)

  return (
    <main className="newspaper-shell py-3 md:py-7">
      <section className="border-b border-stone-900 pb-3">
        <div className="flex items-center gap-3 whitespace-nowrap text-xs">
          <span className="shrink-0 font-bold uppercase tracking-[0.16em] text-hgnRed">Latest</span>
          <div className="mobile-headline-strip flex min-w-0 flex-1 gap-5 overflow-x-auto text-stone-700">
            {briefs.slice(0, 3).map((article) => <Link key={article.id} href={`/articles/${article.slug}`} className="shrink-0 max-w-[18rem] overflow-hidden text-ellipsis hover:text-hgnRed md:max-w-[24rem]">{article.title}</Link>)}
          </div>
          <Link href="/articles" className="ml-auto shrink-0 font-bold">All stories →</Link>
        </div>
      </section>

      <section className="py-4 lg:hidden">
        {main ? (
          <article className="border-b border-stone-400 pb-5">
            <p className="newspaper-kicker">Top Story</p>
            <Link href={`/articles/${main.slug}`} className="group block">
              <h1 className="mt-2 max-w-[16ch] font-serif text-[2rem] font-bold leading-[1.01] tracking-[-0.035em] group-hover:text-hgnRed">{main.title}</h1>
              <p className="mt-3 line-clamp-4 text-[15px] leading-6 text-stone-600">{plainExcerpt(main, 210)}</p>
              <StoryMeta article={main} settings={publishingSettings} />
              <span className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.12em]">Read full story →</span>
            </Link>
            {frontPageVideo ? (
              <section className="mt-5 border-y border-stone-400 py-4">
                <p className="newspaper-kicker text-hgnRed">Live now</p>
                <h2 className="mt-1 font-serif text-2xl font-bold leading-tight">{frontPageVideoTitle}</h2>
                <div className="mt-3 aspect-video overflow-hidden bg-stone-900 shadow-sm">
                  <iframe src={frontPageVideo} title={frontPageVideoTitle} className="h-full w-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                </div>
                {frontPageVideoDescription ? <p className="mt-3 text-sm leading-6 text-stone-600">{frontPageVideoDescription}</p> : null}
              </section>
            ) : frontPageImage ? (
              <div className="mt-5">
                {frontPageHref ? <Link href={frontPageHref}><img src={frontPageImage} alt={frontPageAlt || main.title} className="aspect-[16/9] w-full object-cover" /></Link> : <img src={frontPageImage} alt={frontPageAlt || main.title} className="aspect-[16/9] w-full object-cover" />}
                {(frontPageCaption || frontPageCredit) ? <p className="mt-2 text-[11px] leading-4 text-stone-500">{frontPageCaption || ""}{frontPageCredit ? ` · Photo: ${frontPageCredit}` : ""}</p> : null}
              </div>
            ) : null}
          </article>
        ) : null}

        <section className="border-b border-stone-400 py-5">
          <div className="newspaper-section-heading"><h2>Latest Headlines</h2><Link href="/articles">View all →</Link></div>
          <div>
            {mobileLatest.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`} className="grid grid-cols-[1fr_auto] gap-3 border-b border-stone-200 py-3 last:border-b-0">
                <span className="font-serif text-lg font-bold leading-tight">{article.title}</span>
                <span className="whitespace-nowrap pt-1 text-[10px] uppercase text-stone-500">{articleFreshness(article, publishingSettings)}</span>
              </Link>
            ))}
          </div>
        </section>

        {opinion ? (
          <section className="border-b border-stone-400 py-5">
            <div className="newspaper-section-heading"><h2>Opinion</h2><Link href="/opinion">All opinion →</Link></div>
            <Link href={`/articles/${opinion.slug}`} className="group block">
              <p className="newspaper-kicker text-hgnRed">{opinion.subcategory || opinion.category || "Opinion"}</p>
              <h2 className="mt-2 font-serif text-[1.7rem] font-bold leading-[1.04] group-hover:text-hgnRed">{opinion.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">{plainExcerpt(opinion, 155)}</p>
              <StoryMeta article={opinion} settings={publishingSettings} />
            </Link>
          </section>
        ) : null}

        {mobileNews.length ? (
          <section className="border-b border-stone-400 py-5">
            <div className="newspaper-section-heading"><h2>More News</h2><Link href="/news">All news →</Link></div>
            {mobileNews.map((article) => <Link key={article.id} href={`/articles/${article.slug}`} className="block border-b border-stone-200 py-3 last:border-b-0"><p className="newspaper-kicker">{article.subcategory || article.category || "News"}</p><h3 className="mt-1 font-serif text-xl font-bold leading-tight">{article.title}</h3><StoryMeta article={article} settings={publishingSettings} /></Link>)}
          </section>
        ) : null}

        {mobileSports.length ? (
          <section className="border-b border-stone-400 py-5">
            <div className="newspaper-section-heading"><h2>Sports</h2><Link href="/sports">All sports →</Link></div>
            {mobileSports.map((article) => <Link key={article.id} href={`/articles/${article.slug}`} className="block border-b border-stone-200 py-3 last:border-b-0"><h3 className="font-serif text-xl font-bold leading-tight">{article.title}</h3><StoryMeta article={article} settings={publishingSettings} /></Link>)}
          </section>
        ) : null}

        {mobileColumns.length ? (
          <section className="border-b border-stone-400 py-5">
            <div className="newspaper-section-heading"><h2>Columns</h2><Link href="/columns">All columns →</Link></div>
            {mobileColumns.map((article) => <Link key={article.id} href={`/articles/${article.slug}`} className="block border-b border-stone-200 py-3 last:border-b-0"><p className="newspaper-kicker">{article.column_name || "Column"}</p><h3 className="font-serif text-xl font-bold leading-tight">{article.title}</h3><StoryMeta article={article} settings={publishingSettings} /></Link>)}
          </section>
        ) : null}

        <HomeUpcomingEvents hideWhenEmpty />
        <HomePoll />

        {mobileMoreNews.length ? (
          <section className="border-b border-stone-400 py-5">
            <div className="newspaper-section-heading"><h2>More Local News</h2><Link href="/articles">All stories →</Link></div>
            {mobileMoreNews.map((article) => <Link key={article.id} href={`/articles/${article.slug}`} className="block border-b border-stone-200 py-3 last:border-b-0"><h3 className="font-serif text-lg font-bold leading-tight">{article.title}</h3><StoryMeta article={article} settings={publishingSettings} /></Link>)}
          </section>
        ) : null}

        <section className="border-b border-stone-400 py-5">
          <div className="newspaper-section-heading"><h2>Community & Marketplace</h2></div>
          <div className="grid grid-cols-2 gap-2 text-sm font-bold">
            <Link href="/events" className="border border-stone-300 px-3 py-3">Events →</Link>
            <Link href="/marketplace" className="border border-stone-300 px-3 py-3">Marketplace →</Link>
            <Link href="/explore" className="border border-stone-300 px-3 py-3">Island Guide →</Link>
            <Link href="/obituaries" className="border border-stone-300 px-3 py-3">Obituaries →</Link>
          </div>
        </section>

        <section className="py-5">
          <p className="newspaper-kicker text-hgnRed">Support local journalism</p>
          <h2 className="mt-2 font-serif text-2xl font-bold leading-tight">Independent reporting matters.</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">Help keep Haida Gwaii news and community information accessible.</p>
          <Link href="/support-us" className="newspaper-button mt-4">Support HGN</Link>
        </section>
      </section>

      <section className="hidden items-start gap-6 py-4 md:gap-8 md:py-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,.34fr)]">
        <div className="min-w-0">
          <section className={`grid items-start border-b border-stone-400 pb-5 ${frontPageVideo || frontPageImage ? "lg:grid-cols-[.78fr_1.22fr]" : "grid-cols-1"}`}>
            {main ? (
              <article className={frontPageVideo || frontPageImage ? "pr-0 lg:border-r lg:border-stone-300 lg:pr-6" : "mx-auto w-full max-w-4xl"}>
                <p className="newspaper-kicker">Top Story</p>
                <Link href={`/articles/${main.slug}`} className="group">
                  <h1 className="mt-2 max-w-[15ch] font-serif text-[1.95rem] font-bold leading-[1.02] tracking-[-0.035em] text-stone-950 group-hover:text-hgnRed sm:text-[2.75rem] lg:text-[3rem] xl:text-[3.2rem]">{main.title}</h1>
                  <p className="mt-3 max-w-[42rem] text-sm leading-6 text-stone-600 line-clamp-4 sm:mt-4 sm:text-base sm:leading-7 sm:line-clamp-none">{plainExcerpt(main, 230)}</p>
                  <StoryMeta article={main} settings={publishingSettings} />
                  <span className="mt-5 inline-block text-xs font-bold uppercase tracking-[0.12em]">Read full story →</span>
                </Link>
              </article>
            ) : <div />}

            {frontPageVideo ? (
              <div className="mt-5 self-start lg:mt-0 lg:pl-6">
                <div className="border-y border-stone-400 py-3">
                  <p className="newspaper-kicker text-hgnRed">Live now</p>
                  <h2 className="mt-1 font-serif text-2xl font-bold leading-tight">{frontPageVideoTitle}</h2>
                  <div className="mt-3 aspect-video overflow-hidden bg-stone-900 shadow-sm">
                    <iframe src={frontPageVideo} title={frontPageVideoTitle} className="h-full w-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                  </div>
                  {frontPageVideoDescription ? <p className="mt-3 text-sm leading-6 text-stone-600">{frontPageVideoDescription}</p> : null}
                </div>
                {photoRailStories.length ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {photoRailStories.map((article) => (
                      <Link key={article.id} href={`/articles/${article.slug}`} className="group border-t border-stone-300 pt-3">
                        <p className="newspaper-kicker">{article.category || article.section || "News"}</p>
                        <h2 className="mt-1 font-serif text-xl font-bold leading-[1.08] group-hover:text-hgnRed">{article.title}</h2>
                        <StoryMeta article={article} settings={publishingSettings} />
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : frontPageImage ? (
              <div className="mt-5 self-start lg:mt-0 lg:pl-6">
                {frontPageHref ? (
                  <Link href={frontPageHref} className="group block">
                    <div className="aspect-[16/9] overflow-hidden bg-stone-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={frontPageImage} alt={frontPageAlt || managedRelatedArticle?.title || "Haida Gwaii front-page photograph"} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.015]" />
                    </div>
                    <p className="mt-2 border-b border-stone-200 pb-2 text-[11px] leading-4 text-stone-500">{frontPageCaption || managedRelatedArticle?.title || "Front-page photograph"}{frontPageCredit ? ` · Photo: ${frontPageCredit}` : ""}</p>
                  </Link>
                ) : (
                  <figure>
                    <div className="aspect-[16/9] overflow-hidden bg-stone-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={frontPageImage} alt={frontPageAlt || "Haida Gwaii front-page photograph"} className="h-full w-full object-cover" />
                    </div>
                    <figcaption className="mt-2 border-b border-stone-200 pb-2 text-[11px] leading-4 text-stone-500">{frontPageCaption || "Front-page photograph"}{frontPageCredit ? ` · Photo: ${frontPageCredit}` : ""}</figcaption>
                  </figure>
                )}

                {photoRailStories.length ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {photoRailStories.map((article) => (
                      <Link key={article.id} href={`/articles/${article.slug}`} className="group border-t border-stone-300 pt-3">
                        <p className="newspaper-kicker">{article.category || article.section || "News"}</p>
                        <h2 className="mt-1 font-serif text-xl font-bold leading-[1.08] group-hover:text-hgnRed">{article.title}</h2>
                        <StoryMeta article={article} settings={publishingSettings} />
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="grid border-b border-stone-400 py-5 md:grid-cols-2">
            {secondaryStripStories.map((article, index) => (
              <Link key={article.id} href={`/articles/${article.slug}`} className={`group block py-4 md:px-5 ${index > 0 ? "border-t border-stone-300 md:border-l md:border-t-0" : ""} ${index > 1 ? "md:border-t md:pt-5" : "md:pt-0"}`}>
                <p className="newspaper-kicker">{article.category || article.section || "Local"}</p>
                <h2 className="mt-2 font-serif text-2xl font-bold leading-[1.05] group-hover:text-hgnRed">{article.title}</h2>
                <p className="mt-3 text-sm leading-6 text-stone-600">{plainExcerpt(article, 150)}</p>
                <span className="mt-3 inline-block text-[11px] font-bold uppercase tracking-[0.12em]">Read more →</span>
                <StoryMeta article={article} settings={publishingSettings} />
              </Link>
            ))}
          </section>

          {(desktopSports.length || desktopColumns.length) ? (
            <section className="grid border-b border-stone-400 py-6 md:grid-cols-2 md:gap-7">
              <div className="min-w-0 md:border-r md:border-stone-300 md:pr-7">
                <div className="newspaper-section-heading">
                  <h2>Sports</h2>
                  <Link href="/sports">All sports →</Link>
                </div>
                {desktopSports.length ? desktopSports.map((article) => (
                  <Link key={article.id} href={`/articles/${article.slug}`} className="group block border-b border-stone-200 py-4 last:border-b-0">
                    <h3 className="font-serif text-xl font-bold leading-tight group-hover:text-hgnRed">{article.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">{plainExcerpt(article, 120)}</p>
                    <StoryMeta article={article} settings={publishingSettings} />
                  </Link>
                )) : <p className="py-4 text-sm text-stone-500">More sports coverage coming soon.</p>}
              </div>

              <div className="min-w-0 pt-6 md:pt-0">
                <div className="newspaper-section-heading">
                  <h2>Columns</h2>
                  <Link href="/columns">All columns →</Link>
                </div>
                {desktopColumns.length ? desktopColumns.map((article) => (
                  <Link key={article.id} href={`/articles/${article.slug}`} className="group block border-b border-stone-200 py-4 last:border-b-0">
                    <p className="newspaper-kicker text-hgnRed">{article.column_name || article.subcategory || "Column"}</p>
                    <h3 className="mt-1 font-serif text-xl font-bold leading-tight group-hover:text-hgnRed">{article.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">{plainExcerpt(article, 120)}</p>
                    <StoryMeta article={article} settings={publishingSettings} />
                  </Link>
                )) : <p className="py-4 text-sm text-stone-500">More columns coming soon.</p>}
              </div>
            </section>
          ) : null}

          <section className="py-7">
            <div className="newspaper-section-heading">
              <h2>More Local News</h2>
              <Link href="/articles">All news →</Link>
            </div>
            <div className="grid gap-x-7 md:grid-cols-2">
              {[moreLocalStories.filter((_, index) => index % 2 === 0), moreLocalStories.filter((_, index) => index % 2 === 1)].map((column, columnIndex) => (
                <div key={columnIndex} className="min-w-0">
                  {column.map((article, index) => (
                    <div key={article.id}>
                      {(() => {
                        const image = getArticleImage(article)
                        return (
                          <Link href={`/articles/${article.slug}`} className={`group grid gap-4 border-b border-stone-300 py-5 ${image ? "grid-cols-[1fr_116px]" : "grid-cols-1"}`}>
                            <div>
                              <p className="newspaper-kicker">{article.category || article.section || "News"}</p>
                              <h3 className="mt-1 font-serif text-xl font-bold leading-tight group-hover:text-hgnRed">{article.title}</h3>
                              <p className="mt-2 text-sm leading-6 text-stone-600">{plainExcerpt(article, 125)}</p>
                              <span className="mt-3 inline-block text-[11px] font-bold uppercase tracking-[0.12em]">Read more →</span>
                              <StoryMeta article={article} settings={publishingSettings} />
                            </div>
                            {image ? <div className="aspect-[4/3] overflow-hidden bg-stone-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={image} alt={article.image_alt || article.title} className="h-full w-full object-cover" />
                            </div> : null}
                          </Link>
                        )
                      })()}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-stone-300 pt-1">
              <AdSlot placement="home_middle" fallbackHouseAd className="mx-auto max-w-4xl" />
            </div>
          </section>
        </div>

        <aside className="space-y-5 md:space-y-7 lg:border-l lg:border-stone-300 lg:pl-7">
          {opinion ? (
            <Link href={`/articles/${opinion.slug}`} className="group block">
              <p className="newspaper-kicker text-hgnRed">Opinion</p>
              <h2 className="mt-2 font-serif text-2xl font-bold leading-[1.06] group-hover:text-hgnRed sm:text-3xl">{opinion.title}</h2>
              <p className="mt-3 text-sm leading-6 text-stone-600">{plainExcerpt(opinion, 170)}</p>
              <span className="mt-3 inline-block text-[11px] font-bold uppercase tracking-[0.12em]">Read more →</span>
              <StoryMeta article={opinion} settings={publishingSettings} />
            </Link>
          ) : null}
          <div className="border-t border-stone-300 pt-4">
            <div className="flex items-end justify-between gap-3">
              <h2 className="newspaper-kicker text-stone-900">Latest Headlines</h2>
              <Link href="/articles" className="text-[11px] font-bold">View all →</Link>
            </div>
            <div className="mt-2">
              {briefs.map((article) => (
                <Link key={article.id} href={`/articles/${article.slug}`} className="grid grid-cols-[1fr_auto] gap-3 border-t border-stone-200 py-3 first:border-t-0">
                  <span className="font-serif text-base font-bold leading-tight hover:text-hgnRed">{article.title}</span>
                  <span className="whitespace-nowrap text-[10px] uppercase text-stone-500">{articleFreshness(article, publishingSettings)}</span>
                </Link>
              ))}
            </div>
          </div>
          <HomeUpcomingEvents hideWhenEmpty />
          <HomePoll />
          <section className="border-y border-stone-400 py-5">
            <p className="newspaper-kicker text-hgnRed">Support local journalism</p>
            <h2 className="mt-2 font-serif text-3xl font-bold leading-tight">Independent reporting matters.</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">Help keep Haida Gwaii news and community information accessible.</p>
            <Link href="/support-us" className="newspaper-button mt-5">Support HGN</Link>
          </section>
        </aside>
      </section>
    </main>
  )
}
