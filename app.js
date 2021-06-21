require("dotenv").config();

const express = require("express");
const { Client } = require("@notionhq/client");

const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const notion = new Client({
  auth: process.env.NOTION_KEY,
});

function catchEm(promise) {
  return promise.then((data) => [null, data]).catch((err) => [err]);
}

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

app.post("/", (req, res) => {
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;
  const phone = req.body.phone;
  const message = req.body.message;

  const contact = {
    parent: {
      database_id: process.env.NOTION_DATABASE_ID,
    },
    properties: {
      title: {
        title: [
          { type: "text", text: { content: `${firstName} ${lastName}` } },
        ],
      },
      firstName: {
        rich_text: [{ type: "text", text: { content: `${firstName}` } }],
      },
      lastName: {
        rich_text: [{ type: "text", text: { content: `${lastName}` } }],
      },
      phone: { phone_number: phone },
      email: { email: email },
      message: {
        rich_text: [{ type: "text", text: { content: `${message}` } }],
      },
      tags: {
        multi_select: [{ name: "Lead" }],
      },
    },
  };

  const addMember = async (contact) => {
    const [err, data] = await catchEm(notion.pages.create(contact));

    if (err) {
      res.sendFile(`${__dirname}/fail.html`);
    } else {
      res.sendFile(`${__dirname}/success.html`);
    }
  };

  addMember(contact);
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);
