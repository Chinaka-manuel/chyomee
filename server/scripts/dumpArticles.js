import dotenv from "dotenv";
import connect from "../utils/db.js";
import { AdminRecord } from "../models/AdminRecord.js";

dotenv.config({ path: "./.env" });

(async () => {
  try {
    await connect();
    const records = await AdminRecord.find({ resource: "article" }).lean();
    console.log(`Found ${records.length} article records`);
    for (const r of records) {
      console.log("---");
      console.log("id:", r._id.toString());
      console.log("title:", r.payload?.title);
      console.log("status:", r.payload?.status);
      console.log("featuredOnHomepage:", r.payload?.featuredOnHomepage);
      console.log("payload:", JSON.stringify(r.payload));
    }
    process.exit(0);
  } catch (err) {
    console.error("Error querying articles:", err.message || err);
    process.exit(1);
  }
})();
