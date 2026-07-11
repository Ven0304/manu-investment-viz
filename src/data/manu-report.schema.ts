import { z } from "zod";

export const currencySchema = z.enum(["GBP", "EUR", "USD"]);
export const monetaryUnitSchema = z.enum(["million", "billion"]);

export const monetaryAmountSchema = z
  .object({
    value: z.number(),
    currency: currencySchema,
    unit: monetaryUnitSchema.optional(),
  })
  .strict();

const swotItemSchema = z.object({ tag: z.string(), text: z.string() }).strict();

const dataQualityNoteSchema = z
  .object({
    path: z.string(),
    issue: z.string(),
    values_found: z.array(z.unknown()),
  })
  .strict();

const forceItemSchema = z
  .object({ intensity: z.string(), summary: z.string() })
  .strict();

const numberSeriesSchema = z.array(z.number());
const nullableNumberSeriesSchema = z.array(z.number().nullable());

export const manuReportSchema = z
  .object({
    meta: z
      .object({
        report_title: z.string(),
        subject_company: z.string(),
        ticker: z.string(),
        author: z.string(),
        institution: z.string(),
        source_language: z.literal("zh"),
      })
      .strict(),
    data_quality_notes: z.array(dataQualityNoteSchema),
    executive_summary: z
      .object({
        rating: z.string(),
        target_price_usd: monetaryAmountSchema,
        target_price_eur: monetaryAmountSchema,
        current_price_usd: monetaryAmountSchema,
        upside_pct: z.number(),
        fx_rate_eur_usd: z.number(),
        core_thesis: z.array(z.string()),
        key_financials_summary: z
          .object({
            adjusted_ebitda_fy2025: monetaryAmountSchema,
            net_debt: monetaryAmountSchema,
            net_loss_note: z.string(),
          })
          .strict(),
        risk_factors: z.array(z.string()),
      })
      .strict(),
    company_profile: z
      .object({
        ticker: z.string(),
        exchange: z.string(),
        incorporation: z.string(),
        headquarters: z.string(),
        global_fanbase_estimate: z.string(),
        market_cap: monetaryAmountSchema,
      })
      .strict(),
    ownership_structure: z.array(
      z
        .object({
          holder: z.string(),
          economic_stake_pct: z.number(),
          voting_power_pct: z.number().nullable(),
          share_class: z.string(),
          note: z.string(),
        })
        .strict(),
    ),
    core_assets: z
      .object({
        old_trafford: z
          .object({
            current_capacity: z.number().int(),
            expansion_options: z.array(
              z
                .object({
                  type: z.string(),
                  estimated_cost: monetaryAmountSchema,
                  new_capacity: z.number().int(),
                })
                .strict(),
            ),
          })
          .strict(),
        carrington_training_ground: z
          .object({
            renovation_cost: monetaryAmountSchema,
            note: z.string(),
          })
          .strict(),
        player_registration_intangibles: z
          .object({
            as_of_date: z.string(),
            amount: monetaryAmountSchema,
          })
          .strict(),
      })
      .strict(),
    revenue_breakdown_fy2025: z
      .object({
        commercial: z
          .object({
            value: z.number(),
            currency: z.literal("GBP"),
            pct_of_total: z.number(),
          })
          .strict(),
        broadcasting: monetaryAmountSchema,
        matchday: monetaryAmountSchema,
      })
      .strict(),
    key_sponsorships: z.array(
      z
        .object({
          partner: z.string(),
          annual_value: monetaryAmountSchema,
          term_years: z.number().int().nullable(),
          risk_clause: z.string(),
        })
        .strict(),
    ),
    swot: z
      .object({
        strengths: z.array(swotItemSchema),
        weaknesses: z.array(swotItemSchema),
        opportunities: z.array(swotItemSchema),
        threats: z.array(swotItemSchema),
      })
      .strict(),
    five_forces: z
      .object({
        rivalry_among_competitors: forceItemSchema,
        threat_of_new_entrants: forceItemSchema,
        threat_of_substitutes: forceItemSchema,
        buyer_power: forceItemSchema,
        supplier_power: forceItemSchema,
      })
      .strict(),
    financial_history: z
      .object({
        currency: z.literal("GBP"),
        unit: z.literal("million"),
        years: z.array(z.string()),
        series: z
          .object({
            total_revenue: numberSeriesSchema,
            commercial_revenue: numberSeriesSchema,
            broadcasting_revenue: numberSeriesSchema,
            matchday_revenue: nullableNumberSeriesSchema,
            wages: numberSeriesSchema,
            adjusted_ebitda: numberSeriesSchema,
            operating_pl: numberSeriesSchema,
            net_loss: numberSeriesSchema,
            net_debt: numberSeriesSchema,
          })
          .strict(),
        cagr_5yr_pct: z.record(z.string(), z.number().nullable()),
      })
      .strict(),
    adjusted_ebitda_bridge_fy2025: z
      .object({
        currency: z.literal("GBP"),
        net_loss: z.number(),
        tax: z.number(),
        net_finance_costs: z.number(),
        amortization: z.number(),
        depreciation: z.number(),
        exceptional_items: z.number(),
        adjusted_ebitda: z.number(),
      })
      .strict(),
    key_ratios_fy2025: z
      .object({
        wages_to_revenue_pct: z.number(),
        net_debt_to_ebitda: z.number(),
        interest_cover: z.number(),
      })
      .strict(),
    valuation: z
      .object({
        peer_comparison: z.array(
          z
            .object({
              club: z.string(),
              fiscal_year: z.number().int(),
              enterprise_value: monetaryAmountSchema,
              revenue: monetaryAmountSchema,
              ev_revenue_multiple: z.number(),
            })
            .strict(),
        ),
        fcff_model: z
          .object({
            currency: z.literal("EUR"),
            fx_rate_note: z.string(),
            historical_base: z
              .object({
                years: z.array(z.number().int()),
                revenue: numberSeriesSchema,
                tax_rate_pct: numberSeriesSchema,
                ebit: numberSeriesSchema,
                d_and_a: numberSeriesSchema,
                capex: numberSeriesSchema,
                nwc_change: numberSeriesSchema,
              })
              .strict(),
            key_assumptions: z
              .object({
                revenue_growth_pct_by_year: z.record(z.string(), z.number()),
                ebit_margin_pct: z
                  .object({ fy2025: z.number(), fy2030_target: z.number() })
                  .strict(),
                wacc_pct: z.number(),
                cost_of_equity_pct: z.number(),
                cost_of_debt_pct: z.number(),
                capital_structure: z
                  .object({ equity_pct: z.number(), debt_pct: z.number() })
                  .strict(),
                terminal_growth_rate_pct: z.number(),
                da_pct_of_revenue_range: numberSeriesSchema,
                capex_pct_of_revenue_range: numberSeriesSchema,
                nwc_change_pct_of_revenue: z.number(),
              })
              .strict(),
            forecast: z
              .object({
                years: z.array(z.number().int()),
                revenue: numberSeriesSchema,
                after_tax_ebit: numberSeriesSchema,
                d_and_a: numberSeriesSchema,
                capex: numberSeriesSchema,
                nwc_change: numberSeriesSchema,
                fcff: numberSeriesSchema,
                pv_fcff: numberSeriesSchema,
              })
              .strict(),
            pv_fcff_sum: monetaryAmountSchema,
            terminal_value: z
              .object({
                undiscounted: monetaryAmountSchema,
                present_value: monetaryAmountSchema,
              })
              .strict(),
            enterprise_value: z
              .object({
                base_calculation: monetaryAmountSchema,
                final_adjusted: monetaryAmountSchema,
                adjustment_note: z.string(),
              })
              .strict(),
            sensitivity: z.array(
              z
                .object({
                  variable: z.string(),
                  shock: z.string(),
                  resulting_ev: monetaryAmountSchema,
                  change_pct: z.number(),
                })
                .strict(),
            ),
          })
          .strict(),
      })
      .strict(),
    target_price_derivation: z
      .object({
        enterprise_value: monetaryAmountSchema,
        total_debt: monetaryAmountSchema,
        cash_and_equivalents: monetaryAmountSchema,
        equity_value: monetaryAmountSchema,
        shares_outstanding: z
          .object({
            class_a_million: z.number(),
            class_b_million: z.number(),
            total_million: z.number(),
          })
          .strict(),
        target_price_eur: monetaryAmountSchema,
        fx_rate_eur_usd: z.number(),
        target_price_usd: monetaryAmountSchema,
      })
      .strict(),
    investment_recommendation: z
      .object({
        catalysts: z.array(z.string()),
        key_risks: z.array(z.string()),
        recommendations_by_investor_type: z.array(
          z
            .object({
              investor_type: z.string(),
              action: z.string(),
              trigger: z.string(),
            })
            .strict(),
        ),
      })
      .strict(),
  })
  .strict();

export type Currency = z.infer<typeof currencySchema>;
export type MonetaryAmount = z.infer<typeof monetaryAmountSchema>;
export type ManuReport = z.infer<typeof manuReportSchema>;