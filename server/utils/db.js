import mongoose from "mongoose";

const getMongoUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return process.env.MONGODB_URL;
  }

  if (
    process.env.MONGODB_URL &&
    !/mongodb\.net|mongodb\+srv/i.test(process.env.MONGODB_URL)
  ) {
    return process.env.MONGODB_URL;
  }

  return "mongodb://localhost:27017/niceman-agro-ecommerce";
};

const connect = async () => {
  const mongoUrl = getMongoUrl();
  const connection = await mongoose.connect(mongoUrl);
  console.log(
    `MongoDB connected successfully (${process.env.NODE_ENV || "development"})`,
  );
  return connection;
};

export default connect;
