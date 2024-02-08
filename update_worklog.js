const https = require("https");
const { URL } = require("url");
const { v4: uuidv4 } = require('uuid');

const start_date = new Date();
const end_date = new Date();

const kronos_domain = "https://kronos.tarento.com";

const tasks = {
  "Deployment": 6,
  "Support": 7,
  "Project Management": 9,
  "Meetings": 40,
};

function get_authorization_token(email, password) {
  const url = kronos_domain + "/api/v1/user/login";
  const data = JSON.stringify({
    username: email,
    password: password,
  });

  const parsedUrl = new URL(url);
  const options = {
    hostname: parsedUrl.hostname,
    port: 443,
    path: parsedUrl.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const responseData = JSON.parse(data);
        const authorizationToken = responseData.responseData.sessionId;
        resolve(authorizationToken);
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

function save_task_time(
  date,
  note,
  authorization_token,
  task_id,
  minute = 480
) {
  const url = kronos_domain + "/api/v1/user/saveTaskTimeForProject";
  const activity_ref_number = process.env.KRONOS_EMAIL + "#" + uuidv4();
  const data = JSON.stringify({
    time: [
      {
        date: date,
        pid: 2429,
        tid: task_id,
        minute: minute,
        note: note,
        locId: 8,
        billable: true,
        onSite: false,
        activityRefNumber: activity_ref_number,
      },
    ],
  });

  const parsedUrl = new URL(url);
  const options = {
    hostname: parsedUrl.hostname,
    port: 443,
    path: parsedUrl.pathname,
    method: "POST",
    headers: {
      Authorization: authorization_token,
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({ status: res.statusCode, data: data });
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  // check if Kronos credentials are present
  if (!process.env.KRONOS_EMAIL || !process.env.KRONOS_PASSWORD) {
    throw new Error("KRONOS_EMAIL or KRONOS_PASSWORD not found in env");
  } else {
    try {
      const authorization_token = await get_authorization_token(
        process.env.KRONOS_EMAIL,
        process.env.KRONOS_PASSWORD
      );
      if (!authorization_token) {
        throw new Error("authorization_token not found");
      }

      let current_date = new Date(start_date);
      while (current_date <= end_date) {
        if (current_date.getDay() !== 6 && current_date.getDay() !== 0) {
          const date_str = current_date.toISOString().split("T")[0];

          ({ status: status_code, data: response_json } = await save_task_time(
            date_str,
            "Daily Status Call and Project Meetings",
            authorization_token,
            tasks["Meetings"],
            60
          ));
          console.log(
            `For ${date_str}: Status Code: ${status_code}, Response JSON: ${response_json}`
          );

          ({ status: status_code, data: response_json } = await save_task_time(
            date_str,
            "Project Management",
            authorization_token,
            tasks["Project Management"],
            60
          ));
          console.log(
            `For ${date_str}: Status Code: ${status_code}, Response JSON: ${response_json}`
          );

          ({ status: status_code, data: response_json } = await save_task_time(
            date_str,
            "NOC Team Support",
            authorization_token,
            tasks["Support"],
            360
          ));
          console.log(
            `For ${date_str}: Status Code: ${status_code}, Response JSON: ${response_json}`
          );
        }
        current_date.setDate(current_date.getDate() + 1);
      }
    } catch (error) {
      console.error(error);
    }
  }
}

main();
