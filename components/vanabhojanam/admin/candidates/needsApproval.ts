/** Online-paying students are approved by an admin after checking their ID photo; everyone else needs no approval. */
export const needsApproval = (c: any): boolean => c.collegeOrWorking === "College" && c.paymentMethod !== "Cash";

/** Waiting for the admin: a paid student whose ID has not been accepted or rejected yet. */
export const awaitingApproval = (c: any): boolean => c.paymentStatus === "Paid" && needsApproval(c) && !c.adminAction;

/** The "Student ID" filter: students to verify, or by the decision taken. Empty keeps everyone. */
export const matchesApproval = (c: any, approval: string): boolean => {
  if (!approval) return true;
  if (approval === "verify") return awaitingApproval(c);
  return c.collegeOrWorking === "College" && c.adminAction === approval;
};
