import http from "http";
import * as mysql from "mysql2";

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "bloging",
});

http
  .createServer(function (req, res) {
    if (req.url === "/posts" && req.method === "POST") {
      const chunks = [];
      req.on("data", (chunk) => {
        chunks.push(chunk);
      });
      req.on("end", () => {
        const data = Buffer.concat(chunks).toString();
        const postData = JSON.parse(data);
        const check = [undefined, "undefined", "", " "];
        if (check.includes(postData.title)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end();
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          const insertQwery = `INSERT INTO posts (title, content) VALUES (?,?)`;
          console.log("Parametri ", data); // ovdje je data json string koji nam treba
          conn.query(insertQwery, [postData.title, postData.content], (err) => {
            if (err) {
              throw err;
            }
          });
          res.end();
        }
      });
    } else if (req.url === "/posts" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      conn.query(
        "SELECT * FROM posts WHERE deleted_at IS NULL ORDER BY created_at DESC",
        function (err, results) {
          if (err) throw err;
          const str =
            `{"Total": [${results.length}], "Data": ` +
            JSON.stringify(results) +
            `}`;
          res.end(str);
        }
      );
    } else {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("<h1>Nothing found here!</h1>");
    }
  })
  .listen(8080);
