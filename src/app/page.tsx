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

function LoadingState() {
  return (
    <main className="state-page" aria-busy="true">
      <div className="state-shell" role="status" aria-live="polite">
        <p className="kicker">MANU · INVESTMENT DOSSIER</p>
        <h1>正在建立结论与证据索引</h1>
        <p className="state-copy">正在从本地报告接口读取并校验完整研究数据。</p>
        <div className="loading-rule" aria-hidden="true"><span /></div>
        <div className="loading-lines" aria-hidden="true"><span /><span /><span /></div>
      </div>
    </main>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="state-page">
      <section className="state-shell state-error" aria-live="assertive">
        <p className="kicker">REPORT DATA · ERROR</p>
        <h1>报告暂时无法读取</h1>
        <p className="state-copy">{message}</p>
        <button type="button" onClick={onRetry} className="primary-action">
          重新加载报告 <span aria-hidden="true">↗</span>
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
    destination.scrollIntoView({ block: "start", behavior: "auto" });

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

function ChapterNavigation({ activeSection, onNavigate }: { activeSection: SectionId; onNavigate: NavigateHandler }) {
  return (
    <nav className="chapter-nav" aria-label="报告章节">
      <p className="nav-heading">CONTENTS</p>
      <ol>
        {sectionLinks.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} onClick={(event) => onNavigate(event, item.id)} aria-current={activeSection === item.id ? "location" : undefined}>
              <span>{item.index}</span>{item.label}
            </a>
          </li>
        ))}
      </ol>
      <p className="nav-footnote">沿结论顺序阅读；数字与口径在相邻证据处复核。</p>
    </nav>
  );
}

function MobileJumpBar({ activeSection, onNavigate }: { activeSection: SectionId; onNavigate: NavigateHandler }) {
  return (
    <nav className="mobile-jump" aria-label="快速跳转">
      {sectionLinks.map((item) => (
        <a key={item.id} href={`#${item.id}`} onClick={(event) => onNavigate(event, item.id)} aria-current={activeSection === item.id ? "location" : undefined}>
          <span>{item.index}</span>{item.label}
        </a>
      ))}
    </nav>
  );
}

function EvidenceSpine({ report, activeSection, onNavigate }: { report: ManuReport; activeSection: SectionId; onNavigate: NavigateHandler }) {
  const summary = report.executive_summary;
  const history = report.financial_history;
  const lastIndex = history.years.length - 1;
  const evidence = [
    {
      id: "judgment" as const,
      type: "结论",
      statement: `${summary.rating} · ${formatPercent(summary.upside_pct)}`,
      support: `${formatMoney(summary.current_price_usd)} → ${formatMoney(summary.target_price_usd)}`,
    },
    {
      id: "financials" as const,
      type: "经营",
      statement: `调整后 EBITDA ${formatMoney(summary.key_financials_summary.adjusted_ebitda_fy2025)}`,
      support: `净负债 ${formatMoney(summary.key_financials_summary.net_debt)}`,
    },
    {
      id: "valuation" as const,
      type: "估值",
      statement: `FCFF 修正 EV ${formatMoney(report.valuation.fcff_model.enterprise_value.final_adjusted)}`,
      support: `FY2025 营收 ${formatMoney({ value: history.series.total_revenue[lastIndex], currency: history.currency, unit: history.unit })}`,
    },
    {
      id: "risk" as const,
      type: "边界",
      statement: `${summary.risk_factors.length} 项核心风险`,
      support: `${report.investment_recommendation.recommendations_by_investor_type.length} 类投资者建议`,
    },
    {
      id: "quality" as const,
      type: "口径",
      statement: `${report.data_quality_notes.length} 项原报告矛盾`,
      support: "保留原值，不在展示层修正",
    },
  ];

  return (
    <div className="evidence-spine" aria-label="结论—证据脊柱">
      <div className="spine-heading"><p>CONCLUSION → EVIDENCE</p><span>结论—证据脊柱</span></div>
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

function QualificationRail({ report }: { report: ManuReport }) {
  const { meta, company_profile: company } = report;
  return (
    <aside className="qualification-rail" aria-label="报告口径与身份">
      <div>
        <p className="nav-heading">REPORT IDENTITY</p>
        <dl>
          <div><dt>标的</dt><dd>{meta.ticker} · {company.exchange}</dd></div>
          <div><dt>主体</dt><dd>{meta.subject_company}</dd></div>
          <div><dt>机构 / 作者</dt><dd>{meta.institution}<br />{meta.author}</dd></div>
        </dl>
      </div>
      <div className="qualification-block">
        <p className="nav-heading">DATA BOUNDARY</p>
        <p className="validation-status"><span aria-hidden="true">✓</span> API schema validated</p>
        <p>本页只展示本地报告快照，不代表实时行情。原始数据未提供报告日期。</p>
        <p className="currency-line"><span>GBP</span><span>EUR</span><span>USD</span></p>
      </div>
      <div className="qualification-block">
        <p className="nav-heading">QUALITY FLAG</p>
        <p><strong>{report.data_quality_notes.length}</strong> 项口径或数值矛盾保留在文末，可由脊柱直接定位。</p>
      </div>
    </aside>
  );
}

function ReportPage({ report }: { report: ManuReport }) {
  const { activeSection, onNavigate } = useActiveSection();
  const { meta, executive_summary: summary } = report;
  const title = useMemo(() => meta.report_title.replace("投资研究报告", "").trim(), [meta.report_title]);

  return (
    <main className="report-page">
      <a className="skip-link" href="#report-content">跳到报告正文</a>
      <header className="report-topbar">
        <div className="topbar-inner">
          <a href="#judgment" onClick={(event) => onNavigate(event, "judgment")} className="wordmark" aria-label="返回投资判断"><span>{meta.ticker}</span><small>INVESTMENT DOSSIER</small></a>
          <p><span className="status-dot" aria-hidden="true" /> 本地报告数据已校验</p>
        </div>
      </header>

      <MobileJumpBar activeSection={activeSection} onNavigate={onNavigate} />

      <div className="report-shell">
        <div className="left-rail"><ChapterNavigation activeSection={activeSection} onNavigate={onNavigate} /></div>

        <article id="report-content" className="report-content">
          <section id="judgment" className="hero-section chapter-section" aria-labelledby="report-title">
            <p className="kicker">EQUITY RESEARCH · {meta.ticker}</p>
            <h1 id="report-title">{title}<span>投资研究报告</span></h1>
            <p className="subject-line">{meta.subject_company}</p>

            <div className="rating-statement">
              <div className="rating-mark"><span>INVESTMENT RATING</span><strong>{summary.rating}</strong></div>
              <div className="rating-thesis">
                <p>品牌现金流与效率改善仍有支撑，但杠杆和估值口径限制安全边际。</p>
                <dl>
                  <div><dt>当前价</dt><dd>{formatMoney(summary.current_price_usd)}</dd></div>
                  <div><dt>目标价</dt><dd>{formatMoney(summary.target_price_usd)}</dd></div>
                  <div><dt>潜在涨幅</dt><dd>{formatPercent(summary.upside_pct)}</dd></div>
                </dl>
              </div>
            </div>

            <EvidenceSpine report={report} activeSection={activeSection} onNavigate={onNavigate} />

            <div className="argument-section" aria-labelledby="core-thesis-title">
              <div className="section-intro">
                <p className="section-index">01 / ARGUMENT</p>
                <h2 id="core-thesis-title">为什么当前结论是“持有”</h2>
                <p>以下论点按对投资判断的作用排列，而非作为彼此独立的指标展示。</p>
              </div>
              <ol className="thesis-list">
                {summary.core_thesis.map((item, index) => (
                  <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>
                ))}
              </ol>
              <aside className="margin-qualification"><span>判断边界</span><p>{summary.key_financials_summary.net_loss_note}</p></aside>
            </div>
          </section>

          <FinancialSection report={report} />
          <ValuationSection report={report} />
          <SwotSection report={report} />
          <RecommendationSection report={report} />

          <section id="quality" className="chapter-section quality-section" aria-labelledby="quality-title">
            <div className="section-intro">
              <p className="section-index">05 / DATA QUALITY</p>
              <h2 id="quality-title">数据质量说明</h2>
              <p>以下内容逐项保留原报告中的数值矛盾或口径差异，不在展示层擅自修正。</p>
            </div>
            <div className="quality-register">
              {report.data_quality_notes.map((note, index) => (
                <article key={`${note.path}-${index}`}>
                  <span className="quality-number">Q{String(index + 1).padStart(2, "0")}</span>
                  <div><code>{note.path}</code><p>{note.issue}</p></div>
                </article>
              ))}
            </div>
          </section>

          <footer className="report-footer">
            <p>{meta.institution} · {meta.author}</p>
            <a href="#judgment" onClick={(event) => onNavigate(event, "judgment")}>返回结论 <span aria-hidden="true">↑</span></a>
          </footer>
        </article>

        <div className="right-rail"><QualificationRail report={report} /></div>
      </div>
    </main>
  );
}

export default function Home() {
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

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") {
    return <ErrorState message={state.message} onRetry={() => { setState({ status: "loading" }); setRequestKey((key) => key + 1); }} />;
  }
  return <ReportPage report={state.report} />;
}
