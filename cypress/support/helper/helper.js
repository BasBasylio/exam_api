import { user_default } from "../../fixtures/default";

Cypress.Commands.add("getToken", () => {
  return cy
    .request({
      method: "POST",
      url: "/register",
      body: user_default,
      failOnStatusCode: false,
    })
    .then((response) => {
      if (response.status === 400) {
        return cy
          .request({
            method: "POST",
            url: "/login",
            body: user_default,
            failOnStatusCode: false,
          })
          .then((response) => {
            if (response.status === 200) return response.body.accessToken;
            return "";
          });
      }
      return response.body.accessToken;
    });
});
