import {
  post_default,
  post_update_default,
} from "../fixtures/default";

import "../support/helper/helper";

it("1.Get all posts. Verify HTTP response status code and content type.", () => {
  cy.request("/posts").as("posts");

  cy.get("@posts").its("status").should("eq", 200);

  cy.get("@posts")
    .its("headers")
    .its("content-type")
    .should("include", "application/json");
});
it("2. Get only first 10 posts. Verify HTTP response status code.", () => {
  cy.request("/posts?_limit=10").as("first10Posts");

  cy.get("@first10Posts").its("status").should("eq", 200);

  cy.get("@first10Posts").its("body").should("have.length", 10);
});
it("3. Get posts with id = 55 and id = 60. Verify HTTP response status code. Verify id values of returned records.", () => {
  cy.request("/posts?id=55&id=60").as("postsWithIDs");

  cy.get("@postsWithIDs").its("status").should("eq", 200);

  cy.get("@postsWithIDs")
    .its("body")
    .each((post) => {
      expect(post.id).to.be.oneOf([55, 60]);
    });
});
it("4. Create a post. Verify HTTP response status code. /664/posts 401", () => {
  cy.request({
    method: "POST",
    url: "/664/posts",
    body: post_default,
    failOnStatusCode: false,
  }).as("createPostResponse");

  cy.get("@createPostResponse").its("status").should("eq", 401);
});

it("5. Create post with adding access token in header. Verify HTTP response status code. Verify post is created. /664/posts 201", () => {
  cy.getToken().then((accessToken) => {
    cy.request({
      method: "POST",
      url: "/664/posts",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: post_default,
    }).as("createPostResponse");

    cy.get("@createPostResponse").its("status").should("eq", 201);

    cy.get("@createPostResponse").its("body.id").should("exist");
  });
});

it("6. Create post entity and verify that the entity is created. Verify HTTP response status code. Use JSON in body.", () => {
  cy.request({
    method: "POST",
    url: "/posts",
    body: post_default,
    headers: {
      "Content-Type": "application/json",
    },
  }).as("createPostResponse");

  cy.get("@createPostResponse").its("status").should("eq", 201);

  cy.get("@createPostResponse").its("body.id").should("exist");
});

it("7. Update non-existing entity. Verify HTTP response status code", () => {
  const nonExistentEntityId = 99999;

  cy.request({
    method: "PUT",
    url: `/posts/${nonExistentEntityId}`,
    body: post_default,
    headers: {
      "Content-Type": "application/json",
    },
    failOnStatusCode: false,
  }).as("updateEntityResponse");

  cy.get("@updateEntityResponse").its("status").should("eq", 404);
});

let createdEntityId;
it("8. Create post entity and update the created entity. Verify HTTP response status code and verify that the entity is updated. /posts 200", () => {
  cy.request({
    method: "POST",
    url: "/posts",
    body: post_default,
    headers: {
      "Content-Type": "application/json",
    },
  }).as("createPostResponse");

  cy.get("@createPostResponse").its("status").should("eq", 201);

  cy.get("@createPostResponse")
    .its("body.id")
    .should("exist")
    .then((id) => {
      createdEntityId = id;
    });
});

it("update the created entity + status code", () => {
  cy.request({
    method: "PUT",
    url: `/posts/${createdEntityId}`,
    body: post_update_default,
    headers: {
      "Content-Type": "application/json",
    },
  }).as("updateEntityResponse");

  cy.get("@updateEntityResponse").its("status").should("eq", 200);

  cy.request(`/posts/${createdEntityId}`).then((response) => {
    expect(response.body.userId).to.equal(post_update_default.userId);
    expect(response.body.title).to.equal(post_update_default.title);
    expect(response.body.body).to.equal(post_update_default.body);
  });
});

it("9. Delete non-existing post entity. Verify HTTP response status code. /posts 404", () => {
  const nonExistentEntityId = 9999999;

  cy.request({
    method: "DELETE",
    url: `/posts/${nonExistentEntityId}`,
    failOnStatusCode: false,
  }).as("deleteEntityResponse");

  cy.get("@deleteEntityResponse").its("status").should("eq", 404);
});

describe("10. Create post entity, update the created entity, and delete the entity. Verify HTTP response status code and verify that the entity is deleted.", () => {
  let createdEntityId;

  it("Create post entity", () => {
    cy.request({
      method: "POST",
      url: "/posts",
      body: post_default,
      headers: {
        "Content-Type": "application/json",
      },
    }).as("createPostResponse");

    cy.get("@createPostResponse").its("status").should("eq", 201);

    cy.get("@createPostResponse")
      .its("body.id")
      .should("exist")
      .then((id) => {
        createdEntityId = id;
      });
  });

  it("update the created entity", () => {
    cy.request({
      method: "PUT",
      url: `/posts/${createdEntityId}`,
      body: post_update_default,
      headers: {
        "Content-Type": "application/json",
      },
    }).as("updateEntityResponse");

    cy.get("@updateEntityResponse").its("status").should("eq", 200);
  });

  it("delete the entity", () => {
    cy.request({
      method: "DELETE",
      url: `/posts/${createdEntityId}`,
    }).as("deleteEntityResponse");

    cy.get("@deleteEntityResponse").its("status").should("eq", 200);

    cy.request({
      url: `/posts/${createdEntityId}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(404);
    });
  });
});
