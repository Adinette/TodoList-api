const request = require("supertest");
const app = require("../src/app");
const { connection } = require("../src/models");

describe("User API", () => {
  before((done) => {
    connection.connect(done);
  });

  after((done) => {
    connection.end(done);
  });

  it("should get all users", (done) => {
    request(app)
      .get("/user")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

  it("should get a user by ID", (done) => {
    const userId = 1;
    request(app)
      .get(`/user/${userId}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

  it("should register a new user", (done) => {
    const newUser = {
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
    };
    request(app)
      .post("/user/register")
      .send(newUser)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});