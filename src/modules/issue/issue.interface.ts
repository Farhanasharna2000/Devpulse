export interface TIssue {
  title: string;
  description: string;
  type: "bug" | "feature_request";
}

export interface TIssueQuery {
  sort?: "newest" | "oldest";
  type?: "bug" | "feature_request";
  status?: "open" | "in_progress" | "resolved";
}
