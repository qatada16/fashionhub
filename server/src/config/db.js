import mongoose from "mongoose";

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  let uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  const [base, query] = uri.split("?");
  const afterScheme = base.replace(/^mongodb(\+srv)?:\/\//, "");
  if (!afterScheme.includes("/") || afterScheme.endsWith("/")) {
    uri = base.replace(/\/$/, "") + "/fashionhub" + (query ? `?${query}` : "");
  }

  await mongoose.connect(uri);
  return mongoose.connection;
}
