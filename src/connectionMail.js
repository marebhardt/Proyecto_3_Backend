const SibApiV3Sdk = require('@getbrevo/brevo');

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

let apiKey = apiInstance.authentications['apiKey'];

const connect = async (key) => {
    apiKey.apiKey = key;
};

const send = async (contact) => {
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = "Contacto de Style Chick";
    sendSmtpEmail.textContent = "Nombre: " + contact.fullname + "\n" + "Teléfono: " + contact.phone + "\n" + "Email: " + contact.email + "\n" + "Consulta: " + contact.query + "\n";
    sendSmtpEmail.sender = {"email":"marebhardt@gmail.com","name":"Mery Ebhardt"};
    sendSmtpEmail.to = [{"email":"marebhardt@gmail.com","name":"Mery Ebhardt"}];
    sendSmtpEmail.cc = [{"email": contact.email, "name": contact.fullname}];
    apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
        //console.log('API called successfully. Returned data: ' + JSON.stringify(data));
    }, function(error) {
        console.error(error);
    });
};

module.exports = { connect, send };