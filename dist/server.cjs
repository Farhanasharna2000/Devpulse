

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/config/index.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
import_dotenv.default.config({ path: import_path.default.resolve(process.cwd(), ".env") });
var config = {
  connection_String: process.env.CONNECTIONSTRING,
  port: process.env.PORT,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_secret: process.env.JWT_SECRET,
  jwt_expires_in: process.env.JWT_EXPIRES_IN
};
var config_default = config;

// src/app.ts
var import_express3 = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);

// src/modules/auth/auth.route.ts
var import_express = require("express");

// src/modules/auth/auth.service.ts
var import_bcrypt = __toESM(require("bcrypt"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);

// src/db/index.ts
var import_pg = require("pg");
var pool = new import_pg.Pool({
  connectionString: config_default.connection_String
});
var initDB = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS users(
   
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     password TEXT NOT NULL,
     role VARCHAR(20) DEFAULT 'contributor',
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      ) `);
    await pool.query(`CREATE TABLE IF NOT EXISTS issues(
   
     id SERIAL PRIMARY KEY,
     title VARCHAR(150) NOT NULL,
     description TEXT NOT NULL,
     type VARCHAR(50) NOT NULL,
     status VARCHAR(50) DEFAULT 'open',
     reporter_id INTEGER NOT NULL,
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      ) `);
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/auth/auth.service.ts
var signupUser = async (payload) => {
  const { name, email, password, role } = payload;
  const existingUser = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    email
  ]);
  if (existingUser.rows.length > 0) {
    throw new Error("User already exists");
  }
  const hashedPassword = await import_bcrypt.default.hash(
    password,
    Number(config_default.bcrypt_salt_rounds)
  );
  const result = await pool.query(
    `
    INSERT INTO users(
      name,
      email,
      password,
      role
    )
    VALUES($1,$2,$3,$4)

    RETURNING
      id,
      name,
      email,
      role,
      created_at,
      updated_at
    `,
    [name, email, hashedPassword, role]
  );
  return result.rows[0];
};
var loginUser = async (email, password) => {
  const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    email
  ]);
  const user = result.rows[0];
  if (!user) {
    throw new Error("User not found");
  }
  const passwordMatched = await import_bcrypt.default.compare(password, user.password);
  if (!passwordMatched) {
    throw new Error("Incorrect password");
  }
  const token = import_jsonwebtoken.default.sign(
    {
      id: user.id,
      name: user.name,
      role: user.role
    },
    config_default.jwt_secret,
    {
      expiresIn: config_default.jwt_expires_in
    }
  );
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  };
};
var AuthService = {
  signupUser,
  loginUser
};

// src/modules/auth/auth.controller.ts
var import_http_status_codes = require("http-status-codes");
var signup = async (req, res) => {
  try {
    const result = await AuthService.signupUser(req.body);
    res.status(import_http_status_codes.StatusCodes.CREATED).json({
      success: true,
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    res.status(import_http_status_codes.StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Something went wrong",
      data: error
    });
  }
};
var login = async (req, res) => {
  try {
    const result = await AuthService.loginUser(
      req.body.email,
      req.body.password
    );
    res.status(import_http_status_codes.StatusCodes.OK).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    res.status(import_http_status_codes.StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Something went wrong",
      data: error
    });
  }
};
var AuthController = {
  signup,
  login
};

// src/modules/auth/auth.route.ts
var router = (0, import_express.Router)();
router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
var AuthRoutes = router;

// src/modules/issue/issue.route.ts
var import_express2 = require("express");

// src/modules/issue/issue.controller.ts
var import_http_status_codes3 = require("http-status-codes");

// src/modules/issue/issue.service.ts
var createIssue = async (payload, reporterId) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `
    INSERT INTO issues(title,description,type,reporter_id)
    VALUES($1,$2,$3,$4)
    RETURNING *
    `,
    [title, description, type, reporterId]
  );
  return result.rows[0];
};
var getAllIssues = async (query) => {
  const { sort, type, status } = query;
  let sql = `
    SELECT *
    FROM issues
  `;
  const conditions = [];
  const values = [];
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }
  sql += ` ORDER BY created_at `;
  if (sort === "oldest") {
    sql += `ASC`;
  } else {
    sql += `DESC`;
  }
  const issuesResult = await pool.query(sql, values);
  const issues = issuesResult.rows;
  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];
  let reportersMap = /* @__PURE__ */ new Map();
  if (reporterIds.length > 0) {
    const reportersResult = await pool.query(
      `
        SELECT id,name,role
        FROM users
        WHERE id = ANY($1)
        `,
      [reporterIds]
    );
    reportersMap = new Map(
      reportersResult.rows.map((reporter) => [reporter.id, reporter])
    );
  }
  const finalIssues = issues.map((issue) => ({
    ...issue,
    reporter: reportersMap.get(issue.reporter_id)
  }));
  return finalIssues;
};
var getSingleIssue = async (id) => {
  const issueResult = await pool.query(
    `
    SELECT *
    FROM issues
    WHERE id = $1
    `,
    [id]
  );
  const issue = issueResult.rows[0];
  if (!issue) {
    return null;
  }
  const reporterResult = await pool.query(
    `
      SELECT id, name, role
      FROM users
      WHERE id = $1
      `,
    [issue.reporter_id]
  );
  const reporter = reporterResult.rows[0];
  const formattedIssue = {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
  return formattedIssue;
};
var updateIssue = async (id, payload) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `
    UPDATE issues
    SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      type = COALESCE($3, type),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *
    `,
    [title, description, type, id]
  );
  return result.rows[0];
};
var deleteIssue = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM issues
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );
  return result.rows[0];
};
var IssueService = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/utils/handleError .ts
var import_http_status_codes2 = require("http-status-codes");
var handleError = (error, res) => {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  return res.status(import_http_status_codes2.StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Something went wrong",
    errors: errorMessage
  });
};

// src/modules/issue/issue.controller.ts
var createIssue2 = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    if (!title || !description || !type) {
      return res.status(import_http_status_codes3.StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "All fields are required"
      });
    }
    if (req.user.role !== "contributor" && req.user.role !== "maintainer") {
      return res.status(import_http_status_codes3.StatusCodes.FORBIDDEN).json({
        success: false,
        message: "Forbidden access"
      });
    }
    const reporterId = req.user.id;
    const result = await IssueService.createIssue(req.body, reporterId);
    res.status(import_http_status_codes3.StatusCodes.CREATED).json({
      success: true,
      message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    handleError(error, res);
  }
};
var getAllIssues2 = async (req, res) => {
  try {
    const result = await IssueService.getAllIssues(req.query);
    res.status(import_http_status_codes3.StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    handleError(error, res);
  }
};
var getSingleIssue2 = async (req, res) => {
  try {
    const issueId = Number(req.params.id);
    if (isNaN(issueId)) {
      return res.status(import_http_status_codes3.StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid issue id"
      });
    }
    const result = await IssueService.getSingleIssue(issueId);
    if (!result) {
      return res.status(import_http_status_codes3.StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Issue not found"
      });
    }
    res.status(import_http_status_codes3.StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    handleError(error, res);
  }
};
var updateIssue2 = async (req, res) => {
  try {
    const issueId = Number(req.params.id);
    if (isNaN(issueId)) {
      return res.status(import_http_status_codes3.StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid issue id"
      });
    }
    const { title, description, type } = req.body;
    if (!title && !description && !type) {
      return res.status(import_http_status_codes3.StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "At least one field is required"
      });
    }
    if (type && !["bug", "feature_request"].includes(type)) {
      return res.status(import_http_status_codes3.StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid issue type"
      });
    }
    const issueResult = await pool.query(
      `
      SELECT *
      FROM issues
      WHERE id = $1
      `,
      [issueId]
    );
    const issue = issueResult.rows[0];
    if (!issue) {
      return res.status(import_http_status_codes3.StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Issue not found"
      });
    }
    const user = req.user;
    if (user.role === "maintainer") {
      const result = await IssueService.updateIssue(issueId, {
        title,
        description,
        type
      });
      return res.status(import_http_status_codes3.StatusCodes.OK).json({
        success: true,
        message: "Issue updated successfully",
        data: result
      });
    }
    if (user.role === "contributor") {
      if (issue.reporter_id !== user.id) {
        return res.status(import_http_status_codes3.StatusCodes.FORBIDDEN).json({
          success: false,
          message: "You can update only your own issues"
        });
      }
      if (issue.status !== "open") {
        return res.status(import_http_status_codes3.StatusCodes.FORBIDDEN).json({
          success: false,
          message: "You can update only open issues"
        });
      }
      const result = await IssueService.updateIssue(issueId, {
        title,
        description,
        type
      });
      return res.status(import_http_status_codes3.StatusCodes.OK).json({
        success: true,
        message: "Issue updated successfully",
        data: result
      });
    }
    return res.status(import_http_status_codes3.StatusCodes.FORBIDDEN).json({
      success: false,
      message: "Forbidden access"
    });
  } catch (error) {
    handleError(error, res);
  }
};
var deleteIssue2 = async (req, res) => {
  try {
    const issueId = Number(req.params.id);
    if (isNaN(issueId)) {
      return res.status(import_http_status_codes3.StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid issue id"
      });
    }
    if (req.user.role !== "maintainer") {
      return res.status(import_http_status_codes3.StatusCodes.FORBIDDEN).json({
        success: false,
        message: "Forbidden access"
      });
    }
    const existingIssue = await pool.query(
      `
        SELECT *
        FROM issues
        WHERE id = $1
        `,
      [issueId]
    );
    if (existingIssue.rows.length === 0) {
      return res.status(import_http_status_codes3.StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Issue not found"
      });
    }
    await IssueService.deleteIssue(issueId);
    res.status(import_http_status_codes3.StatusCodes.OK).json({
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    handleError(error, res);
  }
};
var IssueController = {
  createIssue: createIssue2,
  getAllIssues: getAllIssues2,
  getSingleIssue: getSingleIssue2,
  updateIssue: updateIssue2,
  deleteIssue: deleteIssue2
};

// src/middleware/auth.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
var auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access"
    });
  }
  try {
    const decoded = import_jsonwebtoken2.default.verify(token, config_default.jwt_secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};
var auth_default = auth;

// src/modules/issue/issue.route.ts
var router2 = (0, import_express2.Router)();
router2.post("/", auth_default, IssueController.createIssue);
router2.get("/", IssueController.getAllIssues);
router2.get("/:id", IssueController.getSingleIssue);
router2.patch("/:id", auth_default, IssueController.updateIssue);
router2.delete("/:id", auth_default, IssueController.deleteIssue);
var IssueRoutes = router2;

// src/app.ts
var app = (0, import_express3.default)();
app.use((0, import_cors.default)());
app.use(import_express3.default.json());
app.get("/", (req, res) => {
  res.send("Welcome to Devpulse!");
});
app.use("/api/auth", AuthRoutes);
app.use("/api/issues", IssueRoutes);
var app_default = app;

// src/server.ts
var main = async () => {
  try {
    await initDB();
    app_default.listen(config_default.port, () => {
      console.log(`Server running on port ${config_default.port}`);
    });
  } catch (error) {
    console.log("server failed to start", error);
  }
};
main();
//# sourceMappingURL=server.cjs.map