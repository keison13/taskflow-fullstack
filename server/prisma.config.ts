import "dotenv/config";
import { defineConfig } from "@prisma/config";

export default defineConfig({
  datasource: {
    url: "postgresql://neondb_owner:npg_MTAx4wbQDe6N@ep-fancy-glade-b6vm9zrv-pooler.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require",
  },
});