const { Worker } = require("bullmq");
const sendEmail = require("../services/emailService");

new Worker(
  "emailQueue",
  async job => {

    const { email, token } = job.data;

    await sendEmail(email, token);

  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379
    }
  }
);