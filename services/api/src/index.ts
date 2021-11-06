import * as path from "path";
import * as express from "express";
import * as mongoose from "mongoose";

// [DB Connection]

declare var MONGODB_URI: string;

/**
 * connectToDatabase
 * Configures the global MongoDB connection based on the provided secrets.
 *
 * @returns Promise<string>
 */
async function connectToDatabase(connectionUri: string) {
  return new Promise((resolve, reject) => {
    // From mongoose@6.x.x onwards useNewUrlParser, useUnifiedTopology,
    // useCreateIndex are deprecated and default to true
    mongoose
      .connect("mongodb://home-assignment-db:27017/testdb")
      .then(() => resolve("mongodb://home-assignment-db:27017/testdb"))
      .catch((error: any) => {
        console.log(error);
        reject(`${"mongodb://home-assignment-db:27017/testdb"}: ${error}`);
      });
  });
}
connectToDatabase(MONGODB_URI);

// [Express setup]

const app = express(),
  DIST_DIR = __dirname;
app.use(express.static(DIST_DIR));
app.use(express.json());

app.get("/health", async (req, res) => {
  res.status(200).json({ healthy: true });
});

app.get("/currency", async (req, res) => {
  res.status(200).json({ healthy: true });
});

app.post("/currency", async (req, res) => {
  res.status(201).send(req.body);
});

app.delete("/currency", async (req, res) => {
  res.status(201).json({ healthy: true });
});

app.use((req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
});

// [Express start]

const PORT: number | string = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening to ${PORT}....`);
  console.log("Press Ctrl+C to quit.");
});
