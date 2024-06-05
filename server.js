const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require('dotenv').config()

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

app.post("/generate-signature", async (req, res) => {
  try {
    const { fileName, fileType } = req.body;
    const client = new S3Client({
      region: process.env.AWS_ACCESS_KEY_ID,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      useAccelerateEndpoint: true
    });

    const params = {
      Key: fileName,
      ContentType: fileType,
      Bucket: process.env.BUCKET_NAME,
      Metadata: { 'Content-Type': fileType },
    };

    const command = new PutObjectCommand(params);
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });

    res.json({
      signed_url: url,
    });
  } catch (e) {
    console.error(e);
    res.json({ error: e });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
