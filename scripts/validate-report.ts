import reportData from "../manu_report.data.json";
import { manuReportSchema } from "../src/data/manu-report.schema";

const result = manuReportSchema.safeParse(reportData);

if (!result.success) {
  console.error("MANU report data validation failed.");
  console.error(result.error.issues);
  process.exitCode = 1;
} else {
  console.log(
    `MANU report data is valid (${Object.keys(result.data).length} top-level sections).`,
  );
}