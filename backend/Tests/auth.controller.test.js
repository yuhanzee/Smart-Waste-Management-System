/**
 * backend/Tests/auth.controller.test.js
 * Unit tests for registerUser, registerAdmin, registerCollector, loginUser
 */

jest.mock("bcryptjs", () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));
const bcrypt = require("bcryptjs");

jest.mock("../models/User", () => {
  // Mock constructor and static methods
  const User = jest.fn(function (data) {
    return { ...data, save: jest.fn().mockResolvedValue(true) };
  });
  User.findOne = jest.fn();
  return User;
});
const User = require("../models/User");

// ⬇️ Adjust to your actual controller path if needed
const {
  registerUser,
  registerAdmin,
  registerCollector,
  loginUser,
} = require("../controllers/authController");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

describe("authController", () => {
  // Optional: silence error logs during tests
  const origError = console.error;
  beforeAll(() => (console.error = jest.fn()));
  afterAll(() => (console.error = origError));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- registerUser ----------------
  describe("registerUser", () => {
    test("200 -> registers new user (hash flow ok)", async () => {
      const body = { name: "Aka", email: "aka@test.com", password: "pw" };
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue("hashedPw");

      const req = { body };
      const res = mockRes();

      await registerUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "aka@test.com" });
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith("pw", "salt");

      // constructor called with hashed password and role user
      expect(User).toHaveBeenCalledWith({
        name: "Aka",
        email: "aka@test.com",
        password: "hashedPw",
        role: "user",
      });
      const instance = User.mock.results[0].value;
      expect(instance.save).toHaveBeenCalled();

      expect(res.json).toHaveBeenCalledWith({ msg: "User registered successfully" });
    });

    test("400 -> when user already exists", async () => {
      User.findOne.mockResolvedValue({ _id: "u1" });

      const req = { body: { email: "dup@test.com" } };
      const res = mockRes();

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: "User already exists" });
    });

    test("500 -> when bcrypt/gen/save throws", async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockRejectedValue(new Error("salt fail"));

      const req = { body: { name: "A", email: "a@a.com", password: "x" } };
      const res = mockRes();

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: "Server error" });
    });
  });

  // ---------------- registerAdmin ----------------
  describe("registerAdmin", () => {
    test("400 -> invalid security code", async () => {
      const req = { body: { name: "Admin", email: "a@a.com", password: "x", securityCode: "bad" } };
      const res = mockRes();

      await registerAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: "Invalid security code" });
    });

    test("200 -> registers admin with correct code", async () => {
      const body = { name: "Admin", email: "admin@test.com", password: "pw", securityCode: "1234" };
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue("hashed");

      const req = { body };
      const res = mockRes();

      await registerAdmin(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "admin@test.com" });
      expect(User).toHaveBeenCalledWith({
        name: "Admin",
        email: "admin@test.com",
        password: "hashed",
        role: "admin",
      });
      const instance = User.mock.results[0].value;
      expect(instance.save).toHaveBeenCalled();

      expect(res.json).toHaveBeenCalledWith({ msg: "Admin registered successfully" });
    });

    test("400 -> admin already exists", async () => {
      const body = { name: "Admin", email: "admin@test.com", password: "pw", securityCode: "1234" };
      User.findOne.mockResolvedValue({ _id: "adm1" });

      const req = { body };
      const res = mockRes();

      await registerAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: "Admin already exists" });
    });

    test("500 -> internal error", async () => {
      const body = { name: "Admin", email: "admin@test.com", password: "pw", securityCode: "1234" };
      User.findOne.mockRejectedValue(new Error("db fail"));

      const req = { body };
      const res = mockRes();

      await registerAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: "Server error" });
    });
  });

  // ---------------- registerCollector ----------------
  describe("registerCollector", () => {
    test("400 -> invalid collector code", async () => {
      const req = { body: { name: "C", email: "c@c.com", password: "x", securityCode: "NOPE" } };
      const res = mockRes();

      await registerCollector(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: "Invalid security code for collector registration" });
    });

    test("200 -> registers collector with correct code", async () => {
      const body = { name: "Col", email: "col@test.com", password: "pw", securityCode: "COLLECT123" };
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue("hashedPw");

      const req = { body };
      const res = mockRes();

      await registerCollector(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "col@test.com" });
      expect(User).toHaveBeenCalledWith({
        name: "Col",
        email: "col@test.com",
        password: "hashedPw",
        role: "collector",
      });
      const instance = User.mock.results[0].value;
      expect(instance.save).toHaveBeenCalled();

      expect(res.json).toHaveBeenCalledWith({ msg: "Waste Collector registered successfully" });
    });

    test("400 -> collector already registered", async () => {
      const body = { name: "Col", email: "col@test.com", password: "pw", securityCode: "COLLECT123" };
      User.findOne.mockResolvedValue({ _id: "c1" });

      const req = { body };
      const res = mockRes();

      await registerCollector(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: "Collector already registered with this email" });
    });

    test("500 -> internal error", async () => {
      const body = { name: "Col", email: "col@test.com", password: "pw", securityCode: "COLLECT123" };
      User.findOne.mockRejectedValue(new Error("db err"));

      const req = { body };
      const res = mockRes();

      await registerCollector(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: "Server error" });
    });
  });

  // ---------------- loginUser ----------------
  describe("loginUser", () => {
    test("400 -> user not found", async () => {
      User.findOne.mockResolvedValue(null);

      const req = { body: { email: "x@x.com", password: "pw" } };
      const res = mockRes();

      await loginUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "x@x.com" });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: "User not found" });
    });

    test("400 -> invalid credentials", async () => {
      User.findOne.mockResolvedValue({ _id: "u1", name: "A", email: "a@a.com", role: "user", password: "hash" });
      bcrypt.compare.mockResolvedValue(false);

      const req = { body: { email: "a@a.com", password: "wrong" } };
      const res = mockRes();

      await loginUser(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith("wrong", "hash");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: "Invalid credentials" });
    });

    test("200 -> login success", async () => {
      const userDoc = { _id: "u2", name: "Aka", email: "aka@test.com", role: "admin", password: "hash" };
      User.findOne.mockResolvedValue(userDoc);
      bcrypt.compare.mockResolvedValue(true);

      const req = { body: { email: "aka@test.com", password: "pw" } };
      const res = mockRes();

      await loginUser(req, res);

      expect(res.json).toHaveBeenCalledWith({
        msg: "Login success",
        user: { id: "u2", name: "Aka", email: "aka@test.com", role: "admin" },
      });
    });

    test("500 -> internal error", async () => {
      User.findOne.mockRejectedValue(new Error("db fail"));

      const req = { body: { email: "e@e.com", password: "pw" } };
      const res = mockRes();

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: "Server error" });
    });
  });
});
