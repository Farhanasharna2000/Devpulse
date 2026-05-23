import { pool } from "../../db/index.js";
import type { TIssue, TIssueQuery } from "./issue.interface.js";

//Create issues

const createIssue = async (payload: TIssue, reporterId: number) => {
  const { title, description, type } = payload;

  const result = await pool.query(
    `
    INSERT INTO issues(title,description,type,reporter_id)
    VALUES($1,$2,$3,$4)
    RETURNING *
    `,
    [title, description, type, reporterId],
  );

  return result.rows[0];
};

//get all issues

const getAllIssues = async (query: TIssueQuery) => {
  const { sort, type, status } = query;

  let sql = `
    SELECT *
    FROM issues
  `;

  const conditions: string[] = [];
  const values: unknown[] = [];

  // filtering
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  // WHERE clause
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  // sorting
  sql += ` ORDER BY created_at `;

  if (sort === "oldest") {
    sql += `ASC`;
  } else {
    sql += `DESC`;
  }

  // fetch issues
  const issuesResult = await pool.query(sql, values);

  const issues = issuesResult.rows;

  // collect reporter ids
  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];

  // fetch reporters separately
  let reportersMap = new Map();

  if (reporterIds.length > 0) {
    const reportersResult = await pool.query(
      `
        SELECT id,name,role
        FROM users
        WHERE id = ANY($1)
        `,
      [reporterIds],
    );

    reportersMap = new Map(
      reportersResult.rows.map((reporter) => [reporter.id, reporter]),
    );
  }

  // attach reporter data
  const finalIssues = issues.map((issue) => ({
    ...issue,
    reporter: reportersMap.get(issue.reporter_id),
  }));

  return finalIssues;
};

//get single issues

const getSingleIssue = async (id: number) => {
  const issueResult = await pool.query(
    `
    SELECT *
    FROM issues
    WHERE id = $1
    `,
    [id],
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
    [issue.reporter_id],
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
    updated_at: issue.updated_at,
  };

  return formattedIssue;
};

//update issue

const updateIssue = async (id: number, payload: Partial<TIssue>) => {
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
    [title, description, type, id],
  );

  return result.rows[0];
};

//delete issue

const deleteIssue = async (id: number) => {
  const result = await pool.query(
    `
    DELETE FROM issues
    WHERE id = $1
    RETURNING *
    `,
    [id],
  );

  return result.rows[0];
};

export const IssueService = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
