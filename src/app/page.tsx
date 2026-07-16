"use client";

import {
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FinancialSection,
  RecommendationSection,
  SwotSection,
  ValuationSection,
} from "@/components/report-sections";
import type { ManuReport } from "@/data/manu-report.schema";
import { fetchManuReport } from "@/lib/report-client";
import { formatMoney, formatPercent } from "@/lib/report-format";
import { copy, type Locale, translateText } from "@/lib/i18n";

type ReportViewState =
  | { status: "loading" }
  | { status: "success"; report: ManuReport }
  | { status: "error"; message: string };

const sectionLinks = [
  { id: "judgment", index: "01", label: "投资判断" },
  { id: "financials", index: "02", label: "财务证据" },
  { id: "valuation", index: "03", label: "估值复核" },
  { id: "risk", index: "04", label: "风险与建议" },
  { id: "quality", index: "05", label: "质量说明" },
] as const;

type SectionId = (typeof sectionLinks)[number]["id"];
type NavigateHandler = (
  event: ReactMouseEvent<HTMLAnchorElement>,
  sectionId: SectionId,
) => void;

function LoadingState({ locale }: { locale: Locale }) {
  const text = copy[locale];
  return (
    <main className="state-page" aria-busy="true">
      <div className="state-shell" role="status" aria-live="polite">
        <p className="kicker">MANU · INVESTMENT DOSSIER</p>
        <h1>{text.loading}</h1>
        <p className="state-copy">{text.loadingCopy}</p>
        <div className="loading-rule" aria-hidden="true"><span /></div>
        <div className="loading-lines" aria-hidden="true"><span /><span /><span /></div>
      </div>
    </main>
  );
}

function ErrorState({ message, onRetry, locale }: { message: string; onRetry: () => void; locale: Locale }) {
  const text = copy[locale];
  return (
    <main className="state-page">
      <section className="state-shell state-error" aria-live="assertive">
        <p className="kicker">REPORT DATA · ERROR</p>
        <h1>{text.error}</h1>
        <p className="state-copy">{message}</p>
        <button type="button" onClick={onRetry} className="primary-action">
          {text.retry} <span aria-hidden="true">↗</span>
        </button>
      </section>
    </main>
  );
}

function useActiveSection(): {
  activeSection: SectionId;
  onNavigate: NavigateHandler;
} {
  const [activeSection, setActiveSection] = useState<SectionId>("judgment");
  const lockedSection = useRef<SectionId | null>(null);
  const settleFrame = useRef<number | null>(null);

  useEffect(() => {
    const sections = sectionLinks
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    const readCurrentSection = () => {
      const documentOffset =
        Number.parseFloat(
          getComputedStyle(document.documentElement).scrollPaddingTop,
        ) || 0;
      let current = sections[0];

      for (const section of sections) {
        const sectionOffset =
          Number.parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
        const activationLine = Math.max(documentOffset, sectionOffset, 112);
        const sectionTop = section.getBoundingClientRect().top;

        if (sectionTop <= activationLine + 8) {
          current = section;
        } else {
          break;
        }
      }

      if (current) setActiveSection(current.id as SectionId);
    };

    const observer = new IntersectionObserver(
      () => {
        if (lockedSection.current === null) readCurrentSection();
      },
      { rootMargin: "-112px 0px -62% 0px", threshold: [0, 0.15, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    readCurrentSection();

    return () => observer.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (settleFrame.current !== null) {
        cancelAnimationFrame(settleFrame.current);
      }
    },
    [],
  );

  const onNavigate = useCallback<NavigateHandler>((event, sectionId) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const destination = document.getElementById(sectionId);
    if (!destination) return;

    event.preventDefault();
    lockedSection.current = sectionId;
    setActiveSection(sectionId);
    window.history.replaceState(null, "", `#${sectionId}`);
    window.scrollTo({ top: destination.offsetTop, behavior: "auto" });

    if (settleFrame.current !== null) {
      cancelAnimationFrame(settleFrame.current);
    }

    let stableFrames = 0;
    let previousScrollY = window.scrollY;

    const releaseWhenSettled = () => {
      const currentScrollY = window.scrollY;
      const destinationRect = destination.getBoundingClientRect();
      const scrollMargin =
        Number.parseFloat(getComputedStyle(destination).scrollMarginTop) || 0;
      const scrollIsStable = Math.abs(currentScrollY - previousScrollY) < 0.5;
      const destinationIsAligned =
        Math.abs(destinationRect.top - scrollMargin) <= 8;
      const reachedPageBoundary =
        Math.abs(
          document.documentElement.scrollHeight -
            window.innerHeight -
            currentScrollY,
        ) <= 3;

      stableFrames =
        scrollIsStable &&
        (destinationIsAligned || reachedPageBoundary)
          ? stableFrames + 1
          : 0;
      previousScrollY = currentScrollY;

      if (stableFrames >= 2) {
        lockedSection.current = null;
        setActiveSection(sectionId);
        settleFrame.current = null;
        return;
      }

      settleFrame.current = requestAnimationFrame(releaseWhenSettled);
    };

    settleFrame.current = requestAnimationFrame(releaseWhenSettled);
  }, []);

  return { activeSection, onNavigate };
}

function ChapterNavigation({ activeSection, onNavigate, locale }: { activeSection: SectionId; onNavigate: NavigateHandler; locale: Locale }) {
  const text = copy[locale];
  return (
    <nav className="chapter-nav" aria-label="报告章节">
      <p className="nav-heading">CONTENTS</p>
      <ol>
        {sectionLinks.map((item, index) => (
          <li key={item.id}>
            <a href={`#${item.id}`} onClick={(event) => onNavigate(event, item.id)} aria-current={activeSection === item.id ? "location" : undefined}>
              <span>{item.index}</span>{text.contents[index]}
            </a>
          </li>
        ))}
      </ol>
      <p className="nav-footnote">{text.navNote}</p>
    </nav>
  );
}

function MobileJumpBar({ activeSection, onNavigate, locale }: { activeSection: SectionId; onNavigate: NavigateHandler; locale: Locale }) {
  const text = copy[locale];
  return (
    <nav className="mobile-jump" aria-label="快速跳转">
      {sectionLinks.map((item, index) => (
        <a key={item.id} href={`#${item.id}`} onClick={(event) => onNavigate(event, item.id)} aria-current={activeSection === item.id ? "location" : undefined}>
          <span>{item.index}</span>{text.contents[index]}
        </a>
      ))}
    </nav>
  );
}

function EvidenceSpine({ report, activeSection, onNavigate, locale }: { report: ManuReport; activeSection: SectionId; onNavigate: NavigateHandler; locale: Locale }) {
  const summary = report.executive_summary;
  const history = report.financial_history;
  const lastIndex = history.years.length - 1;
  const evidence = [
    {
      id: "judgment" as const,
      type: locale === "en" ? "View" : "结论",
      statement: `${summary.rating} · ${formatPercent(summary.upside_pct)}`,
      support: `${formatMoney(summary.current_price_usd)} → ${formatMoney(summary.target_price_usd)}`,
    },
    {
      id: "financials" as const,
      type: locale === "en" ? "Operations" : "经营",
      statement: `${locale === "en" ? "Adjusted EBITDA" : "调整后 EBITDA"} ${formatMoney(summary.key_financials_summary.adjusted_ebitda_fy2025)}`,
      support: `${locale === "en" ? "Net debt" : "净负债"} ${formatMoney(summary.key_financials_summary.net_debt)}`,
    },
    {
      id: "valuation" as const,
      type: locale === "en" ? "Valuation" : "估值",
      statement: `${locale === "en" ? "FCFF adjusted EV" : "FCFF 修正 EV"} ${formatMoney(report.valuation.fcff_model.enterprise_value.final_adjusted)}`,
      support: `${locale === "en" ? "FY2025 revenue" : "FY2025 营收"} ${formatMoney({ value: history.series.total_revenue[lastIndex], currency: history.currency, unit: history.unit })}`,
    },
    {
      id: "risk" as const,
      type: locale === "en" ? "Boundary" : "边界",
      statement: locale === "en" ? `${summary.risk_factors.length} principal risks` : `${summary.risk_factors.length} 项核心风险`,
      support: locale === "en" ? `${report.investment_recommendation.recommendations_by_investor_type.length} investor profiles` : `${report.investment_recommendation.recommendations_by_investor_type.length} 类投资者建议`,
    },
    {
      id: "quality" as const,
      type: locale === "en" ? "Quality" : "口径",
      statement: locale === "en" ? `${report.data_quality_notes.length} source inconsistencies` : `${report.data_quality_notes.length} 项原报告矛盾`,
      support: locale === "en" ? "Source values retained without interface-level correction" : "保留原值，不在展示层修正",
    },
  ];

  return (
    <div className="evidence-spine" aria-label="结论—证据脊柱">
      <div className="spine-heading"><p>CONCLUSION → EVIDENCE</p><span>{locale === "en" ? "Evidence spine" : "结论—证据脊柱"}</span></div>
      <ol>
        {evidence.map((item, index) => (
          <li key={item.id} className={activeSection === item.id ? "is-active" : undefined}>
            <a href={`#${item.id}`} onClick={(event) => onNavigate(event, item.id)} aria-current={activeSection === item.id ? "location" : undefined}>
              <span className="spine-node" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span className="spine-copy">
                <span className="evidence-type">{item.type}</span>
                <strong>{item.statement}</strong>
                <small>{item.support}</small>
              </span>
              <span className="spine-arrow" aria-hidden="true">→</span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

function QualificationRail({ report, locale }: { report: ManuReport; locale: Locale }) {
  const { meta, company_profile: company } = report;
  return (
    <aside className="qualification-rail" aria-label="报告口径与身份">
      <div>
        <p className="nav-heading">REPORT IDENTITY</p>
        <dl>
          <div><dt>{locale === "en" ? "Listing" : "标的"}</dt><dd>{meta.ticker} · {translateText(company.exchange, locale)}</dd></div>
          <div><dt>{locale === "en" ? "Issuer" : "主体"}</dt><dd>{translateText(meta.subject_company, locale)}</dd></div>
          <div><dt>{locale === "en" ? "Institution / author" : "机构 / 作者"}</dt><dd>{translateText(meta.institution, locale)}<br />{translateText(meta.author, locale)}</dd></div>
        </dl>
      </div>
      <div className="qualification-block">
        <p className="nav-heading">DATA BOUNDARY</p>
        <p className="validation-status"><span aria-hidden="true">✓</span> API schema validated</p>
        <p>{locale === "en" ? "This page presents a local report snapshot, not live market data. The source did not provide a report date." : "本页只展示本地报告快照，不代表实时行情。原始数据未提供报告日期。"}</p>
        <p className="currency-line"><span>GBP</span><span>EUR</span><span>USD</span></p>
      </div>
      <div className="qualification-block">
        <p className="nav-heading">QUALITY FLAG</p>
        <p><strong>{report.data_quality_notes.length}</strong> {locale === "en" ? "definition or numerical inconsistencies are retained at the end and linked from the evidence spine." : "项口径或数值矛盾保留在文末，可由脊柱直接定位。"}</p>
      </div>
    </aside>
  );
}

function LanguageSwitch({ locale, onChange }: { locale: Locale; onChange: (locale: Locale) => void }) {
  return <div className="language-switch" role="group" aria-label={copy[locale].language}><button type="button" className={locale === "zh-CN" ? "is-active" : undefined} onClick={() => onChange("zh-CN")}>简中</button><button type="button" className={locale === "en" ? "is-active" : undefined} onClick={() => onChange("en")}>EN</button></div>;
}

function ReportPage({ report, locale, onLocaleChange }: { report: ManuReport; locale: Locale; onLocaleChange: (locale: Locale) => void }) {
  const text = copy[locale];
  const { activeSection, onNavigate } = useActiveSection();
  const { meta, executive_summary: summary } = report;
  const title = useMemo(() => meta.report_title.replace("投资研究报告", "").trim(), [meta.report_title]);

  const enterReading = useCallback((event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const destination = document.getElementById("reading-start");
    if (!destination) return;
    event.preventDefault();
    window.history.replaceState(null, "", "#judgment");
    destination.scrollIntoView({ block: "start", behavior: "auto" });
  }, []);

  return (
    <main className="report-page" lang={locale}>
      <a className="skip-link" href="#report-content">{text.skip}</a>
      <section className="cover-hero" aria-labelledby="cover-title">
        <div className="cover-hero__shade" aria-hidden="true" />
        <div className="cover-hero__topline">
          <a href="#cover-title" className="cover-wordmark" aria-label="MANU 投资研究报告首页">
            <span>MANU</span>
            <small>INVESTMENT DOSSIER</small>
          </a>
          <div className="cover-tools"><p>INDEPENDENT EQUITY RESEARCH</p><LanguageSwitch locale={locale} onChange={onLocaleChange} /></div>
        </div>
        <div className="cover-hero__content">
          <p className="cover-kicker">EQUITY RESEARCH · NYSE: {meta.ticker}</p>
          <h1 id="cover-title"><span>MANU</span><small>{text.reportTitle}</small></h1>
          <p className="cover-deck">{text.deck}</p>
          <div className="cover-verdict" aria-label="报告摘要">
            <span>{translateText(summary.rating, locale)}</span>
            <span>{formatMoney(summary.target_price_usd)} {text.target}</span>
            <span>{formatPercent(summary.upside_pct)} {text.upside}</span>
          </div>
          <a className="cover-read" href="#reading-start" onClick={enterReading}>
            <span>{text.read}</span><span aria-hidden="true">→</span>
          </a>
        </div>
        <p className="cover-credit">Photo: Arne Müseler / arne-mueseler.com / CC BY-SA 3.0 · Cropped and color-adjusted</p>
        <a className="cover-scroll" href="#reading-start" onClick={enterReading} aria-label="进入报告正文">
          <span>SCROLL TO READ</span><i aria-hidden="true" />
        </a>
      </section>
      <div id="reading-start" className="reading-start" aria-hidden="true" />
      <header className="report-topbar">
        <div className="topbar-inner">
          <a href="#judgment" onClick={(event) => onNavigate(event, "judgment")} className="wordmark" aria-label="返回投资判断"><span>{meta.ticker}</span><small>INVESTMENT DOSSIER</small></a>
          <div className="topbar-tools"><p><span className="status-dot" aria-hidden="true" /> {text.validated}</p><LanguageSwitch locale={locale} onChange={onLocaleChange} /></div>
        </div>
      </header>

      <MobileJumpBar activeSection={activeSection} onNavigate={onNavigate} locale={locale} />

      <div className="report-shell">
        <div className="left-rail"><ChapterNavigation activeSection={activeSection} onNavigate={onNavigate} locale={locale} /></div>

        <article id="report-content" className="report-content">
          <section id="judgment" className="hero-section chapter-section" aria-labelledby="report-title">
            <div className="article-masthead">
              <span>MANU INVESTMENT DOSSIER</span>
              <span>INDEPENDENT EQUITY RESEARCH</span>
            </div>
            <p className="kicker">EQUITY RESEARCH · NYSE: {meta.ticker}</p>
            <h1 id="report-title">{locale === "en" ? "Manchester United (MANU)" : title}<span>{text.reportTitle}</span></h1>
            <p className="subject-line">{translateText(meta.subject_company, locale)}</p>

            <div className="rating-statement">
              <div className="rating-mark"><span>INVESTMENT RATING</span><strong>{translateText(summary.rating, locale)}</strong></div>
              <div className="rating-thesis">
                <p>{text.deck}</p>
                <dl>
                  <div><dt>{text.current}</dt><dd>{formatMoney(summary.current_price_usd)}</dd></div>
                  <div><dt>{text.target}</dt><dd>{formatMoney(summary.target_price_usd)}</dd></div>
                  <div><dt>{text.upside}</dt><dd>{formatPercent(summary.upside_pct)}</dd></div>
                </dl>
              </div>
            </div>

            <EvidenceSpine report={report} activeSection={activeSection} onNavigate={onNavigate} locale={locale} />

            <div className="argument-section" aria-labelledby="core-thesis-title">
              <div className="section-intro">
                <p className="section-index">01 / ARGUMENT</p>
                <h2 id="core-thesis-title">{locale === "en" ? "Why the current rating remains Hold" : "为什么当前结论是“持有”"}</h2>
                <p>{locale === "en" ? "The arguments are ordered by their bearing on the investment view, not presented as isolated indicators." : "以下论点按对投资判断的作用排列，而非作为彼此独立的指标展示。"}</p>
              </div>
              <ol className="thesis-list">
                {summary.core_thesis.map((item, index) => (
                  <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{translateText(item, locale)}</p></li>
                ))}
              </ol>
              <aside className="margin-qualification"><span>{locale === "en" ? "Decision boundary" : "判断边界"}</span><p>{translateText(summary.key_financials_summary.net_loss_note, locale)}</p></aside>
            </div>
          </section>

          <FinancialSection report={report} locale={locale} />
          <ValuationSection report={report} locale={locale} />
          <SwotSection report={report} locale={locale} />
          <RecommendationSection report={report} locale={locale} />

          <section id="quality" className="chapter-section quality-section" aria-labelledby="quality-title">
            <div className="section-intro">
              <p className="section-index">05 / DATA QUALITY</p>
              <h2 id="quality-title">{locale === "en" ? "Data quality notes" : "数据质量说明"}</h2>
              <p>{locale === "en" ? "The items below preserve numerical contradictions and definition differences in the source report; the presentation layer does not silently correct them." : "以下内容逐项保留原报告中的数值矛盾或口径差异，不在展示层擅自修正。"}</p>
            </div>
            <div className="quality-register">
              {report.data_quality_notes.map((note, index) => (
                <article key={`${note.path}-${index}`}>
                  <span className="quality-number">Q{String(index + 1).padStart(2, "0")}</span>
                  <div><code>{note.path}</code><p>{translateText(note.issue, locale)}</p></div>
                </article>
              ))}
            </div>
          </section>

          <footer className="report-footer">
            <p>{translateText(meta.institution, locale)} · {translateText(meta.author, locale)}</p>
            <a href="#judgment" onClick={(event) => onNavigate(event, "judgment")}>{text.return} <span aria-hidden="true">↑</span></a>
          </footer>
        </article>

        <div className="right-rail"><QualificationRail report={report} locale={locale} /></div>
      </div>
    </main>
  );
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("zh-CN");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem("manu-locale");
      const preferred: Locale = saved === "en" ? "en" : (saved === "zh-CN" || navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en");
      setLocale(preferred);
      document.documentElement.lang = preferred;
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const changeLocale = useCallback((next: Locale) => { setLocale(next); localStorage.setItem("manu-locale", next); document.documentElement.lang = next; }, []);
  const [state, setState] = useState<ReportViewState>({ status: "loading" });
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchManuReport({ signal: controller.signal })
      .then((report) => setState({ status: "success", report }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: "error", message: error instanceof Error ? error.message : "报告数据暂时无法读取。" });
      });
    return () => controller.abort();
  }, [requestKey]);

  if (state.status === "loading") return <LoadingState locale={locale} />;
  if (state.status === "error") {
    return <ErrorState locale={locale} message={state.message} onRetry={() => { setState({ status: "loading" }); setRequestKey((key) => key + 1); }} />;
  }
  return <ReportPage report={state.report} locale={locale} onLocaleChange={changeLocale} />;
}
