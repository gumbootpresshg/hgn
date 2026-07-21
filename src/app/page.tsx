import HomeUpcomingEvents from "@/components/HomeUpcomingEvents"
import HomePoll from "@/components/HomePoll"
import AdSlot from "@/components/AdSlot"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { smartExcerpt } from "@/lib/text"
import { getArticleImage } from "@/lib/article-images"

export const revalidate = 60

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

function articleDate(article: Article) {
  return article.published_at ? new Date(article.published_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" }) : ""
}

function StoryMeta({ article }: { article: Article }) {
  return <p className="mt-3 text-[11px] uppercase tracking-[0.08em] text-stone-500">By {article.author_name || "Haida Gwaii News"}{articleDate(article) ? ` · ${articleDate(article)}` : ""}</p>
}

export default async function Home() {
  const [{ data: frontPageSettings }, { data: mainStories }, { data: frontPagePhotos }, { data: featuredStories }, { data: latestStories }] = await Promise.all([
    supabase.from("front_page_settings").select("*").eq("id", "current").maybeSingle(),
    supabase.from("articles").select("*").eq("status", "published").eq("front_page_main", true).order("published_at", { ascending: false }).limit(1),
    supabase.from("articles").select("*").eq("status", "published").eq("front_page_photo", true).not("image_url", "is", null).order("published_at", { ascending: false }).limit(1),
    supabase.from("articles").select("*").eq("status", "published").eq("featured", true).order("published_at", { ascending: false }).limit(8),
    supabase.from("articles").select("*").eq("status", "published").order("published_at", { ascending: false }).limit(28),
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
  const featured = ((featuredStories?.length ? featuredStories : latestStories) || []).filter((a: Article) => a.slug !== main?.slug) as Article[]
  const secondary = featured.slice(0, 2)
  const opinion = [...featured, ...(latestStories || [])].find((article: Article) => /opinion|editorial|column/i.test(`${article.category || ""} ${article.section || ""}`) && article.slug !== main?.slug)
  const used = new Set([main?.slug, ...secondary.map((a) => a.slug), opinion?.slug].filter(Boolean))
  const latest = (latestStories || []).filter((a: Article) => !used.has(a.slug)) as Article[]
  const briefs = latest.slice(0, 5)
  const photoRailStories = secondary
  const secondaryStripStories = latest.slice(5, 9)
  const moreLocalStories = latest.slice(9, 19)

  return (
    <main className="newspaper-shell py-5 md:py-7">
      <section className="border-b border-stone-900 pb-3">
        <div className="flex items-center gap-4 overflow-hidden whitespace-nowrap text-xs">
          <span className="font-bold uppercase tracking-[0.16em] text-hgnRed">Latest</span>
          <div className="flex min-w-0 gap-5 overflow-hidden text-stone-700">
            {briefs.slice(0, 3).map((article) => <Link key={article.id} href={`/articles/${article.slug}`} className="truncate hover:text-hgnRed">{article.title}</Link>)}
          </div>
          <Link href="/articles" className="ml-auto shrink-0 font-bold">All stories →</Link>
        </div>
      </section>

      <section className="grid items-start gap-8 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.34fr)]">
        <div className="min-w-0">
          <section className={`grid items-start border-b border-stone-400 pb-5 ${frontPageImage ? "lg:grid-cols-[.78fr_1.22fr]" : "grid-cols-1"}`}>
            {main ? (
              <article className={frontPageImage ? "pr-0 lg:border-r lg:border-stone-300 lg:pr-6" : "mx-auto w-full max-w-4xl"}>
                <p className="newspaper-kicker">Top Story</p>
                <Link href={`/articles/${main.slug}`} className="group">
                  <h1 className="mt-2 max-w-[15ch] font-serif text-[2.2rem] font-bold leading-[1.01] tracking-[-0.035em] text-stone-950 group-hover:text-hgnRed sm:text-[2.75rem] lg:text-[3rem] xl:text-[3.2rem]">{main.title}</h1>
                  <p className="mt-4 max-w-[42rem] text-base leading-7 text-stone-600">{plainExcerpt(main, 230)}</p>
                  <StoryMeta article={main} />
                  <span className="mt-5 inline-block text-xs font-bold uppercase tracking-[0.12em]">Read full story →</span>
                </Link>
              </article>
            ) : <div />}

            {frontPageImage ? (
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
                        <StoryMeta article={article} />
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
                <StoryMeta article={article} />
              </Link>
            ))}
          </section>

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
                              <StoryMeta article={article} />
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

        <aside className="space-y-7 lg:border-l lg:border-stone-300 lg:pl-7">
          {opinion ? (
            <Link href={`/articles/${opinion.slug}`} className="group block">
              <p className="newspaper-kicker text-hgnRed">Opinion</p>
              <h2 className="mt-2 font-serif text-3xl font-bold leading-[1.04] group-hover:text-hgnRed">{opinion.title}</h2>
              <p className="mt-3 text-sm leading-6 text-stone-600">{plainExcerpt(opinion, 170)}</p>
              <span className="mt-3 inline-block text-[11px] font-bold uppercase tracking-[0.12em]">Read more →</span>
              <StoryMeta article={opinion} />
            </Link>
          ) : null}
          <div className="border-t border-stone-300 pt-4">
            <div className="flex items-end justify-between gap-3">
              <h2 className="newspaper-kicker text-stone-900">Latest Headlines</h2>
              <Link href="/articles" className="text-[11px] font-bold">View all →</Link>
            </div>
            <div className="mt-2">
              {briefs.map((article, index) => (
                <Link key={article.id} href={`/articles/${article.slug}`} className="grid grid-cols-[1fr_auto] gap-3 border-t border-stone-200 py-3 first:border-t-0">
                  <span className="font-serif text-base font-bold leading-tight hover:text-hgnRed">{article.title}</span>
                  <span className="text-[10px] uppercase text-hgnRed">{index + 1}h</span>
                </Link>
              ))}
            </div>
          </div>
          <HomeUpcomingEvents />
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
