import { app } from "./index";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const PORT: string | undefined = process.env.PORT; // FOR PORT

app.listen(PORT, () => {
  console.log(`Server is listining on port ${PORT}`);
});
