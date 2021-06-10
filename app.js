const express = require('express');
const mailchimp = require('@mailchimp/mailchimp_marketing');

const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));


function catchEm(promise) {
    return promise.then(data => [null, data])
      .catch(err => [err]);
}

// mailchimp constants
const listId = "0c8e07ea7c";
const apiKey = "ccdaebf66cd13f0176a4ab2fa41eaa7b";
const mailchimpServer = "us6";

mailchimp.setConfig({
    apiKey: apiKey,
    server: mailchimpServer,
});

app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

app.post("/", (req, res) => {
    const firstName = req.body.fName;
    const lastName = req.body.lName;
    const email = req.body.email;
    const phone = req.body.phone;
    const message = req.body.message;

    const memberObject = {
        email_address: `${email}`,
        status: "subscribed",
        merge_fields: {
            FNAME: `${firstName}`,
            LNAME: `${lastName}`,
            PHONE: `${phone}`,
            MESSAGE: `${message}`
        }
    }

    const addMember = async () => {
        const [err, data] = await catchEm(mailchimp.lists.addListMember(listId, memberObject));
        
        if (err) {
            res.sendFile(`${__dirname}/fail.html`);
        } else {
            res.sendFile(`${__dirname}/success.html`);
        }
    };
    
    addMember(firstName, lastName, email);
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});

