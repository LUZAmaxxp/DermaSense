import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

// Use a module-level cached connection to survive hot-reload in dev
// and reuse connections across serverless invocations
declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: typeof mongoose | null;
}

let cached = global._mongooseConn;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached && mongoose.connection.readyState === 1) {
    return cached;
  }

  const conn = await mongoose.connect(MONGODB_URI);

  cached = conn;
  global._mongooseConn = conn;
  return conn;
}
