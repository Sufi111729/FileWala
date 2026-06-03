const https = require("https");

const payload = JSON.stringify({
  host: "www.filewalatool.com",
  key: "91fe2211d514401d8e4eb93894e45ac6",
  keyLocation: "https://www.filewalatool.com/91fe2211d514401d8e4eb93894e45ac6.txt",
  urlList: [
    "https://www.filewalatool.com/",
    "https://www.filewalatool.com/merge-pdf",
    "https://www.filewalatool.com/split-pdf",
    "https://www.filewalatool.com/compress-pdf",
    "https://www.filewalatool.com/pdf-to-jpg",
    "https://www.filewalatool.com/image-to-pdf",
    "https://www.filewalatool.com/background-remover",
    "https://www.filewalatool.com/passport-photo-maker",
    "https://www.filewalatool.com/contact-us",
    "https://www.filewalatool.com/about-us"
  ]
});

const options = {
  hostname: "api.indexnow.org",
  path: "/IndexNow",
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("IndexNow status:", res.statusCode);
    console.log("Response:", data || "No response body");

    if (res.statusCode === 200) {
      console.log("Success: URLs submitted to IndexNow.");
    } else if (res.statusCode === 400) {
      console.log("Bad request: JSON format ya URL format galat ho sakta hai.");
    } else if (res.statusCode === 403) {
      console.log("Forbidden: Key file accessible nahi hai ya key file ke andar key match nahi ho rahi.");
    } else if (res.statusCode === 422) {
      console.log("Unprocessable Entity: URLs host se match nahi kar rahe ya schema mismatch hai.");
    } else if (res.statusCode === 429) {
      console.log("Too Many Requests: Baad me retry karo.");
    }
  });
});

req.on("error", (error) => {
  console.error("IndexNow request failed:", error);
});

req.write(payload);
req.end();
